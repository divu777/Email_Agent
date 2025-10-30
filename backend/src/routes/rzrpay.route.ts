import { authTokenMiddleware } from "./../middleware/index";
import Razorpay from "razorpay";
import config from "../config";
import { Router } from "express";
import z from "zod";
import { prisma } from "../../prisma";
import crypto from "crypto";

const razorClient = new Razorpay({
  key_id: config.KEY_ID,
  key_secret: config.KEY_SECRET,
});

const razorRouter = Router();

const createOrderSchema = z.object({
  planId: z.string(),
  planType: z.enum(["monthly"]),
});

const planCatalogue = [
  {
    planId: "plan_RZSWTSOzdYLdHC",
    amount: 200,
    currency: "INR",
  },
];

razorRouter.post("/order/create", authTokenMiddleware, async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  try {
    const body = req.body;
    const validInputs = createOrderSchema.safeParse(body);

    if (!validInputs.success) {
      res.json({
        message: validInputs.error.message,
        success: false,
      });
      return;
    }

    const planDetails = planCatalogue[0];

    if (!planDetails) {
      console.log("No plan details available");
      return;
    }

    if (validInputs.data.planType === "monthly") {
      const orderResponse = await razorClient.subscriptions.create({
        plan_id: planDetails.planId,
        customer_notify: 1,
        total_count: 12,
        notes: {
          plan_type: "monthly",
          user_id: userId,
        },
      });

      const transactionCreated = await prisma.transaction.create({
        data: {
          userId,
          amount: planDetails.amount * 100,
          currency: planDetails.currency,
          razorpayOrderId: orderResponse.id,
          planId: planDetails.planId,
        },
      });

      const subscription = await prisma.subscription.create({
        data: {
          planId: planDetails.planId,
          subscriptionId: orderResponse.id,
          userId,
        },
      });

      res.json({
        data: {
          keyId: config.KEY_ID,
          subsriptionId: orderResponse.id,
        },

        success: true,
      });
      return;
    }

    /* section left for if i want upfront whole year payment 
    then we create an order request rather than subcription
    */

    console.log("one time payment matched");
    return;
  } catch (error) {
    console.log("Error in creating order, :" + error);
    res.json({
      message: "Error in creating order",
      success: false,
    });
  }
});

razorRouter.post("/payment/verify", authTokenMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const orderExist = await prisma.transaction.findFirst({
      where: {
        razorpayOrderId,
        status: "PENDING",
      },
    });

    if (!orderExist) {
      res.json({
        message: "Error order does not exist",
        success: false,
      });
      return;
    }

    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", config.KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      await prisma.transaction.update({
        where: {
          razorpayOrderId,
        },
        data: {
          status: "FAILED",
        },
      });

      res.json({
        message: "Error in verifying payment, failed . Try again later",
        success: false,
      });
      return;
    }

    const transaction = await prisma.transaction.update({
      where: {
        razorpayOrderId,
      },
      data: {
        status: "SUCCESS",
      },
    });

    await prisma.subscription.update({
      where: {
        subscriptionId: razorpayOrderId,
        userId
      },
      data: {
        status: "SUCCESS",
                startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      },
    });
  } catch (error) {
    console.log("Error in verifying payment, :" + error);
    res.json({
      message: "Error in verifying payment",
    });
  }
});

razorRouter.post("/webhook/razor", async (req, res) => {
  try {
    const secret = process.env.WEBHOOK_SECRET!;

    const signature = req.headers["x-razorpay-signature"];

    const body = req.body.toString
      ? req.body.toString()
      : JSON.stringify(req.body);

    const expectedString = crypto
      .createHmac("sha256", config.WEBHOOK_SECRET)
      .update(body)
      .digest("hex");

    if (expectedString !== signature) {
      console.log("Invalid signature");
      res.status(400).json({ Error: "invalid creds" });
      return;
    }
    const { event, payload } = req.body;

    if (event === "subscription.activated") {
      const subscription = payload.subscription.entity;
      const { notes, id: subscriptionId } = subscription;

      if (notes.app_name !== "VEKTOR") {
        res.json({
          error: "Webhook works successfully",
        });
        return;
      }
      let userId;

      if (notes && typeof notes === "object") {
        userId = notes.user_id;
      }

      if (!userId) {
        res.json({
          error: "not valid notes recieved from the webhook",
        });
        return;
      }

      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          isPremium: true,
        },
      });

      await prisma.transaction.update({
        where: {
          razorpayOrderId: subscriptionId,
          status: "PENDING",
        },
        data: {
          status: "SUCCESS",
          updatedAt: new Date(),
        },
      });

      const subscriptionExist = await prisma.subscription.findUnique({
        where: {
          subscriptionId,
          userId,
        },
      });

      if (subscriptionExist) {
        if (subscriptionExist?.status === "SUCCESS") {
          res.json({ message: "Already processed" });
          return;
        }
        await prisma.subscription.update({
          where: {
            subscriptionId,
            userId,
          },
          data: {
            status: "SUCCESS",
            createdAt: new Date(subscription.start_at * 1000),
            endDate: new Date(subscription.end_at * 1000),
          },
        });
      } else {
        // i am pretty sure it would exist
        console.log("Subscription does not exist ");
        res.json({
          message: "Done succesfully",
        });
        return;
      }

      console.log("Subscription activated for the user");
      res.json({
        message: "successfull web hook ",
      });
      return;
    }

    res.json({
      message: "Nothing matched",
    });
    return;
  } catch (error) {
    console.log("Error in webhook from razorpay, :" + error);
  }
});

export default razorRouter;

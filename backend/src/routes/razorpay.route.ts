import { authTokenMiddleware } from "../middleware/index";
import Razorpay from "razorpay";
import config from "../config";
import e, { Router } from "express";
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
    planId: "plan_Ra7R2IZuXUnFGD",
    amount: 10,
    currency: "INR",
  },
];


/**
 * Handle subscription.authenticated event
 * Triggered when user completes first payment authentication
 */
const handleSubscriptionAuthenticated = async (payload: any) => {
  const subscription = payload.subscription.entity;
  const { notes, id: subscriptionId } = subscription;

  if (notes.app_name !== "VEKTOR") {
    console.log("App name mismatch, skipping");
    return;
  }

  const userId = notes.user_id;
  if (!userId) {
    console.log("User ID not provided in notes");
    return;
  }

  const webhookDump = await prisma.subscriptionDump.create({
    data: {
      payload: payload,
    },
  });

  await prisma.subscription.update({
    where: {
      subscriptionId,
    },
    data: {
      status: "AUTHENTICATED",
      updatedAt: new Date(),
    },
  });

  await prisma.transaction.create({
    data: {
      userId,
      planId: notes.plan_Id || planCatalogue[0]!.planId,
      amount: planCatalogue[0]!.amount * 100,
      currency: planCatalogue[0]!.currency,
      razorpaySubscriptionId: subscriptionId,
      status: "SUCCESS",
    },
  });

  console.log(`Subscription authenticated for user: ${userId}`);
};

/**
 * Handle subscription.activated event
 * Triggered when subscription becomes active after successful payment
 */
const handleSubscriptionActivated = async (payload: any) => {
  const subscription = payload.subscription.entity;
  const {
    notes,
    id: subscriptionId,
    start_at,
    end_at,
    current_start,
    current_end,
  } = subscription;

  if (notes.app_name !== "VEKTOR") {
    console.log("App name mismatch, skipping");
    return;
  }

  const userId = notes.user_id;
  if (!userId) {
    console.log("User ID not provided in notes");
    return;
  }

  // Store webhook payload
  const webhookDump = await prisma.subscriptionDump.create({
    data: {
      payload: payload,
    },
  });

  // Update user premium status
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      isPremium: true,
    },
  });

  // Update subscription status
  const updatedSubscription = await prisma.subscription.update({
    where: {
      subscriptionId,
      userId,
    },
    data: {
      status: "ACTIVE",
      startDate: current_start ? new Date(current_start * 1000) : new Date(),
      endDate: current_end
        ? new Date(current_end * 1000)
        : new Date(new Date().setMonth(new Date().getMonth() + 1)),
      updatedAt: new Date(),
    },
  });

//   const existingTransaction = await prisma.transaction.findFirst({
//     where: {
//       razorpaySubscriptionId: subscriptionId,
//       userId,
//       status: "PENDING",
//     },
//   });

//   if (existingTransaction) {
//     await prisma.transaction.update({
//       where: {
//         id: existingTransaction.id,
//       },
//       data: {
//         status: "SUCCESS",
//         updatedAt: new Date(),
//       },
//     });
//   }

// no use of curr , amount better to be kept in the subscription 

await prisma.transaction.create({
    data:{
        userId,
        planId:updatedSubscription.planId,
        razorpaySubscriptionId:updatedSubscription.subscriptionId,
        currency:planCatalogue[0]!.currency,
        amount:planCatalogue[0]!.amount*100

    }
})

  console.log(`Subscription activated for user: ${userId}`);
};

/**
 * Handle subscription.charged event
 * Triggered on recurring payments (monthly charges)
 */
const handleSubscriptionCharged = async (payload: any) => {
  const subscription = payload.subscription.entity;
  const payment = payload.payment?.entity;
  const { notes, id: subscriptionId } = subscription;

  if (notes.app_name !== "VEKTOR") {
    console.log("App name mismatch, skipping");
    return;
  }

  const userId = notes.user_id;
  if (!userId) {
    console.log("User ID not provided in notes");
    return;
  }

  await prisma.subscriptionDump.create({
    data: {
      payload: payload,
    },
  });

  const subscriptionExist = await prisma.subscription.findUnique({
    where: {
      subscriptionId,
      userId,
    },
  });

  if (!subscriptionExist) {
    console.log("Subscription does not exist");
    return;
  }

  await prisma.transaction.create({
    data: {
      userId,
      planId: notes.plan_Id || planCatalogue[0]!.planId,
      amount: planCatalogue[0]!.amount * 100,
      currency: planCatalogue[0]!.currency,
      razorpaySubscriptionId: subscriptionId,
      razorpayPaymentId: payment?.id,
      status: "SUCCESS",
    },
  });

  await prisma.subscription.update({
    where: {
      subscriptionId,
      userId,
    },
    data: {
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      updatedAt: new Date(),
    },
  });

  console.log(`Subscription charged for user: ${userId}`);
};

/**
 * Handle subscription.halted event
 * Triggered when payment fails and subscription is halted
 */
const handleSubscriptionHalted = async (payload: any) => {
  const subscription = payload.subscription.entity;
  const { notes, id: subscriptionId } = subscription;

  if (notes.app_name !== "VEKTOR") {
    console.log("App name mismatch, skipping");
    return;
  }

  const userId = notes.user_id;
  if (!userId) {
    console.log("User ID not provided in notes");
    return;
  }

 await prisma.subscriptionDump.create({
    data: {
      payload: payload,
    },
  });

  await prisma.subscription.update({
    where: {
      subscriptionId,
      userId,
    },
    data: {
      status: "HALTED",
      updatedAt: new Date(),
    },
  });

  await prisma.transaction.create({
    data: {
      userId,
      planId: notes.plan_Id || planCatalogue[0]!.planId,
      amount: planCatalogue[0]!.amount * 100,
      currency: planCatalogue[0]!.currency,
      razorpaySubscriptionId: subscriptionId,
      status: "FAILED",
    },
  });

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      isPremium: false,
    },
  });

  console.log(`Subscription halted for user: ${userId}`);
};

/**
 * Handle subscription.paused event
 * Triggered when user pauses their subscription - (stil don't know how will it be paused)
 */
const handleSubscriptionPaused = async (payload: any) => {
  const subscription = payload.subscription.entity;
  const { notes, id: subscriptionId } = subscription;

  if (notes.app_name !== "VEKTOR") {
    console.log("App name mismatch, skipping");
    return;
  }

  const userId = notes.user_id;
  if (!userId) {
    console.log("User ID not provided in notes");
    return;
  }

  await prisma.subscriptionDump.create({
    data: {
      payload: payload,
    },
  });

  await prisma.subscription.update({
    where: {
      subscriptionId,
      userId,
    },
    data: {
      status: "PAUSED",
      updatedAt: new Date(),
    },
  });

  console.log(`Subscription paused for user: ${userId}`);
};

/**
 * Handle subscription.cancelled event
 * Triggered when subscription is cancelled
 */
const handleSubscriptionCancelled = async (payload: any) => {
  const subscription = payload.subscription.entity;
  const { notes, id: subscriptionId } = subscription;

  if (notes.app_name !== "VEKTOR") {
    console.log("App name mismatch, skipping");
    return;
  }

  const userId = notes.user_id;
  if (!userId) {
    console.log("User ID not provided in notes");
    return;
  }

  // Store webhook payload
  await prisma.subscriptionDump.create({
    data: {
      payload: payload,
    },
  });

  // Mark subscription as deleted and cancelled
  await prisma.subscription.update({
    where: {
      subscriptionId,
      userId,
    },
    data: {
      status: "CANCELLED",
      isDeleted: true,
      updatedAt: new Date(),
    },
  });

  // Create cancellation transaction
  await prisma.transaction.create({
    data: {
      userId,
      planId: notes.plan_Id || planCatalogue[0]!.planId,
      amount: planCatalogue[0]!.amount * 100,
      currency: planCatalogue[0]!.currency,
      razorpaySubscriptionId: subscriptionId,
      status: "CANCELLED",
    },
  });

  // Revoke premium access
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      isPremium: false,
    },
  });

  console.log(`Subscription cancelled for user: ${userId}`);
};

/**
 * Handle subscription.completed event
 * Triggered when subscription cycle completes
 */
const handleSubscriptionCompleted = async (payload: any) => {
  const subscription = payload.subscription.entity;
  const { notes, id: subscriptionId } = subscription;

  if (notes.app_name !== "VEKTOR") {
    console.log("App name mismatch, skipping");
    return;
  }

  const userId = notes.user_id;
  if (!userId) {
    console.log("User ID not provided in notes");
    return;
  }

  await prisma.subscriptionDump.create({
    data: {
      payload: payload,
    },
  });

  await prisma.subscription.update({
    where: {
      subscriptionId,
      userId,
    },
    data: {
      status: "COMPLETED",
      isDeleted: true,
      updatedAt: new Date(),
    },
  });

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      isPremium: false,
    },
  });

  console.log(`Subscription completed for user: ${userId}`);
};

/**
 * Handle payment.failed event
 * Triggered when a payment attempt fails
 */
const handlePaymentFailed = async (payload: any) => {
  const payment = payload.payment?.entity;
  const subscription = payload.subscription?.entity;

  if (!subscription || subscription.notes?.app_name !== "VEKTOR") {
    console.log("Not a VEKTOR subscription payment");
    return;
  }

  const userId = subscription.notes.user_id;
  if (!userId) {
    console.log("User ID not provided");
    return;
  }

  await prisma.subscriptionDump.create({
    data: {
      payload: payload,
    },
  });

  await prisma.transaction.create({
    data: {
      userId,
      planId: subscription.notes.plan_Id || planCatalogue[0]!.planId,
      amount: payment?.amount || planCatalogue[0]!.amount * 100,
      currency: planCatalogue[0]!.currency,
      razorpaySubscriptionId: subscription.id,
      razorpayPaymentId: payment?.id,
      status: "FAILED",
    },
  });

  console.log(`Payment failed for user: ${userId}`);
};


razorRouter.post("/subscribe/create", authTokenMiddleware, async (req, res) => {
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
      res.status(400).json({
        message: "No plan details available",
        success: false,
      });
      return;
    }

    if (validInputs.data.planType === "monthly") {
      const subscription = await razorClient.subscriptions.create({
        plan_id: planDetails.planId,
        customer_notify: 1,
        total_count: 12,
        notes: {
          plan_type: "monthly",
          user_id: userId,
          app_name: "VEKTOR",
          plan_Id: planDetails.planId,
        },
      });

      await prisma.transaction.create({
        data: {
          userId,
          amount: planDetails.amount * 100,
          currency: planDetails.currency,
          razorpaySubscriptionId: subscription.id,
          planId: planDetails.planId,
        },
      });

      await prisma.subscription.upsert({
        where: { userId },
        update: {
          planId: planDetails.planId,
          subscriptionId: subscription.id,
          status: "PENDING",
          updatedAt: new Date(),
        },
        create: {
          planId: planDetails.planId,
          subscriptionId: subscription.id,
          userId,
        },
      });

      res.json({
        data: {
          keyId: config.KEY_ID,
          subscriptionId: subscription.id,
        },
        success: true,
      });
      return;
    }

    res.status(400).json({
      message: "Invalid plan type",
      success: false,
    });
  } catch (error) {
    console.log("Error in creating order: " + JSON.stringify(error));
    res.status(500).json({
      message: "Error in creating order",
      success: false,
    });
  }
});

/**
 * Verify payment after Razorpay checkout
 */
razorRouter.post("/payment/verify", authTokenMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { razorpaySubscriptionId, razorpayPaymentId, razorpaySignature } =
      req.body;

    const subscriptionExist = await prisma.subscription.findUnique({
      where: {
        userId,
      },
    });

    if (!subscriptionExist) {
      res.status(404).json({
        error: "Subscription does not exist",
        success: false,
      });
      return;
    }

    const body = razorpayPaymentId + "|" + razorpaySubscriptionId;
    const expectedSignature = crypto
      .createHmac("sha256", config.KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      await prisma.transaction.create({
        data: {
          planId: planCatalogue[0]!.planId,
          amount: planCatalogue[0]!.amount * 100,
          razorpaySubscriptionId,
          razorpayPaymentId,
          razorpaySignature,
          userId,
          status: "FAILED",
        },
      });

      res.status(400).json({
        message: "Payment signature verification failed",
        success: false,
      });
      return;
    }

    await prisma.transaction.create({
      data: {
        userId,
        razorpaySubscriptionId: subscriptionExist.subscriptionId,
        razorpayPaymentId,
        razorpaySignature,
        planId: planCatalogue[0]!.planId,
        amount: planCatalogue[0]!.amount * 100,
        status: "SUCCESS",
      },
    });

    await prisma.subscription.update({
      where: {
        subscriptionId: razorpaySubscriptionId,
        userId,
      },
      data: {
        status: "ACTIVE",
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      },
    });

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        isPremium: true,
      },
    });

    res.json({
      message: "Verified successfully, enjoy the services",
      success: true,
    });
  } catch (error) {
    console.log("Error in verifying payment: " + error);
    res.status(500).json({
      message: "Error in verifying payment",
      success: false,
    });
  }
});

/**
 * Webhook endpoint for Razorpay events
 */
razorRouter.post(
  "/webhook/razor",
  e.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const signature = req.headers["x-razorpay-signature"];
      const body = req.body.toString();

      const expectedSignature = crypto
        .createHmac("sha256", config.WEBHOOK_SECRET)
        .update(body)
        .digest("hex");

      if (expectedSignature !== signature) {
        console.log("Invalid webhook signature");
        res.status(400).json({ error: "Invalid signature" });
        return;
      }

      const { event, payload } = JSON.parse(body);

      console.log(`Received webhook event: ${event}`);

      switch (event) {
        case "subscription.authenticated":
          await handleSubscriptionAuthenticated(payload);
          break;

        case "subscription.activated":
          await handleSubscriptionActivated(payload);
          break;

        case "subscription.charged":
          await handleSubscriptionCharged(payload);
          break;

        case "subscription.halted":
          await handleSubscriptionHalted(payload);
          break;

        case "subscription.paused":
          await handleSubscriptionPaused(payload);
          break;

        case "subscription.cancelled":
          await handleSubscriptionCancelled(payload);
          break;

        case "subscription.completed":
          await handleSubscriptionCompleted(payload);
          break;

        case "payment.failed":
          await handlePaymentFailed(payload);
          break;

        default:
          console.log(`Unhandled event type: ${event}`);
          await prisma.subscriptionDump.create({
            data: {
              payload: { event, payload, unhandled: true },
            },
          });
      }

      res.json({ success: true, message: "Webhook processed" });
    } catch (error) {
      console.log("Error in webhook handler: " + error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  }
);

razorRouter.post(
  "/payment/abandoned",
  authTokenMiddleware,
  async (req, res) => {
    try {
      const { subscriptionId } = req.body;
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const subscriptionExist = await prisma.subscription.findUnique({
        where: {
          subscriptionId,
          userId,
        },
      });

      if (!subscriptionExist) {
        res.status(404).json({
          error: "No subscription exists",
          success: false,
        });
        return;
      }

      // Delete local subscription record
      await prisma.subscription.delete({
        where: {
          id: subscriptionExist.id,
        },
      });

      // Cancel on Razorpay
      await razorClient.subscriptions.cancel(subscriptionId);

      await prisma.transaction.create({
        data:{
            razorpaySubscriptionId:subscriptionExist.id,
            amount : planCatalogue[0]!.amount * 100,
            currency: planCatalogue[0]!.currency,
            planId: subscriptionExist.planId,
            userId
        }
      })

      res.json({
        message: "Abandoned subscription handled",
        success: true,
      });
    } catch (error) {
      console.log("Error in handling abandoned subscription: " + error);
      res.status(500).json({
        message: "Error in handling abandoned payment",
        success: false,
      });
    }
  }
);

/**
 * Cancel active subscription
 */
razorRouter.post("/cancel", authTokenMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const subscription = await prisma.subscription.findFirst({
      where: { userId: userId, isDeleted: false },
    });

    if (!subscription) {
      res.status(400).json({ error: "No active subscription found" });
      return;
    }

    // Cancel on Razorpay
    await razorClient.subscriptions.cancel(subscription.subscriptionId, true);

    // Create cancellation transaction
    await prisma.transaction.create({
      data: {
        userId,
        razorpaySubscriptionId: subscription.subscriptionId,
        status: "CANCELLED",
        amount: planCatalogue[0]!.amount * 100,
        planId: planCatalogue[0]!.planId,
      },
    });

    // Mark subscription as deleted and cancelled
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        isDeleted: true,
        status: "CANCELLED",
      },
    });

    // Revoke premium access
    await prisma.user.update({
      where: { id: userId },
      data: {
        isPremium: false,
      },
    });

    res.json({ success: true, message: "Subscription cancelled" });
  } catch (err) {
    console.error("Error cancelling subscription:", err);
    res.status(500).json({ error: "Failed to cancel subscription" });
  }
});

/**
 * Get subscription status for current user
 */
razorRouter.get("/status", authTokenMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        subscription: {
          where: {
            isDeleted: false,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({
        message: "User does not exist",
        success: false,
      });
      return;
    }

    const activeSubscription = user.subscription?.[0];

    res.json({
      message: "User subscription status",
      active: activeSubscription ? true : false,
      data: activeSubscription || undefined,
      success: true,
    });
  } catch (error) {
    console.log("Error in getting user billing status: " + error);
    res.status(500).json({
      message: "Error in getting user subscription status",
      success: false,
    });
  }
});

export default razorRouter;
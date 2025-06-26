import express from "express";
import { GoogleOAuthManager } from "../google";
import { randomUUIDv7 } from "bun";
import jwt from "jsonwebtoken";
import config from "../config";
import { prisma } from "../db";
import { authTokenMiddleware } from "../middleware";
import { GlobalUser } from "../mail";

const router = express.Router();

router.get("/callback", async (req, res) => {
  const { state, code } = req.query;
  if (state != req.session.state) {
    res.redirect("http://localhost:5173/login");
    return;
  }

  if (!code) {
    res.redirect("http://localhost:5173");
    return;
  }

  const obj = new GoogleOAuthManager();
  const { access_token, refresh_token, expiry_date } = await obj.getTokens(
    String(code)
  );

  const { emailAddress } = await obj.getUserProfile(obj.gmail);

  const emailExist = await prisma.user.findUnique({
    where: {
      email: emailAddress,
    },
  });

  await prisma.user.upsert({
    where: {
      email: emailAddress,
    },
    update: {
      access_token,
      refresh_token,
      expiry_date: new Date(expiry_date),
    },
    create: {
      email: emailAddress,
      access_token,
      refresh_token,
      expiry_date: new Date(expiry_date),
    },
  });

  const token = jwt.sign({ email: emailAddress }, config.JWT_SECRET!);

  const isLocalhost = req.hostname === "localhost";

  res.cookie("token", token, {
    httpOnly: true,
    secure: !isLocalhost,
    sameSite: "lax",
  });
  res.redirect("http://localhost:5173/dashboard");
  return;
});

router.get("/authorizationUrl", (req, res) => {
  try {
    const token = req.cookies.token;
    console.log(JSON.stringify(token) + "old userrrr ");
    if (token) {
      res.send("http://localhost:5173/about-me");
      return;
    }
    const randomId = randomUUIDv7();
    const { url, state } = GoogleOAuthManager.getAuthorizationURL(randomId);
    req.session.state = state;

    res.send(url);
  } catch (error) {
    console.log("Error in gettting Authorization URl ", error);
    res.json({
      message: "Error in getting Auth URl",
      success: false,
    });
    return;
  }
});

router.get("/emails", authTokenMiddleware, async(req, res) => {
  try {
    const token = GlobalUser[req.email!]
    const client = new GoogleOAuthManager(token)

    const response= await client.getEmailIdsMetaDataList()
    console.log(JSON.stringify(response)+"")    
  } catch (error) {
    console.log("Error in getting emails " + error);
    res.json({
        message:"Error in getting emails",
        success:false
    })
    return;
  }
});

export default router;

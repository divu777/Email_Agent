import type { Request, Response, NextFunction } from "express";

import jwt, { type JwtPayload } from "jsonwebtoken";
import { prisma } from "../../prisma";
import config from "../config";
import { RedisManager } from "../lib/redis";

export const authTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const token = req.cookies["email-agent"];

    if (!token) {

      res.json({
        success:false,
        redirectUrl:config.REDIRECT_FRONTEND_URL});
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    if (!decoded || !decoded.email || !decoded.id) {

      res.json({
        message: "Not valid cookie you trator",
        success: false,
      });
      return;
    }

    // const userExist = GlobalUser[decoded.email];
      const redisCLient  = await RedisManager.getInstance()
    const userExist = await redisCLient.getItems(decoded.email)

    // console.log(JSON.stringify(userExist)+"::::::")
        // console.log(JSON.stringify(userExist2)+"::::::")


    if (!userExist) {
      const user = await prisma.user.findFirst({
        where: {
          email: decoded.email,
        },
      });

      if (!user) {
        res.clearCookie('email-agent',{
          httpOnly:true,
          sameSite:'lax',
          secure:req.hostname==='localhost'?false:true
        })
        res.json({
          success:false,
          redirectUrl:config.FRONTEND_URL});
        return;
      }

      // GlobalUser[user.email] = {
      //   access_token: user?.access_token,
      //   expiry_date: user.expiry_date,
      //   refresh_token: user?.refresh_token,
      // };

      await redisCLient.setItems({
          access_token: user.access_token,
          expiry_date: user.expiry_date,
          refresh_token: user.refresh_token,
        },user.email)

      // await redisclient.set(
      //   `user:${user.email}:tokens`,
      //   JSON.stringify({
      //     access_token: user.access_token,
      //     expiry_date: user.expiry_date,
      //     refresh_token: user.refresh_token,
      //   })
      // );
    }

    req.email = decoded.email;
    req.userId = decoded.id;
    next();
  } catch (error) {
    console.log("Error in the middleware : " + error);
    res.json({
      message: "Error in handling your request , please try again later",
      success: false,
    });
    return;
  }
};

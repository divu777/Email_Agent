import type { Request, Response, NextFunction } from "express";

import jwt, { type JwtPayload } from "jsonwebtoken";
import { GlobalUser } from "../mail";
import { prisma } from "../db";

export const authTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.redirect("http://localhost:5173/login");
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    if (!decoded || !decoded) {
      res.json({
        message: "Not valid cookie you trator",
        success: false,
      });
      return;
    }

    const userExist = GlobalUser[decoded.email];

    if (!userExist) {
      const user = await prisma.user.findFirst({
        where: {
          email: decoded.email,
        },
      });

      if (!user) {
        res.clearCookie('token',{
          httpOnly:true,
          sameSite:'lax',
          secure:req.hostname==='localhost'?false:true
        })
        res.json({
          message: "user with this email doesn't exist",
        });

        return;
      }

      GlobalUser[user.email] = {
        access_token: user?.access_token,
        expiry_date: user.expiry_date,
        refresh_token: user?.refresh_token,
      };
    }

    req.email = decoded.email;

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

import express from 'express'
import { GoogleOAuthManager } from '../google';
import { randomUUIDv7 } from 'bun';
import jwt from 'jsonwebtoken'
import config from '../config';
import { PrismaClient } from '@prisma/client';
import { prisma } from '../db';

const router=express.Router()

router.get("/callback",async(req,res)=>{

    const {state,code}=req.query
    console.log(state +"   gottttt   "+ code)
    console.log(req.session.state +"    req state");
    if(state!=req.session.state){
         res.redirect("http://localhost:5173/login")
         return
    }

    if(!code){
        res.redirect("http://localhost:5173")
        return
    }


    const obj = new GoogleOAuthManager();
   const {access_token,refresh_token,expiry_date} = await obj.getTokens(String(code))

   const {emailAddress} = await obj.getUserProfile(obj.gmail)


   await prisma.user.create({
    data:{
        email:emailAddress,
        name:"Guest",
        access_token,
        refresh_token,
        expiry_date:new Date(expiry_date)
    },

   })
    

    const token = jwt.sign({email:emailAddress},config.JWT_SECRET!)

    res.cookie("token",token,{
        httpOnly:false,
        secure:false,
        sameSite:"none"
    })

    res.redirect("http://localhost:5173/about-me")
    return 
})


router.get("/authorizationUrl",(req,res)=>{
    try {
        const token = req.cookies.token
        console.log(JSON.stringify(token))
        if(token){
            res.send("http://localhost:5173/about-me")
            return
        }
        const randomId = randomUUIDv7()
        const {url ,state} = GoogleOAuthManager.getAuthorizationURL(randomId);
        req.session.state=state

        res.send(url);
        
        
    } catch (error) {
        console.log("Error in gettting Authorization URl ",error);
        res.json({
            message:"Error in getting Auth URl",
            success:false
        })
        return
    }
})

router.get("/emails",(req,res)=>{
    
})



export default router
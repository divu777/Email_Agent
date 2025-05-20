import express from 'express';
import cors from 'cors';
import config from './config';
import googleRouter from "./routes/google"
import genAiRouter from "./routes/genAI"
import 'express-session'
import { GoogleOAuthManager } from './google';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
const app=express();



app.use(express.json());
app.use(cors());
app.use(cookieParser())

app.use("/api/v1/google",googleRouter)
app.use("/api/v1/ai",genAiRouter)

const PORT=config.PORT 




app.get("/api/v1/auth/callback",(req,res)=>{

    const {state,code}=req.query
    if(state!==req.session.state){
         res.status(403).send("State mismatch (potential CSRF)");
         return
    }

     GoogleOAuthManager.getToken({code})

    //  get user info and save it in db 

    const token = jwt.sign({userId:"hhhss",email:"div@gmail.com"},config.JWT_SECRET!)

    res.cookie("token",token,{
        httpOnly:false,
        secure:false,
        sameSite:"none"
    })

    res.redirect("/dashboard")
    return 
})


app.get("/uptime",(req,res)=>{
    res.json({
        message:"Going great Uptime monitor",
        success:true
    })
})

app.listen(PORT,()=>{
    console.log("App is running on PORT "+PORT)
})


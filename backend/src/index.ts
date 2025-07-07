import express from 'express';
import cors from 'cors';
import config from './config';
import googleRouter from "./routes/google.route"
import genAiRouter from "./routes/genAi.routes"
import 'express-session'
import { GoogleOAuthManager } from './google';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import session from 'express-session';
const app=express();

app.use(cookieParser())

app.use(session({
  secret: 'supersecretpassword',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // true in HTTPS
    sameSite: 'lax' // or 'none' if cross-origin and using HTTPS
  }
}));


app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
  credentials: true
}));



app.use("/api/v1/google",googleRouter)
app.use("/api/v1/genai",genAiRouter)

const PORT=config.PORT 







app.get("/uptime",(req,res)=>{
    res.json({
        message:"Going great Uptime monitor",
        success:true
    })
})

app.listen(PORT,()=>{
    console.log("App is running on PORT "+PORT)
})


import express from 'express'

import { authTokenMiddleware } from '../middleware';
import { EmailTypeSchema } from '../types';

import type { GlobalUserType } from "../types";



export const GlobalUser:GlobalUserType={}


const router=express.Router()


router.get("/reply",authTokenMiddleware,async(req,res)=>{
  try {
    const validSchema = EmailTypeSchema.safeParse(req.body)

    if(!validSchema.success){
        res.json({
            message:"Not valid schema",
            success:false
        })
        return
    }

    const {id,messages,impheaders} = req.body








    



    
  } catch (error) {
    console.log(" error in generating reply "+error);
    res.json({
      message:"Error in generating reply for this thread",
      success:false,
    })
    return
  }
})



export default router
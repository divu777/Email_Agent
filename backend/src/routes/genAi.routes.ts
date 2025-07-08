import express from 'express'

import { EmailTypeSchema } from '../types';

import { authTokenMiddleware } from '../middleware';
import { generateReply } from '../ai/mail';





const router=express.Router()


router.post("/reply",authTokenMiddleware,async(req,res)=>{
  try {
    const validSchema = EmailTypeSchema.safeParse(req.body.email)

    if(!validSchema.success){
        res.json({
            message:"Not valid schema",
            success:false
        })
        return
    }


    

    const {messages} = validSchema.data

    const reply = await generateReply({
      user:req.email!,
      user_input:null,
      emails:messages
    })

    if(!reply){
      res.json({
        reply:"Please try again, after some time."
      })
      return
    }


    res.json({
      reply
    })

    return 






    



    
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
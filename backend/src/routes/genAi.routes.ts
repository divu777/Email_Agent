import express from "express";

import { EmailTypeSchema } from "../types";

import { authTokenMiddleware } from "../middleware";
import { craftNewReply, generateReply } from "../ai/mail";

const router = express.Router();

router.post("/reply", authTokenMiddleware, async (req, res) => {
  try {
    const validSchema = EmailTypeSchema.safeParse(req.body.email);

    if (!validSchema.success) {
      res.json({
        message: "Not valid schema",
        success: false,
      });
      return;
    }

    //

    const { messages } = validSchema.data;


    const reply = await generateReply({
      user: req.email!,
      user_input: null,
      emails: messages,
    });

    if (!reply) {
      res.json({
        reply: "Please try again, after some time.",
      });
      return;
    }

    res.json({
      reply,
    });

  } catch (error) {
    console.log(" error in generating reply " + error);
    res.json({
      message: "Error in generating reply for this thread",
      success: false,
    });
    return;
  }
});

import z, { success } from 'zod/v4'
import { prisma } from "../../prisma";
import { deleteFile, generatePreSignedURL } from "../lib/s3";

const craftNewReplySchema = z.object({
  subject:z.string().nullable(),
  body:z.string().nullable()
})


router.post("/craft",authTokenMiddleware,async(req,res)=>{
    const body = req.body

    const validSchema = craftNewReplySchema.safeParse(body);

    console.log(validSchema)

    if(!validSchema.success){
      console.log("not valid schema");
      res.json({
        message:"Not correct Inputs",
        success:false
      })
      return
    }

    const user = req.email
    
    if(!user){
      console.log("user not available");
      return
    }

    const response = await craftNewReply({user , payload:{subject:validSchema.data.subject || null ,body:validSchema.data.body || null}})


    if(response.error){
      res.json({
        message:"Error in generating reply",
        error:response.error,
        success:false
      })
      return
    }

    res.json({
      message:"Here is the new generated reply",
      data:response,
      success:true
    })
})


router.get("/messages",authTokenMiddleware,async(_,res)=>{
  try {

    const email = _.email

    if(!email){
      return
    }

    const user = await prisma.user.findUnique({
      where:{
        email
      },
      select:{
        messages:true
      }
    })

    if(!user){
      res.json({
        message:"Unauthorized user",
        success:false
      })
      return
    }

    res.json({
      message:"Fetched user messages successfully.",
      success:true,
      messages:user.messages
    })

    
  } catch (error) {
    console.log("Error in getting user messages: "+error);
    res.json({
      message:"Error in getting user message",
      success:false
    })
  }
})

router.post("/presignedUrl",authTokenMiddleware,async(_,res)=>{
  try {
    const { filename,contentType} = _.body

    console.log(JSON.stringify(_.body)+"============>>>>")

    const url = await generatePreSignedURL(filename,contentType)

    if(!url){
      res.json({
        message:"Error in getting Presigned Url",
        success:false
      })
      return
    }
    
    res.json({
      message:"Fetched presigned Url",
      success:true,
      url
    })
  } catch (error) {
    console.log("Error in getting presigned Url: "+error);
    res.json({
      message:'Error in getting presigned Url.',
      success:false
    })
  }
})

router.delete("/deleteFile/:fileName",authTokenMiddleware,async(req,res)=>{
  try {
    const {fileName} = req.params

    if(!fileName){
      return
    }

    const deleted = await deleteFile(fileName);

    if(!deleted){
      res.json({
        message:"Error in deleting file",
        success:false
      })
      return
    }

    res.json({
      message:"Deleted successfully",
      success:true
    })
    
  } catch (error) {
    console.log("Error in delete the file: "+error);
    res.json({
      message:"Error in delete the file",
      success:false
    })
  }
})


export default router;

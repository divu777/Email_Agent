import e from "express";
import { gmailobj } from "../gmail";
import { db } from "../db";
import { activeIntervals, handleEmail } from "../email";

const router = e.Router();

// check if userId exists in OAuth
router.get("/checkOAuth/:userId", async (req, res) => {
  const { userId } = req.params;


  const result = await db.oAuth.findUnique({
    where: { userId },
  });
  

  if (!result) {
    return res.json({
      message: `No token available for the userId + ${userId}`,
      status: 200,
      data:false,
    });
  } 
  
  return res.json({
    message: `Token available for the userId + ${userId}`,
    status: 200,
    data: result,
  });
});

// get auth URL to initiate OAuth flow
router.post("/getAuthUrl", async (req, res) => {
  try {
    const { userId, email } = req.body;

    await db.user.upsert({
      where: { id: userId },
      update: { email },
      create: { id: userId, email, lastHistoryId: "" },
    });

    const authUrl = gmailobj.getAuthorizationURl(userId);

    return res.json({ status: 200, url: authUrl });
  } catch (err) {
    console.log(err);
    return res.json({
      message: "Error in getting the Auth Url",
      status: 500,
    });
  }
});

// start email service if user already authorized
router.post("/startService", async (req, res) => {
  try {
    const { userId } = req.body;

    const result = await db.oAuth.findUnique({
      where: { userId },
    });

    if (!result) {
      return res.json({
        message: "No Token for this User Redirect to Auth Flow",
        data: false,
      });
    }

    // if(result && !result.onboarding_complete){
    //   return res.json({
    //     message:"Onboarding not Complete",
    //     data:result
    //   })
    // }

    if (result && !result.auto_reply) {
      return res.json({
        message: "Auto reply is set to False",
        data: result,
      });
    }

    const { access_token, refresh_token, expiry_date, auto_reply , prompt } = result;

    await gmailobj.check_expiry({ access_token, refresh_token, expiry_date, auto_reply ,prompt}, userId);

    handleEmail(userId,prompt);

    return res.json({
      message: 'Email service started with OAuth Tokens',
      data: result,
    });
  } catch (err) {
    console.log(err);
    return res.json({
      message: "Error getting the Token for the UserId from the DB",
      status: 500,
    });
  }
});

// toggle Auto-Reply On or Off
router.post("/toggleAutoReply", async (req, res) => {
  const { userId, auto_reply } = req.body;
  console.log(JSON.stringify(req.body))
  if (auto_reply) {
   const result= await db.oAuth.update({
      where: { userId },
      data: { auto_reply: true }
    });
    const { access_token, refresh_token, expiry_date, auto_reply ,prompt} = result;

    await gmailobj.check_expiry({ access_token, refresh_token, expiry_date, auto_reply }, userId);
    handleEmail(userId,prompt);
    console.log("Auto-reply service started.");
    return res.json({ message: "Auto-reply service started." });
  } else {
    if (activeIntervals[userId]) {
      clearInterval(activeIntervals[userId]);
      delete activeIntervals[userId];
    }

    await db.oAuth.update({
      where: { userId },
      data: { auto_reply: false },
    });

    console.log("Auto-reply service stopped.");
    return res.json({ message: "Auto-reply service stopped." });
  }
});

// this will get the email Threads for the frontend to store in the state 

router.get("/getEmailThread", async(req,res)=>{
  try{
    const result=await db.emailThread.findMany();
    if(!result){
      return res.status(200).json({
        message:"Email Thread Could Not be Fetched Successfully",
        data: null
      })
      
    }

    return res.status(200).json({
      message:"Email Thread fetched Successfully",
      data:result
    })
  }catch(err){
    console.log("Error in getting email thread"+err)
  }
})



router.get("/getEmailThread/:threadId", async(req,res)=>{
  try{
    const {threadId} = req.params;
    const result=await db.emailThread.findUnique({
      where:{
        threadId
      }
    });
    if(!result){
      return res.status(200).json({
        message:`Emails Could Not be Fetched for the threadId ${threadId}`,
        data: null
      })
      
    }

    return res.status(200).json({
      message:`Emails fetched Successfully for threadID ${threadId}`,
      data:result
    })
  }catch(err){
    console.log("Error in getting emails for the threadId"+err)
  }
})

export default router;

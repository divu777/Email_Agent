import e from "express";
import { gmailobj } from "../gmail";
import { db } from "../db";
import { activeIntervals, handleEmail } from "../email";
import { addJobsToMail, sendFirstEmailQueue } from "../redis";
import { google } from "googleapis";

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
      success:false
    });
  } 
  
  return res.json({
    message: `Token available for the userId + ${userId}`,
    status: 200,
    data: result,
    success:true
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
      include:{
        user:{
          select:{
            email:true
          }
        }
      }
    });

    if (!result) {
      return res.json({
        message: "No Token for this User Redirect to Auth Flow",
        data: false,
      });
    }

    if (result && !result.auto_reply) {
      return res.json({
        message: "Auto reply is set to False",
        data: result,
      });
    }


    const { access_token, refresh_token, expiry_date,prompt,first_email_send, user} = result;

    await gmailobj.check_expiry({ access_token, refresh_token, expiry_date}, userId);

    // const oauth2 = google.gmail({
    //   version: "v1",
    //   auth: gmailobj.oauth2Client,
    // });
    console.log("inside start email");

    // await oauth2.users.watch({
    //   userId: 'me',
    //   requestBody: {
    //     topicName: 'projects/moonlit-bliss-454514-c1/topics/gmail-notifs',
    //     labelIds: ['INBOX'], 
    //   },
    // });
    if(!first_email_send){

       addJobsToMail({userId,email:user.email})

        
      //     userId,
      //     email:user.email
        
      // }, {
      //   attempts: 3,
      //   backoff: {
      //     type: 'exponential',
      //     delay: 5000, // in ms
      //   },
      // });
    }

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
  if (auto_reply) {
   const result= await db.oAuth.update({
      where: { userId },
      data: { auto_reply: true }
    });
    const { access_token, refresh_token, expiry_date, auto_reply ,prompt} = result;

    await gmailobj.check_expiry({ access_token, refresh_token, expiry_date, auto_reply }, userId);
    handleEmail(userId,prompt);
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

router.get("/getEmailThreads/:userId", async(req,res)=>{
  try{
    let {userId} = req.params;
    let result=await db.emailThread.findMany({
      where:{
        userId
      },
      select:{
        id:true,
        userId:true,
        threadId:true,
        subject:true,
        createdAt:true,
        updatedAt:true,
        emails:true
      }
    });
    if(!result){
      return res.status(200).json({
        message:"Email Thread Could Not be Fetched Successfully",
        data: null
      })
      
    }

    result=result.map(thread=>
    {
      const isUnread=thread.emails.some(email=>!email.read)
      return {
        ...thread,
        read:!isUnread
      }
    }
    )

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
      },
      select:{
        emails:true
      }
    });
    if(!result){
      return res.status(200).json({
        message:`Emails Could Not be Fetched for the threadId ${threadId}`,
        status:false
      })
      
    }

    return res.status(200).json({
      message:`Emails fetched Successfully for threadID ${threadId}`,
      data:{emails:result.emails},
      status:true
    })
  }catch(err){
    console.log("Error in getting emails for the threadId"+err)
  }
})


router.post("/markThreadRead/:threadId", async (req, res) => {
  try {
    const { threadId } = req.params;

    const updated = await db.email.updateMany({
      where: { threadId },
      data: { read: true },
    });

    return res.status(200).json({
      message: `Marked all emails in thread ${threadId} as read`,
      updatedCount: updated.count,
    });
  } catch (err) {
    console.log("Error marking emails read", err);
    return res.status(500).json({ message: "Failed to mark emails as read" });
  }
});


router.post('/pubsub-webhook', async (req, res) => {
  const msg = req.body.message;
  if (!msg || !msg.data) {
    return res.status(400).send("Invalid Pub/Sub message");
  }

  const decoded = JSON.parse(Buffer.from(msg.data, 'base64').toString());
  const { historyId, emailAddress } = decoded;

  console.log("New email notification for:", emailAddress, "History ID:", historyId);

  // Do what your polling loop did — process messages
  // await processHistoryChanges(emailAddress, historyId);

  res.status(200).send(); // ACK the message
});

export default router;

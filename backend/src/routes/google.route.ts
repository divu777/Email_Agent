import express from "express";
import { GoogleOAuthManager } from "../google";
import { randomUUIDv7 } from "bun";
import jwt from "jsonwebtoken";
import config from "../config";
import { authTokenMiddleware } from "../middleware";
import {prisma} from "../../prisma/index"
import { GlobalUser } from "../ai/mail";
import z from "zod/v4";
const router = express.Router();

router.get("/callback", async (req, res) => {
  const { state, code } = req.query;
  if (state != req.session.state) {
    res.redirect("http://localhost:5173/login");
    return;
  }

  if (!code) {
    res.redirect("http://localhost:5173");
    return;
  }

  const obj = new GoogleOAuthManager();
  const { access_token, refresh_token, expiry_date } = await obj.getTokens(
    String(code)
  );

  const  emailAddress  = await obj.getUserProfile();

  if(!emailAddress){
    return
  }

  const emailExist = await prisma.user.findUnique({
    where: {
      email: emailAddress,
    },
  });

  await prisma.user.upsert({
    where: {
      email: emailAddress,
    },
    update: {
      access_token,
      refresh_token,
      expiry_date: new Date(expiry_date),
    },
    create: {
      email: emailAddress,
      access_token,
      refresh_token,
      expiry_date: new Date(expiry_date),
    },
  });

  const token = jwt.sign({ email: emailAddress }, config.JWT_SECRET!);

  const isLocalhost = req.hostname === "localhost";

  res.cookie("email-agent", token, {
    httpOnly: true,
    secure: !isLocalhost,
    sameSite: "lax",
  });
  res.redirect("http://localhost:5173/dashboard");
  return;
});

router.get("/authorizationUrl", (req, res) => {
  try {
    const token =  req.cookies["email-agent"]
    console.log(JSON.stringify(token) + "old userrrr ");
    if (token) {
      res.send("http://localhost:5173/dashboard");
      return;
    }
    const randomId = randomUUIDv7();
    const { url, state } = GoogleOAuthManager.getAuthorizationURL(randomId);
    req.session.state = state;

    res.send(url);
  } catch (error) {
    console.log("Error in gettting Authorization URl ", error);
    res.json({
      message: "Error in getting Auth URl",
      success: false,
    });
    return;
  }
});



router.get("/emails", authTokenMiddleware, async(req, res) => {
  try {
    const token = GlobalUser[req.email!]
    const client = new GoogleOAuthManager(token)

    const response = await client.getEmailIdsMetaDataList()

    if(!response || !response.messages){
      return
    }

    let MessageArray = []

    MessageArray = await Promise.all ( response.messages.map((msg:any) => {
         return client.getEmailData(msg.id)!
    }));

    MessageArray = MessageArray.map((message)=>{
      
      let from = message?.impheaders?.filter((head)=>head.name=="From")[0]?.value || ""
     let  subject =  message?.impheaders?.filter((head)=>head.name=="Subject")[0]?.value || ""
     
     return{
      id: message?.id,
      threadId: message?.threadId,
    from: from,
    subject: subject,
    snippet: message?.snippet,
     }
  })

    res.json({
      message:"fetch data successfully",
      array:MessageArray,
      success:true
    })
    return
  } catch (error) {
    console.log("Error in getting emails " + error);
    res.json({
        message:"Error in getting emails",
        success:false
    })
    return;
  }
});



router.get("/emails/:threadId",authTokenMiddleware,async(req,res)=>{
  const {threadId} = req.params

  if(!threadId){
    console.log("no threadid");
    return
  }
  try {
    const email = req.email;

    if(!email){
      console.log("no email in the req")
      return
    }

    const tokens = GlobalUser[email]

    if(!tokens){
      console.log("no tokens available ");
      return 
    }


    const gmalInstance = new GoogleOAuthManager(tokens)

    const data = await gmalInstance.getfullThreadId(threadId,'metadata')

    res.json({
      message:"data fetched of the email",
      success:true,
      data
    })
    return 

    
  } catch (error) {
    console.log("error in getting thread "+error)
    res.json({
      message:"Error in getting thread "+threadId,
      success:false
    })
    return
  }
})

const ReplyThreadSchema = z.object({
  body:z.string(),
  subject:z.string(),
  references:z.string(),
  to : z.email(),
  messageId:z.string()

})

export type replyType = z.infer<typeof ReplyThreadSchema>

// sending reply to a thread
router.post("/email/reply",authTokenMiddleware,async(req,res)=>{
  const email = req.email
  try {

    if(!email){
      console.log("here")
      return 
    }

    //console.log(JSON.stringify(req.body))
    const validSchema = ReplyThreadSchema.safeParse(req.body);

    if(!validSchema.success){
      res.json({
        message:"Not valid schema",
        success:false
      })
      return
    }

    validSchema.data

    const tokens = GlobalUser[email]

    const gmail = new GoogleOAuthManager(tokens)

    console.log(JSON.stringify(validSchema.data)+"]]]]]]")

    //gmail.replyToThread(validSchema.data)
    
  } catch (error) {
    console.log("Error in sending reply")
  }
})




export default router;

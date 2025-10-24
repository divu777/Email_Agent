import express from "express";
import { GoogleOAuthManager } from "../google";
import { randomUUIDv7 } from "bun";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { authTokenMiddleware } from "../middleware";
import {prisma} from "../../prisma/index"
import z, { success } from "zod/v4";
import { RedisManager } from "../lib/redis";
const router = express.Router();

router.get("/callback", async (req, res) => {
  //console.log("--------")
  const { state, code } = req.query;
  if (state != req.session.state) {
    res.redirect(config.REDIRECT_FRONTEND_URL);
    return;
  }

  if (!code) {
    res.redirect(config.FRONTEND_URL);
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

  const user =await prisma.user.upsert({
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

  const token = jwt.sign({id:user.id, email: emailAddress }, config.JWT_SECRET!);

  const isLocalhost = req.hostname === "localhost";

  res.cookie("email-agent", token, {
    httpOnly: true,
    secure: !isLocalhost,
    sameSite: "lax",
  });
  res.redirect(config.DASHBOARD_URL);
  return;
});

router.get("/authorizationUrl", async(req, res) => {
  try {
      const isLocalhost = req.hostname === "localhost";

    const token =  req.cookies["email-agent"]
    if (token) {
      const decoded = jwt.verify(token,config.JWT_SECRET!) as JwtPayload
      if(!decoded || !decoded.email){
        res.clearCookie('email-agent',{
          httpOnly:true,
          secure:!isLocalhost,
          sameSite:"lax"
        })

      }else{

        const userExist = await prisma.user.findUnique({
          where:{
            email:decoded.email
          }
        })

        if(!userExist){
          res.clearCookie('email-agent',{
            httpOnly:true,
            secure:!isLocalhost,
            sameSite:'lax'
          })

        }else{
          res.send({
            success:false,
            redirectUrl:config.DASHBOARD_URL})
        }

      }
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



router.get("/emails/:pageToken", authTokenMiddleware, async(req, res) => {
  try {
    //const token2 = GlobalUser[req.email!]
    const redisClient = await RedisManager.getInstance()

    const token = await redisClient.getItems(req.email!)


    //console.log(JSON.stringify(token)+"-----------page token")
        // console.log(JSON.stringify(token2)+"-----------page token")



    const pageToken = req.params.pageToken

    
    const client = new GoogleOAuthManager(token)

    const response = await client.getEmailIdsMetaDataList(pageToken=="0"?undefined:pageToken)


    if(!response || !response.messages){
      return
    }
    //console.log(JSON.stringify(response))
    let MessageArray = []

    MessageArray = await Promise.all ( response.messages.map((thread:any) => {
         return client.getEmailData(thread.id)!
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
      success:true,
      nextPageToken : response.nextPageToken

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



router.get("/email/:threadId",authTokenMiddleware,async(req,res)=>{
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

    // const tokens = GlobalUser[email]
    const redisClient = await RedisManager.getInstance()
    const tokens = await redisClient.getItems(email)


    if(!tokens){
      console.log("no tokens available ");
      return 
    }


    const gmalInstance = new GoogleOAuthManager(tokens)

    const data = await gmalInstance.getfullThreadId(threadId,'full')

    res.json({
      message:"data fetched of the email",
      success:true,
      data
    })
    return 

    
  } catch (error) {
    console.log("error in getting thread "+error)
          const isLocalhost = req.hostname === "localhost";

      res.clearCookie('email-agent',{
            httpOnly:true,
            secure:!isLocalhost,
            sameSite:'lax'
          })
    res.json({
      message:"Error in getting thread "+threadId,
      success:false,
      redirectUrl:config.FRONTEND_URL
    })
    return
  }
})

const ReplyThreadSchema = z.object({
  body:z.string(),
  subject:z.string(),
  references:z.string(),
  to : z.string(),
  messageId:z.string(),
  threadId:z.string()
})

export type replyType = z.infer<typeof ReplyThreadSchema>

// sending reply to a thread
router.post("/email/reply",authTokenMiddleware,async(req,res)=>{
  const email = req.email
  try {

    if(!email){
      return 
    }

    const validSchema = ReplyThreadSchema.safeParse(req.body);


    if(!validSchema.success){
      res.json({
        message:"Not valid schema",
        success:false
      })
      return
    }

    validSchema.data

    // const tokens = GlobalUser[email]
     const redisClient = await RedisManager.getInstance()
    const tokens = await redisClient.getItems(email)


    const gmail = new GoogleOAuthManager(tokens)


    await gmail.replyToThread(validSchema.data)
    
  } catch (error) {
    console.log("Error in sending reply")
  }
})

export const NewEmailSchema = z.object({
  to:z.string(),
  subject:z.string(),
  body:z.string()
})


router.post("/email/new",authTokenMiddleware,async(req,res)=>{
  try {

    
    const email = req.email
    
    if(!email){
      return
    }
    const validSchema  = NewEmailSchema.safeParse(req.body)

    if(!validSchema.success){
      console.log("wrong format");
      res.json({
        message:"Wrong format",
        success:false
      })
      return
    }


    // const tokens = GlobalUser[email]
 const redisClient = await RedisManager.getInstance()
    const tokens = await redisClient.getItems(email)

    const gmailClnt = new GoogleOAuthManager(tokens);

    const response = await gmailClnt.sendEmail(validSchema.data)

    res.json({
      message:"Send email",
      success:true
    })

    return

    
  } catch (error) {
    console.log("Error in sending new email "+error);
    res.json({
      message:"Error in sending new email",
      success:false
    })
  }
})


router.post("/logout",authTokenMiddleware,async(req,res)=>{
  try {
    const email = req.email
    if(!email){
      return
    }
   const islocalHost = req.hostname=="localhost"

    res.clearCookie('email-agent',{
      httpOnly:true,
      secure:!islocalHost,
      sameSite:"lax"
    })

    res.json({
      success:false,
      redirectUrl:config.FRONTEND_URL})

    
  } catch (error) {
    console.log("Error is deleting account: "+error);
    res.json({
      message:"Error in logging out",
      success:false
    })
  }
})




export default router;

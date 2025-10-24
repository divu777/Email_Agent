import { gmail_v1, google } from "googleapis";
import config from "../config/index";
import type { replyType } from "../routes/google.route";
import z from "zod/v4";
import { processGmailMessages } from "./convert";
import { RedisManager } from "../lib/redis";
export class GoogleOAuthManager {
  static SCOPES = [
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email",
  ];
  public tokens: any;
  public gmail: gmail_v1.Gmail | null = null;

  constructor(tokens?: any) {
    if (tokens) {
      this.tokens = tokens;
      const client = GoogleOAuthManager.createOAuthClient();
      client.setCredentials(tokens);
      this.gmail = google.gmail({ version: "v1", auth: client });
    }
  }
  static createOAuthClient() {
    return new google.auth.OAuth2(
      config.CLIENT_ID,
      config.CLIENT_SECRET,
      config.REDIRECT_URL
    );
  }

  static async getNewTokens(tokens: any) {
    const client = GoogleOAuthManager.createOAuthClient();
    client.setCredentials(tokens);

    const token = await client.refreshAccessToken();

    return token;
  }

  static getAuthorizationURL(userId: string) {
    let state = JSON.stringify({ userId });
    state = Buffer.from(state).toString("base64");
   // console.log(state + " maaadeee");
    const client = this.createOAuthClient();
    const url = client.generateAuthUrl({
      access_type: "offline",
      scope: this.SCOPES,
      prompt: "consent",
      include_grant_scopes: true,
      state: state,
    });

    return {
      url,
      state,
    };
  }

  async getTokens(code: string): Promise<any> {
    try {
      if (!code) {
        throw new Error("Authorization code is missing");
      }
      const client = GoogleOAuthManager.createOAuthClient();
      const { tokens } = await client.getToken(code);
      client.setCredentials(tokens);
      this.gmail = google.gmail({ version: "v1", auth: client });
      this.tokens = tokens;

      return tokens;
    } catch (error) {
      console.log("Error in setting tokens " + error);
    }
  }
  async ensureValidTokens() {
  const expiry = this.tokens?.expiry_date ? new Date(this.tokens.expiry_date).getTime() : null
  const now = Date.now()

  if (!expiry || expiry < now) {
    console.log("Refreshing expired token...")
    const refreshed = await GoogleOAuthManager.getNewTokens(this.tokens)

    this.tokens = refreshed.credentials
    const client = GoogleOAuthManager.createOAuthClient()
    client.setCredentials(this.tokens)
    this.gmail = google.gmail({ version: "v1", auth: client })

    // Persist back to Redis
    const redisClient = await RedisManager.getInstance()
    await redisClient.setItems(this.tokens, this.tokens.email)
  }
}


  async getUserProfile(gmail?: gmail_v1.Gmail) {
    try {
      const userInfo = await this.gmail!.users.getProfile({ userId: "me" });
      return userInfo.data.emailAddress;
    } catch (error) {
      console.log("Error in getting user profile " + error);
    }
  }

    /* 
    this is for the base - dashboard with uk primary emails with header to show in the ui as default we pass 
    primary in labels, could be use to get and show specific emails like important, sent, drafts, all, spam, etc 
    */
  async getEmailIdsMetaDataList(
    token?:string,
    labels: any[] = ["IMPORTANT"]
  ) {
    try {
     // console.log("-------"+token)
       await this.ensureValidTokens()

      const emailThreadIds = await this.gmail!.users.messages.list({
        userId: "me",
        maxResults:20,
        pageToken:token?token: undefined,
        labelIds: labels,
      });
     //console.log(JSON.stringify(emailThreadIds))
      return emailThreadIds.data;
    } catch (error) {
      console.log("Error in getting the Email " + error);
    }
  }

  // get threads all chats data to show to the user , also can be user to use as context to provide in the prompt
  async getEmailData(messageId: string, format = "metadata") {
    try {
      const emailData = await this.gmail!.users.messages.get({
        userId: "me",
        id: messageId,
        format,
      });
    //console.log(JSON.stringify(emailData)+"------>")
      const impheaders = emailData.data.payload?.headers?.filter(
        (head) =>
          head.name === "From" ||
          head.name === "Subject" ||
          head.name === "Date" ||
          head.name === "To"
      );
      delete emailData.data.payload;
      return { ...emailData.data, impheaders };
    } catch (error) {
      console.log("Error in getting the Email 2 " + error);
    }
  }

  async getfullThreadId(threadId: string, format: string ='full') {
    try {
      const { data } = await this.gmail!.users.threads.get({
        userId: "me",
        id: threadId,
        format,
      });
      //console.log(JSON.stringify(data)+"--->>>>")

      data.messages = data.messages!.map((message) => {

         const impheaders = message?.payload?.headers?.filter(
        (head) =>
          head.name === "From" ||
          head.name === "Subject" ||
          head.name === "Date" ||
          head.name === "To" || 
          head.name === 'References' ||
          head.name === 'Message-ID'
      );

        delete message.payload;

        return {
          id: message.id,
          snippet: message.snippet,
          labels: message.labelIds,
          impheaders,
        };
      });

      return {
        ...data,
      };
    } catch (error) {
      console.log("error in getting the whole thread " + error);
    }
  }


  async sendEmail(data: SendMessageType) {
    try {
     // console.log("here1")
      if(!this.gmail){
        return
      }
      //console.log("here2")

      const emailLines = [ 
       `To: ${data.to}`,
       `Subject: ${data.subject}`,
        ``,
        data.body
      ]

      const email  = emailLines.join("\r\n")

      const raw = Buffer.from(email)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");


      const sendMessage = await this.gmail.users.messages.send({
        userId: "me",
        requestBody:{
          raw:raw
        }
      });
      

     // console.log("senddd");
    } catch (error) {
      console.log("Erorr in sending the email"+error);
    }
  }


  // you just have to send the references from the last email exchaned in the thread 
  // and the messageId of the last email , both of from headers and PS ; messageid is not the same one you are thinking of 
  async replyToThread(data:replyType){
    try {
      const emailLines = [
      `To: ${data.to}`,
      `Subject: ${data.subject.startsWith("Re:") ? data.subject : "Re: " + data.subject}`,
      `In-Reply-To: ${data.messageId}`,
      `References: ${data.references}`,
      'Content-Type: text/plain; charset="UTF-8"',
      'Content-Transfer-Encoding: 7bit',
      '', 
      data.body,
    ];

    const email = emailLines.join("\r\n");

    const raw = Buffer.from(email)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    await this.gmail?.users.messages.send({
      userId: "me",
      requestBody: {
        raw: raw,
        threadId:data.threadId
      },
    });

   // console.log("sent");
    } catch (error) {
      console.log("error in replying within the thread"+error)
    }
  }
}



const SendMessageSchema = z.object({
  to:z.string(),
  body:z.string(),
  subject:z.string()
})

type SendMessageType = z.infer<typeof SendMessageSchema>
import { google } from "googleapis";
import config from "../config";
import { db } from "../db";

class Gmail {
  oauth2Client: any;
  gmail: any;
  SCOPES = ["https://www.googleapis.com/auth/gmail.modify"];
  state = "";

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      config.CLIENT_ID,
      config.CLIENT_SECRET,
      config.REDIRECT_URL
    );
  }

  getAuthorizationURl(userId: string) {
    this.state = JSON.stringify({ userId });
    this.state = Buffer.from(this.state).toString("base64");
    console.log(this.state+"this is state and user id  "+ userId);
    return this.oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: this.SCOPES,
      prompt: "consent",
      include_grant_scopes: true,
      state: this.state,
    });
  }

  async setTokens(q: any, userId: string) {
    try {
      if (!q.code) throw new Error("Authorization code is missing.");
      const { tokens } = await this.oauth2Client.getToken(q.code);
      const { access_token, refresh_token, expiry_date } = tokens;
      this.oauth2Client.setCredentials(tokens);
      await db.oAuth.create({
        data: {
          userId,
          access_token,
          refresh_token,
          expiry_date: new Date(expiry_date),
        },
      });
      this.gmail = google.gmail({ version: "v1", auth: this.oauth2Client });
      console.log("Tokens set successfully:", tokens);
    } catch (error) {
      console.error("Error setting tokens:", error);
    }
  }

  async check_expiry(tokens:any,userId:string) {
    try {
      this.oauth2Client.setCredentials(tokens);
      if (!tokens.expiry_date || tokens.expiry_date < Date.now()) {
        console.log("Token expired, refreshing...");
        const {res} = await this.oauth2Client.getAccessToken();
        await db.oAuth.update({
          where:{
            userId
          },
          data:{
            access_token:res.data.access_token,
            refresh_token:res.data.refresh_token,
            expiry_date:new Date(res.data.expiry_date),
          }
        })
        console.log("New tokens after refresh:"+res.data);
      } else {
        console.log("Tokens are still valid.");
      }
    } catch (error) {
      console.error("Error checking token expiry:", error);
    }
  }

  
}

export const gmailobj = new Gmail();

import { google } from "googleapis";
import config from "../config/index";
export class GoogleOAuthManager{
   static SCOPES=["https://www.googleapis.com/auth/gmail.modify","https://www.googleapis.com/auth/userinfo.profile","https://www.googleapis.com/auth/userinfo.email"];
    constructor(){
       
    }

    static createOAuthClient(){
         return new google.auth.OAuth2(
            config.CLIENT_ID,
            config.CLIENT_SECRET,
            config.REDIRECT_URL
        )
    }

    static getAuthorizationURL(userId:string){
        let state=JSON.stringify({userId});
        state=Buffer.from(state).toString("base64");
        const client=this.createOAuthClient()
        const url= client.generateAuthUrl({
            access_type:"offline",
            scope:this.SCOPES,
            prompt:"consent",
            include_grant_scopes:true,
            state:state
        })

        return {
            url,
            state
        }
    }

    static async getToken(q:any):Promise<any>{
        try {

            if(!q.code){
                throw new Error("Authorization code is missing");
            }
            const client =this.createOAuthClient()
            const {tokens}=await client.getToken(q.code);
            return tokens
            
        } catch (error) {
            console.log("Error in setting tokens "+error);
        }
    }

}

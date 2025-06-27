import { gmail_v1, google } from "googleapis";
import config from "../config/index";
export class GoogleOAuthManager{
   static SCOPES=["https://www.googleapis.com/auth/gmail.modify","https://www.googleapis.com/auth/userinfo.profile","https://www.googleapis.com/auth/userinfo.email"];
    public tokens:any
    public gmail: gmail_v1.Gmail | null = null;

    constructor(tokens?:any){
        if(tokens){
            this.tokens=tokens
            const client = GoogleOAuthManager.createOAuthClient()
            client.setCredentials(tokens);
            this.gmail = google.gmail({ version: "v1", auth: client });
        }
    }
    static createOAuthClient(){
         return new google.auth.OAuth2(
            config.CLIENT_ID,
            config.CLIENT_SECRET,
            config.REDIRECT_URL
        )
    }

     static async getNewTokens(tokens:any){
        const client = GoogleOAuthManager.createOAuthClient()
        client.setCredentials(tokens)

        const token = await client.refreshAccessToken()

        return token
     }

    static getAuthorizationURL(userId:string){
        let state=JSON.stringify({userId});
        state=Buffer.from(state).toString("base64");
        console.log(state + " maaadeee")
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

     async getTokens(code:string):Promise<any>{
        try {

            if(!code){
                throw new Error("Authorization code is missing");
            }
            const client =GoogleOAuthManager.createOAuthClient()
            const {tokens}=await client.getToken(code);
            client.setCredentials(tokens);
            this.gmail= google.gmail({ version: "v1", auth: client });
            this.tokens=tokens  


            return tokens
        
            
        } catch (error) {
            console.log("Error in setting tokens "+error);
        }
    }

    async getUserProfile(gmail?:gmail_v1.Gmail){
        try {
            const userInfo = await this.gmail!.users.getProfile({userId:"me"});
            return userInfo.data.emailAddress
        } catch (error) {
            console.log("Error in getting user profile "+error)
        }
    }


    /* 
    this is for the base - dashboard with uk primary emails with header to show in the ui as default we pass primary in labels ,
    could be use to get and show specific emails like important , sent , drafts , all , spam etc 
    */
    async getEmailIdsMetaDataList(gmail?:gmail_v1.Gmail,labels:any[]=["IMPORTANT"]){
        try {

            const emailThreadIds= await this.gmail!.users.messages.list({userId:'me',maxResults:20,labelIds:labels})
            return emailThreadIds.data
        } catch (error) {
            console.log("Error in getting the Email "+error)
        }
    }

    // get threads all chats data to show to the user , also can be user to use as context to provide in the prompt
    async getEmailData(threadId:string,gmail?:gmail_v1.Gmail){
     try {

            const emailData= await this.gmail!.users.messages.get({userId:'me',id:threadId,format:'metadata'})

            const impheaders = emailData.data.payload?.headers?.filter((head)=>head.name ==="From" || head.name==="Subject")
            delete emailData.data.payload
            return {...emailData.data,impheaders}
        } catch (error) {
            console.log("Error in getting the Email "+error)
        }
    }


    async sendEmail(gmail:gmail_v1.Gmail,data:any){
        try {
            
            const sendMessage = await gmail.users.messages.send({
                userId:"me",
                requestBody:{
                    internalDate:Date.now().toString(),
                    payload:{
                        body:{
                            data:Buffer.from("hello bhaiyaa").toString('base64')
                        },
                        headers:[{
                           name:"To",
                           value:"divakarjaiswal707@gmail.com" 
                        },{
                            name:'Subject',
                            value:'Just Checking In'
                        }
                    ]
                    }
                }
            })
        } catch (error) {
            console.log("Erorr in sending the email")
        }
    }

}



/*
first the new user flow works and now makes entry in the database 

second step have to check with ki if token exist and redirect to dashboard for old user 
third step is more like dashboard making using the client 
making the authmiddleware and state map property for uk userId : { tokens  } 

fouth is UI and using it with genai and streaming it with help tools or calls 

*/


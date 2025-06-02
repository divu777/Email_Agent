import { gmail_v1, google } from "googleapis";
import config from "../config/index";
export class GoogleOAuthManager{
   static SCOPES=["https://www.googleapis.com/auth/gmail.modify","https://www.googleapis.com/auth/userinfo.profile","https://www.googleapis.com/auth/userinfo.email"];
    private oauth2Client:any
    private tokens:any
    private gmail:any

    constructor(tokens?:any){
        this.oauth2Client=new google.auth.OAuth2(
            config.CLIENT_ID,
            config.CLIENT_SECRET,
            config.REDIRECT_URL
        )
        if(tokens){
            this.tokens=tokens
        }
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

     async getTokens(q:any):Promise<any>{
        try {

            if(!q.code){
                throw new Error("Authorization code is missing");
            }
            const client =GoogleOAuthManager.createOAuthClient()
            const {tokens}=await client.getToken(q.code);
            client.setCredentials(tokens);
                return  { gmaill : google.gmail({ version: "v1", auth: client }) ,tokens  
        } 
            
        } catch (error) {
            console.log("Error in setting tokens "+error);
        }
    }

    async getUserProfile(gmail:gmail_v1.Gmail){
        try {
            const userInfo = await gmail.users.getProfile({userId:"me"});
            return userInfo
        } catch (error) {
            console.log("Error in getting user profile "+error)
        }
    }


    /* 
    this is for the base - dashboard with uk primary emails with header to show in the ui as default we pass primary in labels ,
    could be use to get and show specific emails like important , sent , drafts , all , spam etc 
    */
    async getEmailIdsMetaDataList(gmail:gmail_v1.Gmail,labels:any[]){
        try {

            const emailThreadIds= await gmail.users.messages.list({userId:'me',maxResults:20,labelIds:labels})
            
            return emailThreadIds
        } catch (error) {
            console.log("Error in getting the Email "+error)
        }
    }

    // get threads all chats data to show to the user , also can be user to use as context to provide in the prompt
    async getEmailData(gmail:gmail_v1.Gmail,threadId:string){
     try {

            const emailData= await gmail.users.messages.get({userId:'me',id:threadId})
            
            return emailData
        } catch (error) {
            console.log("Error in getting the Email "+error)
        }
    }


    async sendEmail(gmail:gmail_v1.Gmail,data:any){
        try {
            
            const sendMessage = gmail.users.messages.send({
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



// in the dashboard 1) get email metadata ( ids , header ) - > pass it to map. sort for primary emails only because thats the default 

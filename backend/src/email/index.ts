import { google } from "googleapis";
import { db } from "../db";
import { ai } from "../genai";
import { gmailobj } from "../gmail";
import { settingNewEvent } from "../socket";
import { PromptEnums } from "@prisma/client";


export const activeIntervals: Record<string, NodeJS.Timeout> = {};


export const handleEmail = async ( userIdClerk: string, prompt:PromptEnums) => {
  try{
    if (activeIntervals[userIdClerk]) {
        console.log(`Service already running for user ${userIdClerk}`);
        return;
      }

    const oauth2 = google.gmail({
        version: "v1",
        auth: gmailobj.oauth2Client,
      });
      console.log("inside handle email");
    
      let lastHistoryIdEntry = await db.user.findUnique({ where: { id: userIdClerk }, select: { lastHistoryId: true } });
      let lastHistoryId = lastHistoryIdEntry?.lastHistoryId || null;
    
      let IntervalId=setInterval(async () => {
          try {
              if (!lastHistoryId) {
                  const profile = await oauth2.users.getProfile({ userId: "me" });
                  lastHistoryId = profile.data.historyId!;
                  await db.user.update({ where: { id: userIdClerk }, data: { lastHistoryId } });
                  console.log("Stored initial historyId:", lastHistoryId);
              }
    
              const historyResponse = await oauth2.users.history.list({
                  userId: "me",
                  startHistoryId: lastHistoryId,
                  historyTypes: ["messageAdded"],
              });
    
              if (!historyResponse.data.history) {
                  console.log("No new emails.");
                  return;
              }
    
              for (const history of historyResponse.data.history) {
                if(!history.messages) continue;
                  for (const message of history.messages) {
          

                     try {
                       const msg = await oauth2.users.messages.get({ userId: "me", id: message.id! });
 
                       const categories = msg.data.labelIds || [];
                       if (categories.includes('IMPORTANT') && categories.includes('UNREAD')) {
     
                       const subjectHeader = msg.data.payload?.headers?.find((head) => head.name === "Subject")?.value || "No Subject";
                       const emailSnippet = msg.data.snippet || "";
                       const emailContent = `${emailSnippet}\n\n${subjectHeader}`;
                       const fromHeader = msg.data.payload?.headers?.find((head) => head.name === "From")?.value || "No Sender";
                       const emailMatch = fromHeader.match(/<([^>]+)>/);
                       const senderEmail = emailMatch ? emailMatch[1] : null;
                       const threadId = msg.data.threadId!;
                      console.log(senderEmail+"is sender mail randddd");
 
                     const isServiceEmail =  senderEmail?.includes("noreply") || senderEmail?.includes("do-not-reply");
 
                     if (isServiceEmail) {
                     console.log("Skipping auto-reply to service email:", senderEmail);
                     await oauth2.users.messages.modify({userId:'me',id:message.id!,requestBody:{removeLabelIds:['UNREAD']}})
                     continue;
                     }
     
                       let existingThread = await db.emailThread.findFirst({ where: { threadId } });
                       if (!existingThread) {
                           const emailData=await db.emailThread.create({
                               data: {
                                   threadId,
                                   userId: userIdClerk,
                                   subject: subjectHeader,
                                   createdAt: new Date(Number(msg.data.internalDate)),
                               }
                           });
                           settingNewEvent(emailData,'new_thread_created')
                           console.log(`New thread created: ${threadId}`);
                       }
     
                       let emailData=await db.email.create({
                           data: {
                               userId: userIdClerk,
                               threadId,
                               sender: fromHeader,
                               recipient: "ME",
                               context: msg.data.snippet!,
                               ai_generated: false,
                           }
                       });
 
                       settingNewEvent(emailData,'new_email_in_thread')
 
                       console.log("Stored email in DB!");
     
                       await ai(emailContent, fromHeader, msg.data.id!, threadId, prompt ?? null);
                       await oauth2.users.messages.modify({userId:'me',id:message.id!,requestBody:{removeLabelIds:['UNREAD']}})
                     }
                     } catch (err: any) {
                      if (err.code === 404 || err.response?.status === 404) {
                        console.warn(`Message not found (maybe deleted): ${message.id}`);
                        continue; // skip this message, don't kill the whole loop
                      } else {
                        console.error("Unexpected error fetching message:", err);
                        throw err; // re-throw other errors
                      }
                    }
                  }
              }
    
              const newHistoryId = historyResponse.data.historyId;
              if (newHistoryId) {
                  await db.user.update({ where: { id: userIdClerk }, data: { lastHistoryId: newHistoryId } });
                  console.log("Updated historyId:", newHistoryId);
              }
    
          } catch (error) {
              console.error("Error in handleEmail:", error);

              let err=error as any
              
              if(err.response?.status==401){
                await db.oAuth.delete({ where: { userId: userIdClerk } });
                
              }
              clearInterval(IntervalId)
          }
      }, 30000);

      activeIntervals[userIdClerk] = IntervalId;

  }catch(err){
    console.log(err);
    console.log("error in handling email");
  }

};





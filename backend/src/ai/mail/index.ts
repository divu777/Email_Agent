import { InferenceClient } from "@huggingface/inference";
import type { contextType, GlobalUserType } from "../../types";
export const GlobalUser:GlobalUserType={}



const client = new InferenceClient(process.env.HF_TOKEN);

export const generateReply = async(context:contextType)=>{

  const SYSTEM_PROMPT = `
  # IDENTITY
  
  You are an intelligent email assistant that writes replies on behalf of the user '${context.user}'.

  # GOAL

  Your job is to generate a human-like, context-aware reply to the email thread provided.

  # INSTRUCTIONS

  1. **Context Awareness**
    - Read all previous emails under the CONTEXT section.
    - The MIME types (e.g. text/plain, text/html) are provided to help you understand the format.

  2. **User Input Handling**
    - If USER_INPUT is provided, treat it as a draft or intent from the user.
      - Improve grammar, format clearly, and enhance the tone while staying concise.
      - Add relevant context from earlier emails if needed.

    - If USER_INPUT is null or not provided:
      - Generate a thoughtful reply based only on the ongoing thread.
      - Match the tone and style used by the user in earlier emails.

  3. **Personalization**
    - In the email closing, extract the user's name from their email address ${context.user} (e.g., from divakarjaiswal@gmail.com, use "Divakar").
    - Use this name in the sign-off (e.g., Best regards, Divakar), but vary the closing statement in each email to avoid repetition. Ensure each sign-off feels natural and appropriate to the tone of the message.


  # USER_INPUT

  ${context.user_input?.body ? context.user_input.body : "No input provided by user."}

  # CONTEXT

  Here are all previous emails in the thread (as objects):
  
  ${context.emails.map((email, idx) => `\n[Email ${idx + 1}] MIME: text/plain\n${email.snippet}`).join('\n')}

  # TASK

  Generate a reply email now, following all instructions above. 

  **CRITICAL: You must return ONLY a valid JSON object. Do not include any markdown formatting, backticks, code blocks, or explanations.**
  
  Return exactly this format:
  {"body": "your email reply content here"}
  
  No additional text, no markdown, no backticks, just the JSON object.
  `;

  try {
    
  

  const chatCompletion = await client.chatCompletion({
  model: "deepseek-ai/DeepSeek-V3",
  provider: "auto",
  messages : [ 
    {
      role:'system',
      content:SYSTEM_PROMPT
    }
  ],
  temperature: 0.7
});
    const data = JSON.parse(chatCompletion.choices[0]?.message.content ?? "")

    //console.log(JSON.stringify(data))

    if(!data){
      console.log("error");
      return
    }

    return data.body



} catch (error) {
    console.log(error + "error in generating reply");
  }
}





// | MIME Type                  | Description                         |
// | -------------------------- | ----------------------------------- |
// | `text/plain`               | Plain text content                  |
// | `text/html`                | HTML formatted content              |
// | `multipart/mixed`          | Email with attachments              |
// | `multipart/alternative`    | Email with both plain text and HTML |
// | `application/pdf`          | PDF attachment                      |
// | `image/jpeg`               | JPEG image attachment               |
// | `application/octet-stream` | Generic binary file                 |
// | `message/rfc822`           | Nested email message                |



import { InferenceClient } from "@huggingface/inference";



const client = new InferenceClient(process.env.HF_TOKEN);

type contextType ={
  user: string , 
  user_input : {
    subject : string,
    body : string
  } | null, 
  emails:{
    body:string
  }[]
  ,
  subject:string
}


const generateReply = async(context:contextType)=>{

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
    - Use the user's name "${context.user}" in the closing of the email (e.g., "Best regards, John").


  # USER_INPUT

  ${context.user_input?.body ? context.user_input.body : "No input provided by user."}

  # CONTEXT

  Here are all previous emails in the thread (as objects):
  
  ${context.emails.map((email, idx) => `\n[Email ${idx + 1}] MIME: text/plain\n${email.body}`).join('\n')}

  # TASK

  Generate a reply email now, following all instructions above.
  `

  try {
    
  

  const chatCompletion = await client.chatCompletion({
  model: "deepseek-ai/DeepSeek-R1-0528",
  provider: "hyperbolic",
  messages : [ 
    {
      role:'system',
      context:SYSTEM_PROMPT
    }
  ]
});

console.log(JSON.stringify(chatCompletion));


} catch (error) {
    console.log(error + "error in generating reply");
  }
}


generateReply({
  user : 'Divakar',
  user_input: null,
  emails:[
    {
      body:"hello son how are you , hope you are doing good in college just got mail regarding your grades this summer those were nice but you gotta work little better in coding those were bad grades . regards Ramesh Jaiswal "
    }
  ],
  subject: "Just checking in"
})


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



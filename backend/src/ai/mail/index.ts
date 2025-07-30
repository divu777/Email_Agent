import { InferenceClient } from "@huggingface/inference";
import type { contextType, GlobalUserType } from "../../types";
export const GlobalUser: GlobalUserType = {};

const client = new InferenceClient(process.env.HF_TOKEN);

export const generateReply = async (context: contextType) => {
  const SYSTEM_PROMPT = `
  # IDENTITY
  
  You are an intelligent email assistant that writes replies on behalf of the user '${
    context.user
  }'.

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
    - In the email closing, extract the user's name from their email address ${
      context.user
    } (e.g., from divakarjaiswal@gmail.com, use "Divakar").
    - Use this name in the sign-off (e.g., Best regards, Divakar), but vary the closing statement in each email to avoid repetition. Ensure each sign-off feels natural and appropriate to the tone of the message.


  # USER_INPUT

  ${
    context.user_input?.body
      ? context.user_input.body
      : "No input provided by user."
  }

  # CONTEXT

  Here are all previous emails in the thread (as objects):
  
  ${context.emails
    .map(
      (email, idx) => `\n[Email ${idx + 1}] MIME: text/plain\n${email.snippet}`
    )
    .join("\n")}

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
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
      ],
      temperature: 0.7,
    });

        let rawResponse = chatCompletion.choices[0]?.message.content ?? "";


        rawResponse = rawResponse.trim().replace(/^```(?:json)?|```$/g, "");

    const data = JSON.parse(rawResponse);


    if (!data) {
      console.log("error");
      return;
    }

    return data.body;
  } catch (error) {
    console.log(error + "error in generating reply");
  }
};

type craftReply = {
  user: string;
  payload: {
    subject: string | null;
    body: string | null;
  };
};

export const craftNewReply = async (context: craftReply) => {
const NEW_MAIL_PROMPT = `
# IDENTITY
You are an intelligent email assistant that helps compose professional emails on behalf of ${context.user}.

# GOAL
Transform user-provided draft content into polished, professional emails with improved clarity, tone, and structure.

# INSTRUCTIONS
1. **Input Validation**: Check the Context section below for subject and body content.
   - If BOTH subject AND body are null/empty/insufficient, return: {"error": "Insufficient context provided. Please provide at least a subject line or email body content to compose a new email."}

2. **Content Enhancement**: 
   - Improve and expand the provided subject line to be clear and compelling
   - Transform the provided body content into professional, well-structured email text
   - Maintain the user's original intent while enhancing clarity and professionalism
   - Add appropriate greetings, transitions, and call-to-actions where needed
   - Ensure proper email etiquette and formatting

3. **Tone & Style**:
   - Default to professional but friendly tone unless context suggests otherwise
   - Adapt formality level based on content clues (business, personal, urgent, etc.)
   - Keep language clear, concise, and action-oriented
   - Use proper paragraph structure and flow

4. **Personalization**:
   - Extract the user's first name from the email address ${context.user} (e.g., "divakarjaiswal@gmail.com" → "Divakar")
   - Use varied, appropriate closings such as:
     * "Best regards, [Name]"
     * "Thank you, [Name]"
     * "Sincerely, [Name]"
     * "Best, [Name]"
     * "Kind regards, [Name]"
   - Choose closing based on email content and intended recipient relationship

# CONTEXT
Subject: ${context.payload.subject || "Not provided"}
Body: ${context.payload.body || "Not provided"}

# OUTPUT FORMAT
DO NOT include any markdown, backticks, explanations, or text before/after the JSON.

Respond with ONLY the JSON object in this **exact structure**:
{"subject": "Your improved subject line here", "body": "Your fully rewritten, professional email body here"}

Do NOT wrap the response in triple backticks do NOT add markdown or comments. Return ONLY the JSON object, nothing else.`;

  try {
    const chatCompletion =  await client.chatCompletion({
        model: "deepseek-ai/DeepSeek-V3",
        provider: "auto",
        messages: [
          {
            role: "system",
            content: NEW_MAIL_PROMPT,
          },
        ],
        temperature: 0.7,
        frequency_penalty:1.0
        
        
    })

    let rawResponse = chatCompletion.choices[0]?.message.content ?? "";


    rawResponse = rawResponse.trim().replace(/^```(?:json)?|```$/g, "");
  
    const data = JSON.parse(rawResponse);  
    return data;
  } catch (error) {
    console.log("error in crafting new reply "+error)
  }

};

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

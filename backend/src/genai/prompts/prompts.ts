import { PromptEnums } from "@prisma/client";

const DEFAULT_PROMPT=`TASK: Generate a precise, contextually accurate email response

STRICT REQUIREMENTS:
- Analyze the ENTIRE input email carefully
- Generate a response that DIRECTLY addresses the specific content
- Ensure the response is professional, concise, and actionable
- Match the tone and context of the original email
- Include specific details from the original communication

ABSOLUTE FORMAT RULES:
\`\`\`json
{
    "header": "Precise Subject Line",
    "body": "Detailed, Contextual Response"
}
\`\`\`

CRITICAL INSTRUCTION: 
- DO NOT use generic placeholders
- MUST use real, specific content
- MUST reference specific points from the input`



 const CASUAL_PROMPT = `TASK: Write a chill, friendly email reply.

GUIDELINES:
- Read the whole incoming email carefully
- Reply in a relaxed, conversational tone
- Keep it clear, helpful, and straight to the point
- Make it sound natural, like you're chatting with a teammate
- Mention specific parts of their email so it feels personal

FORMAT:
\`\`\`json
{
    "header": "Friendly Subject Line",
    "body": "Easygoing, Helpful Response"
}
\`\`\`

IMPORTANT:
- No stiff corporate language
- No vague stuff — be real and specific
- Make sure it sounds like you actually read their email`;



 const FUN_PROMPT = `TASK: Craft a playful, upbeat email reply.

GUIDELINES:
- Carefully read the incoming email
- Respond in a lively, energetic tone
- Add a touch of humor or positivity (if appropriate)
- Keep it short, sweet, and engaging
- Pull in real details from their message so it feels authentic

FORMAT:
\`\`\`json
{
    "header": "Catchy, Fun Subject Line",
    "body": "Lively, Positive Response"
}
\`\`\`

IMPORTANT:
- Don’t overdo jokes — keep it tasteful
- Avoid sounding robotic or fake
- Always relate directly to what they said`;




export const prompts: Record<PromptEnums, string> = {
    [PromptEnums.Professional]: DEFAULT_PROMPT,
    [PromptEnums.Casual]: CASUAL_PROMPT,
    [PromptEnums.Friendly]: FUN_PROMPT
}
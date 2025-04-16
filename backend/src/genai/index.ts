import { InferenceClient } from "@huggingface/inference";
import { addJobs } from "../queue";
import { db } from "../db";
import config from "../config";
import {  prompts } from "./prompts/prompts";
import { settingNewEvent } from "../socket";
import { PromptEnums } from "@prisma/client";
const client2 = new InferenceClient(config.AI_API);



export const ai = async (
  data: string,
  fromHeader: string,
  msgid: string,
  threadId: string,
  promptLable:PromptEnums
) => {
  console.log("Generating AI email response");

  const enhancedPrompt = `${prompts[promptLable]}

CONTEXT INPUT: "${data}"

GENERATE RESPONSE NOW:`;

  const model = "deepseek-ai/DeepSeek-V3-0324";

  try {
    const chatCompletion = await client2.chatCompletion({
      provider: "nebius",
      model: model,
      messages: [
        {
          role: "user",
          content: enhancedPrompt,
        },
      ],
      max_tokens: 500,
    });

    const rawOutput = chatCompletion.choices[0].message.content;
    console.log("Raw AI Response:", rawOutput);

    try {
      const parsedOutput = JSON.parse(
        rawOutput!.match(/```json([\s\S]*?)```/)![1]
      );

      const emailMatch = fromHeader.match(/<([^>]+)>/);
      const senderEmail = emailMatch ? emailMatch[1] : null;

      if (!senderEmail) throw new Error("Invalid sender email");

      const existingEmail = await db.email.findFirst({ where: { threadId } });

      if (!existingEmail)
        throw new Error("Thread ID not found in the database");

      const userId = existingEmail.userId;
      const emailData = {
        subject: parsedOutput.header.replace(/^Subject:\s*/, ""),
        body: parsedOutput.body,
        from: senderEmail,
        msgid,
        threadId,
      };

      console.log("Generated Email:", emailData);

      const aiemailData=await db.email.create({
        data: {
          userId,
          threadId,
          sender: "AI",
          recipient: senderEmail,
          context: emailData.body,
          ai_generated: true,
        },
      });
      settingNewEvent(aiemailData,'new_email_in_thread')
      await addJobs(emailData);

      console.log("Job added to queue!");
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      console.error("Raw output was:", rawOutput);
    }
  } catch (error) {
    console.error(`Failed with model ${model}:`, error);
  }
};




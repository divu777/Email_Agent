"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ai = void 0;
const inference_1 = require("@huggingface/inference");
const redis_1 = require("../redis");
const db_1 = require("../db");
const config_1 = __importDefault(require("../config"));
const prompts_1 = require("./prompts/prompts");
const socket_1 = require("../socket");
const client2 = new inference_1.InferenceClient(config_1.default.AI_API);
const ai = (data, fromHeader, msgid, threadId, promptLable) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Generating AI email response");
    const enhancedPrompt = `${prompts_1.prompts[promptLable]}

CONTEXT INPUT: "${data}"

GENERATE RESPONSE NOW:`;
    const model = "deepseek-ai/DeepSeek-V3-0324";
    try {
        const chatCompletion = yield client2.chatCompletion({
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
            const parsedOutput = JSON.parse(rawOutput.match(/```json([\s\S]*?)```/)[1]);
            const emailMatch = fromHeader.match(/<([^>]+)>/);
            const senderEmail = emailMatch ? emailMatch[1] : null;
            if (!senderEmail)
                throw new Error("Invalid sender email");
            const existingEmail = yield db_1.db.email.findFirst({ where: { threadId } });
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
            const aiemailData = yield db_1.db.email.create({
                data: {
                    userId,
                    threadId,
                    sender: "AI",
                    recipient: senderEmail,
                    context: emailData.body,
                    ai_generated: true,
                },
            });
            (0, socket_1.settingNewEvent)(aiemailData, 'new_email_in_thread');
            yield (0, redis_1.addJobs)(emailData);
            console.log("Job added to queue!");
        }
        catch (parseError) {
            console.error("Error parsing AI response:", parseError);
            console.error("Raw output was:", rawOutput);
        }
    }
    catch (error) {
        console.error(`Failed with model ${model}:`, error);
    }
});
exports.ai = ai;

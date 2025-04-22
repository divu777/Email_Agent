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
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleEmail = exports.activeIntervals = void 0;
const googleapis_1 = require("googleapis");
const db_1 = require("../db");
const genai_1 = require("../genai");
const gmail_1 = require("../gmail");
const socket_1 = require("../socket");
exports.activeIntervals = {};
const handleEmail = (userIdClerk, prompt) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (exports.activeIntervals[userIdClerk]) {
            console.log(`Service already running for user ${userIdClerk}`);
            return;
        }
        const oauth2 = googleapis_1.google.gmail({
            version: "v1",
            auth: gmail_1.gmailobj.oauth2Client,
        });
        console.log("inside handle email");
        let lastHistoryIdEntry = yield db_1.db.user.findUnique({ where: { id: userIdClerk }, select: { lastHistoryId: true } });
        let lastHistoryId = (lastHistoryIdEntry === null || lastHistoryIdEntry === void 0 ? void 0 : lastHistoryIdEntry.lastHistoryId) || null;
        let IntervalId = setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
            try {
                if (!lastHistoryId) {
                    const profile = yield oauth2.users.getProfile({ userId: "me" });
                    lastHistoryId = profile.data.historyId;
                    yield db_1.db.user.update({ where: { id: userIdClerk }, data: { lastHistoryId } });
                    console.log("Stored initial historyId:", lastHistoryId);
                }
                const historyResponse = yield oauth2.users.history.list({
                    userId: "me",
                    startHistoryId: lastHistoryId,
                    historyTypes: ["messageAdded"],
                });
                if (!historyResponse.data.history) {
                    console.log("No new emails.");
                    return;
                }
                for (const history of historyResponse.data.history) {
                    if (!history.messages)
                        continue;
                    for (const message of history.messages) {
                        const msg = yield oauth2.users.messages.get({ userId: "me", id: message.id });
                        const categories = msg.data.labelIds || [];
                        if (categories.includes('IMPORTANT') && categories.includes('UNREAD')) {
                            const subjectHeader = ((_c = (_b = (_a = msg.data.payload) === null || _a === void 0 ? void 0 : _a.headers) === null || _b === void 0 ? void 0 : _b.find((head) => head.name === "Subject")) === null || _c === void 0 ? void 0 : _c.value) || "No Subject";
                            const emailSnippet = msg.data.snippet || "";
                            const emailContent = `${emailSnippet}\n\n${subjectHeader}`;
                            const fromHeader = ((_f = (_e = (_d = msg.data.payload) === null || _d === void 0 ? void 0 : _d.headers) === null || _e === void 0 ? void 0 : _e.find((head) => head.name === "From")) === null || _f === void 0 ? void 0 : _f.value) || "No Sender";
                            const emailMatch = fromHeader.match(/<([^>]+)>/);
                            const senderEmail = emailMatch ? emailMatch[1] : null;
                            const threadId = msg.data.threadId;
                            console.log(senderEmail + "is sender mail randddd");
                            const isServiceEmail = (senderEmail === null || senderEmail === void 0 ? void 0 : senderEmail.includes("noreply")) || (senderEmail === null || senderEmail === void 0 ? void 0 : senderEmail.includes("do-not-reply"));
                            if (isServiceEmail) {
                                console.log("Skipping auto-reply to service email:", senderEmail);
                                yield oauth2.users.messages.modify({ userId: 'me', id: message.id, requestBody: { removeLabelIds: ['UNREAD'] } });
                                return;
                            }
                            let existingThread = yield db_1.db.emailThread.findFirst({ where: { threadId } });
                            if (!existingThread) {
                                const emailData = yield db_1.db.emailThread.create({
                                    data: {
                                        threadId,
                                        userId: userIdClerk,
                                        subject: subjectHeader,
                                        createdAt: new Date(Number(msg.data.internalDate)),
                                    }
                                });
                                (0, socket_1.settingNewEvent)(emailData, 'new_thread_created');
                                console.log(`New thread created: ${threadId}`);
                            }
                            let emailData = yield db_1.db.email.create({
                                data: {
                                    userId: userIdClerk,
                                    threadId,
                                    sender: fromHeader,
                                    recipient: "ME",
                                    context: msg.data.snippet,
                                    ai_generated: false,
                                }
                            });
                            (0, socket_1.settingNewEvent)(emailData, 'new_email_in_thread');
                            console.log("Stored email in DB!");
                            yield (0, genai_1.ai)(emailContent, fromHeader, msg.data.id, threadId, prompt !== null && prompt !== void 0 ? prompt : null);
                            yield oauth2.users.messages.modify({ userId: 'me', id: message.id, requestBody: { removeLabelIds: ['UNREAD'] } });
                        }
                    }
                }
                const newHistoryId = historyResponse.data.historyId;
                if (newHistoryId) {
                    yield db_1.db.user.update({ where: { id: userIdClerk }, data: { lastHistoryId: newHistoryId } });
                    console.log("Updated historyId:", newHistoryId);
                }
            }
            catch (error) {
                console.error("Error in handleEmail:", error);
                let err = error;
                if (((_g = err.response) === null || _g === void 0 ? void 0 : _g.status) == 401) {
                    yield db_1.db.oAuth.delete({ where: { userId: userIdClerk } });
                }
                clearInterval(IntervalId);
            }
        }), 30000);
        exports.activeIntervals[userIdClerk] = IntervalId;
    }
    catch (err) {
        console.log(err);
        console.log("error in handling email");
    }
});
exports.handleEmail = handleEmail;

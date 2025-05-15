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
const express_1 = __importDefault(require("express"));
const gmail_1 = require("../gmail");
const db_1 = require("../db");
const email_1 = require("../email");
const redis_1 = require("../redis");
const router = express_1.default.Router();
// check if userId exists in OAuth
router.get("/checkOAuth/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const result = yield db_1.db.oAuth.findUnique({
        where: { userId },
    });
    if (!result) {
        return res.json({
            message: `No token available for the userId + ${userId}`,
            status: 200,
            success: false
        });
    }
    return res.json({
        message: `Token available for the userId + ${userId}`,
        status: 200,
        data: result,
        success: true
    });
}));
// get auth URL to initiate OAuth flow
router.post("/getAuthUrl", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, email } = req.body;
        yield db_1.db.user.upsert({
            where: { id: userId },
            update: { email },
            create: { id: userId, email, lastHistoryId: "" },
        });
        const authUrl = gmail_1.gmailobj.getAuthorizationURl(userId);
        return res.json({ status: 200, url: authUrl });
    }
    catch (err) {
        console.log(err);
        return res.json({
            message: "Error in getting the Auth Url",
            status: 500,
        });
    }
}));
// start email service if user already authorized
router.post("/startService", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        const result = yield db_1.db.oAuth.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        email: true
                    }
                }
            }
        });
        if (!result) {
            return res.json({
                message: "No Token for this User Redirect to Auth Flow",
                data: false,
            });
        }
        if (result && !result.auto_reply) {
            return res.json({
                message: "Auto reply is set to False",
                data: result,
            });
        }
        const { access_token, refresh_token, expiry_date, prompt, first_email_send, user } = result;
        yield gmail_1.gmailobj.check_expiry({ access_token, refresh_token, expiry_date }, userId);
        // const oauth2 = google.gmail({
        //   version: "v1",
        //   auth: gmailobj.oauth2Client,
        // });
        console.log("inside start email");
        // await oauth2.users.watch({
        //   userId: 'me',
        //   requestBody: {
        //     topicName: 'projects/moonlit-bliss-454514-c1/topics/gmail-notifs',
        //     labelIds: ['INBOX'], 
        //   },
        // });
        if (!first_email_send) {
            (0, redis_1.addJobsToMail)({ userId, email: user.email });
            yield db_1.db.oAuth.update({
                where: {
                    userId
                },
                data: {
                    first_email_send: true
                }
            });
            //     userId,
            //     email:user.email
            // }, {
            //   attempts: 3,
            //   backoff: {
            //     type: 'exponential',
            //     delay: 5000, // in ms
            //   },
            // });
        }
        (0, email_1.handleEmail)(userId, prompt);
        return res.json({
            message: 'Email service started with OAuth Tokens',
            data: result,
        });
    }
    catch (err) {
        console.log(err);
        return res.json({
            message: "Error getting the Token for the UserId from the DB",
            status: 500,
        });
    }
}));
// toggle Auto-Reply On or Off
router.post("/toggleAutoReply", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, auto_reply } = req.body;
    if (auto_reply) {
        const result = yield db_1.db.oAuth.update({
            where: { userId },
            data: { auto_reply: true }
        });
        const { access_token, refresh_token, expiry_date, auto_reply, prompt } = result;
        yield gmail_1.gmailobj.check_expiry({ access_token, refresh_token, expiry_date, auto_reply }, userId);
        (0, email_1.handleEmail)(userId, prompt);
        return res.json({ message: "Auto-reply service started." });
    }
    else {
        if (email_1.activeIntervals[userId]) {
            clearInterval(email_1.activeIntervals[userId]);
            delete email_1.activeIntervals[userId];
        }
        yield db_1.db.oAuth.update({
            where: { userId },
            data: { auto_reply: false },
        });
        console.log("Auto-reply service stopped.");
        return res.json({ message: "Auto-reply service stopped." });
    }
}));
// this will get the email Threads for the frontend to store in the state 
router.get("/getEmailThreads/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { userId } = req.params;
        let result = yield db_1.db.emailThread.findMany({
            where: {
                userId
            },
            select: {
                id: true,
                userId: true,
                threadId: true,
                subject: true,
                createdAt: true,
                updatedAt: true,
                emails: true
            }
        });
        if (!result) {
            return res.status(200).json({
                message: "Email Thread Could Not be Fetched Successfully",
                data: null
            });
        }
        result = result.map(thread => {
            const isUnread = thread.emails.some(email => !email.read);
            return Object.assign(Object.assign({}, thread), { read: !isUnread });
        });
        return res.status(200).json({
            message: "Email Thread fetched Successfully",
            data: result
        });
    }
    catch (err) {
        console.log("Error in getting email thread" + err);
    }
}));
router.get("/getEmailThread/:threadId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { threadId } = req.params;
        const result = yield db_1.db.emailThread.findUnique({
            where: {
                threadId
            },
            select: {
                emails: true
            }
        });
        if (!result) {
            return res.status(200).json({
                message: `Emails Could Not be Fetched for the threadId ${threadId}`,
                status: false
            });
        }
        return res.status(200).json({
            message: `Emails fetched Successfully for threadID ${threadId}`,
            data: { emails: result.emails },
            status: true
        });
    }
    catch (err) {
        console.log("Error in getting emails for the threadId" + err);
    }
}));
router.post("/markThreadRead/:threadId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { threadId } = req.params;
        const updated = yield db_1.db.email.updateMany({
            where: { threadId },
            data: { read: true },
        });
        return res.status(200).json({
            message: `Marked all emails in thread ${threadId} as read`,
            updatedCount: updated.count,
        });
    }
    catch (err) {
        console.log("Error marking emails read", err);
        return res.status(500).json({ message: "Failed to mark emails as read" });
    }
}));
router.post('/pubsub-webhook', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const msg = req.body.message;
    if (!msg || !msg.data) {
        return res.status(400).send("Invalid Pub/Sub message");
    }
    const decoded = JSON.parse(Buffer.from(msg.data, 'base64').toString());
    const { historyId, emailAddress } = decoded;
    console.log("New email notification for:", emailAddress, "History ID:", historyId);
    // Do what your polling loop did — process messages
    // await processHistoryChanges(emailAddress, historyId);
    res.status(200).send(); // ACK the message
}));
exports.default = router;

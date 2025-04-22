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
const db_1 = require("../db");
const router = express_1.default.Router();
router.get("/getAnalytics/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params; // or however you're authing
        // Total emails
        const totalEmails = yield db_1.db.email.count({
            where: { userId }
        });
        // Total auto-replied emails
        const autoRepliedEmails = yield db_1.db.email.count({
            where: { userId, ai_generated: true }
        });
        // Top senders
        const topSenders = yield db_1.db.email.groupBy({
            by: ['sender'],
            where: { userId },
            _count: { sender: true },
            orderBy: { _count: { sender: 'desc' } },
            take: 5,
        });
        // Emails over time (last 7 days)
        const emailsOverTime = yield db_1.db.email.groupBy({
            by: ['createdAt'],
            where: { userId },
            _count: { id: true },
            orderBy: { createdAt: 'asc' },
        });
        // Emails read vs unread
        const readEmails = yield db_1.db.email.count({
            where: { userId, read: true }
        });
        const unreadEmails = yield db_1.db.email.count({
            where: { userId, read: false }
        });
        // Most common subjects
        const topSubjects = yield db_1.db.emailThread.groupBy({
            by: ['subject'],
            where: { userId },
            _count: { subject: true },
            orderBy: { _count: { subject: 'desc' } },
            take: 5,
        });
        res.status(200).json({
            totalEmails,
            autoRepliedEmails,
            replyRate: totalEmails === 0 ? 0 : (autoRepliedEmails / totalEmails) * 100,
            topSenders,
            emailsOverTime,
            readEmails,
            unreadEmails,
            topSubjects,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
exports.default = router;

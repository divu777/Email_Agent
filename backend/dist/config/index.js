"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const config = {
    PORT: process.env.PORT,
    CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    REDIRECT_URL: process.env.REDIRECT_URL,
    AI_API: process.env.AI_API,
    FRONTEND_URL: process.env.FRONTEND_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    REDIS_CLIENT: String(process.env.REDIS_CLIENT_DEV),
    SOCKET_URL: process.env.SOCKET_URL,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_EMAIL: process.env.SMTP_EMAIL
};
exports.default = config;

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
exports.sendWelcomeEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../config"));
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: config_1.default.SMTP_EMAIL, // your email address
        pass: config_1.default.SMTP_PASS, // your app password or real password (if not using Gmail)
    },
});
const sendWelcomeEmail = function (email) {
    return __awaiter(this, void 0, void 0, function* () {
        const mailOptions = {
            from: '"Divakar" <onboarding@email.agent.divakar10x.com>', // From email address
            to: email,
            subject: 'Hey, I’m Divakar — Thanks for checking out Email Agent!',
            html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <p>Hey, I’m Divakar 👋</p>
        <p>Thanks for trying out my new project — <strong>Email Agent</strong>. It took a bit of time to get here, but it’s working pretty well now!</p>
        <p>You might find some features super interesting... and some where you’ll be like “Why did he do *that*?” 😂</p>
        <p>This is the first prototype, and I’m just getting started. If you're a dev, check out the GitHub repo — I’ll be raising some issues soon, so feel free to jump in if you’re curious or want to learn.</p>
        <p>Who knows? We might end up building a SaaS together. Let’s make AI work for us. Who’s laughing now? 😎</p>
        <p>Catch you soon,<br/>Divakar</p>
      </div>
    `,
        };
        try {
            const info = yield transporter.sendMail(mailOptions);
            console.log('Email sent:', info.response);
            return info;
        }
        catch (error) {
            console.error('Error sending email:', error);
            return { error };
        }
    });
};
exports.sendWelcomeEmail = sendWelcomeEmail;

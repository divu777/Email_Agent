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
exports.sendFirstEmailQueue = exports.scaleWrokers = void 0;
exports.addJobs = addJobs;
const bullmq_1 = require("bullmq");
const bullmq_2 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const googleapis_1 = require("googleapis");
const gmail_1 = require("../gmail");
const resend_1 = require("../resend");
const db_1 = require("../db");
const config_1 = __importDefault(require("../config"));
const connection = new ioredis_1.default(config_1.default.REDIS_CLIENT, { maxRetriesPerRequest: null, tls: {} });
const myQueue = new bullmq_1.Queue("email", { connection });
function addJobs(jobs) {
    return __awaiter(this, void 0, void 0, function* () {
        yield myQueue.add("myJobName", jobs);
    });
}
const workers = [];
const addworkers = () => {
    console.log("inside workers");
    try {
        const worker = new bullmq_2.Worker("email", (job) => __awaiter(void 0, void 0, void 0, function* () {
            const { subject, body, from, msgid, threadId } = job.data;
            const gmail = googleapis_1.google.gmail({
                version: "v1",
                auth: gmail_1.gmailobj.oauth2Client,
            });
            const emailLines = [];
            emailLines.push(`To: ${from}`);
            emailLines.push(`Content-Type: text/plain; charset="UTF-8"`);
            emailLines.push(`MIME-Version: 1.0`);
            emailLines.push(` In-Reply-To: ${msgid}`);
            emailLines.push(`References: ${msgid}`);
            emailLines.push(`Content-Transfer-Encoding: 7bit`);
            emailLines.push(`to: `);
            emailLines.push(`subject: ${subject}`);
            emailLines.push("");
            emailLines.push(body);
            const email = emailLines.join("\n");
            const base64EncodedEmail = Buffer.from(email)
                .toString("base64")
                .replace(/\+/g, "-")
                .replace(/\//g, "_")
                .replace(/=+$/, "");
            const res = yield gmail.users.messages.send({
                userId: "me",
                requestBody: {
                    raw: base64EncodedEmail,
                    threadId: threadId,
                },
            });
            console.log("Email sent:", res.data);
        }), { connection });
        workers.push(worker);
        worker.on("completed", (job) => {
            console.log(`${job.id} has completed!`);
        });
        worker.on("failed", (job, err) => {
            console.log(`${job.id} has failed with ${err.message}`);
        });
    }
    catch (err) {
        console.log(`Error in Adding workers ${err}`);
    }
};
const scaleWrokers = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { waiting } = yield myQueue.getJobCounts();
        let neededWorkers = Math.ceil(waiting / 5);
        if (neededWorkers > workers.length) {
            while (neededWorkers > workers.length) {
                addworkers();
            }
        }
        else {
            while (neededWorkers < workers.length) {
                const worker = workers.pop();
                yield (worker === null || worker === void 0 ? void 0 : worker.close());
            }
        }
    }
    catch (err) {
        console.log(`Error in Scaling workers:  ${err}`);
    }
});
exports.scaleWrokers = scaleWrokers;
setInterval(exports.scaleWrokers, 30000);
exports.sendFirstEmailQueue = new bullmq_1.Queue('send_first_email', { connection });
const worker = new bullmq_2.Worker('send_first_email', (job) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, userId } = job.data;
    console.log(JSON.stringify(job.data) + "jabbbbb");
    yield (0, resend_1.sendWelcomeEmail)(String(email));
    yield db_1.db.oAuth.update({
        where: {
            userId
        },
        data: {
            first_email_send: true
        }
    });
}), { connection });
worker.on("completed", (job) => {
    console.log(`${job.id} has completed!`);
});
worker.on("failed", (job, err) => {
    console.log(`${job.id} has failed with ${err.message}`);
});

import { Job, Queue } from "bullmq";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import { google } from "googleapis";
import { gmailobj } from "../gmail";
import { sendWelcomeEmail } from "../resend";
import { db } from "../db";
import config from "../config";
const connection = new IORedis(config.REDIS_CLIENT!,{ maxRetriesPerRequest: null ,tls:{}});

const myQueue = new Queue("email",{connection});
export async function addJobs(jobs: any) {
  await myQueue.add("myJobName", jobs);
}

const workers: Worker<any, any, string>[] = [];

const addworkers = () => {
  console.log("inside workers");

  try {
    const worker = new Worker(
      "email",
      async (job) => {
        const { subject, body, from, msgid, threadId } = job.data;
        const gmail = google.gmail({
          version: "v1",
          auth: gmailobj.oauth2Client,
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

        const res = await gmail.users.messages.send({
          userId: "me",
          requestBody: {
            raw: base64EncodedEmail,
            threadId: threadId,
          },
        });

        console.log("Email sent:", res.data);
      },
      { connection }
    );

    workers.push(worker);

    worker.on("completed", (job) => {
      console.log(`${job.id} has completed!`);
    });

    worker.on("failed", (job, err) => {
      console.log(`${job!.id} has failed with ${err.message}`);
    });
  } catch (err) {
    console.log(`Error in Adding workers ${err}`);
  }
};

export const scaleWrokers = async () => {
  try {
    const { waiting } = await myQueue.getJobCounts();

    let neededWorkers = Math.ceil(waiting / 5);

    if (neededWorkers > workers.length) {
      while (neededWorkers > workers.length) {
        addworkers();
      }
    } else {
      while (neededWorkers < workers.length) {
        const worker = workers.pop();
        await worker?.close();
      }
    }
  } catch (err) {
    console.log(`Error in Scaling workers:  ${err}`);
  }
};
setInterval(scaleWrokers, 30000);


export const sendFirstEmailQueue = new Queue('send_first_email',{connection});

const worker=new Worker('send_first_email',async(job)=>{

  const {email , userId} = job.data;

  await sendWelcomeEmail(String(email));

  await db.oAuth.update({
    where:{
      userId
    },
    data:{
      first_email_send: true
    }
  });
},{connection})

worker.on("completed", (job) => {
  console.log(`${job.id} has completed!`);
});

worker.on("failed", (job, err) => {
  console.log(`${job!.id} has failed with ${err.message}`);
});
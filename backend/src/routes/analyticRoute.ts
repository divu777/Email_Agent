import e from "express"
import { db } from "../db";
const router = e.Router();

router.get("/getAnalytics/:userId",async(req,res)=>{
    try {
        const {userId} = req.params; // or however you're authing
    
        // Total emails
        const totalEmails = await db.email.count({
          where: { userId }
        });
    
        // Total auto-replied emails
        const autoRepliedEmails = await db.email.count({
          where: { userId, ai_generated: true }
        });
    
        // Top senders
        const topSenders = await db.email.groupBy({
          by: ['sender'],
          where: { userId },
          _count: { sender: true },
          orderBy: { _count: { sender: 'desc' } },
          take: 5,
        });
    
        // Emails over time (last 7 days)
        const emailsOverTime = await db.email.groupBy({
          by: ['createdAt'],
          where: { userId },
          _count: { id: true },
          orderBy: { createdAt: 'asc' },
        });
    
        // Emails read vs unread
        const readEmails = await db.email.count({
          where: { userId, read: true }
        });
        const unreadEmails = await db.email.count({
          where: { userId, read: false }
        });
    
        // Most common subjects
        const topSubjects = await db.emailThread.groupBy({
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
    
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
      }
})


export default router;
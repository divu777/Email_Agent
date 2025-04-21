import { motion } from "framer-motion";
import { AnalyticsData } from "../Insights";

interface SmartInsightsProps {
    analyticsData: AnalyticsData | null;
  }
  
 export const SmartInsights = ({ analyticsData }: SmartInsightsProps) => {
    console.log(JSON.stringify(analyticsData) + "analllll");
  
    if (!analyticsData) {
      return (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Smart Insights</h3>
          <p className="text-sm text-gray-500">No analytics data available.</p>
        </div>
      );
    }
    
  
    const {
      totalEmails = 0,
      autoRepliedEmails = 0,
      replyRate = 0,
      readEmails = 0,
      unreadEmails = 0,
    } = analyticsData;
  
    const readRate = ((readEmails / totalEmails) * 100 || 0).toFixed(1);
  
    const itemVariants = {
      hidden: { y: 20, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: {
          type: "spring",
          stiffness: 100,
          damping: 15,
          delay: 0.3,
        },
      },
    };
  
    const containerVariants = {
      visible: {
        transition: {
          staggerChildren: 0.15,
        },
      },
      hidden: {},
    };
  
    
  
    return (
      <motion.div
        className="rounded-xl bg-white p-6 shadow-sm"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Smart Insights</h3>
          <p className="text-sm text-gray-500">
            AI-powered recommendations to improve your email workflow
          </p>
        </div>
  
        <motion.div className="space-y-4" variants={containerVariants}>
          {/* Unread Emails Insight */}
          <motion.div
            className="flex items-start gap-4 rounded-lg border border-gray-200 p-4"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="rounded-full bg-indigo-100 p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                {unreadEmails > 0 ? "High Unread Rate" : "Email Management"}
              </h4>
              <p className="text-sm text-gray-500">
                {unreadEmails > 0
                  ? `You have ${unreadEmails} unread emails (${(100 - Number(readRate)).toFixed(
                      1
                    )}% of total). Consider setting aside 15 minutes each morning to process unread messages.`
                  : "Great job keeping up with your emails! Consider setting up filters to organize incoming messages automatically."}
              </p>
            </div>
          </motion.div>
  
          {/* Optimal Time Insight */}
          <motion.div
            className="flex items-start gap-4 rounded-lg border border-gray-200 p-4"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="rounded-full bg-emerald-100 p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">Optimal Email Time</h4>
              <p className="text-sm text-gray-500">
                {totalEmails > 0
                  ? "Your emails receive the most attention when sent between 9am-11am. Schedule important communications during this window for better engagement."
                  : "As you use the system more, we'll analyze your email patterns to suggest optimal sending times."}
              </p>
            </div>
          </motion.div>
  
          {/* Auto-Reply Insight */}
          <motion.div
            className="flex items-start gap-4 rounded-lg border border-gray-200 p-4"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="rounded-full bg-rose-100 p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-rose-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">Auto-Reply Effectiveness</h4>
              <p className="text-sm text-gray-500">
                {autoRepliedEmails > 0
                  ? `Your auto-replies handle ${replyRate}% of incoming messages. Consider expanding your templates to cover more common inquiries.`
                  : "Enable auto-replies in your settings to let our AI handle routine emails on your behalf."}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  };
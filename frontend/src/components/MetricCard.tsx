import { motion } from "framer-motion";
import { Mail, Reply, CheckCircle, AlertCircle } from "lucide-react";
import { AnalyticsData } from "../Insights";

interface MetricCardsProps {
    analyticsData: AnalyticsData | null;
  }
  
  export const MetricCards = ({ analyticsData }: MetricCardsProps) => {
    const itemVariants = {
      hidden: { y: 20, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: {
          type: "spring",
          stiffness: 100,
          damping: 15,
        },
      },
    };
  
    const metricsData = [
      {
        title: "Total Emails",
        value: analyticsData?.totalEmails ?? 0,
        icon: <Mail className="h-5 w-5 text-indigo-600" />,
        trend: "+12.5%",
        trendColor: "text-emerald-500",
        info: "Avg 0.1 emails per day",
      },
      {
        title: "Auto Replies",
        value: analyticsData?.autoRepliedEmails ?? 0,
        icon: <Reply className="h-5 w-5 text-amber-500" />,
        trend: `${analyticsData?.replyRate ?? 0}%`,
        trendColor: "text-amber-500",
        info: "Reply rate",
      },
      {
        title: "Read Emails",
        value: analyticsData?.readEmails ?? 0,
        icon: <CheckCircle className="h-5 w-5 text-emerald-600" />,
        trend: analyticsData?.totalEmails
          ? `${Math.round((analyticsData.readEmails / analyticsData.totalEmails) * 100)}%`
          : "0%",
        trendColor: "text-emerald-600",
        info: "Most active on weekdays",
      },
      {
        title: "Unread Emails",
        value: analyticsData?.unreadEmails ?? 0,
        icon: <AlertCircle className="h-5 w-5 text-rose-500" />,
        trend: analyticsData?.totalEmails
          ? `${Math.round((analyticsData.unreadEmails / analyticsData.totalEmails) * 100)}%`
          : "0%",
        trendColor: "text-slate-500",
        info: "Consider archiving or deleting",
      },
    ];
  
    return (
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {metricsData.map((metric, index) => (
          <motion.div
            key={metric.title}
            variants={itemVariants}
            custom={index}
            className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-sm font-medium text-slate-500">{metric.title}</span>
              <div className="p-1.5 bg-slate-50 rounded-md">{metric.icon}</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-semibold">{metric.value.toLocaleString()}</p>
                <span className={`text-xs font-medium ${metric.trendColor}`}>{metric.trend}</span>
              </div>
              <p className="text-xs text-slate-400">{metric.info}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  };
  
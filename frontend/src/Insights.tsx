import  { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { motion } from "framer-motion";
import { Header } from "./components/Header";
import { EmailActivityChart } from "./components/ActivityChart";
import { SubjectDistributionChart } from "./components/Charts";
import { ErrorState } from "./components/Error";
import { LoadingState } from "./components/Loading";
import { MetricCards } from "./components/MetricCard";
import { NoDataState } from "./components/NoData";
import { SmartInsights } from "./components/SmartInsights";
import { config } from "./config";
import { RootState } from "./store/store";



export interface AnalyticsData {
  totalEmails: number;
  autoRepliedEmails: number;
  replyRate: number;
  topSenders: Array<{ sender: string; _count: { sender: number } }>;
  emailsOverTime: Array<{ createdAt: string; _count: { id: number } }>;
  readEmails: number;
  unreadEmails: number;
  topSubjects: Array<{ subject: string; _count: { subject: number } }>;
}

export type TimeRange = "7d" | "30d" | "90d";

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const { userId } = useSelector((state: RootState) => state.authreducer);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${config.BACKEND_URL}/api/v1/analytics/getAnalytics/${userId}`);
        setAnalyticsData(res.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [timeRange, userId]);

  const hasNoData = !analyticsData || analyticsData.totalEmails === 0;

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 py-8 bg-slate-50 text-slate-800">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-8"
      >
        <Header timeRange={timeRange} setTimeRange={setTimeRange} />

        {hasNoData ? (
          <NoDataState />
        ) : (
          <>
            <MetricCards analyticsData={analyticsData} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EmailActivityChart analyticsData={analyticsData} />
              <SubjectDistributionChart analyticsData={analyticsData} />
            </div>
            
            <SmartInsights analyticsData={analyticsData} />
          </>
        )}
      </motion.div>
    </div>
  );
};

export default AnalyticsDashboard;





































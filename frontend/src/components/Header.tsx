import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { TimeRange } from "../Insights";

interface HeaderProps {
    timeRange: TimeRange;
    setTimeRange: (range: TimeRange) => void;
  }
  
  export const Header = ({ timeRange, setTimeRange }: HeaderProps) => {
    const itemVariants = {
      hidden: { y: -20, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: {
          type: "spring",
          stiffness: 100,
          damping: 12,
        },
      },
    };
  
    return (
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <BarChart3 className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Email Insights</h1>
            <p className="text-slate-600">Analytics and performance metrics for your email activity</p>
          </div>
        </div>
  
        <div className="flex items-center justify-between flex-wrap gap-4">
          <span className="text-sm font-medium text-slate-500">
            {timeRange === "7d" ? "Last 7 days" : 
             timeRange === "30d" ? "Last 30 days" : "Last 90 days"}
          </span>
  
          <div className="flex gap-2">
            {[
              { id: "7d", label: "7 Days" },
              { id: "30d", label: "30 Days" },
              { id: "90d", label: "90 Days" },
            ].map((range) => (
              <button
                key={range.id}
                disabled={range.id !== "7d"}
                onClick={() => setTimeRange(range.id as TimeRange)}
                className={`px-4 py-2 text-sm rounded-lg border transition-all duration-200
                  ${
                    timeRange === range.id
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  } ${range.id !== "7d" ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    );
  };
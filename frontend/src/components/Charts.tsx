import { motion } from "framer-motion";
import { Pie } from "react-chartjs-2";
import { AnalyticsData } from "../Insights";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  Title
);


interface SubjectDistributionChartProps {
    analyticsData: AnalyticsData | null;
  }
  
  export const SubjectDistributionChart = ({ analyticsData }: SubjectDistributionChartProps) => {
    const itemVariants = {
      hidden: { y: 20, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: {
          type: "spring",
          stiffness: 100,
          damping: 15,
          delay: 0.2,
        },
      },
    };
  
    const formatEmailCategoriesData = () => {
      if (!analyticsData?.topSubjects?.length) {
        return {
          labels: ["Work", "Personal", "Promotions", "Updates"],
          datasets: [
            {
              data: [0, 0, 0, 0],
              backgroundColor: ["#4f46e5", "#10b981", "#ef4444", "#f59e0b"],
              borderWidth: 0,
            },
          ],
        };
      }
  
      // Limit to top 6 subjects
      const topSubjects = analyticsData.topSubjects.slice(0, 6);
      const labels = topSubjects.map((s: { subject: any; }) => s.subject || "Unknown");
      const data = topSubjects.map((s: { _count: { subject: any; }; }) => s._count.subject);
  
      return {
        labels,
        datasets: [
          {
            data,
            backgroundColor: [
              "#4f46e5", // indigo
              "#10b981", // emerald 
              "#ef4444", // red
              "#f59e0b", // amber
              "#3b82f6", // blue
              "#8b5cf6", // purple
            ],
            borderWidth: 0,
          },
        ],
      };
    };
  
    const pieChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right" as const,
          labels: {
            boxWidth: 12,
            padding: 15,
            font: {
              size: 12,
              family: "'Inter', sans-serif",
            },
          },
        },
        tooltip: {
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          titleColor: "#1e293b",
          bodyColor: "#475569",
          borderColor: "rgba(226, 232, 240, 1)",
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          boxPadding: 6,
          callbacks: {
            label: function(context: any) {
              const label = context.label || '';
              const value = context.raw;
              const percentage = Math.round((value / context.dataset.data.reduce((a: number, b: number) => a + b, 0)) * 100);
              return `${label}: ${value} emails (${percentage}%)`;
            }
          }
        },
      },
      cutout: '65%',
      animation: {
        animateRotate: true,
        animateScale: true,
      },
    };
  
    const emailCategoriesData = formatEmailCategoriesData();
  
    return (
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-[400px]"
      >
        <h3 className="text-lg font-semibold mb-6 text-slate-800">Top Subjects</h3>
        <div className="h-[320px] flex items-center">
          <Pie data={emailCategoriesData} options={pieChartOptions} />
        </div>
      </motion.div>
    );
  };
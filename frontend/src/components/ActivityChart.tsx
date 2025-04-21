import { motion } from "framer-motion";
import { Line } from "react-chartjs-2";
import { AnalyticsData } from "../Insights";

interface EmailActivityChartProps {
    analyticsData: AnalyticsData | null;
  }
  
  export const EmailActivityChart = ({ analyticsData }: EmailActivityChartProps) => {
    console.log(JSON.stringify(analyticsData)+"annal dataá");
    const itemVariants = {
      hidden: { y: 20, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: {
          type: "spring",
          stiffness: 100,
          damping: 15,
          delay: 0.1,
        },
      },
    };
  
    const formatEmailsOverTimeData = () => {
      if (!analyticsData) return defaultLineData;
  
      const last7Dates = [...Array(7)].map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split("T")[0];
      });
  
      const emailMap = new Map();
      analyticsData.emailsOverTime.forEach((entry: { createdAt: string | number | Date; _count: { id: any; }; }) => {
        const date = new Date(entry.createdAt).toISOString().split("T")[0];
        const currentCount = emailMap.get(date) || 0;
        emailMap.set(date, currentCount + entry._count.id);
      });
  
      const emailCounts = last7Dates.map((date) => emailMap.get(date) || 0);
      const readRatio = analyticsData.totalEmails ? analyticsData.readEmails / analyticsData.totalEmails : 0;
  
      return {
        labels: last7Dates.map((d) => 
          new Date(d).toLocaleDateString("en-US", { weekday: "short" })
        ),
        datasets: [
          {
            label: "Total Emails",
            data: emailCounts,
            borderColor: "#4f46e5",
            backgroundColor: "rgba(79, 70, 229, 0.08)",
            fill: true,
            tension: 0.4,
            borderWidth: 2,
          },
          {
            label: "Read Emails",
            data: emailCounts.map((count) => Math.floor(count * readRatio)),
            borderColor: "#10b981",
            backgroundColor: "rgba(16, 185, 129, 0.08)",
            fill: true,
            tension: 0.4,
            borderWidth: 2,
          },
          {
            label: "Unread Emails",
            data: emailCounts.map((count) => count - Math.floor(count * readRatio)),
            borderColor: "#f59e0b",
            backgroundColor: "rgba(245, 158, 11, 0.08)",
            fill: true,
            tension: 0.4,
            borderWidth: 2,
          },
        ],
      };
    };
  
    const defaultLineData = {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          label: "Total Emails",
          data: [0, 0, 0, 0, 0, 0, 0],
          borderColor: "#4f46e5",
          backgroundColor: "rgba(79, 70, 229, 0.08)",
          fill: true,
          tension: 0.4,
          borderWidth: 2,
        },
      ],
    };
  
    const lineChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top" as const,
          labels: {
            usePointStyle: true,
            pointStyle: "circle",
            boxWidth: 15,
            padding: 30,
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
          usePointStyle: true,
          callbacks: {
            label: function(context: any) {
              const label = context.dataset.label || '';
              const value = context.parsed.y;
              return `${label}: ${value} emails`;
            }
          }
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: {
              size: 12,
              family: "'Inter', sans-serif",
            },
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(226, 232, 240, 0.5)",
            drawBorder: false,
          },
          ticks: {
            stepSize: 1,
            font: {
              size: 12,
              family: "'Inter', sans-serif",
            },
          },
        },
      },
      elements: {
        point: {
          radius: 3,
          hoverRadius: 5,
        },
        line: {
          borderWidth: 2,
        },
      },
      animation: {
        duration: 1000,
      },
    };
  
    const emailsOverTimeData = formatEmailsOverTimeData();
  
    return (
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-[400px]"
      >
        <h3 className="text-lg font-semibold mb-6 text-slate-800">Email Activity</h3>
        <div className="h-[320px]">
          <Line data={emailsOverTimeData} options={lineChartOptions} />
        </div>
      </motion.div>
    );
  };
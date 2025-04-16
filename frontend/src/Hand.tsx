"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { Line, Bar, Pie } from "react-chartjs-2"

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

export default function Insights() {
  const [timeRange, setTimeRange] = useState("7d")
  const [isLoaded, setIsLoaded] = useState(false)

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  }

  // Dummy data (replace with your API data later)
  const totalEmails = 200
  const autoRepliedEmails = 50
  const readEmails = 120
  const unreadEmails = 80

  const replyRate = ((autoRepliedEmails / totalEmails) * 100).toFixed(1)
  const readRate = ((readEmails / totalEmails) * 100).toFixed(1)

  // More detailed dummy data
  const emailsOverTime = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Total Emails",
        data: [28, 32, 24, 35, 30, 18, 22],
        borderColor: "#6366f1",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        tension: 0.3,
        fill: true,
      },
      {
        label: "Read Emails",
        data: [20, 25, 18, 22, 19, 10, 16],
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.3,
        fill: true,
      },
      {
        label: "Auto-Replied",
        data: [8, 10, 6, 12, 8, 3, 5],
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.3,
        fill: true,
      },
    ],
  }

  const emailCategoriesData = {
    labels: ["Work", "Personal", "Promotions", "Updates"],
    datasets: [
      {
        data: [85, 45, 40, 30],
        backgroundColor: [
          "rgba(99, 102, 241, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(59, 130, 246, 0.8)",
        ],
        borderColor: [
          "rgba(99, 102, 241, 1)",
          "rgba(16, 185, 129, 1)",
          "rgba(239, 68, 68, 1)",
          "rgba(59, 130, 246, 1)",
        ],
        borderWidth: 1,
      },
    ],
  }

  const busyHoursData = {
    labels: ["12am", "3am", "6am", "9am", "12pm", "3pm", "6pm", "9pm"],
    datasets: [
      {
        label: "Emails",
        data: [5, 2, 8, 25, 18, 30, 15, 10],
        backgroundColor: "rgba(99, 102, 241, 0.8)",
        borderRadius: 4,
      },
    ],
  }

  // Calculate trends
  const totalLastWeek = emailsOverTime.datasets[0].data.reduce((sum, val) => sum + val, 0)
  const avgPerDay = (totalLastWeek / 7).toFixed(1)
  const trend = totalLastWeek > 180 ? "up" : "down"
  const trendPercent = trend === "up" ? "12.5%" : "8.3%"

  // Chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          boxWidth: 6,
        },
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        backgroundColor: "rgba(17, 24, 39, 0.9)",
        padding: 12,
        boxPadding: 6,
        bodyFont: {
          size: 13,
        },
        titleFont: {
          size: 14,
          weight: "bold",
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(156, 163, 175, 0.1)",
        },
      },
    },
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
  }

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.9)",
        padding: 12,
        bodyFont: {
          size: 13,
        },
        titleFont: {
          size: 14,
          weight: "bold",
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(156, 163, 175, 0.1)",
        },
      },
    },
  }

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.9)",
        padding: 12,
        bodyFont: {
          size: 13,
        },
        titleFont: {
          size: 14,
          weight: "bold",
        },
      },
    },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div
        className="flex-1 space-y-6 p-6 md:p-8"
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <motion.div
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          variants={itemVariants}
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Email Insights</h1>
            <p className="text-gray-500">Analytics and performance metrics for your email activity</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="appearance-none rounded-lg border border-gray-300 bg-white pl-10 pr-10 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute left-3 top-2.5 h-4 w-4 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute right-3 top-2.5 h-4 w-4 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <button className="rounded-lg border border-gray-300 bg-white p-2 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
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
            </button>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4" variants={containerVariants}>
          <motion.div className="rounded-xl bg-white p-6 shadow-sm" variants={itemVariants}>
            <div className="text-sm font-medium text-gray-500">Total Emails</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{totalEmails}</div>
            <div className="mt-2 text-xs text-gray-500">
              <span
                className={`inline-flex items-center font-medium ${trend === "up" ? "text-emerald-600" : "text-rose-600"}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-1 h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={trend === "up" ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"}
                  />
                </svg>
                {trendPercent}
              </span>
              <span className="ml-1">from previous period</span>
            </div>
            <div className="mt-4 text-xs text-gray-500">Avg {avgPerDay} emails per day</div>
          </motion.div>

          <motion.div className="rounded-xl bg-white p-6 shadow-sm" variants={itemVariants}>
            <div className="text-sm font-medium text-gray-500">Auto Replies</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{autoRepliedEmails}</div>
            <div className="mt-2 flex items-center">
              <div className="mr-2 h-2 w-2 rounded-full bg-indigo-600"></div>
              <div className="text-xs text-gray-500">
                <span className="font-medium">{replyRate}%</span> reply rate
              </div>
            </div>
            <div className="mt-4 h-2 w-full rounded-full bg-gray-100">
              <div className="h-2 rounded-full bg-indigo-600" style={{ width: `${replyRate}%` }}></div>
            </div>
          </motion.div>

          <motion.div className="rounded-xl bg-white p-6 shadow-sm" variants={itemVariants}>
            <div className="text-sm font-medium text-gray-500">Read Emails</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{readEmails}</div>
            <div className="mt-2 flex items-center">
              <div className="mr-2 h-2 w-2 rounded-full bg-emerald-500"></div>
              <div className="text-xs text-gray-500">
                <span className="font-medium">{readRate}%</span> of total emails
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-1 h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              Most active on weekdays
            </div>
          </motion.div>

          <motion.div className="rounded-xl bg-white p-6 shadow-sm" variants={itemVariants}>
            <div className="text-sm font-medium text-gray-500">Unread Emails</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{unreadEmails}</div>
            <div className="mt-2 flex items-center">
              <div className="mr-2 h-2 w-2 rounded-full bg-rose-500"></div>
              <div className="text-xs text-gray-500">
                <span className="font-medium">{(100 - Number.parseFloat(readRate)).toFixed(1)}%</span> of total emails
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-1 h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
              Consider archiving or deleting
            </div>
          </motion.div>
        </motion.div>

        {/* Charts */}
        <motion.div className="space-y-6" variants={containerVariants}>
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button className="border-indigo-500 text-indigo-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                Activity
              </button>
              <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                Categories
              </button>
              <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                Timing
              </button>
            </nav>
          </div>

          <motion.div className="rounded-xl bg-white p-6 shadow-sm" variants={itemVariants}>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Email Activity Over Time</h3>
              <p className="text-sm text-gray-500">Track your email volume, read rate, and auto-replies</p>
            </div>
            <div className="h-[300px]">
              <Line data={emailsOverTime} options={lineChartOptions} />
            </div>
          </motion.div>

          <motion.div className="grid gap-6 md:grid-cols-2" variants={containerVariants}>
            <motion.div className="rounded-xl bg-white p-6 shadow-sm" variants={itemVariants}>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Email Categories</h3>
                <p className="text-sm text-gray-500">Distribution of emails by category</p>
              </div>
              <div className="h-[300px]">
                <Pie data={emailCategoriesData} options={pieChartOptions} />
              </div>
            </motion.div>

            <motion.div className="rounded-xl bg-white p-6 shadow-sm" variants={itemVariants}>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Busiest Hours</h3>
                <p className="text-sm text-gray-500">When you receive the most emails</p>
              </div>
              <div className="h-[300px]">
                <Bar data={busyHoursData} options={barChartOptions} />
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-4 w-4"
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
                Peak activity at 3pm with 30 emails
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Insights and Recommendations */}
        <motion.div className="rounded-xl bg-white p-6 shadow-sm" variants={itemVariants}>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Smart Insights</h3>
            <p className="text-sm text-gray-500">AI-powered recommendations to improve your email workflow</p>
          </div>
          <motion.div className="space-y-4" variants={containerVariants}>
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
                <h4 className="text-sm font-medium text-gray-900">High Unread Rate</h4>
                <p className="text-sm text-gray-500">
                  You have {unreadEmails} unread emails ({(100 - Number.parseFloat(readRate)).toFixed(1)}% of total).
                  Consider setting aside 15 minutes each morning to process unread messages.
                </p>
              </div>
            </motion.div>

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
                  Your emails receive the most attention when sent between 9am-11am. Schedule important communications
                  during this window for better engagement.
                </p>
              </div>
            </motion.div>

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
                  Your auto-replies handle {replyRate}% of incoming messages. Consider expanding your templates to cover
                  more common inquiries.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

"use client"

import { useCallback, useEffect, useState } from "react"
import { Search, Inbox, Mail, ChevronLeft, Loader2, RefreshCw } from "lucide-react"
import axios from "axios"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { config } from "../config"
import { socket } from "../utils/socket"
import { logout } from "../store/slices/authSlice"
import {
  updateEmailThread,
  addEmailThread,
  setEmailThread,
  clearSelectedThread,
  setSelectedThread,
} from "../store/slices/emailSlice"
import { connectMail, disconnectMail, updateAutoReply } from "../store/slices/oauthSlice"
import type { RootState } from "../store/store"
import { useWindowSize } from "../curtomhooks/useWindowSize"

const getRandomColor = (userId: any) => {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-red-500",
    "bg-gray-500",
    "bg-slate-500",
    "bg-teal-500",
  ]
  return colors[userId % 10]
}

const MailView = () => {
  const dispatch = useDispatch()
  const { userId } = useSelector((state: RootState) => state.authreducer)
  const [showMobileThread, setShowMobileThread] = useState(false)
  const { onboarding_complete } = useSelector((state: RootState) => state.OAuthreducer)
  const { auto_reply } = useSelector((state: RootState) => state.OAuthreducer)
  const emails = useSelector((state: RootState) => state.emailThreadReducer)
  const [autoReply, setAutoReply] = useState(auto_reply)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const windowWidth = useWindowSize()

  const fetchThreadDetails = async (threadId: string, id: number) => {
    try {
      const { data } = await axios.get(`${config.BACKEND_URL}/api/v1/mail/getEmailThread/${threadId}`)
      if (data?.data) {
        dispatch(setSelectedThread({ emails: data.data.emails, threadId, id }))
        await axios.post(`${config.BACKEND_URL}/api/v1/mail/markThreadRead/${threadId}`)
      }
    } catch (err) {
      console.error("Failed to fetch thread details", err)
    }
  }
  const getOAuthAccess = async () => {
    try {
      const result = await axios.post(`${config.BACKEND_URL}/api/v1/mail/startService`, { userId })
      if (!result.data) {
        dispatch(disconnectMail())
        navigate("/")
      } else {
        dispatch(connectMail(result.data.data))
      }
    } catch (error) {
      console.error("Error connecting:", error)
      dispatch(disconnectMail())
      navigate("/")
    }
  }

  useEffect(() => {
    if (!userId) {
      dispatch(logout())
      dispatch(disconnectMail())
      navigate("/")
      return
    }
    getOAuthAccess().then(() => {
      fetchEmails().then(() => {
        setLoading(false)
        if (!onboarding_complete) {
          console.log("yehhh");
          navigate("/connect-gmail")
        }
      })
    })
    

    socket.emit("register", userId)

    const handleNewEmailInThread = (data: any) => {
      dispatch(updateEmailThread(data.threadId))
    }

    const handleNewThreadCreated = (data: any) => {
      dispatch(addEmailThread(data))
    }

    socket.on("new_email_in_thread", handleNewEmailInThread)
    socket.on("new_thread_created", handleNewThreadCreated)

    



    return () => {
      socket.off("new_email_in_thread", handleNewEmailInThread)
      socket.off("new_thread_created", handleNewThreadCreated)
    }
  }, [userId, onboarding_complete])

  const fetchEmails = async () => {
    try {
      const { data } = await axios.get(`${config.BACKEND_URL}/api/v1/mail/getEmailThread`)
      if (data?.data) {
        dispatch(setEmailThread(data.data))
      }
    } catch (error) {
      console.error("Error fetching emails:", error)
    }
  }

  const refreshEmails = async () => {
    setRefreshing(true)
    await fetchEmails()
    setTimeout(() => setRefreshing(false), 800) // Add a slight delay for better UX
  }

  const toggleConnection = useCallback(async () => {
    const newAutoReply = !autoReply
    setAutoReply(newAutoReply)
    await axios.post(`${config.BACKEND_URL}/api/v1/mail/toggleAutoReply`, { userId, auto_reply: newAutoReply })
    dispatch(updateAutoReply({ auto_reply: newAutoReply }))
  }, [dispatch, userId, autoReply])

  const filteredThreads = emails.threads.filter((email) =>
    email.subject.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-[calc(100vh-2rem)] mx-4 gap-4">
      {/* Email Thread Sidebar */}
      <motion.div
        layout
        className={`${showMobileThread ? "hidden lg:flex" : "flex"} w-full lg:w-1/3 bg-white rounded-xl shadow-md overflow-hidden flex-col`}
      >
        {/* Search and Auto-reply Section */}
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="relative">
            <input
              type="text"
              placeholder="Search emails..."
              className="w-full px-4 py-3 pl-10 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">
                {autoReply ? "Auto-Reply ON" : "Auto-Reply OFF"}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={autoReply} onChange={toggleConnection} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-500 transition-all duration-300"> </div>
                  <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5 shadow-sm"></span>
               
              </label>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={refreshEmails}
              className="text-blue-500 hover:text-blue-600 transition-colors"
              disabled={refreshing}
            >
              <motion.div
                animate={refreshing ? { rotate: 360 } : {}}
                transition={{ duration: 1, ease: "linear" }}
              >
                {refreshing ? <Loader2 size={20} /> : <RefreshCw size={20} />}
              </motion.div>
            </motion.button>
          </div>
        </div>

        {/* Email List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "linear" }}
              >
                <Loader2 className="w-8 h-8 text-blue-500" />
              </motion.div>
              <p className="mt-4 text-gray-500">Loading emails...</p>
            </div>
          ) : filteredThreads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Inbox className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-700">No emails found</h3>
              <p className="text-gray-500 mt-2">
                {searchQuery ? "Try a different search term" : "Your inbox is empty"}
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredThreads.map((email: any, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => {
                    fetchThreadDetails(email.threadId, email.id)
                    if (window.innerWidth < 1024) setShowMobileThread(true)
                  }}
                  className={`p-5 bg-white rounded-2xl shadow hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 ${email.read ? "border-transparent" : "border-blue-500"}`}
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={`${getRandomColor(email.id)} w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold shadow-md`}
                    >
                      {email.subject[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h2 className={`font-semibold text-xl text-gray-800 truncate ${!email.read && "font-bold"}`}>
                          {windowWidth < 1024
                            ?( windowWidth<500 ? `${email.subject.slice(0, 10)}...`: email.subject )
                            : email.subject.length < 20
                            ? email.subject
                            : `${email.subject.slice(0, 19)}...`}
                        </h2>
                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                          {formatDate(email.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 flex items-center">
                        {!email.read && <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>}
                        <span className={`${!email.read ? "font-medium" : ""}`}>{email.read ? "Read" : "Unread"}</span>
                      </p>
                      <p className={`text-gray-700 mt-3 line-clamp-2 ${!email.read && "font-medium"}`}>
                        {email.snippet}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </motion.div>

      {/* Mobile Thread Drawer */}
      <AnimatePresence>
        {emails.selectedThread && showMobileThread && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 bg-white shadow-lg lg:hidden"
          >
            <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowMobileThread(false)
                  dispatch(clearSelectedThread())
                }}
                className="flex items-center text-blue-600 font-medium"
              >
                <ChevronLeft size={20} className="mr-1" />
                Back
              </motion.button>
              <h3 className="text-lg font-semibold text-gray-800">Email Details</h3>
              <div className="w-8"></div> {/* Spacer for centering */}
            </div>

            <div className="overflow-y-auto px-4 py-6 h-[calc(100vh-4rem)] bg-gray-50">
              <AnimatePresence>
                {emails.selectedThread.map((email, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="mb-6 p-5 border bg-white rounded-xl shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-3 pb-3 border-b border-gray-100">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{email.sender}</p>
                        <p className="text-xs text-gray-500">To: {email.recipient}</p>
                      </div>
                      <p className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(email.createdAt).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700 whitespace-pre-line">{email.context}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Thread View */}
      <motion.div layout className="hidden lg:flex w-2/3 bg-white rounded-xl shadow-md overflow-hidden">
        {emails.selectedThread ? (
          <div className="p-6 w-full overflow-y-auto bg-gray-50">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
              <h3 className="text-2xl font-semibold text-gray-800">Email Conversation</h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => dispatch(clearSelectedThread())}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm flex items-center"
              >
                <ChevronLeft size={16} className="mr-1" />
                Back to Inbox
              </motion.button>
            </div>
            <div className="space-y-6">
              <AnimatePresence>
                {emails.selectedThread.map((email, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-6 border bg-white rounded-xl shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-100">
                      <div>
                        <p className="text-base font-medium text-gray-800">{email.sender}</p>
                        <p className="text-sm text-gray-500 mt-1">To: {email.recipient}</p>
                      </div>
                      <p className="text-sm text-gray-400">
                        {new Date(email.createdAt).toLocaleString([], {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-line">{email.context}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-gray-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <Mail className="w-20 h-20 text-blue-200 mx-auto mb-6" />
            </motion.div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-3">No Email Selected</h3>
            <p className="text-gray-500 max-w-md">
              Select an email from the list to view its contents. Your conversation will appear here.
            </p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default MailView

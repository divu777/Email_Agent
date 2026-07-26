import { EmailsType } from "./Dashboard";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Mail } from "lucide-react";
import { useState } from "react";

const LABEL_OPTIONS = [
  { id: "IMPORTANT", label: "Important" },
  { id: "ALL", label: "All Mail" },
  { id: "UNREAD", label: "Unread" },
  { id: "STARRED", label: "Starred" },
  { id: "SENT", label: "Sent" },
  { id: "SPAM", label: "Spam" },
  { id: "TRASH", label: "Trash" },
];

const MailView = ({
  emails,
  handleEmailClick,
  handleLoadMore,
  load,
  loading,
  searchQuery,
  setSearchQuery,
  activeLabel,
  setActiveLabel,
}: {
  emails: EmailsType[];
  handleEmailClick: (threadId: string) => void;
  handleLoadMore: () => void;
  load: string;
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  activeLabel: string;
  setActiveLabel: (value: string) => void;
}) => {
  const [searchFocused, setSearchFocused] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
       duration: 0.35,
        staggerChildren: 0.08,
        ease: [0.25, 1, 0.5, 1]
      }
    }
  };

  const emailVariants = {
    hidden: { 
      opacity: 0, 
      x: -15,
      scale: 0.97
    },
    visible: { 
      opacity: 1, 
      x: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 250,
        damping: 20,
        mass: 0.8,
        duration: 0.3
      }
    },
    exit: {
      opacity: 0,
      x: 15,
      scale: 0.97,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  const searchVariants = {
    unfocused: {
      scale: 1,
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)"
    },
    focused: {
      scale: 1.03,
      boxShadow: "0 4px 16px rgba(59, 130, 246, 0.2)",
      transition: {
        duration: 0.2,
                ease: [0.4, 0, 0.2, 1]

      }
    }
  };

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { 
      scale: 1.08,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 15
      }
    },
    tap: { scale: 0.96 }
  };

  const loadingDots = {
    animate: {
      opacity: [0.4, 1, 0.4],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div 
    layout="position"
      className="h-full w-full lg:w-2/6 bg-white flex flex-col p-6 space-y-6 rounded-lg border border-gray-200 shadow-sm"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Search Bar */}
      <motion.div
        variants={searchVariants}
        animate={searchFocused ? "focused" : "unfocused"}
        className="relative"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <motion.input
            type="text"
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            whileFocus={{ scale: 1.01 }}
          />
        </div>
      </motion.div>

      {/* Label Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mt-2 scrollbar-hide">
        {LABEL_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setActiveLabel(opt.id)}
            className={`relative px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors duration-200 ${
              activeLabel === opt.id
                ? "text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {activeLabel === opt.id && (
              <motion.div
                layoutId="activeLabelPill"
                className="absolute inset-0 bg-blue-600 rounded-full"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative z-10">{opt.label}</span>
          </button>
        ))}
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto space-y-3 py-2 scrollbar-hide">
        <AnimatePresence mode="popLayout">
          {emails && emails.length > 0 ? (
            emails.map((email, index) => (
              <motion.div
                key={`${email.threadId}-${index}`}
                variants={emailVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
  layout="position"
                className="bg-gray-50 hover:bg-gray-100 transition-all duration-200 cursor-pointer px-5 py-4 rounded-lg border border-transparent hover:border-blue-400 shadow-sm hover:shadow-md"
                onClick={() => handleEmailClick(email.threadId)}
                whileHover={{ 
                  y: -2,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-semibold text-blue-600 flex-1 mr-2">
                      {/* {email.subject ? (email.subject === 'Re:' ? 'No Subject' : email.subject) : "No Subject"} */}
                                          {email.from || "Unknown Sender"}

                    </p>
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </div>
                  <p className="text-xs font-semibold text-gray-500 mb-2">
                    {/* {email.from || "Unknown Sender"} */}
                                          {email.subject ? (email.subject === 'Re:' ? 'No Subject' : email.subject) : "No Subject"}

                  </p>
                  <p className="text-xs text-gray-700 leading-snug">
                    {email.snippet?.substring(0, 60)}...
                  </p>
                </motion.div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-12 text-gray-500"
            >
              <Mail className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-lg font-medium">No emails found</p>
              <p className="text-sm">Your inbox is empty</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Load More Button */}
        <AnimatePresence>
          {emails && load && load !== "0" && (
            <motion.div 
              className="w-full flex items-center justify-center mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <motion.button
                className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium text-sm shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                onClick={handleLoadMore}
                disabled={loading}
                variants={buttonVariants}
                initial="idle"
                whileHover={!loading ? "hover" : "idle"}
                whileTap={!loading ? "tap" : "idle"}
              >
                {loading ? (
                  <>
                    <motion.div
                      variants={loadingDots}
                      animate="animate"
                      className="flex space-x-1"
                    >
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                    </motion.div>
                    <span className="ml-2">Loading</span>
                  </>
                ) : (
                  <span>Load More</span>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default MailView;
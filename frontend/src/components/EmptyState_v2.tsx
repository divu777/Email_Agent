import React from "react";
import { motion } from "framer-motion";
import { Inbox, Mail, Search } from "lucide-react";

interface EmptyStateProps {
  type: "no-email" | "loading" | "no-selection" | "no-results";
  searchQuery?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ type, searchQuery }) => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const iconVariants = {
    hidden: { scale: 0.5, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 300,
        delay: 0.2
      }
    }
  };

  const textVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: 0.4
      }
    }
  };

  const renderContent = () => {
    switch (type) {
      case "loading":
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 1,
                ease: "linear",
              }}
              className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full mb-6"
            />
            <motion.p 
              variants={textVariants}
              className="text-gray-600 font-medium text-lg"
            >
              Loading emails...
            </motion.p>
          </motion.div>
        );

      case "no-email":
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center justify-center max-w-sm mx-auto"
          >
            <motion.div variants={iconVariants}>
              <Inbox className="w-20 h-20 text-gray-300 mb-6" />
            </motion.div>
            <motion.h3 
              variants={textVariants}
              className="text-2xl font-semibold text-gray-700 mb-3"
            >
              Your inbox is empty
            </motion.h3>
            <motion.p 
              variants={textVariants}
              className="text-gray-500 text-center leading-relaxed"
            >
              When you receive new emails, they'll appear here. Check back later or send yourself a test email.
            </motion.p>
          </motion.div>
        );

      case "no-results":
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center justify-center max-w-sm mx-auto"
          >
            <motion.div variants={iconVariants}>
              <Search className="w-20 h-20 text-gray-300 mb-6" />
            </motion.div>
            <motion.h3 
              variants={textVariants}
              className="text-2xl font-semibold text-gray-700 mb-3"
            >
              No results found
            </motion.h3>
            <motion.p 
              variants={textVariants}
              className="text-gray-500 text-center leading-relaxed"
            >
              No emails matching <span className="font-semibold text-gray-700">"{searchQuery}"</span> were found. Try a different search term.
            </motion.p>
          </motion.div>
        );

      case "no-selection":
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center justify-center max-w-md mx-auto"
          >
            <motion.div variants={iconVariants}>
              <Mail className="w-24 h-24 text-blue-300 mb-8" />
            </motion.div>
            <motion.h3 
              variants={textVariants}
              className="text-2xl font-semibold text-gray-700 mb-4"
            >
              No Email Selected
            </motion.h3>
            <motion.p 
              variants={textVariants}
              className="text-gray-500 text-center leading-relaxed text-lg"
            >
              Select an email from the list to view its contents. Your conversation will appear here.
            </motion.p>
          </motion.div>
        );
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-full min-h-[400px] lg:min-h-[500px] p-6 lg:p-8">
      <div className="text-center w-full">
        {renderContent()}
      </div>
    </div>
  );
};

export default EmptyState;
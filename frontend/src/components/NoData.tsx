import { motion } from "framer-motion";
import { MailX } from "lucide-react";

export const NoDataState = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 mb-8"
      >
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="p-3 bg-white rounded-full shadow-sm">
            <MailX className="h-8 w-8 text-indigo-500" />
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-medium text-indigo-800 mb-1">No email data available yet</h3>
            <p className="text-indigo-600 mb-4">
              Start using your email agent to see insights and analytics here.
            </p>
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200 text-sm"
            >
              Set Up Your Email
            </button>
          </div>
        </div>
      </motion.div>
    );
  };
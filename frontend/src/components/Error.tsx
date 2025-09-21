import { motion } from "framer-motion";
import { AlertOctagon } from "lucide-react";

interface ErrorStateProps {
  error: string;
}

export const ErrorState = ({ error }: ErrorStateProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white shadow-md rounded-xl p-6 text-center"
      >
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertOctagon className="h-6 w-6 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">
          Something went wrong
        </h2>
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200"
        >
          Try Again
        </button>
      </motion.div>
    </div>
  );
};

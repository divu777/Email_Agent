import { motion } from "framer-motion";

export const LoadingState = () => {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md"
        >
          <div className="flex justify-center">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative"
            >
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-slate-50 rounded-full"></div>
              </div>
            </motion.div>
          </div>
          <h2 className="mt-6 text-xl font-medium text-slate-800">Analyzing your emails</h2>
          <p className="mt-2 text-slate-500">
            We're gathering insights about your email activity...
          </p>
        </motion.div>
      </div>
    );
  };
import { motion } from "framer-motion";
import { FaGoogle } from "react-icons/fa";
import axios from "axios";
import { config } from "./config";
import { useSelector } from "react-redux";
import { RootState } from "./store/store";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

export const ConnectGmail = () => {
  const navigate=useNavigate();
  const [loading,setLoading]=useState(true);
  const {user}=useUser();
  const { userId, email } = useSelector(
    (state: RootState) => state.authreducer
  );
  const {onboarding_complete} = useSelector(
    (state:RootState) => state.OAuthreducer
  )
  const handleConnect = async () => {
    try {
      const result = await axios.post(
        `${config.BACKEND_URL}/api/v1/mail/getAuthUrl`,
        { userId, email }
      );
      const url = result.data.url;
      if (url) {
        window.location.href = url;
      } else {
        console.error("No URL received from the server.");
        alert("Failed to get Gmail connection URL.");
      }
    } catch (error) {
      console.error("Error connecting to Gmail:", error);
      alert("Something went wrong. Try again.");
    }
  };

  useEffect(()=>{
    if(!user && onboarding_complete){
      navigate("/")
    }else{
      setLoading(false)

    }
  },[user,onboarding_complete])



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-xl font-semibold text-gray-600 animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white overflow-hidden px-4">
      {/* Content - unchanged from original */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 bg-white shadow-2xl rounded-3xl p-10 max-w-md w-full text-center"
      >
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-3xl font-bold text-gray-800 mb-3"
        >
          Connect Your Gmail
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-gray-600 mb-6"
        >
          To enable AI replies and insights, securely connect your Gmail
          account.
        </motion.p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleConnect}
          className="flex items-center justify-center gap-3 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all w-full font-medium shadow-lg"
        >
          <FaGoogle className="text-lg" />
          Connect with Gmail
        </motion.button>
      </motion.div>
    </div>
  );
};

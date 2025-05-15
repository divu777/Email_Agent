import { motion } from "framer-motion";
import { FaGoogle } from "react-icons/fa";
import axios from "axios";
import { config } from "./config";
import { useSelector } from "react-redux";
import { RootState } from "./store/store";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const ConnectGmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [display, setDisplay] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { userId, email } = useSelector((state: RootState) => state.authreducer);
  const { onboarding_complete } = useSelector((state: RootState) => state.OAuthreducer);

  const handleConnect = async () => {
    try {
      setDisplay(true);
      setError(null);

      if (userId && !onboarding_complete) {
        const result = await axios.post(`${config.BACKEND_URL}/api/v1/mail/getAuthUrl`, {
          userId,
          email,
        });

        const url = result.data?.url;

        if (url) {
          window.location.href = url;
        } else {
          setError("Failed to get Gmail connection URL.");
        }
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Error connecting to Gmail:", error);
      setError("Something went wrong. Try again.");
      navigate("/")
    } finally {
      setDisplay(false);
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const state = queryParams.get("state");
    const code = queryParams.get("code");

    if (state && code) {
      axios
        .post(`${config.BACKEND_URL}/callback`, { state, code })
        .then((response) => {
          if (response.data.success) {
            navigate("/prompt-select");
          } else {
            setError("Failed to complete Gmail connection.");
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error("Error during Gmail callback:", err);
          setError("Error finalizing connection.");
          setLoading(false);
        });
    } else {
      setLoading(false); // No OAuth query params — stop loading
    }
  }, [location.search]);

  useEffect(()=>{
    if(userId && onboarding_complete){
      navigate("/dashboard");
    }
  })

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
          To enable AI replies and insights, securely connect your Gmail account.
        </motion.p>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <motion.button
          disabled={display}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleConnect}
          className="flex items-center justify-center gap-3 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all w-full font-medium shadow-lg disabled:opacity-50"
        >
          <FaGoogle className="text-lg" />
          Connect with Gmail
        </motion.button>
      </motion.div>
    </div>
  );
};

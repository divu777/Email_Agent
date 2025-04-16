import axios from "axios";
import { useCallback, useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./store/store";
import { useNavigate } from "react-router-dom";
import { connect, disconnect } from "./store/slices/oauthSlice";
import { signout } from "./store/slices/authSlice";
import { socket } from "./socket";
import { addEmailThread, setEmailThread, updateEmailThread } from "./store/slices/emailSlice";
import { config } from "./config";

const Gmail = () => {
  const dispatch = useDispatch();
  const { userId } = useSelector((state: RootState) => state.authreducer);
  const { onboarding_complete } = useSelector((state: RootState) => state.OAuthreducer);
  const { auto_reply } = useSelector((state: RootState) => state.OAuthreducer);
  const emails = useSelector((state: RootState) => state.emailThreadReducer);
  const [AutoReply, setAutoReply] = useState(auto_reply);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const isInitialMount = useRef(true);

  // Effect for auth check and navigation
  useEffect(() => {
    if (!userId) {
      dispatch(signout());
      dispatch(disconnect());
      navigate("/");
      return;
    }

    if (onboarding_complete) {
      navigate("/gmail");
    }
  }, [userId, onboarding_complete, dispatch, navigate]);

  // Effect for socket connection and initialization
  useEffect(() => {
    // Only run this effect once on initial mount
    if (!userId) return;

    socket.emit('register', userId);
  
    const handleNewEmailInThread = (data: any) => {
      dispatch(updateEmailThread(data.threadId));
    };
  
    const handleNewThreadCreated = (data: any) => {
      dispatch(addEmailThread(data));
    };
  
    socket.on('new_email_in_thread', handleNewEmailInThread);
    socket.on('new_thread_created', handleNewThreadCreated);
  
    const getOAuthAccess = async () => {
      try {
        const result = await axios.post(`${config.BACKEND_URL}/api/v1/mail/startService`, { userId });
        if (!result.data) {
          dispatch(disconnect());
          navigate("/");
          return;
        }
        
        dispatch(connect(result.data));
        
        if (result.data && !result.data.onboarding_complete) {
          navigate("/prompt-select");
          return;
        }
        
        // Only fetch emails if we're staying on this page
        fetchEmails().then(() => setLoading(false));
      } catch (error) {
        console.error("Error connecting:", error);
        dispatch(disconnect());
        navigate("/");
      }
    };
  
    // Initial setup
    getOAuthAccess();
  
    return () => {
      socket.off('new_email_in_thread', handleNewEmailInThread);
      socket.off('new_thread_created', handleNewThreadCreated);
    };
  }, [userId, dispatch, navigate]); // Only depend on these stable dependencies

  const fetchEmails = async () => {
    try {
      const { data } = await axios.get(`${config.BACKEND_URL}/api/v1/mail/getEmailThread`);
      if (data?.data) {
        dispatch(setEmailThread(data.data));
      }
    } catch (error) {
      console.error("Error fetching emails:", error);
    }
  };

  const toggleConnection = useCallback(async () => {
    const newAutoReply = !AutoReply;
    setAutoReply(newAutoReply);
    await axios.post(`${config.BACKEND_URL}/api/v1/mail/toggleAutoReply`, { userId, auto_reply: newAutoReply });
    dispatch(connect({ auto_reply: newAutoReply }));
  }, [dispatch, userId, AutoReply]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg font-semibold">
        ⏳ Wait a minute bhai sahab...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-4 bg-blue-700 text-white shadow-lg">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span>📧</span> My Inbox
        </h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">
            {AutoReply ? "Auto-Reply ON" : "Auto-Reply OFF"}
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={AutoReply}
              onChange={toggleConnection}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-all duration-300"></div>
            <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></span>
          </label>
        </div>
      </nav>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {emails.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500 text-lg">No emails found 📨</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {emails.map((email: any, index) => (
              <div
                key={index}
                className="p-5 bg-white rounded-2xl shadow-md border hover:shadow-lg transition-all duration-300"
              >
                <h2 className="font-semibold text-xl text-gray-800 truncate">{email.subject}</h2>
                <p className="text-sm text-gray-500 mt-2">
                  <span className="font-semibold">From:</span> {email.sender || "Unknown Sender"}
                </p>
                <p className="text-gray-700 mt-3 line-clamp-3">{email.snippet || "No preview available."}</p>
                <div className="mt-4 flex justify-end">
                  <span className="text-xs text-gray-400">
                    {new Date(email.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gmail;
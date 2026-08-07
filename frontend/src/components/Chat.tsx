import { File, MessageSquare, Send, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useSocket } from "../hooks/useSocket";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import axios from "axios";
import { config } from "../config";

type Message = {
  content: string;
  role: "human" | "ai";
  id: number;
};

type ApprovalRequest = {
  id: number;
  tool: string;
  input: Record<string, unknown>;
  flagged?: boolean;
  flagReason?: string;
};


const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
      staggerChildren: 0.08,
    },
  },
};

const messageVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 160, damping: 18 },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.97,
    transition: { duration: 0.2 },
  },
};

const inputVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

const Chat = () => {
  const [file, setFile] = useState<HTMLInputElement | null>(null);
  const [error, setError] = useState(false);

  const [chats, setChats] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pendingApproval, setPendingApproval] = useState<ApprovalRequest | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const socket = useSocket();

  const getMessages = async () => {
    const { data } = await axios.get(
      `${config.BACKEND_URL}/api/v1/genai/messages`,
      {
        withCredentials: true,
      }
    );

    if (!data.success) {
      setChats([]);
      return;
    }
    //console.log(JSON.stringify(data))
    setChats(data.messages);
  };

  const removeFile = async (change: boolean) => {
    // axios request to run a cron job to remove that file from S3 and the chunk embeddings
    await axios.delete(
      `${config.BACKEND_URL}/api/v1/genai/deleteFile/${filenameRef.current}`,
      {
        withCredentials: true,
      }
    );
    if (!change) {
      setFile(null);
      filenameRef.current = null;
    }
  };
  useEffect(() => {
    getMessages();

    return () => {
      if (filenameRef.current) {
        removeFile(false);
      }
    };
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    if (socket?.readyState === WebSocket.OPEN) {
      const humanId = Date.now();
      const aiId = humanId + 1;
      if (chats.length >= 19) {
        setError(true);
        setTimeout(() => setError(false), 5000);

        return;
      }
      const messages = chats.map(({ id, ...rest }) => rest);
      messages.push({
        content: input,
        role: "human",
      });
      // console.log(JSON.stringify(messages))
      socket.send(
        JSON.stringify({
          messages,
          newMsgId: aiId,
          fileName: filenameRef.current ? filenameRef.current : null,
        })
      );

      setChats((prev) => [
        ...prev,
        { content: input, id: humanId, role: "human" },
        { content: "", id: aiId, role: "ai" },
      ]);
    }
    setInput("");
  };

  useEffect(() => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.onmessage = (message) => {
        const event = JSON.parse(message.data);

        if (event.type === "approval_request") {
          setPendingApproval({
            id: event.id,
            tool: event.tool,
            input: event.input,
            flagged: event.flagged,
            flagReason: event.flagReason,
          });
          return;
        }

        setChats((prev) =>
          prev.map((m) => (m.id === event.id ? { ...m, content: event.content } : m))
        );
      };
    }
  }, [socket]);

  const handleApprovalDecision = (approved: boolean) => {
    if (!pendingApproval || socket?.readyState !== WebSocket.OPEN) return;
    socket.send(
      JSON.stringify({
        type: "approval_response",
        id: pendingApproval.id,
        approved,
      })
    );
    setPendingApproval(null);
  };

  const filenameRef = useRef<String>(null);

  const getPresignedUrl = async (
    fileName: string,
    contentType: string
  ): Promise<string> => {
    const { data } = await axios.post(
      `${config.BACKEND_URL}/api/v1/genai/presignedUrl`,
      {
        filename: fileName,
        contentType,
      },
      {
        withCredentials: true,
      }
    );

    return data.url;
  };

  const handleFileChange = async (e: React.ChangeEvent<any>) => {
    if (filenameRef.current) {
      removeFile(true);
    }
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFile(file);
      const uniqueKey = `${Date.now()}_${file.name}`;

      const url = await getPresignedUrl(uniqueKey, file.type);
      //JSON.stringify(url)+"========> URL")
      await axios.put(url, file, {
        headers: {
          "Content-Type": file.type,
        },
      });

      filenameRef.current = uniqueKey;
      // console.log(filenameRef)
      //console.log(JSON.stringify(filenameRef))
    }
  };

  return (
    <motion.div
      className="h-full w-full bg-white flex flex-col p-6 space-y-6 rounded-lg border border-gray-200 shadow-sm"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 py-2 scrollbar-hide">
        <AnimatePresence>
          {chats.map((chat) => (
            <motion.div
              key={chat.content}
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
              className={`flex w-full ${
                chat.role === "ai" ? "justify-start" : "justify-end"
              }`}
            >
              <motion.div
                layout
                className={`px-4 py-3 rounded-lg shadow-sm max-w-xs text-sm leading-snug ${
                  chat.role === "ai"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-blue-600 text-white"
                }`}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {chat.content}
                </ReactMarkdown>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {chats.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-col items-center justify-center h-full text-center text-gray-500 space-y-3"
        >
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-50">
            <MessageSquare className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-700">
            Start a Conversation
          </h2>
          <p className="text-sm text-gray-400 max-w-xs">
            Say hello to begin chatting with the AI assistant.
          </p>
        </motion.div>
      )}

      {pendingApproval && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="border border-amber-300 bg-amber-50 rounded-lg px-4 py-3 space-y-2"
        >
          <p className="text-sm font-semibold text-amber-800">
            Approve action: {pendingApproval.tool}
          </p>
          {pendingApproval.flagged && (
            <p className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1">
              ⚠ This action may not match your original request: {pendingApproval.flagReason}
            </p>
          )}
          <div className="text-xs text-amber-700 space-y-0.5">
            {Object.entries(pendingApproval.input).map(([key, value]) => (
              <p key={key}>
                <span className="font-medium">{key}:</span> {String(value)}
              </p>
            ))}
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => handleApprovalDecision(true)}
              className="px-3 py-1.5 text-sm rounded-md bg-green-600 hover:bg-green-700 text-white"
            >
              Accept
            </button>
            <button
              onClick={() => handleApprovalDecision(false)}
              className="px-3 py-1.5 text-sm rounded-md bg-red-100 hover:bg-red-200 text-red-700"
            >
              Reject
            </button>
          </div>
        </motion.div>
      )}

      {file && (
        <div className="mb-2 flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded w-fit">
          <File className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-700">{file.name}</span>
          <button
            onClick={() => removeFile(false)}
            className="text-gray-500 hover:text-gray-700 font-bold"
          >
            ×
          </button>
        </div>
      )}
      {/* Input Area */}
      <motion.div
        variants={inputVariants}
        initial="hidden"
        animate="visible"
        className="relative flex items-center bg-gray-50 border border-gray-300 rounded-lg shadow-sm px-3 py-2"
      >
        <input
          type="text"
          placeholder={
            pendingApproval
              ? "Respond to the pending approval above to continue..."
              : "Type a message..."
          }
          value={input}
          disabled={!!pendingApproval}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 pl-4 pr-20 py-2 bg-transparent text-gray-800 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        />

        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
          onClick={() => fileInputRef.current?.click()}
          disabled={!!pendingApproval}
          className="absolute right-12 p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Upload className="w-4 h-4 text-gray-600" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={handleSend}
          disabled={!!pendingApproval}
          className="absolute right-3 p-2 rounded-full bg-blue-600 hover:bg-blue-700 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4 text-white" />
        </motion.button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex items-center justify-center bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm"
          >
            😅 You’ve exceeded the free message limit! Don’t worry —
            <span className="ml-1 font-semibold text-red-800">
              the dev (aka just one)
            </span>
            is adding a payment feature soon. Can’t let you spend all my tokens!
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Chat;

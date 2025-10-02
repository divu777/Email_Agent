import { MessageSquare, Search, Send, Upload } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { useSocket } from "../hooks/useSocket"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"


type Message={
    content:string,
    type: "human" | "assistant",
    id: number
}



const Chat = () => {
  const [chats, setChats] = useState<Message[]>([])
  const [input, setInput] = useState("")
    const fileInputRef = useRef<HTMLInputElement | null>(null)


  const socket = useSocket()



  
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1],
        staggerChildren: 0.08
      }
    }
  }

  const messageVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 160, damping: 18 }
    },
    exit: {
      opacity: 0,
      y: -8,
      scale: 0.97,
      transition: { duration: 0.2 }
    }
  }

  const inputVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  }

  const handleSend = () => {
    if (!input.trim()) return
    if (socket?.readyState===WebSocket.OPEN) {
      const humanId = Date.now()
      const aiId = humanId + 1
      const messages = chats.map(({id,...rest})=>rest)
      messages.push({
        "content":input,
        "type":"human"
      })
      console.log(JSON.stringify(messages))
      socket.send(
        JSON.stringify(
          {
            messages,
            newMsgId:aiId          }
        )
      )

      setChats((prev) => [
        ...prev,
        { content: input, id: humanId, type: "human" },
        { content: "", id: aiId, type: "assistant" }
      ])
    }
    setInput("")
  }

  useEffect(() => {
    if (socket?.readyState===WebSocket.OPEN) {
      socket.onmessage = (message) => {
        const aiMessage = JSON.parse(message.data)

        setChats((prev) =>
          prev.map((m) =>
            m.id === aiMessage.id
              ? { ...m, content: aiMessage.content }
              : m
          )
        )
      }
    }
  }, [socket])

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
              key={chat.id}
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
              className={`flex w-full ${
                chat.type === "assistant" ? "justify-start" : "justify-end"
              }`}
            >
              <motion.div
                layout
                className={`px-4 py-3 rounded-lg shadow-sm max-w-xs text-sm leading-snug ${
                  chat.type === "assistant"
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
    <h2 className="text-lg font-semibold text-gray-700">Start a Conversation</h2>
    <p className="text-sm text-gray-400 max-w-xs">
      Say hello to begin chatting with the AI assistant.
    </p>
  </motion.div>
)}

      {/* Input Area */}
      <motion.div
        variants={inputVariants}
        initial="hidden"
        animate="visible"
        className="relative flex items-center bg-gray-50 border border-gray-300 rounded-lg shadow-sm px-3 py-2"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 pl-10 pr-10 py-2 bg-transparent text-gray-800 focus:outline-none"
        />
        <input
          type="file"
                    ref={fileInputRef}

          className="hidden"
        />

         <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
          onClick={() => fileInputRef.current?.click()}
          className="absolute right-12 p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition"
        >
          <Upload className="w-4 h-4 text-gray-600" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={handleSend}
          className="absolute right-3 p-2 rounded-full bg-blue-600 hover:bg-blue-700 transition-all duration-200"
        >
          <Send className="w-4 h-4 text-white" />
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

export default Chat

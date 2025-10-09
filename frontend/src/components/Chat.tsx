import { File, MessageSquare, Send, Upload } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { useSocket } from "../hooks/useSocket"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import axios from "axios"
import { config } from "../config"


type Message={
    content:string,
    role: "human" | "ai",
    id: number
}



const Chat = () => {
    const [file, setFile] = useState<HTMLInputElement|null>(null);

  const [chats, setChats] = useState<Message[]>([])
  const [input, setInput] = useState("")
    const fileInputRef = useRef<HTMLInputElement | null>(null)


  const socket = useSocket()

  const getMessages = async()=>{
     const {data}= await axios.get(`${config.BACKEND_URL}/api/v1/genai/messages`,{
        withCredentials:true
      })

      if(!data.success){
        setChats([])
        return 
      }
      //console.log(JSON.stringify(data))
      setChats(data.messages)
  }

  const removeFile = async(change:boolean) => {
    // axios request to run a cron job to remove that file from S3 and the chunk embeddings 
    await axios.delete(`${config.BACKEND_URL}/api/v1/genai/deleteFile/${filenameRef.current}`,{
      withCredentials:true
    })
    if(!change){

      setFile(null)
      filenameRef.current = null
    }
}
  useEffect(()=>{
    getMessages()

    return ()=>{
      if(filenameRef.current){
        removeFile(false)
        
      }
    }
  },[])


  
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
        "role":"human"
      })
     // console.log(JSON.stringify(messages))
      socket.send(
        JSON.stringify(
          {
            messages,
            newMsgId:aiId,
          fileName:filenameRef.current? filenameRef.current : null   
               }
        )
      )

      setChats((prev) => [
        ...prev,
        { content: input, id: humanId, role: "human" },
        { content: "", id: aiId, role: "ai" }
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

  const filenameRef = useRef<String>(null)

  const getPresignedUrl = async(fileName:string,contentType:string):Promise<string>=>{
    const {data} = await axios.post(`${config.BACKEND_URL}/api/v1/genai/presignedUrl`,{
      filename:fileName,
      contentType
    },{
      withCredentials:true
    })

    return data.url
  }

    const handleFileChange = async(e:React.ChangeEvent<any>) => {
      if(filenameRef.current){
        removeFile(true)
      }
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFile(file); 
      const uniqueKey = `${Date.now()}_${file.name}`;

      const url = await getPresignedUrl(uniqueKey,file.type)
      //JSON.stringify(url)+"========> URL")
      await axios.put(url,file,{
        headers:{
          'Content-Type':file.type
        }
      })

      filenameRef.current=uniqueKey;
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
    <h2 className="text-lg font-semibold text-gray-700">Start a Conversation</h2>
    <p className="text-sm text-gray-400 max-w-xs">
      Say hello to begin chatting with the AI assistant.
    </p>
  </motion.div>
)}

         {file && (
  <div className="mb-2 flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded w-fit">
        <File className="w-4 h-4 text-gray-600" />
      <span className="text-sm text-gray-700">{file.name}</span>
      <button onClick={()=>removeFile(false)} className="text-gray-500 hover:text-gray-700 font-bold">
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
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 pl-4 pr-20 py-2 bg-transparent text-gray-800 focus:outline-none"
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
         <input
          type="file"
                    ref={fileInputRef}
        onChange={handleFileChange}
          className="hidden"
        />
      </motion.div>
    </motion.div>
  )
}

export default Chat

import { useEffect, useState } from "react";
import Sidebar from "./components/SideBar";
import axios from "axios";
import {  Star } from "lucide-react";

export type EmailsType = {
  id: string;
  threadId: string;
  snippet: string;
  from: string;
  subject: string;
};


export type EmailSummary = {
  id:string;
  snippet:string
  labels:string[],
  impheaders: { value: string; name: string }[];
}

type EmailType = {
  id: string;
  messages: EmailsType[];
  impheaders: { value: string; name: string }[];
};
type EmailType2 = {
  id: string;
  messages: EmailSummary[];
};
const Dashboard2 = () => {
  const [selectedMail, setselectedMail] = useState<boolean>(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [activeView, setActiveView] = useState("mail");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [email, setEmail] = useState<EmailType2 | null>(null);
  const [emails, setEmails] = useState<EmailsType[] | null>([]);
  const [response, setResponse] = useState<string>("");
  useEffect(() => {
    const fetchEmailHeaders = async () => {
      const response = await axios.get(
        "http://localhost:3000/api/v1/google/emails",
        {
          withCredentials: true,
        }
      );
      //console.log(JSON.stringify(response.data.array))
      setEmails(response.data.array);
    };

    fetchEmailHeaders();
  }, []);

  const handleEmailClick = async (threadId:string) => {
    const response = await axios.get(
      `http://localhost:3000/api/v1/google/emails/${threadId}`,
      { withCredentials: true }
    );
    setEmail(response.data.data);
    setselectedMail(true);

   console.log(JSON.stringify(response.data.data))
  };


  const handleGenerateReply = async (emailselected: EmailType2) => {
    console.log("--------");
    const response = await axios.post(
      `http://localhost:3000/api/v1/genai/reply`,
      {
        email: emailselected,
      },
      {
        withCredentials: true,
      }
    );

    console.log(
      JSON.stringify(response.data) + "---->reply recieved for thread"
    );
    setResponse(response.data.reply);
  };


  return (
    <div className="bg-black min-h-screen">
      <Sidebar
        setActiveView={setActiveView}
        activeView={activeView}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <div
        className={`h-screen w-auto ${
          isCollapsed ? "lg:ml-20" : "lg:ml-64"
        } flex px-6 py-6 bg-[#0d0d0d] text-white space-x-6`}
      >
        {/* Left Email Panel */}
        <div className="h-full w-2/5 bg-[#1a1a1a] flex flex-col px-6 py-6 space-y-6 rounded-lg border border-[#2a2a2a] shadow-md">
          {/* Search Bar */}
          <div>
            <input
              type="text"
              placeholder="Search emails..."
              className="w-full px-4 py-3 bg-[#121212] text-white border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-inner transition-all duration-300"
            />
          </div>

          {/* Email List */}
          <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide">
            {emails &&
              emails.map((email, index) => (
                <div
                  key={index}
                  className="bg-[#222] hover:bg-[#2c2c2c] transition-colors cursor-pointer px-5 py-4 rounded-lg border border-transparent hover:border-orange-500 shadow-sm"
                  onClick={() => handleEmailClick(email.threadId)}
                >
                  <p className="text-sm font-semibold text-orange-400">
                    {email.subject || "No Subject"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {email.from || "Unknown Sender"}
                  </p>
                  <p className="text-sm text-gray-300 mt-2 leading-snug">
                    {email.snippet?.substring(0, 60)}...
                  </p>
                </div>
              ))}
          </div>
        </div>

        {/* Right Email Viewer */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
  {selectedMail && email ? (
    <>
      {/* Thread scrollable area */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-6 mt-4 pb-40">
        {email.messages.map((msg) => {
          const fromHeader = msg.impheaders.find((h) => h.name === "From")?.value || "Unknown Sender";
          const subject = msg.impheaders.find((h)=>h.name==="Subject")?.value || "No subject"
          const timestamp = new Date().toLocaleString();

          return (
            <div
              key={msg.id}
              className="flex items-start space-x-4 bg-[#1e1e1e] p-6 rounded-lg border border-[#2d2d2d] shadow hover:shadow-lg transition-all"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                {fromHeader.charAt(0).toUpperCase()}
              </div>

              <div className="flex flex-col flex-1">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-semibold text-orange-300">
                    {fromHeader}
                  </p>
                  <p className="text-sm font-semibold text-orange-300">
                    {subject}
                  </p>
                  <span className="text-xs text-gray-500">{timestamp}</span>
                </div>

                <p className="text-sm text-gray-300 leading-relaxed">
                  {msg.snippet}
                </p>
              </div>
            </div>
          );
        })}
        {/* Spacer to prevent overlap */}
        <div className="h-44" />
      </div>

      {/* Reply Box - Stays Fixed at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#0d0d0d] border-t border-[#2d2d2d] pt-4 px-4 pb-6">
      <h3 className="text-sm text-gray-400 mb-2">Reply</h3>
      <div className="flex flex-col space-y-3 bg-[#1a1a1a] p-4 rounded-lg shadow-md">
        <textarea
          rows={4}
           value={response} 
           onChange={(e) => setResponse(e.target.value)}
          placeholder="Write your reply..."
          className="w-full bg-[#121212] text-white border border-[#333] rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500 resize-none"
        />
        <div className="flex justify-between items-center">
          {/* Left Action Buttons */}
          <div className="flex items-center space-x-3">
            <button className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-5 py-2 rounded-md transition-colors">
              Send
            </button>
            <button className="text-gray-400 hover:text-gray-200 text-sm transition">
              Attach
            </button>
          </div>

          {/* Right Action Buttons and Shortcut */}
          <div className="flex items-center space-x-4">
            <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-2 rounded-md transition-colors"
            onClick={()=>handleGenerateReply(email)}>
              <Star size={16} />
              Generate
            </button>

          </div>
        </div>
      </div>
    </div>
    </>
  ) : (
    <div className="text-gray-500 flex items-center justify-center w-full h-full text-lg">
      Select an email to read
    </div>
  )}
</div>

      </div>
    </div>
  );
};

export default Dashboard2;

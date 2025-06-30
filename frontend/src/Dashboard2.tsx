import { useEffect, useState } from "react";
import Sidebar from "./components/SideBar";
import axios from "axios";

type EmailType = {
  id:string,
  snippet:string,
  from:string,
  subject:string
}

const Dashboard2 = () => {
  const [selectedMail, setselectedMail] = useState<string|null>()
  const [chatVisible, setChatVisible] = useState(false);
  const [activeView, setActiveView] = useState("mail");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [emails, setEmails] = useState<EmailType[] | null>([]);

  useEffect(() => {
    const fetchEmailHeaders = async () => {
      const response = await axios.get("http://localhost:3000/api/v1/google/emails", {
        withCredentials: true,
      });
      setEmails(response.data.array);
      console.log(JSON.stringify(response.data.array) + "+++++");
    };

    fetchEmailHeaders();
  }, []);

  return (
    <div className="bg-black">
      <Sidebar
        setActiveView={setActiveView}
        activeView={activeView}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <div
        className={`h-screen w-auto ${isCollapsed ? "lg:ml-20" : "lg:ml-64"} flex px-5 bg-[#0d0d0d] text-white`}
      >
        {/* Left Email Panel */}
        <div className="h-full w-2/5 bg-[#1a1a1a] flex flex-col p-5 space-y-4 border-r border-orange-500">
          {/* Topbar / Search */}
          <div className="w-full">
            <input
              type="text"
              placeholder="Search emails..."
              className="w-full px-4 py-3 bg-[#121212] text-white border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm transition-all duration-300"
            />
          </div>

          {/* Email List */}
          <div className="flex-1 overflow-y-auto space-y-2 scrollbar-hide">
            {emails &&
              emails.map((email, index) => (
                <div
                  key={index}
                  className="bg-[#222] hover:bg-[#2c2c2c] transition-colors cursor-pointer p-4 rounded-md border border-transparent hover:border-orange-500"
                >
                  <p className="text-sm text-orange-400 font-semibold">
                    {email.subject || "No Subject"}
                  </p>
                  <p className="text-xs text-gray-400">{email.from || "Unknown Sender"}</p>
                  <p className="text-sm mt-1 text-gray-300">
                    {email.snippet?.substr(0, 60)}...
                  </p>
                </div>
              ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="h-full w-3/5 bg-[#121212] p-6 border-l border-orange-500">
          {/* Placeholder for selected message view */}
          <div className="text-gray-400 text-center mt-20 text-xl">Select an email to read</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard2;

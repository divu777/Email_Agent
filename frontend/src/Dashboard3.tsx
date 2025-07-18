import { useEffect, useState } from "react";
import Sidebar from "./components/SideBar";
import axios from "axios";
import {  Star } from "lucide-react";
import { getCookie } from "./utils/dateFormat";
import { IoReturnUpBack } from "react-icons/io5";
import MailView from "./components/MailView2";
import PromptView from "./components/PromptView";

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
  const [replyTarget, setReplyTarget] = useState<EmailSummary | null>(null);
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
    setResponse("")
   console.log(JSON.stringify(response.data.data))
  };
  const getHeader = (headers: { name: string; value: string }[], name: string) => {
  
  return headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || "";
};



  const handleGenerateReply = async (emailselected: EmailType2) => {
    console.log("--------"+JSON.stringify(emailselected));
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

  const handleSendReply = async()=>{





    const body  = response;
    const messageIdHeader = replyTarget?.impheaders.find((head)=>head.name==="Message-ID")
    const referencesHeader = replyTarget?.impheaders.find((head)=>head.name==="References")
    const fromHeader  = replyTarget?.impheaders.find((head)=>head.name==="From")
    const subjectHeader = replyTarget?.impheaders.find((head)=>head.value==="Subject")

      const originalSubject = subjectHeader?.value || "No Subject";
      const subject = originalSubject.startsWith("Re:") ? originalSubject : `Re: ${originalSubject}`;



    const res = await axios.post("http://localhost:3000/api/v1/google/email/reply",{
      body:body,
      messageId: messageIdHeader?.value || "",
      references: referencesHeader?.value || messageIdHeader?.value || "",
      to: fromHeader?.value || "",
      subject,
       threadId: email?.id
    },{
      withCredentials:true
    })
  }


  const renderView = () => {
    switch (activeView) {
      case "mail":
        return <MailView />;
      case "Send Email":
        return <PromptView />;
      default:
        return <MailView />;
    }
  };


  return (
    <div className="bg-black min-h-screen">
      <Sidebar
        setActiveView={setActiveView}
        activeView={activeView}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <main
      >
        <div className="mx-auto w-full">{renderView()}</div>
      </main>

    </div>
  );
};

export default Dashboard2;

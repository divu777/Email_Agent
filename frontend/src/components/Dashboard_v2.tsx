import { useEffect, useState } from "react";
import Sidebar from "./Sidebar_v2";
import axios from "axios";
import {  X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ReplyBox from "./ReplyBox_v2";
import MailView from "./MailView_v3";
import EmptyState from "./EmptyState_v2";
import { config } from "../config";
import EmailDetailView from "./EmailDetailView_v2";

export type EmailsType = {
  id: string;
  threadId: string;
  snippet: string;
  from: string;
  subject: string;
};

export type SendReply =
  | {
      type: "thread-reply";
      payload: EmailSummary;
    }
  | {
      type: "new-message";
      payload: {
        to: string;
        subject: string;
        body: string;
      };
    };

export type EmailSummary = {
  id: string;
  snippet: string;
  labels: string[];
  impheaders: { value: string; name: string }[];
};

export type EmailType = {
  id: string;
  messages: EmailsType[];
  impheaders: { value: string; name: string }[];
};

export type EmailType2 = {
  id: string;
  messages: EmailSummary[];
};

const Dashboard2 = () => {
  const [selectedMail, setselectedMail] = useState(false);
  const [activeView, setActiveView] = useState("mail");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [email, setEmail] = useState<EmailType2 | null>(null);
  const [emails, setEmails] = useState<EmailsType[]>([]);
  const [response, setResponse] = useState("");
  const [replyTarget, setReplyTarget] = useState<EmailSummary | null>(null);
  const [replybox, setReplyBox] = useState(false);

  type Mail = {
    to: string;
    subject: string;
    body: string;
  };

  const [mail, setMail] = useState<Mail>({
    to: "",
    subject: "",
    body: "",
  });

  const [load, setLoad] = useState("0");
  const [loading, setLoading] = useState(false);
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);

  const fetchEmailHeaders = async () => {
    const response = await axios.get(
      `${config.BACKEND_URL}/api/v1/google/emails/${load}`,
      { withCredentials: true }
    );
    console.log(response.data.array)
    if(!response.data.success && response.data.redirectUrl){
      window.location.href=response.data.redirectUrl
    }
    setEmails((prev) => [...prev, ...response.data.array]);
    setLoad(response.data.nextPageToken);
  };

  useEffect(() => {
    fetchEmailHeaders();
  }, []);

  useEffect(() => {
    if (activeView === "send-mail") {
      replybox ? setReplyBox(false) : setReplyBox(true);
    }
  }, [activeView]);

  const handleEmailClick = async (threadId: string) => {
    const response = await axios.get(
      `${config.BACKEND_URL}/api/v1/google/email/${threadId}`,
      { withCredentials: true }
    );
        console.log(JSON.stringify(response.data.data)+"------")
    if(!response.data.success && response.data.redirectUrl){
      window.location.href=response.data.redirectUrl
    }
    setEmail(response.data.data);
    setselectedMail(true);
    setIsMobileDetailOpen(true);
    setResponse("");
  };

   const closeMobileDetail = () => {
    setIsMobileDetailOpen(false);
    setReplyTarget(null);
  };

  const getHeader = (
    headers: { name: string; value: string }[],
    name: string
  ) =>
    headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ||
    "";

  const handleGenerateReply = async (emailselected: EmailType2) => {
    const response = await axios.post(
      `${config.BACKEND_URL}/api/v1/genai/reply`,
      { email: emailselected },
      { withCredentials: true }
    );
    if(!response.data.success && response.data.redirectUrl){
      window.location.href=response.data.redirectUrl
    }
    setResponse(response.data.reply);
  };

  const handleSendReply = async () => {
    const body = response;
    const messageIdHeader = replyTarget?.impheaders.find(
      (head) => head.name === "Message-ID"
    );
    const referencesHeader = replyTarget?.impheaders.find(
      (head) => head.name === "References"
    );
    const fromHeader = replyTarget?.impheaders.find(
      (head) => head.name === "From"
    );
    const subjectHeader = replyTarget?.impheaders.find(
      (head) => head.value === "Subject"
    );

    const originalSubject = subjectHeader?.value || "No Subject";
    const subject = originalSubject.startsWith("Re:")
      ? originalSubject
      : `Re: ${originalSubject}`;

   const {data} = await axios.post(
      `${config.BACKEND_URL}/api/v1/google/email/reply`,
      {
        body,
        messageId: messageIdHeader?.value || "",
        references: referencesHeader?.value || messageIdHeader?.value || "",
        to: fromHeader?.value || "",
        subject,
        threadId: email?.id,
      },
      { withCredentials: true }
    );

    if(!data.success && data.redirectUrl){
      window.location.href=data.redirectUrl
    }
  };

  const handleNewEmail = async (mail: {
    to: string;
    subject: string;
    body: string;
  }) => {
    const response = await axios.post(
      `${config.BACKEND_URL}/api/v1/google/email/new`,
      { ...mail },
      { withCredentials: true }
    );
    if(!response.data.success && response.data.redirectUrl){
      window.location.href=response.data.redirectUrl
    }
  };

  const handleGenerateEmail = async (subject: string, body: string) => {
    const response = await axios.post(
      `${config.BACKEND_URL}/api/v1/genai/craft`,
      { subject, body },
      { withCredentials: true }
    );

    if(!response.data.success && response.data.redirectUrl){
      window.location.href=response.data.redirectUrl
    }
    setMail((prev) => ({
      ...prev,
      subject: response.data.data.subject ?? prev.subject,
      body: response.data.data.body ?? prev.body,
    }));
  };

  const handleLoadMore = async () => {
    setLoading(true);
    await fetchEmailHeaders();
    setLoading(false);
  };

  return (
    <div className="bg-white min-h-screen">
      <Sidebar
        setActiveView={setActiveView}
        activeView={activeView}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <div
        className={`h-screen w-auto ${
          isCollapsed ? "lg:ml-20" : "lg:ml-64"
        } flex px-6 py-4 bg-gray-50 text-gray-800 lg:space-x-6`}
      >
        {emails.length > 0 ? (
          <MailView
            emails={emails}
            handleEmailClick={handleEmailClick}
            handleLoadMore={handleLoadMore}
            load={load}
            loading={loading}
          />
        ) : (
          <EmptyState type="no-email" />
        )}

        {/* Right Email Viewer */}
        <div className="hidden lg:flex flex-1 flex-col relative overflow-hidden ">
          {selectedMail && email ? (
                           <EmailDetailView email={email} getHeader={getHeader} setReplyTarget={setReplyTarget} replyTarget={replyTarget} response={response} setResponse={setResponse} handleSendReply={handleSendReply} handleGenerateReply={handleGenerateReply} />

          ) : (
            <div className="text-gray-500 flex items-center justify-center w-full h-full text-lg">
              Select an email to read
            </div>
          )}
        </div>

        {/* Mobile Email Overlay */}
        {/* Mobile Email Overlay */}
<AnimatePresence>
  {isMobileDetailOpen && email && (
    <motion.div 
      className="lg:hidden fixed left-0 right-0 bg-black bg-opacity-50 z-30 flex"
      style={{ 
        top: 0, 
        bottom: '64px' // Leave space for mobile bottom nav (h-16 = 64px)
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div 
        className="w-full bg-white flex flex-col"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white shrink-0">
          <h2 className="text-lg font-semibold text-gray-800">Email Details</h2>
          <button
            onClick={closeMobileDetail}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Mobile Email Content */}
        <div className="flex-1 overflow-y-auto bg-white">
          <EmailDetailView 
            email={email} 
            getHeader={getHeader} 
            setReplyTarget={setReplyTarget} 
            replyTarget={replyTarget} 
            response={response} 
            setResponse={setResponse} 
            handleSendReply={handleSendReply} 
            handleGenerateReply={handleGenerateReply} 
          />
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
      </div>

      {replybox && (
        <ReplyBox
          handleGenerateEmail={handleGenerateEmail}
          mail={mail}
          setMail={setMail}
          setActiveView={setActiveView}
          setReplyBox={setReplyBox}
          handleNewEmail={handleNewEmail}
        />
      )}

      
    </div>
  );
};

export default Dashboard2;

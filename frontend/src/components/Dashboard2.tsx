import { useEffect, useState } from "react";
import Sidebar from "./SideBar";
import axios from "axios";
import { Star } from "lucide-react";
import { IoReturnUpBack } from "react-icons/io5";
import ReplyBox from "./ReplyBox";
import MailView from "./MailView2";
import EmptyState from "./EmptyState";
import { config } from "../config";

export type EmailsType = {
  id: string;
  threadId: string;
  snippet: string;
  from: string;
  subject: string;
};

export type SendReply = {
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
  const [selectedMail, setselectedMail] = useState<boolean>(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [activeView, setActiveView] = useState("mail");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [email, setEmail] = useState<EmailType2 | null>(null);
  const [emails, setEmails] = useState<EmailsType[] | null>([]);
  const [response, setResponse] = useState<string>("");
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


  useEffect(() => {
    const fetchEmailHeaders = async () => {
      const response = await axios.get(
        `${config.BACKEND_URL}/api/v1/google/emails`,
        {
          withCredentials: true,
        }
      );
      setEmails(response.data.array);
    };

    fetchEmailHeaders();
  }, []);

  useEffect(() => {
    if (activeView === "send-mail") {
      replybox ? setReplyBox(false) : setReplyBox(true);
    }
  }, [activeView]);

  const handleEmailClick = async (threadId: string) => {
    const response = await axios.get(
      `${config.BACKEND_URL}/api/v1/google/emails/${threadId}`,
      { withCredentials: true }
    );
    setEmail(response.data.data);
    setselectedMail(true);
    setResponse("");
  };
  const getHeader = (
    headers: { name: string; value: string }[],
    name: string
  ) => {
    return (
      headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ||
      ""
    );
  };

  const handleGenerateReply = async (emailselected: EmailType2) => {
    const response = await axios.post(
      `${config.BACKEND_URL}/api/v1/genai/reply`,
      {
        email: emailselected,
      },
      {
        withCredentials: true,
      }
    );

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

    const res = await axios.post(
      `${config.BACKEND_URL}/api/v1/google/email/reply`,
      {
        body: body,
        messageId: messageIdHeader?.value || "",
        references: referencesHeader?.value || messageIdHeader?.value || "",
        to: fromHeader?.value || "",
        subject,
        threadId: email?.id,
      },
      {
        withCredentials: true,
      }
    );
  };

  const handleNewEmail = async (mail:{to:string,subject:string,body:string}) => {



    const response = await axios.post(`${config.BACKEND_URL}/api/v1/google/email/new`,{
      ...mail
    },
  {
    withCredentials:true
  })


  };

  async function handleGenerateEmail(subject:string,body:string){
    const response =  await axios.post(`${config.BACKEND_URL}/api/v1/genai/craft`,{
      subject,
      body
    },{
      withCredentials:true
    });


    setMail((prev)=>({ ...prev,
  subject: response.data.data.subject ?? prev.subject,
  body: response.data.data.body ?? prev.body,}))

  
  }

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
        {emails ? (
          <MailView emails={emails!} handleEmailClick={handleEmailClick} />
        ) : (
          <EmptyState type="no-email" />
        )}

        {/* Right Email Viewer */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {selectedMail && email ? (
            <>
              {/* Thread scrollable area */}
              <div className="flex-1 overflow-y-auto pr-2 space-y-6 mt-4 pb-40">
                {email.messages.map((msg, index) => {
                  const fromHeader =
                    msg.impheaders.find((h) => h.name === "From")?.value ||
                    "Unknown Sender";
                  const subject =
                    msg.impheaders.find((h) => h.name === "Subject")?.value ||
                    "No subject";
                  const timestamp = new Date(Date.now()).toLocaleString();

                  return (
                    <div
                      key={msg.id}
                      className="flex flex-col gap-2 border-b border-[#2d2d2d] pb-6 pt-4"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                            {fromHeader.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">
                              {fromHeader}
                            </p>
                            <p className="text-xs text-gray-400">{subject}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {timestamp}
                        </span>
                        <IoReturnUpBack
                          className="cursor-pointer"
                          onClick={() => setReplyTarget(msg)}
                        />
                      </div>

                      {/* Message content */}
                      <div className="ml-14 pr-2">
                        <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
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
              {replyTarget &&
                (() => {
                  const originalSubject = getHeader(
                    replyTarget.impheaders,
                    "Subject"
                  );
                  const replySubject = originalSubject.startsWith("Re:")
                    ? originalSubject
                    : `Re: ${originalSubject}`;

                  return (
                    <div className="absolute bottom-0 left-0 right-0 bg-[#0d0d0d] border-t border-[#2d2d2d] pt-4 px-4 pb-6 ">
                      <div className=" flex  w-full   items-center justify-between">
                   
                      <h3 className="text-sm text-gray-400 mb-2 ">
                        Replying to:{" "}
                        <span className="text-white">
                          {getHeader(replyTarget.impheaders, "From")}
                        </span>
                      </h3>
                           <button onClick={()=> setReplyTarget(null)}>

                        x
                        </button>
                      </div>
                      <div className="flex flex-col space-y-3 bg-[#1a1a1a] p-4 rounded-lg shadow-md">
                        <input
                          type="text"
                          value={replySubject}
                          disabled
                          className="bg-[#121212] text-white border border-[#333] rounded-md px-4 py-2"
                        />
                        <textarea
                          rows={4}
                          value={response}
                          onChange={(e) => setResponse(e.target.value)}
                          placeholder="Write your reply..."
                          className="w-full bg-[#121212] text-white border border-[#333] rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500 resize-none"
                        />
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleSendReply()}
                              className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-5 py-2 rounded-md transition-colors"
                            >
                              Send
                            </button>
                          </div>
                          <div className="flex items-center space-x-4">
                            <button
                              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-2 rounded-md transition-colors"
                              onClick={() =>
                                handleGenerateReply({
                                  ...email!,
                                  messages: [replyTarget],
                                })
                              }
                            >
                              <Star size={16} />
                              Generate
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
            </>
          ) : (
            <div className="text-gray-500 flex items-center justify-center w-full h-full text-lg">
              Select an email to read
            </div>
          )}
        </div>
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

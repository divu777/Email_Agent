import { Star } from "lucide-react";
import { IoReturnUpBack } from "react-icons/io5";
import { EmailSummary, EmailType2 } from "../types";

const EmailDetailView = ({email,getHeader,setReplyTarget,replyTarget,response,setResponse,handleSendReply,handleGenerateReply}:{email:EmailType2,getHeader:(headers: {
    name: string;
    value: string;
}[], name: string) => string,setReplyTarget:React.Dispatch<React.SetStateAction<EmailSummary | null>>,replyTarget:EmailSummary | null,response:string,setResponse:React.Dispatch<React.SetStateAction<string>>,handleSendReply:() => Promise<void>,handleGenerateReply:(emailselected: EmailType2) => Promise<void>}) => {
  return (
    <>
              <div className="flex-1 overflow-y-auto pr-2 space-y-6 mt-4 pb-40">
                {email.messages.map((msg) => {
                  const fromHeader = getHeader(msg.impheaders, "From");
                  const subject = getHeader(msg.impheaders, "Subject");
                  const timestamp = new Date().toLocaleString();

                  return (
                    <div
                      key={msg.id}
                      className="flex flex-col gap-2 border-b border-gray-300 pb-6 pt-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                            {fromHeader.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              {fromHeader}
                            </p>
                            <p className="text-xs text-gray-600">{subject}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {timestamp}
                        </span>
                        <IoReturnUpBack
                          className="cursor-pointer text-gray-500 hover:text-blue-500"
                          onClick={() => setReplyTarget(msg)}
                        />
                      </div>

                      <div className="ml-14 pr-2">
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                          {msg.snippet}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div className="h-44" />
              </div>

              {/* Reply Box */}
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
                    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-300 pt-4 px-4 pb-6">
                      <div className="flex w-full items-center justify-between">
                        <h3 className="text-sm text-gray-600 mb-2">
                          Replying to:{" "}
                          <span className="text-gray-800">
                            {getHeader(replyTarget.impheaders, "From")}
                          </span>
                        </h3>
                        <button
                          onClick={() => setReplyTarget(null)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          ×
                        </button>
                      </div>
                      <div className="flex flex-col space-y-3 bg-gray-100 p-4 rounded-lg shadow-sm">
                        <input
                          type="text"
                          value={replySubject}
                          disabled
                          className="bg-white text-gray-800 border border-gray-300 rounded-md px-4 py-2"
                        />
                        <textarea
                          rows={4}
                          value={response}
                          onChange={(e) => setResponse(e.target.value)}
                          placeholder="Write your reply..."
                          className="w-full bg-white text-gray-700 border border-gray-300 rounded-md px-4 py-3 resize-none"
                        />
                        <div className="flex justify-between items-center">
                          <button
                            onClick={handleSendReply}
                            className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-5 py-2 rounded-md"
                          >
                            Send
                          </button>
                          <button
                            onClick={() =>
                              handleGenerateReply({
                                ...email!,
                                messages: [replyTarget],
                              })
                            }
                            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-md"
                          >
                            <Star size={16} />
                            Generate
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
            </>
  )
}

export default EmailDetailView

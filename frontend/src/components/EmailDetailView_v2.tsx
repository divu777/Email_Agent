import { Star, Paperclip, Download } from "lucide-react";
import { IoReturnUpBack } from "react-icons/io5";
import axios from "axios";
import { EmailSummary, EmailType2 } from "../types";
import { config } from "../config";

const downloadAttachment = async (
  messageId: string,
  filename: string,
  attachmentId: string,
  mimeType: string
) => {
  const response = await axios.get(
    `${config.BACKEND_URL}/api/v1/google/email/attachment/${messageId}/${attachmentId}`,
    { withCredentials: true }
  );
  if (!response.data?.data) return;

  const link = document.createElement("a");
  link.href = `data:${mimeType};base64,${response.data.data}`;
  link.download = filename;
  link.click();
};

const EmailDetailView = ({
  email,
  getHeader,
  setReplyTarget,
  replyTarget,
  response,
  setResponse,
  handleSendReply,
  handleGenerateReply,
}: {
  email: EmailType2;
  getHeader: (
    headers: { name: string; value: string }[],
    name: string
  ) => string;
  setReplyTarget: React.Dispatch<React.SetStateAction<EmailSummary | null>>;
  replyTarget: EmailSummary | null;
  response: string;
  setResponse: React.Dispatch<React.SetStateAction<string>>;
  handleSendReply: () => Promise<void>;
  handleGenerateReply: (emailselected: EmailType2) => Promise<void>;
}) => {
  return (
    <div className="flex-1 overflow-y-auto flex flex-col bg-white border border-gray-200 scrollbar-hide">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            {getHeader(email.messages[0].impheaders, "Subject") || "No Subject"}
          </h2>
          <p className="text-sm text-gray-500">
            {getHeader(email.messages[0].impheaders, "From")}
          </p>
        </div>
        <span className="text-xs text-gray-400">
          {new Date().toLocaleDateString()}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 scrollbar-hide">
        {email.messages.map((msg) => {
          const fromHeader = getHeader(msg.impheaders, "From");
          const subject = getHeader(msg.impheaders, "Subject");
          const timestamp = new Date().toLocaleString();

          return (
            <div key={msg.id} 
  className="flex flex-col  border-b border-gray-200  p-4 "
            >
              {/* Sender Info */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-medium">
                  {fromHeader.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{fromHeader}</p>
                  <p className="text-sm text-gray-600">{subject}</p>
                </div>
                <span className="text-xs text-gray-400">{timestamp}</span>
                <IoReturnUpBack
                  className="ml-2 cursor-pointer text-gray-400 hover:text-blue-500"
                  onClick={() => setReplyTarget(msg)}
                />
              </div>

              {/* Message Body */}
              <div className="ml-12">
                {msg.html ? (
                  <iframe
                    title={`email-${msg.id}`}
                    srcDoc={msg.html}
                    sandbox=""
                    className="w-full border-0"
                    style={{ minHeight: "200px" }}
                    onLoad={(e) => {
                      const doc = e.currentTarget.contentWindow?.document;
                      if (doc) e.currentTarget.style.height = `${doc.body.scrollHeight + 16}px`;
                    }}
                  />
                ) : (
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {msg.text || msg.snippet}
                  </p>
                )}

                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="mt-3 flex flex-col gap-2">
                    {msg.attachments.map((att) => (
                      <button
                        key={att.attachmentId}
                        onClick={() =>
                          downloadAttachment(msg.id, att.filename, att.attachmentId, att.mimeType)
                        }
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 border border-gray-200 rounded-md px-3 py-1.5 w-fit"
                      >
                        <Paperclip size={14} />
                        {att.filename}
                        <Download size={14} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reply Box */}
      {replyTarget && (() => {
        const originalSubject = getHeader(replyTarget.impheaders, "Subject");
        const replySubject = originalSubject.startsWith("Re:")
          ? originalSubject
          : `Re: ${originalSubject}`;

        return (
          <div className="border border-gray-200 bg-gray-50 px-6 py-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm text-gray-600">
                Replying to{" "}
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
            <div className="space-y-3">
              <input
                type="text"
                value={replySubject}
                disabled
                className="w-full bg-white text-gray-800 border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <textarea
                rows={4}
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Write your reply..."
                className="w-full bg-white text-gray-700 border border-gray-300 rounded-md px-3 py-2 text-sm resize-none"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleGenerateReply.bind(null, {
                    ...email!,
                    messages: [replyTarget],
                  })}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-4 py-2 rounded-md"
                >
                  <Star size={16} />
                  Generate
                </button>
                <button
                  onClick={handleSendReply}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2 rounded-md"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default EmailDetailView;

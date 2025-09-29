import { Star } from "lucide-react";
import { IoReturnUpBack } from "react-icons/io5";
import { EmailSummary, EmailType2 } from "./Dashboard_v2";

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
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {msg.snippet}
                </p>
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

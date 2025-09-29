import { Star } from "lucide-react";
import { useRef, useState } from "react";

const ReplyBox = ({
  setReplyBox,
  setActiveView,
  mail,
  setMail,
  handleNewEmail,
  handleGenerateEmail,
}: {
  setActiveView: (x: string) => void;
  setReplyBox: (y: boolean) => void;
  mail: { to: string; subject: string; body: string };
  setMail: (x: any) => void;
  handleNewEmail: (x: any) => void;
  handleGenerateEmail: (subject: string, body: string) => Promise<any>;
}) => {
  const hasTypedRef = useRef(false);
  const [emailList, setEmailList] = useState<string[]>([]);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleBlur = () => {
    if (hasTypedRef.current) {
      const trimmed = mail.to.trim();

      const isValid = trimmed.match(emailRegex);
      if (isValid) {
        if (!emailList.includes(trimmed)) {
          setEmailList([...emailList, trimmed]);
        }
        setMail({ ...mail, to: "" });
      } else if (trimmed) {
        alert("Invalid email address");
        setMail({ ...mail, to: "" });
      }

      hasTypedRef.current = false;
    }
  };

  return (
    <div className="absolute inset-0 bg-black/50 bg-opacity-40 text-gray-800 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-lg p-6 shadow-lg relative">
        <h2 className="text-xl font-semibold mb-4">New Mail</h2>

        <div className="flex flex-col space-y-4">
          {/* Pills inside input-like container */}
          <div className="flex flex-wrap items-center bg-gray-50 border border-gray-300 rounded-md px-2 py-1 min-h-[42px]">
            {emailList.map((email, index) => (
              <div
                key={index}
                className="flex items-center bg-blue-100 text-blue-700 rounded-full px-3 py-1 mr-2 mb-1"
              >
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">
                  {email.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm">{email}</span>
                <button
                  onClick={() =>
                    setEmailList(emailList.filter((_, i) => i !== index))
                  }
                  className="ml-2 text-blue-600 hover:text-red-500 text-sm"
                >
                  ×
                </button>
              </div>
            ))}

            <input
              type="email"
              placeholder={emailList.length === 0 ? "To" : ""}
              value={mail.to}
              onChange={(e) => {
                setMail({ ...mail, to: e.target.value });
                if (!hasTypedRef.current) {
                  hasTypedRef.current = true;
                }
              }}
              onBlur={handleBlur}
              className="bg-transparent text-gray-800 flex-1 outline-none min-w-[120px] py-1"
            />
          </div>

          {/* Subject Input */}
          <input
            type="text"
            placeholder="Subject"
            value={mail.subject}
            onChange={(e) => setMail({ ...mail, subject: e.target.value })}
            className="bg-white text-gray-800 border border-gray-300 rounded-md px-4 py-2"
          />

          {/* Body Textarea */}
          <textarea
            placeholder="Write your message..."
            rows={6}
            value={mail.body}
            onChange={(e) => setMail({ ...mail, body: e.target.value })}
            className="w-full bg-white text-gray-800 border border-gray-300 rounded-md px-4 py-3 resize-none"
          />

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              onClick={() => {
                handleGenerateEmail(mail.subject, mail.body);
              }}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-md transition-colors"
            >
              <Star size={16} />
              Generate
            </button>

            <button
              onClick={() => {
                const allEmails = [...emailList];
                const trimmed = mail.to.trim();
                if (trimmed && emailRegex.test(trimmed)) {
                  allEmails.push(trimmed);
                }

                handleNewEmail({
                  ...mail,
                  to: allEmails.join(", "),
                });

                setReplyBox(false);
                setActiveView("mail");
                setMail({ to: "", subject: "", body: "" });
                setEmailList([]);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-6 py-2 rounded-md"
            >
              Send
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            setReplyBox(false);
            setActiveView("mail");
            setMail({ to: "", subject: "", body: "" });
            setEmailList([]);
          }}
          className="absolute top-2 right-3 text-gray-400 hover:text-gray-700 text-lg"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default ReplyBox;

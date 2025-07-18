import { Star } from "lucide-react";
import React from "react";

const ReplyBox = ({
  setReplyBox,
  setActiveView,
  mail,
  setMail,
  handleNewEmail
}: {
  setActiveView: (x: string) => void;
  setReplyBox: (y: boolean) => void;
  mail: { to: string; subject: string; body: string };
  setMail: (x: any) => void;
  handleNewEmail : (x:any)=>void;
}) => {
    console.log(mail);
  return (
    <div className="absolute inset-0 bg-black bg-opacity-70 text-white flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] w-full max-w-lg rounded-lg p-6 shadow-lg relative">
        <h2 className="text-xl font-semibold mb-4">New Mail</h2>

        <div className="flex flex-col space-y-4">
          <input
            type="email"
            placeholder="To"
            value={mail.to}
            onChange={(e) => setMail({ ...mail, to: e.target.value })}
            className="bg-[#121212] text-white border border-[#333] rounded-md px-4 py-2"
          />

          <input
            type="text"
            placeholder="Subject"
            value={mail.subject}
            onChange={(e) => setMail({ ...mail, subject: e.target.value })}
            className="bg-[#121212] text-white border border-[#333] rounded-md px-4 py-2"
          />

          <textarea
            placeholder="Write your message..."
            rows={6}
            value={mail.body}
            onChange={(e) => setMail({ ...mail, body: e.target.value })}
            className="w-full bg-[#121212] text-white border border-[#333] rounded-md px-4 py-3 resize-none"
          />

          <div className="flex justify-end gap-4 pt-4">
            <button
              onClick={() => {
                // Add your generate logic here
              }}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-2 rounded-md transition-colors"
            >
              <Star size={16} />
              Generate
            </button>

            <button
              onClick={() => {
                // Add your send logic here
                            handleNewEmail(mail)
                     setReplyBox(false);
            setActiveView("mail");
                        setMail({to:"",subject:"",body:""})

              }}
              className="bg-orange-600 hover:bg-orange-700 text-white text-sm px-6 py-2 rounded-md"
            >
              Send
            </button>
          </div>
        </div>

        <button
          onClick={() => {
            setReplyBox(false);
            setActiveView("mail");
            setMail({to:"",subject:"",body:""})
          }}
          className="absolute top-2 right-3 text-gray-400 hover:text-white text-lg"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default ReplyBox;

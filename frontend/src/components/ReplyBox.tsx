import { Star } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

const ReplyBox = ({
  setReplyBox,
  setActiveView,
  mail,
  setMail,
  handleNewEmail,
  handleGenerateEmail
}: {
  setActiveView: (x: string) => void;
  setReplyBox: (y: boolean) => void;
  mail: { to: string; subject: string; body: string };
  setMail: (x: any) => void;
  handleNewEmail : (x:any)=>void;
  handleGenerateEmail : (subject:string,body:string)=>Promise<any>
}) => {
 const hasTypedRef = useRef(false);
   const [emailList, setEmailList] = useState<string[]>([]);


   
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const handleBlur = ()=>{
      if(hasTypedRef.current){
              const trimmed = mail.to.trim();


        const isValid = trimmed.match(emailRegex)
           if (isValid) {
        if (!emailList.includes(trimmed)) {
          setEmailList([...emailList, trimmed]);
        }
        setMail({ ...mail, to: "" });
      } else if (trimmed) {
        alert("Invalid email address");
                setMail({ ...mail, to: "" });

      }
  
        hasTypedRef.current=false
      }
    }
  return (
       <div className="absolute inset-0 bg-black bg-opacity-70 text-white flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] w-full max-w-lg rounded-lg p-6 shadow-lg relative">
        <h2 className="text-xl font-semibold mb-4">New Mail</h2>

        <div className="flex flex-col space-y-4">
          {/* Pills inside input-like container */}
          <div
            className="flex flex-wrap items-center bg-[#121212] border border-[#333] rounded-md px-2 py-1 min-h-[42px]"
            
          >
            {emailList.map((email, index) => (
              <div
                key={index}
                className="flex items-center bg-[#2a2a2a] text-white rounded-full px-3 py-1 mr-2 mb-1"
              >
                <div className="bg-gray-600 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">
                  {email.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm">{email}</span>
                <button
                  onClick={() =>
                    setEmailList(emailList.filter((_, i) => i !== index))
                  }
                  className="ml-2 text-gray-300 hover:text-white text-sm"
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
              className="bg-transparent text-white flex-1 outline-none min-w-[120px] py-1"
            />
          </div>

          {/* Subject Input */}
          <input
            type="text"
            placeholder="Subject"
            value={mail.subject}
            onChange={(e) => setMail({ ...mail, subject: e.target.value })}
            className="bg-[#121212] text-white border border-[#333] rounded-md px-4 py-2"
          />

          {/* Body Textarea */}
          <textarea
            placeholder="Write your message..."
            rows={6}
            value={mail.body}
            onChange={(e) => setMail({ ...mail, body: e.target.value })}
            className="w-full bg-[#121212] text-white border border-[#333] rounded-md px-4 py-3 resize-none"
          />

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              onClick={() => {
                // Optional: Generate logic
                             handleGenerateEmail(mail.subject,mail.body)

              }}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-2 rounded-md transition-colors"
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
              className="bg-orange-600 hover:bg-orange-700 text-white text-sm px-6 py-2 rounded-md"
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
          className="absolute top-2 right-3 text-gray-400 hover:text-white text-lg"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default ReplyBox;

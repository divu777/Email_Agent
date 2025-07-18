import React from 'react'
import { IoReturnUpBack } from 'react-icons/io5';

const MailPreview = () => {
  return (
        <div className="flex-1 flex flex-col relative overflow-hidden">
  {selectedMail && email ? (
    <>
      {/* Thread scrollable area */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-6 mt-4 pb-40">
       {email.messages.map((msg, index) => {
  const fromHeader = msg.impheaders.find((h) => h.name === "From")?.value || "Unknown Sender";
  const subject = msg.impheaders.find((h) => h.name === "Subject")?.value || "No subject";
  const timestamp = new Date( Date.now()).toLocaleString();

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
            <p className="text-sm font-semibold text-white">{fromHeader}</p>
            <p className="text-xs text-gray-400">{subject}</p>
          </div>
        </div>
        <span className="text-xs text-gray-500">{timestamp}</span>
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
     {replyTarget 
   && (() => {
  const originalSubject = getHeader(replyTarget.impheaders, "Subject");
  const replySubject = originalSubject.startsWith("Re:") ? originalSubject : `Re: ${originalSubject}`;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-[#0d0d0d] border-t border-[#2d2d2d] pt-4 px-4 pb-6">
      <h3 className="text-sm text-gray-400 mb-2">
        Replying to: <span className="text-white">{getHeader(replyTarget.impheaders, "From")}</span>
      </h3>
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
              onClick={() => handleGenerateReply({ ...email!, messages: [ replyTarget] })}
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
  )
}

export default MailPreview

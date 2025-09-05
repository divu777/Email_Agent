import { EmailsType } from "./Dashboard2";

const MailView = ({
  emails,
  handleEmailClick,
  handleLoadMore,
  load,
  loading
}: {
  emails: EmailsType[];
  handleEmailClick: (threadId: string) => void;
  handleLoadMore: () => void;
  load: string;
  loading:boolean
}) => {
  return (
    <div className="h-full w-2/5 bg-[#1a1a1a] flex flex-col px-6 py-6 space-y-6 rounded-lg border border-[#2a2a2a] shadow-md">
      {/* Search Bar */}
      <div>
        <input
          type="text"
          placeholder="Search emails..."
          className="w-full px-4 py-3 bg-[#121212] text-white border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-inner transition-all duration-300"
        />
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide">
        {emails &&
          emails.map((email, index) => (
            <div
              key={index}
              className="bg-[#222] hover:bg-[#2c2c2c] transition-colors cursor-pointer px-5 py-4 rounded-lg border border-transparent hover:border-orange-500 shadow-sm"
              onClick={() => handleEmailClick(email.threadId)}
            >
              <p className="text-sm font-semibold text-orange-400">
                {email.subject || "No Subject"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {email.from || "Unknown Sender"}
              </p>
              <p className="text-sm text-gray-300 mt-2 leading-snug">
                {email.snippet?.substring(0, 60)}...
              </p>
            </div>
          ))}
        <div className=" w-full flex items-center justify-center">
          {emails && load && load !== "0" && (
            <div className="w-full flex items-center justify-center mt-4">
              <button
                className="px-6 py-2 rounded-md bg-zinc-950 hover:bg-orange-600 text-white font-medium text-sm shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MailView;

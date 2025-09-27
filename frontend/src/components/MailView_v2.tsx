import { EmailsType } from "./Dashboard";

const MailView = ({
  emails,
  handleEmailClick,
  handleLoadMore,
  load,
  loading,
}: {
  emails: EmailsType[];
  handleEmailClick: (threadId: string) => void;
  handleLoadMore: () => void;
  load: string;
  loading: boolean;
}) => {
  return (
    <div className="h-full w-full lg:w-2/5 bg-white flex flex-col px-6 py-6 space-y-6 rounded-lg border border-gray-200 shadow-sm">
      {/* Search Bar */}
      <div>
        <input
          type="text"
          placeholder="Search emails..."
          className="w-full px-4 py-3 bg-white text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner transition-all duration-300"
        />
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {emails &&
          emails.map((email, index) => (
            <div
              key={index}
              className="bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer px-5 py-4 rounded-lg border border-transparent hover:border-blue-500 shadow-sm"
              onClick={() => handleEmailClick(email.threadId)}
            >
              <p className="text-sm font-semibold text-blue-600">
                {email.subject ? (email.subject=='Re:'? 'No Subject':email.subject ): "No Subject"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {email.from || "Unknown Sender"}
              </p>
              <p className="text-sm text-gray-700 mt-2 leading-snug">
                {email.snippet?.substring(0, 60)}...
              </p>
            </div>
          ))}
        <div className="w-full flex items-center justify-center">
          {emails && load && load !== "0" && (
            <div className="w-full flex items-center justify-center mt-4">
              <button
                className="px-6 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

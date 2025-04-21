import React from 'react';
import { motion } from 'framer-motion';
import { Inbox, Mail, Search } from 'lucide-react';

interface EmptyStateProps {
  type: 'no-email' | 'loading' | 'no-selection' | 'no-results';
  searchQuery?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ type, searchQuery }) => {
  const renderContent = () => {
    switch (type) {
      case 'loading':
        return (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "linear" }}
              className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full"
            />
            <p className="mt-4 text-gray-500 font-medium">Loading emails...</p>
          </>
        );
        
      case 'no-email':
        return (
          <>
            <Inbox className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700">Your inbox is empty</h3>
            <p className="text-gray-500 mt-2 max-w-xs text-center">
              When you receive new emails, they'll appear here
            </p>
          </>
        );
        
      case 'no-results':
        return (
          <>
            <Search className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700">No results found</h3>
            <p className="text-gray-500 mt-2 max-w-xs text-center">
              No emails matching "{searchQuery}" were found.
              Try a different search term.
            </p>
          </>
        );
        
      case 'no-selection':
        return (
          <>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className="w-full h-full flex flex-col items-center justify-center text-center p-6 "

            >
              <Mail className="w-20 h-20 text-blue-200 mx-auto mb-6" />
              

            <h3 className="text-2xl font-semibold text-gray-700 mb-3">No Email Selected</h3>
            <p className="text-gray-500 max-w-md text-center">
              Select an email from the list to view its contents.
              Your conversation will appear here.
            </p>
            </motion.div>
          </>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      {renderContent()}
    </div>
  );
};

export default EmptyState;
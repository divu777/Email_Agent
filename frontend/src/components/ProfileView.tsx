import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { Sparkles, Mail, UserCircle, Calendar } from 'lucide-react';

const ProfileView = () => {
  const { user } = useUser();

  if (!user) {
    return (
      <div className="text-center text-gray-500">Loading user profile...</div>
    );
  }

  const fullName = user.fullName || 'Unnamed User';
  const email = user.primaryEmailAddress?.emailAddress || 'Email not available';
  const avatar = user.imageUrl || '/placeholder-avatar.png'; // fallback image
  const createdAt = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : 'Unknown';
  const username = user.username || 'No username';

  return (
    <motion.div
      className="max-w-4xl mx-auto p-4"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Profile</h1>
        <p className="text-gray-600">
          This is your profile powered by Clerk. It includes your basic info and account details.
        </p>
      </div>

      <motion.div
        className="bg-white rounded-2xl shadow-md p-6 flex flex-col md:flex-row items-center gap-6 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <img
          src={avatar}
          alt="User avatar"
          className="w-24 h-24 rounded-full object-cover shadow-sm border"
        />
        <div className="text-center md:text-left">
          <h2 className="text-xl font-semibold text-gray-900">{fullName}</h2>
          <p className="text-gray-600 text-sm">{email}</p>
          <p className="text-gray-500 text-sm">Username: {username}</p>
        </div>
      </motion.div>

      <motion.div
        className="grid md:grid-cols-2 gap-4 mb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <div className="flex items-center mb-2">
            <Mail className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-sm font-medium text-gray-900">Email Address</h3>
          </div>
          <p className="text-gray-700 text-sm">{email}</p>
        </div>

        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
          <div className="flex items-center mb-2">
            <Calendar className="w-5 h-5 text-purple-600 mr-2" />
            <h3 className="text-sm font-medium text-gray-900">Account Created</h3>
          </div>
          <p className="text-gray-700 text-sm">{createdAt}</p>
        </div>
      </motion.div>

      <motion.div
        className="bg-gradient-to-r from-pink-50 to-yellow-50 rounded-xl p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center mb-4">
          <Sparkles className="w-5 h-5 text-pink-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">More Features Coming Soon!</h2>
        </div>
        <p className="text-gray-600 mb-2">
          Soon you'll be able to manage advanced preferences, track usage, and much more from this profile view.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default ProfileView;

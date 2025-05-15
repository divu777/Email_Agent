import { useUser, useClerk } from '@clerk/clerk-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Calendar, Trash2 } from 'lucide-react';
import { config } from '../config';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
import { useDispatch } from 'react-redux';
import { clearEmailThreads } from '../store/slices/emailSlice';
import { disconnectMail } from '../store/slices/oauthSlice';

const ProfileView = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [showModal, setShowModal] = useState(false);

  if (!user) {
    return <div className="text-center text-gray-500">Loading user profile...</div>;
  }

  const fullName = user.fullName || 'Unnamed User';
  const email = user.primaryEmailAddress?.emailAddress || 'Email not available';
  const avatar = user.imageUrl || '/placeholder-avatar.png';
  const createdAt = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown';
  const username = user.username || 'No username';
  const navigate=useNavigate();
  const dispatch = useDispatch()
  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      const response = await axios.delete(`${config.BACKEND_URL}/api/v1/email/${user.id}`);

      if (response.data.success) {
            dispatch(logout());
            dispatch(disconnectMail());
            dispatch(clearEmailThreads());
        await signOut(); // Logout via Clerk
        navigate("/")
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

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

        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 relative">
          <div className="flex items-center mb-2">
            <Calendar className="w-5 h-5 text-purple-600 mr-2" />
            <h3 className="text-sm font-medium text-gray-900">Account Created</h3>
          </div>
          <p className="text-gray-700 text-sm mb-3">{createdAt}</p>

          {/* Delete Button */}
          <button
            onClick={() => setShowModal(true)}
            className="mt-2 flex items-center gap-2 px-4 py-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition"
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </button>

          {error && (
            <p className="text-red-500 text-xs mt-1">Failed to delete account. Please try again.</p>
          )}
        </div>
      </motion.div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Are you sure?</h2>
            <p className="text-sm text-gray-600 mb-6">
              This will permanently delete your account. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-700 border border-gray-200 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

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
          Soon you'll be able to manage advanced preferences, track usage, and much more from this
          profile view.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default ProfileView;

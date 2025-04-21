import { Link } from "react-router-dom";
import {
  SignInButton,
  SignOutButton,
  useUser,
  UserButton,
} from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { login, logout } from "../store/slices/authSlice";
import { disconnectMail } from "../store/slices/oauthSlice";
import { clearEmailThreads } from "../store/slices/emailSlice";
import { useEffect } from "react";

const Navbar = () => {
  const { isSignedIn , user } = useUser();
  const dispatch = useDispatch();
  const handleLogOut = () => {
    dispatch(logout());
    dispatch(disconnectMail());
    dispatch(clearEmailThreads());
  };

  useEffect(()=>{

    if(user){
      dispatch(login({userId:user.id,firstName:user.firstName,lastName:user.lastName,email:user.primaryEmailAddress?.emailAddress}))
    }

  },[user])

  return (
    <motion.nav
      className="flex items-center justify-between px-8 py-3 bg-white shadow-md rounded-full m-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      {/* Left side: Logo + Brand */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <span className="rounded-full bg-black text-white w-6 h-6 flex items-center justify-center">
            ✉️
          </span>
          <span>Email Agent</span>
        </Link>
      </div>

      {/* Right side: Nav Links + Auth */}
      <div className="flex items-center gap-6">
        <Link
          to="/about-me"
          className="text-sm font-medium hover:underline transition"
        >
          About Us
        </Link>

        {isSignedIn && (
          <Link
            to="/dashboard"
            className="text-sm font-medium hover:underline transition"
          >
            Dashboard
          </Link>
        )}

        {isSignedIn ? (
          <div className="flex items-center gap-4">
            <UserButton />
            <SignOutButton redirectUrl="/">
              <button
                className="text-sm border px-4 py-1.5 rounded-full hover:bg-gray-100 transition"
                onClick={handleLogOut}
              >
                Log Out
              </button>
            </SignOutButton>
          </div>
        ) : (
          <SignInButton signUpForceRedirectUrl="/prompt-select">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-blue-500 text-white px-5 py-2 rounded-full text-sm font-medium transition"
            >
              Log In
              <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center">
                →
              </span>
            </motion.button>
          </SignInButton>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;

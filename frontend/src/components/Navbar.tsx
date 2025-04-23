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
import { Zap } from "lucide-react";

const Navbar = () => {
  const { isSignedIn, user } = useUser();
  const dispatch = useDispatch();

  const handleLogOut = () => {
    dispatch(logout());
    dispatch(disconnectMail());
    dispatch(clearEmailThreads());
  };

  useEffect(() => {
    if (user) {
      dispatch(
        login({
          userId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.primaryEmailAddress?.emailAddress,
        })
      );
    }
  }, [user]);

  return (
    <motion.nav
      className="flex items-center justify-between px-10 py-3 bg-white shadow-lg rounded-full m-4 backdrop-blur-md border border-gray-100"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
          <Zap className="w-6 h-6 text-blue-600" />
          <span>Email Agent</span>
        </Link>
      </div>

      {/* Nav Links & Auth */}
      <div className="flex items-center gap-6">
      {["About Us"].map((text, index) => (
  <Link
    key={index}
    to={text === "About Us" ? "/about-me" : "#"}
    className="relative text-sm font-medium text-gray-700 px-4 py-1.5 rounded-full transition-all duration-300 hover:text-blue-600 border border-transparent hover:border-blue-500 hover:bg-blue-50"
  >
    {text}
  </Link>
))}

{isSignedIn && (
  <Link
    to="/dashboard"
    className="relative text-sm font-medium text-gray-700 px-4 py-1.5 rounded-full transition-all duration-300 hover:text-blue-600 border border-transparent hover:border-blue-500 hover:bg-blue-50"
  >
    Dashboard
  </Link>
)}

        {/* Auth buttons */}
        {isSignedIn ? (
        <div className="flex items-center gap-4">
        <UserButton />
        <SignOutButton redirectUrl="/">
          <motion.button
            onClick={handleLogOut}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-sm px-4 py-1.5 rounded-full border border-red-500 text-red-600 hover:bg-red-50 transition-all duration-300"
          >
            Log Out
          </motion.button>
        </SignOutButton>
      </div>
      
        ) : (
          <SignInButton signUpForceRedirectUrl="/prompt-select">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium shadow hover:shadow-lg transition-all"
            >
              Log In
              <span className="w-6 h-6 bg-white text-black rounded-full flex items-center justify-center text-xs font-bold">
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

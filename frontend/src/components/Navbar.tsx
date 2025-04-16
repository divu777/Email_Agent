
import { Link } from "react-router-dom";
import {
  SignInButton,
  SignOutButton,
  useUser,
  UserButton
} from "@clerk/clerk-react";
import { motion } from "framer-motion";

const Navbar = () => {
  const { isSignedIn } = useUser();

  

  return (
    <motion.nav
      className="flex justify-between items-center px-6 py-3 bg-white shadow-md rounded-full m-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut",  }}

    >
      <div className="flex items-center justify-center gap-8">
        <Link to="/" className="text-xl font-bold flex items-center gap-2">
          <span className="rounded-full bg-black text-white p-2"></span>
          <span>Email Agent</span>
        </Link>
        <Link to="/about" className="hover:underline text-sm font-medium">
          About Us
        </Link>
      </div>

      <div className="flex items-center justify-center gap-4">
        {isSignedIn ? (
          <>
            <UserButton />
            <SignOutButton redirectUrl="/dashboard">
              <button className="text-sm border px-3 py-1 rounded-full hover:bg-gray-100">
                Log Out
              </button>
            </SignOutButton>
          </>
        ) : (
          <>

            <SignInButton
            signUpForceRedirectUrl="/prompt-select"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-2 bg-blue-300 px-6 py-2 rounded-full text-sm font-medium"
              >
                LogIn
                <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center">
                  →
                </span>
              </motion.button>
            </SignInButton>
          </>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;

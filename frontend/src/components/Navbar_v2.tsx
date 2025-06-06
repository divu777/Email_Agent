import { Link } from "react-router-dom";
import {
  SignInButton,
  SignOutButton,
  UserButton,
  useUser,
} from "@clerk/clerk-react";
import { motion } from "framer-motion";

import {  useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { Menu, X } from 'lucide-react';

const Navbar = () => {
    const [loggedIn, setLoggedIn]= useState(false)

    


  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 border-b border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
              <Zap className="h-6 w-6 text-blue-600" />
              <span>Email Agent</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center md:space-x-4">
            <Link 
              to="/about-me"
              className="px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 transition duration-150"
            >
              About Us
            </Link>
            {loggedIn && (
              <Link 
                to="/dashboard"
                className="px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 transition duration-150"
              >
                Dashboard
              </Link>
            )}
            {loggedIn ? (
              <div className="flex items-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-sm px-4 py-1.5 rounded-full border border-red-500 text-red-600 hover:bg-red-50 transition-all duration-300"
                  >
                    Log Out
                  </motion.button>
              </div>
            ) : (
                <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex   items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium shadow hover:shadow-lg transition-all"
                >
                  Log In
                  <span className="w-6 h-6 bg-white text-black rounded-full flex items-center justify-center text-xs font-bold">
                    →
                  </span>
                </motion.button>
                </Link>

            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">{isMenuOpen ? 'Close menu' : 'Open menu'}</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg rounded-b-lg">
            <Link
              to="/about-me"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              onClick={() => setIsMenuOpen(false)}
            >
              About Us
            </Link>
            {true && (
              <Link
                to="/dashboard"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
            {loggedIn ? (
              <div className="flex flex-col space-y-2 px-3 py-2">
                <UserButton />
                <SignOutButton redirectUrl="/">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-sm px-4 py-1.5 rounded-full border border-red-500 text-red-600 hover:bg-red-50 transition-all duration-300"
                  >
                    Log Out
                  </motion.button>
                </SignOutButton>
              </div>
            ) : (
              <div className="px-3 py-2">
                <SignInButton signUpForceRedirectUrl="/">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium shadow hover:shadow-lg transition-all w-full justify-between"
                  >
                    Log In
                    <span className="w-6 h-6 bg-white text-black rounded-full flex items-center justify-center text-xs font-bold">
                      →
                    </span>
                  </motion.button>
                </SignInButton>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
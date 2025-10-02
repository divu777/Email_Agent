import axios from "axios";
import { motion } from "framer-motion";
import { Mail, LogOut, Zap, ChevronLeft, ChevronRight, MessageCircleMore } from "lucide-react";
import { IoCreateOutline } from "react-icons/io5";
import { config } from "../config";

interface SidebarProps {
  setActiveView: (view: string) => void;
  activeView: string;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const Sidebar = ({
  setActiveView,
  activeView,
  isCollapsed,
  setIsCollapsed,
}: SidebarProps) => {
  const menuItems = [
    { id: "mail", icon: Mail, label: "Mail" },
    { id: "send-mail", icon: IoCreateOutline, label: "Send Email" },
    {id:"chat",icon: MessageCircleMore,label:"Chat"}
  ];


  const handleLogout=async()=>{
    const response = await axios.post(`${config.BACKEND_URL}/api/v1/google/logout`,{},{
      withCredentials:true
    })
    if(!response.data.success && response.data.redirectUrl){
      window.location.href=response.data.redirectUrl
    }
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.div
  layout="position"
  className={`hidden lg:block fixed h-screen bg-white border-r border-gray-200 shadow-sm 
    ${isCollapsed ? "w-20" : "w-64"}`}
>
        {/* Branding */}
        <div className="flex items-center p-6 border-b border-gray-200">
          <Zap className="w-6 h-6 text-blue-600" />
          <span
            className={`ml-3 font-semibold text-gray-800 transition-opacity  ${
              isCollapsed ? "opacity-0 hidden" : "opacity-100"
            }`}
          >
            Vektor
          </span>
        </div>

        {/* Menu Items */}
        <nav className="mt-6 px-3">
          {menuItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              className={`w-full flex items-center py-3 mb-2 rounded-lg transition-all duration-200 
                ${
                  activeView === id
                    ? "bg-blue-50 text-blue-600 border border-blue-500"
                    : "text-gray-600 hover:bg-gray-100"
                } ${isCollapsed ? "justify-center" : "px-3"}`}
            >
              <Icon className="w-5 h-5" />
              <span
                className={`ml-3 transition-opacity duration-200 ${
                  isCollapsed ? "opacity-0 hidden" : "opacity-100"
                }`}
              >
                {label}
              </span>
            </button>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 w-full px-3 py-4 border-t border-gray-200 space-y-2">
          {/* Logout */}
          <button
          onClick={()=>handleLogout()}
            className={`w-full flex items-center px-3 py-3 text-red-500 rounded-lg transition-colors duration-200 hover:bg-gray-100 ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <LogOut className="w-5 h-5" />
            <span
              className={`ml-3 transition-opacity duration-200 ${
                isCollapsed ? "opacity-0 hidden" : "opacity-100"
              }`}
            >
              Logout
            </span>
          </button>

          {/* Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`w-full flex items-center px-3 py-3 text-gray-500 rounded-lg transition-colors duration-200 hover:bg-gray-100 ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="ml-3">Collapse</span>
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md z-40">
        <nav className="flex justify-around items-center h-16">
          {menuItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 ${
                activeView === id ? "text-blue-600" : "text-gray-500"
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1">{label}</span>
            </button>
          ))}
          <button className="flex flex-col items-center justify-center flex-1 py-1 text-red-500"
          onClick={()=>handleLogout()}
          >
            <LogOut className="w-6 h-6" />
            <span className="text-xs mt-1">Logout</span>
          </button>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;

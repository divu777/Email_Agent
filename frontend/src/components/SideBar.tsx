import {
  Mail,

  LogOut,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { IoCreateOutline } from "react-icons/io5";

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
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:block fixed h-screen transition-all duration-300 ease-in-out
        ${isCollapsed ? "w-20" : "w-64"} bg-[#0d0d0d] border-r border-[#222] shadow-md`}
      >
        {/* Branding */}
        <div className="flex items-center p-6 border-b border-[#222]">
          <Zap className="w-6 h-6 text-orange-500" />
          <span
            className={`ml-3 font-semibold text-white transition-opacity duration-200 ${
              isCollapsed ? "opacity-0 hidden" : "opacity-100"
            }`}
          >
            Vektor
          </span>
        </div>

        {/* Menu Items */}
        <nav className="mt-6 px-3 ">
          {menuItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              className={`w-full flex items-center  py-3 mb-2 rounded-lg transition-all duration-200 
                ${
                  activeView === id
                    ? "bg-[#1a1a1a] text-orange-500 border border-orange-500"
                    : "text-gray-400 hover:bg-[#1e1e1e]"
                } ${
                  isCollapsed? "justify-center": "px-3"
                }`}
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
        <div className="absolute bottom-0 w-full px-3 py-4 border-t border-[#222] space-y-2">
          {/* Logout */}
          
            <button
              className={`w-full flex items-center px-3 py-3 text-red-500 rounded-lg transition-colors duration-200 hover:bg-[#1e1e1e] ${
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
            className={`w-full flex items-center px-3 py-3 text-gray-400 rounded-lg transition-colors duration-200 hover:bg-[#1e1e1e] ${
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
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0d0d0d] border-t border-[#222] shadow-md">
        <nav className="flex justify-around items-center h-16">
          {menuItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 ${
                activeView === id ? "text-orange-500" : "text-gray-400"
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1">{label}</span>
            </button>
          ))}
            <button className="flex flex-col items-center justify-center flex-1 py-1 text-red-500">
              <LogOut className="w-6 h-6" />
              <span className="text-xs mt-1">Logout</span>
            </button>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;

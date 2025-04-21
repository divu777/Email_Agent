import { Mail, Settings, BarChart2, LogOut, Zap, ChevronLeft, ChevronRight, UserCircle } from 'lucide-react';
import { SignOutButton } from '@clerk/clerk-react';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { clearEmailThreads } from '../store/slices/emailSlice';
import { disconnectMail } from '../store/slices/oauthSlice';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  setActiveView: (view: string) => void;
  activeView: string;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}


const Sidebar = ({ setActiveView, activeView, isCollapsed, setIsCollapsed }:SidebarProps) => {
  const navigate=useNavigate()
  const dispatch = useDispatch()
  const handleLogOut=()=>{
      dispatch(logout());
      dispatch(disconnectMail());
      dispatch(clearEmailThreads());
      navigate('/'); 
    }
  const menuItems = [
    { id: 'mail', icon: Mail, label: 'Mail' },
    { id: 'prompt', icon: Settings, label: 'Prompts' },
    { id: 'analytics', icon: BarChart2, label: 'Analytics' },
    { id: 'profile', icon: UserCircle, label: 'Profile' }
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={`hidden lg:block fixed h-screen bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}>
        {/* Branding */}
        <div className="flex items-center p-6 border-b border-gray-100">
          <Zap className="w-6 h-6 text-blue-600" />
          <span className={`ml-3 font-semibold text-gray-900 transition-opacity duration-200 ${
            isCollapsed ? 'opacity-0 hidden' : 'opacity-100'
          }`}>
            Email Agent
          </span>
        </div>

        {/* Menu Items */}
        <nav className="mt-6 px-3">
          {menuItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              className={`w-full flex items-center px-3 py-3 mb-2 rounded-lg transition-all duration-200 ${
                activeView === id
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className={`ml-3 transition-opacity duration-200 ${
                isCollapsed ? 'opacity-0 hidden' : 'opacity-100'
              }`}>
                {label}
              </span>
            </button>
          ))}
        </nav>

       

        {/* Bottom Section */}
        <div className="absolute bottom-0 w-full px-3 py-4 border-t border-gray-100 space-y-2">
          {/* Logout */}
          <SignOutButton >
          <button
            onClick={handleLogOut}
            className={`w-full flex items-center px-3 py-3 text-red-600 rounded-lg transition-colors duration-200 hover:bg-red-50 ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-5 h-5" />
            <span className={`ml-3 transition-opacity duration-200 ${
              isCollapsed ? 'opacity-0 hidden' : 'opacity-100'
            }`}>
              Logout
            </span>
          </button>
          </SignOutButton>

          {/* Collapse */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`w-full flex items-center px-3 py-3 text-gray-600 rounded-lg transition-colors duration-200 hover:bg-gray-50 ${
              isCollapsed ? 'justify-center' : ''
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
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        {/* Example Component for Profile in Mobile */}
   
        <nav className="flex justify-around items-center h-16">
          {menuItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 ${
                activeView === id
                  ? 'text-blue-600'
                  : 'text-gray-600'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1">{label}</span>
            </button>
          ))}
          <SignOutButton redirectUrl="/">

          <button
            onClick={handleLogOut}
            className="flex flex-col items-center justify-center flex-1 py-1 text-red-600"
          >
            <LogOut className="w-6 h-6" />
            <span className="text-xs mt-1">Logout</span>
          </button>
          </SignOutButton>

        </nav>
      </div>
    </>
  );
};

export default Sidebar;
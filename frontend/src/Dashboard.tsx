// App.jsx or Dashboard.jsx
import { useEffect, useState } from "react";
import Sidebar from "./components/SideBar";
import MailView from "./components/MailView2";
import PromptView from "./components/PromptView";
import { useDispatch, useSelector } from "react-redux";
import { disconnectMail } from "./store/slices/oauthSlice";
import { logout } from "./store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import Insights from "./Insights";
import { RootState } from "./store/store";
import ProfileView from "./components/ProfileView";
import { clearEmailThreads } from "./store/slices/emailSlice";

function Dashboard() {
  const { userId } = useSelector((state: RootState) => state.authreducer);
  // const {connected ,onboarding_complete} = useSelector((state:RootState)=>state.OAuthreducer);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("mail");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const renderView = () => {
    switch (activeView) {
      case "mail":
        return <MailView />;
      case "prompt":
        return <PromptView />;
      case "analytics":
        return <Insights />;
      case "profile":
        return <ProfileView />;
      default:
        return <MailView />;
    }
  };

  // useEffect(() => {
  //   if (!userId) {
  //     console.log("user nahi mila");
  //     dispatch(disconnectMail());
  //     dispatch(logout());
  //     dispatch(clearEmailThreads())
  //     navigate("/");
  //   }else{
  //     if(connected && !onboarding_complete){
  //       navigate("/prompt-select");
  //     } else if(!connected && !onboarding_complete) {
  //       navigate("/connect-gmail")
  //     }else{
  //       console.log("app toh ache insaan ho")
  //     }
  //   }
    
  // }, [userId,onboarding_complete,connected]);

  return (
    <div className="flex flex-col lg:flex-row bg-gray-50 min-h-screen">
      {/* Sidebar (already responsive in your component) */}
      <Sidebar
        setActiveView={setActiveView}
        activeView={activeView}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ease-in-out pt-6 pb-20 px-4 sm:px-6 lg:px-8
          ${isCollapsed ? "lg:ml-20" : "lg:ml-64"}`}
      >
        <div className="max-w-7xl mx-auto">{renderView()}</div>
      </main>
    </div>
  );
}

export default Dashboard;

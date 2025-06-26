import { useEffect, useState } from "react"
import Sidebar from "./components/SideBar"
import axios from "axios";

const Dashboard2 = () => {
    const [ chatVisible,setChatVisible] = useState(false)
    const [activeView, setActiveView] = useState("mail");
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(()=>{
    const fetchEmailHeaders=async()=>{
        const response = await axios.get("http://localhost:3000/api/v1/google/emails",{
            withCredentials:true
        })
        console.log(response.data+"+++++")
    }


    fetchEmailHeaders()
  },[])
  return (
    <>
<Sidebar
        setActiveView={setActiveView}
        activeView={activeView}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />      
    <div className={`h-screen w-auto ${isCollapsed ? 'lg:ml-24' : 'lg:ml-64'} flex px-5 bg-amber-600`}>
      
      <div className="h-full w-2/5 bg-blue-500 text-black text-3xl flex flex-col justify-around p-5">

      <div className="topbar bg-green-400 w-full h-1/5 flex items-center ">

 <input
              type="text"
              placeholder="Search emails..."
              className="w-full px-4 py-3 pl-10 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-300"
              
            />      </div>

      <div className="bg-purple-400 w-full h-4/5" >
            chats 
      </div>


      </div>
      <div className="h-full w-3/5 bg-red-500">

      </div>
    </div>
    </>
  )
}

export default Dashboard2

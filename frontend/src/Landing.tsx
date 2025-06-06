
import Navbar from "./components/Navbar_v2";
import { useEffect } from "react";
import {  logout } from "./store/slices/authSlice";
import { disconnectMail, connectMail } from "./store/slices/oauthSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./store/store";
import axios from "axios";
import { config } from "./config";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import FeatureShowcase from "./components/Feature";
import NewsCarousel from "./components/NewsCarousel";


function App() {
  // const { userId } = useSelector((state: RootState) => state.authreducer);
  // const checkOAuth = async (userId: string) => {
  //   const result = await axios.get(
  //     `${config.BACKEND_URL}/api/v1/mail/checkOAuth/${userId}`
  //   );
  //   return result.data;
  // };
  // const dispatch = useDispatch();
  // useEffect(() => {
  //   const fetchData = async () => {
  //     if (userId) {
  //       const oauthacess = await checkOAuth(userId);
  //       if (!oauthacess.success) {
  //         dispatch(disconnectMail());
  //       } else {
  //         dispatch(connectMail(oauthacess.data));
  //       }
  //     } else {
  //       dispatch(logout());
  //     }
  //   };

  //   if (userId) {
  //     fetchData();
  //   }
  // }, [userId]);



  return (
    <div className="relative">
      <div className="relative z-10">
        <Navbar />
        <Hero />
        
        <NewsCarousel/>
        <FeatureShowcase />
        <Footer />
      </div>
    </div>
  );
}

export default App;






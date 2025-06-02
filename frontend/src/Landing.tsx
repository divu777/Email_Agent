
import Navbar from "./components/Navbar";
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


function App() {
  const { userId } = useSelector((state: RootState) => state.authreducer);
  const checkOAuth = async (userId: string) => {
    const result = await axios.get(
      `${config.BACKEND_URL}/api/v1/mail/checkOAuth/${userId}`
    );
    return result.data;
  };
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchData = async () => {
      if (userId) {
        const oauthacess = await checkOAuth(userId);
        if (!oauthacess.success) {
          dispatch(disconnectMail());
        } else {
          dispatch(connectMail(oauthacess.data));
        }
      } else {
        dispatch(logout());
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);
  return (
    <div className="relative">
      <ParticleTrail />
      <WorkInProgressBanner/>
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



import {  useState } from "react";
import { motion } from "framer-motion";
import NewsCarousel from "./components/NewsCarousel";

const ParticleTrail = () => {
  const [particles, setParticles] = useState<any[]>([]);

  const handleMouseMove = (e: MouseEvent) => {
    const newParticle = {
      x: e.clientX,
      y: e.clientY,
      id: Date.now() + Math.random(), // Unique ID for each particle
    };
    setParticles((prev) => [...prev, newParticle]);
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map((particle, index) => (
        <motion.div
          key={particle.id}
          className="absolute bg-white rounded-full"
          style={{
            top: particle.y - 5, // Center the particle
            left: particle.x - 5,
            width: 10, // Particle size
            height: 10,
          }}
          initial={{
            opacity: 1,
            scale: 1,
          }}
          animate={{
            opacity: 0,
            scale: 0.5,
          }}
          transition={{
            duration: 1.5,
            ease: "easeOut",
            delay: index * 0.1, // Add slight delay for stagger effect
          }}
        />
      ))}
    </div>
  );
};




const WorkInProgressBanner = () => {
  return (
    <motion.div
      initial={{ y: -500, opacity: 0 }}
      animate={{ y: "40vh", opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 20,
        mass: 1.5,
      }}
      className="fixed top-0 left-1/2 transform -translate-x-1/2 z-50 text-black px-10 py-6 text-center text-xl font-bold shadow-2xl"
      style={{
        backgroundColor: "#facc15", // Tailwind's vibrant yellow-400
        border: "6px solid transparent",
        borderImage: "repeating-linear-gradient(45deg, black 0 10px, #facc15 10px 20px) 30",
        borderRadius: "12px",
      }}
    >
      🚧 This project is under work!  
      <br />
      V2 is coming — and it's going to be amazing!
    </motion.div>
  );
};


import Navbar from "./Navbar";

import Hero from "./Hero";
import Footer from "./Footer";
import FeatureShowcase from "./Feature";
import NewsCarousel from "./NewsCarousel";
import { motion } from "framer-motion";

function App() {
  return (
    <div className="relative">
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <NewsCarousel />
        <WorkInProgressBanner/>
        <FeatureShowcase />
        <Footer />
      </div>
    </div>
  );
}

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
      🚧 This project is under maintainence!  
      <br />
      If you are a recruiter or someone who found my project intresting please wait and checkout later
    </motion.div>
  );
};

export default App;

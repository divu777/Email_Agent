import Navbar from "./components/Navbar";

import Hero from "./components/Hero";
import Footer from "./components/Footer";
import FeatureShowcase from "./components/Feature";
import NewsCarousel from "./components/NewsCarousel";

function App() {
  return (
    <div className="relative">
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <NewsCarousel />
        <FeatureShowcase />
        <Footer />
      </div>
    </div>
  );
}

export default App;

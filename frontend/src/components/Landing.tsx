import Navbar from "./Navbar";

import Hero from "./Hero";
import Footer from "./Footer";
import FeatureShowcase from "./Feature";
import NewsCarousel from "./NewsCarousel";

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

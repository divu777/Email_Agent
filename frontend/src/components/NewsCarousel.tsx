import { useState, useEffect, useCallback } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
interface NewsItem {
    title: string;
    excerpt: string;
    source: string;
    date: string;
    link: string;
  }
  
  export const newsData: NewsItem[] = [
    {
      title: "AI Email Agents Show 300% Improvement in Response Time",
      excerpt: "Recent study shows AI-powered email management systems reduce response times by 300% while maintaining high accuracy.",
      source: "TechCrunch",
      date: "Mar 15, 2024",
      link: "#"
    },
    {
      title: "Email Automation: The Future of Business Communication",
      excerpt: "Research indicates 78% of businesses plan to implement AI email automation by 2025.",
      source: "Forbes",
      date: "Mar 12, 2024",
      link: "#"
    },
    {
      title: "Divakar Jaiswal's SASS Innovation Transforms Email Management",
      excerpt: "Tech entrepreneur Divakar Jaiswal discusses how his team developed a revolutionary email automation system.",
      source: "Business Insider",
      date: "Mar 10, 2024",
      link: "#"
    },
    {
      title: "Study: AI Email Agents Save 15 Hours Per Week Per Employee",
      excerpt: "New research reveals significant productivity gains through AI-powered email management systems.",
      source: "Harvard Business Review",
      date: "Mar 8, 2024",
      link: "#"
    },
    {
      title: "The Rise of Contextual AI in Email Communication",
      excerpt: "How modern AI systems are revolutionizing email management with context-aware responses.",
      source: "Wired",
      date: "Mar 5, 2024",
      link: "#"
    }
  ];
const NewsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [userInteracted, setUserInteracted] = useState(false);
  const controls = useAnimation();
  
  // Create infinite array by duplicating items
  const extendedItems = [...newsData, ...newsData, ...newsData];
  
  const getItemsToShow = useCallback(() => {
    const width = window.innerWidth;
    if (width >= 1280) return 4;
    if (width >= 1024) return 3;
    if (width >= 768) return 2;
    return 1;
  }, []);

  const [itemsToShow, setItemsToShow] = useState(getItemsToShow());
  
  useEffect(() => {
    const handleResize = () => {
      setItemsToShow(getItemsToShow());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getItemsToShow]);

  const moveToIndex = useCallback((index: number) => {
    const maxIndex = extendedItems.length - itemsToShow;
    let newIndex = index;

    // Handle infinite scroll
    if (index < 0) {
      newIndex = maxIndex - Math.abs(index) % newsData.length;
    } else if (index > maxIndex) {
      newIndex = index % newsData.length;
    }

    setCurrentIndex(newIndex);
    controls.start({
      x: `${-newIndex * (100 / itemsToShow)}%`,
      transition: {
        type: "spring",
        stiffness: 150,
        damping: 20
      }
    });
  }, [itemsToShow, controls, extendedItems.length]);

  const next = useCallback(() => {
    moveToIndex(currentIndex + 1);
  }, [currentIndex, moveToIndex]);

  const prev = useCallback(() => {
    moveToIndex(currentIndex - 1);
  }, [currentIndex, moveToIndex]);

  useEffect(() => {
    let autoPlayTimer: number | undefined;
    let userInteractionTimer: number | undefined;

    if (isAutoPlaying) {
      autoPlayTimer = setInterval(next, 3000);
    }

    if (userInteracted) {
      userInteractionTimer = setTimeout(() => {
        setUserInteracted(false);
        setIsAutoPlaying(true);
      }, 5000);
    }

    return () => {
      clearInterval(autoPlayTimer);
      clearTimeout(userInteractionTimer);
    };
  }, [isAutoPlaying, next, userInteracted]);

  const handleManualControl = (action: () => void) => {
    setUserInteracted(true);
    setIsAutoPlaying(false);
    action();
  };

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            Email Agent in the News
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover how our AI-powered email automation is transforming business communication
          </p>
        </div>

        <div className="relative">
          <div className="overflow-hidden">
            <motion.div
              className="flex gap-6"
              animate={controls}
              initial={{ x: 0 }}
            >
              {extendedItems.map((item, index) => (
                <motion.div
                  key={index}
                  className={`${
                    itemsToShow === 4 ? 'min-w-[calc(25%-18px)]' :
                    itemsToShow === 3 ? 'min-w-[calc(33.333%-16px)]' :
                    itemsToShow === 2 ? 'min-w-[calc(50%-12px)]' :
                    'min-w-[100%]'
                  } p-4`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="bg-white rounded-xl shadow-md overflow-hidden h-full">
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <span className="text-sm font-medium text-indigo-600">{item.source}</span>
                        <span className="mx-2 text-gray-300">•</span>
                        <span className="text-sm text-gray-500">{item.date}</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600 mb-4">{item.excerpt}</p>
                      <div className="flex items-center text-indigo-600 hover:text-indigo-700">
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-sm font-medium">
                          Read More
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <button
            onClick={() => handleManualControl(prev)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white p-2 rounded-full shadow-lg hover:bg-gray-50"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>

          <button
            onClick={() => handleManualControl(next)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white p-2 rounded-full shadow-lg hover:bg-gray-50"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default NewsCarousel;
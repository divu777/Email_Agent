import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface NewsItem {
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

const NewsCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [itemsToShow, setItemsToShow] = useState(3); // Default to 3 items
  
  // Create infinite array by duplicating items
  const extendedItems = [...newsData, ...newsData, ...newsData];
  
  const getItemsToShow = useCallback(() => {
    const width = window.innerWidth;
    if (width >= 1024) return 3;
    if (width >= 768) return 2;
    return 1;
  }, []);
  
  useEffect(() => {
    const handleResize = () => {
      setItemsToShow(getItemsToShow());
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getItemsToShow]);

  const totalItems = extendedItems.length;
  const maxIndex = totalItems - itemsToShow;
  
  const next = useCallback(() => {
    setCurrentIndex(prev => {
      const nextIndex = prev + 1;
      // Reset to start when reaching the end of extended items
      return nextIndex > maxIndex ? 0 : nextIndex;
    });
  }, [maxIndex]);
  
  const prev = useCallback(() => {
    setCurrentIndex(prev => {
      const nextIndex = prev - 1;
      // Jump to end when going below 0
      return nextIndex < 0 ? maxIndex : nextIndex;
    });
  }, [maxIndex]);

  useEffect(() => {
    let timer: number;
    
    if (isAutoPlaying) {
      timer = window.setInterval(next, 4000);
    }
    
    return () => clearInterval(timer);
  }, [isAutoPlaying, next]);

  const handleUserInteraction = (action: () => void) => {
    setIsAutoPlaying(false);
    action();
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  return (
    <section className="py-8 md:py-12 lg:py-16" style={{ height: '80vh', width: '80vw', maxWidth:'1400px', margin: '0 auto' }}>
      <div className="h-full w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-semibold text-gray-900 mb-4">
            Latest News
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover how AI-powered email automation is transforming business communication
          </p>
        </div>

        <div className="relative h-[70%] w-full">
          <div className="overflow-hidden rounded-lg h-full">
            <motion.div
              className="flex h-full"
              initial={{ x: 0 }}
              animate={{ 
                x: `${-currentIndex * (100 / itemsToShow)}%`
              }}
              transition={{ 
                type: "spring",
                stiffness: 150,
                damping: 20
              }}
            >
              {extendedItems.map((item, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    width: `${100 / itemsToShow}%`, 
                    flexShrink: 0,
                    padding: '1rem',
                    height: '100%'
                  }}
                >
                  <NewsItem item={item} />
                </div>
              ))}
            </motion.div>
          </div>

          <button
            onClick={() => handleUserInteraction(prev)}
            className="absolute left-0 top-1/2 -translate-y-1/2  bg-white/90 p-3 rounded-full shadow-lg hover:bg-white transition-colors z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>

          <button
            onClick={() => handleUserInteraction(next)}
            className="absolute right-0 top-1/2 -translate-y-1/2  bg-white/90 p-3 rounded-full shadow-lg hover:bg-white transition-colors z-10"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        <div className="flex justify-center mt-8 gap-2">
          {Array.from({ length: newsData.length }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleUserInteraction(() => setCurrentIndex(idx))}
              className={`h-3 rounded-full transition-all duration-300 ${
                currentIndex % newsData.length === idx ? 'w-8 bg-gray-800' : 'w-3 bg-gray-300'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsCarousel;

interface NewsItemProps {
  item: NewsItem;
}

const NewsItem: React.FC<NewsItemProps> = ({ item }) => {
  return (
    <motion.div
      className="bg-white rounded-xl shadow-md overflow-hidden h-full border border-gray-200 flex flex-col"
      whileHover={{ 
        y: window.innerWidth >= 768 ? -8 : 0,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4 md:p-6 flex flex-col h-full">
        <div className="flex items-center mb-4">
          <span className="text-lg font-medium text-blue-600">{item.source}</span>
          <span className="mx-2 text-gray-300">•</span>
          <span className="text-lg text-gray-500">{item.date}</span>
        </div>
        
        <h3 className="text-2xl font-medium text-gray-900 mb-4 line-clamp-2">
          {item.title}
        </h3>
        
        <p className="text-gray-600 mb-6 text-lg line-clamp-3 flex-grow">
          {item.excerpt}
        </p>
        
        <motion.a
          href={item.link}
          className="inline-flex items-center text-lg font-medium text-blue-600 hover:text-blue-800 mt-auto"
          whileHover={{ x: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          Read More
          <svg className="w-5 h-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </motion.a>
      </div>
    </motion.div>
  );
};
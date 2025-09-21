import { Feature } from "../types";

export const featuresData: Feature[] = [
  {
    id: 1,
    title: "Automated Email Replies",
    description:
      "Take the hassle out of replying to emails with AI-driven automation. This feature integrates DeepSeek and HuggingFace to craft human-like responses. Securely connect your Gmail via OAuth for peace of mind and convenience.",
    image:
      "https://res.cloudinary.com/dwrqohfya/image/upload/v1745180274/2_g5tixn.png",
    details: [
      {
        title: "Smart Reply Engine",
        content:
          "Powered by DeepSeek API on HuggingFace Inference, this engine understands context and tone. It crafts accurate, intelligent replies tailored to each email.",
      },
      {
        title: "Secure OAuth Access",
        content:
          "Connect your Gmail without sharing passwords. OAuth integration ensures end-to-end encryption and compliance with modern security standards.",
      },
      {
        title: "Toggle Auto-Reply",
        content:
          "Easily switch automated replies on or off from your dashboard. You stay in control at all times with just a single click.",
      },
    ],
  },
  {
    id: 2,
    title: "Customizable Prompt Logic",
    description:
      "Fine-tune how your AI responds by editing the backend prompt logic. Whether it’s tone, language, or structure, you can personalize it to fit your style. This is AI tailored exactly the way you want it.",
    image:
      "https://res.cloudinary.com/dwrqohfya/image/upload/v1745180274/3_ktoxxl.png",
    details: [
      {
        title: "Edit Prompts Easily",
        content:
          "Modify the system prompt that defines your AI’s behavior with ease. Whether casual or formal, you set the tone and rules.",
      },
      {
        title: "Real-Time Updates",
        content:
          "No need to restart or reload — any changes to the prompt logic take effect instantly. It’s fast, seamless, and responsive.",
      },
      {
        title: "Version History",
        content:
          "Every change is tracked and saved. Easily revert to a previous version if your latest tweaks don’t hit the mark.",
      },
    ],
  },
  {
    id: 3,
    title: "Email Insights & Analytics",
    description:
      "Understand your inbox like never before with advanced analytics. Get visibility into trends, bottlenecks, and agent performance. Actionable insights help you optimize every response.",
    image:
      "https://res.cloudinary.com/dwrqohfya/image/upload/v1745180273/1_sc6tue.png",
    details: [
      {
        title: "Email Categorization",
        content:
          "Automatically organize incoming emails into logical categories like support, sales, and spam. It makes browsing and prioritization effortless.",
      },
      {
        title: "Response Metrics",
        content:
          "Track performance across key metrics like resolution rate, containment rate, and customer satisfaction. Stay on top of your support game.",
      },
      {
        title: "Improvement Suggestions",
        content:
          "AI analyzes reply effectiveness and suggests ways to improve. Spot inefficiencies and level up your agent’s capabilities.",
      },
    ],
  },
];

const FeatureShowcase = () => {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto bg-white">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Powerful Features for Your Inbox
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Enhance your email experience with intelligent automation and deep
          insights
        </p>
      </div>

      <div className="flex flex-col gap-24">
        {featuresData.map((feature, index) => (
          <FeatureItem
            key={feature.id}
            feature={feature}
            isReversed={index % 2 !== 0}
          />
        ))}
      </div>
    </div>
  );
};

export default FeatureShowcase;

import { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

interface FeatureItemProps {
  feature: Feature;
  isReversed: boolean;
}

const FeatureItem = ({ feature, isReversed }: FeatureItemProps) => {
  const [openAccordions, setOpenAccordions] = useState<Record<number, boolean>>(
    {}
  );

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: "-50px 0px",
  });

  const toggleAccordion = (index: number) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
        duration: 0.5,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1.0] },
    },
  };

  const imageVariants = {
    hidden: {
      opacity: 0,
      x: isReversed ? -50 : 50,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1.0],
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      className={`flex flex-col ${
        isReversed ? "md:flex-row-reverse" : "md:flex-row"
      } items-stretch gap-10`}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={containerVariants}
    >
      {/* Image */}
      <motion.div className="w-full md:w-1/2" variants={imageVariants}>
        <img
          src={feature.image}
          alt={feature.title}
          className="w-full h-full rounded-xl shadow-lg object-cover"
        />
      </motion.div>

      {/* Text Section */}
      <div className="w-full md:w-1/2 flex flex-col justify-between">
        {/* Top Text */}
        <motion.div variants={itemVariants}>
          <h2 className="text-3xl font-bold mb-3 text-gray-900">
            {feature.title}
          </h2>
          <p className="text-lg text-gray-700 mb-6">{feature.description}</p>
        </motion.div>

        {/* Bottom Accordions */}
        <motion.div className="space-y-4" variants={itemVariants}>
          {feature.details.map((item, idx) => (
            <FeatureAccordion
              key={idx}
              title={item.title}
              content={item.content}
              isOpen={!!openAccordions[idx]}
              toggle={() => toggleAccordion(idx)}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

import { AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface AccordionProps {
  title: string;
  content: string;
  isOpen: boolean;
  toggle: () => void;
}

const FeatureAccordion = ({
  title,
  content,
  isOpen,
  toggle,
}: AccordionProps) => {
  return (
    <div className="border-t border-gray-100 py-3">
      <div
        className="flex justify-between items-center cursor-pointer group"
        onClick={toggle}
      >
        <h4 className="text-base font-medium text-gray-800 group-hover:text-gray-900">
          {title}
        </h4>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{
            duration: 0.3,
            ease: [0.25, 0.1, 0.25, 1.0],
          }}
        >
          <ChevronDown
            size={18}
            className="text-gray-500 group-hover:text-gray-700"
          />
        </motion.div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="overflow-hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: 1,
              height: "auto",
              transition: {
                height: { duration: 0.3 },
                opacity: { duration: 0.25, delay: 0.1 },
              },
            }}
            exit={{
              opacity: 0,
              height: 0,
              transition: {
                height: { duration: 0.2 },
                opacity: { duration: 0.15 },
              },
            }}
          >
            <p className="mt-2 text-sm text-gray-600 pb-1">{content}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

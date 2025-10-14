import { Feature } from "../types";

export const featuresData: Feature[] = [
  {
    id: 1,
    title: "Context-Aware Email Intelligence",
    description:
      "Your agent doesn’t just reply — it understands. By combining RAG, memory, and reasoning, it crafts human-like, contextually precise responses drawn from past threads, attachments, and your communication style.",
    image:
      "https://res.cloudinary.com/dwrqohfya/image/upload/v1745180274/1_sc6tue.png",
    details: [
      {
        title: "RAG-Powered Understanding",
        content:
          "Retrieval-Augmented Generation with Qdrant ensures replies are contextually accurate, grounded in prior conversations, documents, and uploaded files.",
      },
      {
        title: "Persistent Conversational Memory",
        content:
          "With Mem0 + Neo4j, the agent builds a memory graph — remembering user preferences, tone, and relationships to deliver consistent responses.",
      },
      {
        title: "Adaptive Tone and Intent",
        content:
          "The agent mirrors your communication tone — professional, casual, or concise — adapting intelligently to the thread’s context.",
      },
    ],
  },
  {
    id: 2,
    title: "Agentic Workflows & Tool Use",
    description:
      "Powered by LangChain and LangGraph, the agent reasons like a workflow engine — planning multi-step actions, executing tools, and managing emails on your behalf.",
    image:
      "https://res.cloudinary.com/dwrqohfya/image/upload/v1745180274/2_g5tixn.png",
    details: [
      {
        title: "Autonomous Tool Execution",
        content:
          "The agent can read emails, summarize threads, or draft replies automatically — deciding which tools to invoke through reasoning.",
      },
      {
        title: "LangGraph Multi-Node Planning",
        content:
          "Each workflow is built as a dynamic graph of reasoning nodes — enabling branching logic, retries, and adaptive behavior.",
      },
      {
        title: "Secure Gmail Integration",
        content:
          "OAuth-based Gmail access ensures all actions — from reading to sending emails — are fully secure and user-consented.",
      },
    ],
  },
  {
    id: 3,
    title: "Real-Time Collaboration & Control",
    description:
      "Stay in command while your agent works. Chat, guide, and observe every action in real time — from message generation to file processing — all through an interactive dashboard.",
    image:
      "https://res.cloudinary.com/dwrqohfya/image/upload/v1745180274/3_ktoxxl.png",
    details: [
      {
        title: "Chat-Based Control Interface",
        content:
          "Talk to your email agent to summarize emails, find conversations, or instruct it to reply — all through a natural language chat.",
      },
      {
        title: "Real-Time WebSocket Updates",
        content:
          "Every event — from mail fetch to AI reply generation — streams instantly to your dashboard for a live, fluid experience.",
      },
      {
        title: "File-Aware Context",
        content:
          "Upload PDFs, docs, or images to enrich the agent’s understanding. Files are processed securely and automatically deleted from S3 after use.",
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

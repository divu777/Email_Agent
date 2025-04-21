import  { useEffect, useState } from 'react';
import { Code2, Sparkles, MessageSquare } from 'lucide-react';
import {  useSelector } from 'react-redux';
import axios from 'axios';
import { motion } from 'framer-motion';
import { config } from '../config';
import { RootState } from '../store/store';

interface PromptOption {
  id: string;
  label: string;
  description: string;
  prompt: string;
}

const PromptView = () => {
  const defaultOptions: PromptOption[] = [
    {
      id: 'Friendly',
      label: 'Friendly',
      description: 'Warm and approachable responses',
      prompt: '',
    },
    {
      id: 'Professional',
      label: 'Professional',
      description: 'Formal and business-oriented',
      prompt: '',
    },
    {
      id: 'Casual',
      label: 'Casual',
      description: 'Relaxed and conversational',
      prompt: '',
    },
  ];

  const defaultPromptId = 'Professional';
  const [promptOptions, setPromptOptions] = useState<PromptOption[]>(defaultOptions);
  const { userId } = useSelector((root: RootState) => root.authreducer);
  const [selectedPrompt, setSelectedPrompt] = useState<string>(defaultPromptId);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [hasChanged, setHasChanged] = useState<boolean>(false);

  const handlePromptChange = (promptId: string) => {
    if (promptId === selectedPrompt && hasChanged) {
      setSelectedPrompt(defaultPromptId);
      setCurrentPrompt(promptOptions.find(p => p.id === defaultPromptId)?.prompt || '');
      setHasChanged(false);
    } else {
      const selected = promptOptions.find((opt) => opt.id === promptId);
      if (selected) {
        setSelectedPrompt(promptId);
        setCurrentPrompt(selected.prompt);
        setHasChanged(true);
      }
    }
  };

  const handleApplyClick = async () => {
    try {
      const result = await axios.post(`${config.BACKEND_URL}/api/v1/prompt/setprompt`, {
        prompt: selectedPrompt,
        userId,
      });
      if (!result.data) {
        alert('Failed to set prompt');
      } else {
        alert('Prompt Style Updated Successfully');
        setHasChanged(false);
      }
    } catch (err) {
      console.error('Apply Error:', err);
    }
  };

  const getAllPrompts = async () => {
    try {
      const { data } = await axios.get(`${config.BACKEND_URL}/api/v1/prompt/getPrompts`);
      const mappedPrompts = defaultOptions.map((opt) => ({
        ...opt,
        prompt: data.data[opt.id] || '',
      }));
      setPromptOptions(mappedPrompts);
      const defaultPrompt = mappedPrompts.find(p => p.id === defaultPromptId)?.prompt || '';
      setCurrentPrompt(defaultPrompt);
    } catch (err) {
      console.error('Error fetching prompts:', err);
    }
  };

  useEffect(() => {
    if (userId) {
      getAllPrompts();
    }
  }, [userId]);

  return (
    <motion.div
      className="max-w-4xl mx-auto p-4"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Assistant Configuration</h1>
        <p className="text-gray-600">
          Your email assistant is powered by the DeepSeek language model, designed to understand and respond
          to emails based on your selected communication style. Choose from our preset styles below or wait
          for our upcoming custom prompt feature.
        </p>
      </div>

      <motion.div
        className="bg-white rounded-2xl shadow-md p-6 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center mb-4">
          <Code2 className="w-5 h-5 text-blue-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Current Prompt</h2>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">{currentPrompt}</pre>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {promptOptions.map((option) => (
          <motion.button
            key={option.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300 }}
            onClick={() => handlePromptChange(option.id)}
            className={`p-4 rounded-xl border-2 shadow-sm transition-all duration-200 ${
              selectedPrompt === option.id && hasChanged
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            }`}
          >
            <h3 className="font-semibold text-gray-900 mb-1">{option.label}</h3>
            <p className="text-sm text-gray-600">{option.description}</p>
          </motion.button>
        ))}
      </div>

      <div className="mb-8">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleApplyClick}
          disabled={!hasChanged}
          className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
            hasChanged
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Apply Prompt
        </motion.button>
      </div>

      <motion.div
        className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center mb-4">
          <Sparkles className="w-5 h-5 text-purple-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Custom Prompts Coming Soon!</h2>
        </div>
        <p className="text-gray-600 mb-4">
          Soon you'll be able to create and fine-tune your own custom prompts, allowing for more
          personalized email interactions tailored to your specific needs.
        </p>
        <div className="flex items-center text-sm text-purple-600">
          <MessageSquare className="w-4 h-4 mr-1" />
          <span>Stay tuned for updates</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PromptView;

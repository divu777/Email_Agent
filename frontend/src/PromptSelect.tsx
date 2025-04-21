import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './store/store';
import { useEffect, useState } from 'react';
import {  setPrompt } from './store/slices/oauthSlice';
import { useNavigate } from 'react-router-dom';
import { config } from './config';
import { motion } from 'framer-motion';

const prompts = [
  { id: 1, label: 'Casual', icon: '🧢' },
  { id: 2, label: 'Professional', icon: '💼' },
  { id: 3, label: 'Friendly', icon: '😊' },
];

const PromptSelect = () => {
  const dispatch= useDispatch();
  const navigate=useNavigate();
  const {onboarding_complete} = useSelector((state:RootState)=>state.OAuthreducer);
  const [loading,setLoading]=useState(true);
  const {userId}= useSelector((state:RootState)=>state.authreducer);
  const handleSelect = async (promptLabel: string) => {
    try {
      if(userId && !onboarding_complete){
        const result =await axios.post(`${config.BACKEND_URL}/api/v1/prompt/setprompt`, { prompt: promptLabel,userId });
      console.log(JSON.stringify(result)+"set prompttt");
      if(!result.data){
        alert('Failed to set prompt');
      }else{
        dispatch(setPrompt(result.data.data));
        navigate("/dashboard");
      }
      }else{
          navigate("/");
      }
      
    } catch (error) {
      console.error('Error setting prompt:', error);
      alert('Failed to set prompt');
    }
  };

  useEffect(()=>{
    setLoading(false);
    if(userId && onboarding_complete){
      navigate("/dashboard")
    }
        
  },[userId,onboarding_complete])


 


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-xl font-semibold text-gray-600 animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white overflow-hidden px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 bg-white shadow-2xl rounded-3xl p-10 max-w-md w-full text-center"
      >
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-3xl font-bold text-gray-800 mb-3"
        >
          Choose Your Style
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-gray-600 mb-6"
        >
          Select the tone you'd like AI to use in your emails.
        </motion.p>
        <div className="space-y-4">
          {prompts.map((prompt, index) => (
            <motion.div
              key={prompt.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
              className="flex items-center justify-between bg-indigo-100 hover:bg-indigo-200 text-gray-800 py-3 px-5 rounded-xl cursor-pointer transition font-medium shadow-sm"
              onClick={() => handleSelect(prompt.label)}
            >
              <span className="text-xl">{prompt.icon}</span>
              <span className="text-lg">{prompt.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default PromptSelect;

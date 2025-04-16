import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './store/store';
import { useEffect, useState } from 'react';
import { signout } from './store/slices/authSlice';
import { disconnect, setPrompt } from './store/slices/oauthSlice';
import { useNavigate } from 'react-router-dom';
import { config } from './config';

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
      const result =await axios.post(`${config.BACKEND_URL}/api/v1/prompt/setprompt`, { prompt: promptLabel,userId });
      if(!result.data){
        alert('Failed to set prompt');
            }else{
        
      }
      dispatch(setPrompt(result.data));
      navigate("/gmail");
    } catch (error) {
      console.error('Error setting prompt:', error);
      alert('Failed to set prompt');
    }
  };

  useEffect(()=>{
    if (!userId) {
          dispatch(signout());
          dispatch(disconnect());
          navigate("/");
          return;
        }

        if(onboarding_complete){
          navigate("/gmail");
        }

        setLoading(false);
  },[userId,onboarding_complete])

  if(loading){
    return(
      <div>
        Loading....
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-black">
      <div className="bg-gray-900 p-8 rounded-lg shadow-lg text-center w-80">
        <h2 className="text-white text-2xl mb-6 font-semibold">Choose Your Style</h2>
        {prompts.map((prompt) => (
          <div
            key={prompt.id}
            className="flex items-center gap-4 bg-gray-800 hover:bg-gray-700 text-white py-3 px-5 rounded-md mb-4 cursor-pointer transition"
            onClick={() => handleSelect(prompt.label)}
          >
            <span className="text-2xl">{prompt.icon}</span>
            <span className="text-lg">{prompt.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromptSelect;


import { useEffect } from 'react'
import Navbar from './components/Navbar'
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { config } from './config';
import { login, signout } from './store/slices/authSlice';
import { connect, disconnect } from './store/slices/oauthSlice';
import { useUser } from '@clerk/clerk-react';

const Landing = () => {
  const {user}=useUser();
  const dispatch= useDispatch();
  const navigate= useNavigate();


  const checkOAuth=async(userId:string)=>{
    console.log("ouath kei andrr")
    const result= await axios.get(`${config.BACKEND_URL}/api/v1/mail/checkOAuth/${userId}`);

    console.log(JSON.stringify(result)+"resss");
    return result.data;
}

  useEffect(()=>{
    const fetchData=async()=>{
        if(user){
            dispatch(login({userId:user.id,firstName:user.firstName,lastName:user.lastName,email:user.primaryEmailAddress?.emailAddress}))
            const oauthacess= await checkOAuth(user.id);
            console.log(JSON.stringify(oauthacess)+"oauth ka pahad ");
            if(!oauthacess.data){
                dispatch(disconnect())
                navigate("/connect-gmail");
            }else{    
                dispatch(connect(oauthacess.data))
                navigate("/dashboard")
            }

            

        }else{
        dispatch(signout())
        }
    }

    if(user){
        fetchData()
    }
},[user])
  return (
    <div className='bg-amber-600 h-screen w-screen'>
        <div className='h-1/12 bg-pink-400'>
      <Navbar />
     
      </div>
      <div className='h-11/12 bg-amber-300'>
      <h1>
        hello
      </h1>
      </div>
    </div>
  )
}

export default Landing

import axios from 'axios';
import  { useEffect, useState } from 'react'

const Login = () => {
    const [authurl,SetAuthUrl]=useState(null);
    useEffect(()=>{
        const getAuthuRL=async()=>{
            const response = await axios.get(`${config.BACKEND_URL}/api/v1/google/authorizationUrl`,{
                withCredentials:true
            })
            SetAuthUrl(response.data)
        }
        getAuthuRL()
    },[])


    if(!authurl){
        return( 
            <div>
                getting auth url wait
            </div>
        )
    }

    const handleClick = () => {
  window.location.href = authurl;
};

  return (

    <div className='flex w-screen h-screen justify-center items-center'>
        <button className='bg-black text-white p-5 rounded-xl '
        onClick={()=>handleClick()}
        >
        Login with google Go
        </button>
    </div>
  )
}

export default Login

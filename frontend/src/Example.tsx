import { SignInButton, UserButton, useUser } from "@clerk/clerk-react"
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { login, signout } from "./store/slices/authSlice";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { connect, disconnect } from "./store/slices/oauthSlice";
import { config } from "./config";

export default function Example() {
    const { isSignedIn, user, isLoaded } = useUser()
    const dispatch= useDispatch();
    const navigate= useNavigate();
    const checkOAuth=async(userId:string,email: string)=>{
        console.log("ouath kei andrr")
        const result= await axios.get(`${config.BACKEND_URL}/api/v1/mail/checkOAuth/${userId}`);

        console.log(JSON.stringify(result)+"resss");
        return result.data;
    }

    useEffect(()=>{
        const fetchData=async()=>{
            if(user){
                dispatch(login({userId:user.id,firstName:user.firstName,lastName:user.lastName,email:user.primaryEmailAddress?.emailAddress}))
                const oauthacess= await checkOAuth(user.id,user.primaryEmailAddress!.emailAddress);
                console.log(JSON.stringify(oauthacess)+"oauth ka pahad ");
                if(!oauthacess.data){
                    dispatch(disconnect())
                    const result=await axios.post(`${config.BACKEND_URL}/api/v1/mail/getAuthUrl`,{ userId: user.id , email:user.emailAddresses[0].emailAddress});
                    const url=result.data.url;
                    if(url){
                        window.location.href = url;
                    }
                    else{
                        console.log("no url recieved show eror in getting the access to your email")
                        alert("no url recieved");
                    }
                    
                }else{
                
                    dispatch(connect(oauthacess.data))
                    navigate("/gmail")
                }
    
                
    
            }else{
            dispatch(signout())
            }
        }

        if(user){
            fetchData()
        }
    },[user])
  
    if (!isLoaded) {
      return <div>Loading...</div>
    }
  
    if (!isSignedIn) {
    return(
        <>
        
        <div>

        <SignInButton />

        </div>
        </>
    )
    }
  
    return( 
    <>
    <UserButton />
    <div>Hello {user.firstName}!</div>
    </>

    )
  }
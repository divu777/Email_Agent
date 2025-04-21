import { createSlice } from "@reduxjs/toolkit";

const initialState={
    connected:false,
    auto_reply:true,
    onboarding_complete:false
}

export const OAuthSlice = createSlice({
    name:'OAuth',
    initialState,
    reducers:{
        connectMail:(state,action)=>{
            console.log(JSON.stringify(action.payload)+"payyy");
            state.connected=true
            state.auto_reply = action.payload?.auto_reply ?? state.auto_reply;
            state.onboarding_complete = action.payload?.onboarding_complete ?? state.onboarding_complete
        },
        disconnectMail:()=>{
            return initialState
        },
        setPrompt:(state,action)=>{
            state.connected=true
            state.onboarding_complete=action.payload.onboarding_complete ?? state.onboarding_complete
        },
        updateAutoReply:(state,action)=>{
            state.auto_reply=action.payload?.auto_reply ?? state.auto_reply;
        }
    }

})

export const {connectMail,disconnectMail,setPrompt,updateAutoReply}=OAuthSlice.actions;

export const OAuthreducer=OAuthSlice.reducer
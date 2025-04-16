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
        connect:(state,action)=>{
            state.connected=true
            state.auto_reply = action.payload?.auto_reply ?? state.auto_reply;
            state.onboarding_complete = action.payload?.onboarding_complete ?? state.onboarding_complete
        },
        disconnect:(state)=>{
            state.connected=false
        },
        setPrompt:(state,action)=>{
            state.onboarding_complete=action.payload.onboarding_complete ?? state.onboarding_complete
        }
    }

})

export const {connect,disconnect,setPrompt}=OAuthSlice.actions;

export const OAuthreducer=OAuthSlice.reducer
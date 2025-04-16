import { createSlice } from "@reduxjs/toolkit";

const initialState=[
    {
        id:0,
        subject:"",
        createdAt:new Date(),
        updatedAt:new Date(),
        read:false,
    }
]

const emailThreadSlice=createSlice({
    name:'emailThread',
    initialState,
    reducers:{
        setEmailThread:(state,action)=>{
            return action.payload.map((emailThread:any) => ({
                id: emailThread.id,
                subject: emailThread.subject,
                createdAt: new Date(emailThread.createdAt),
                updatedAt: new Date(emailThread.last_updated),
                read: false
            }));

        },
        addEmailThread:(state,action)=>{
            state.push({
                id: action.payload.id,
                subject: action.payload.subject,
                createdAt: new Date(action.payload.createdAt),
                updatedAt: new Date(action.payload.last_updated),
                read: false
            })

        },
        updateEmailThread:(state,action)=>{
            state.map((email)=>{
                if(email.id==action.payload.threadId){
                    email.read=!email.read
                }
            })
        }
    }
});

export const {setEmailThread,addEmailThread,updateEmailThread}= emailThreadSlice.actions
export const emailThreadReducer = emailThreadSlice.reducer
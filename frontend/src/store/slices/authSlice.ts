import { createSlice } from "@reduxjs/toolkit"

interface OAuth{
    status:Boolean,
    userId:string,
    firstName:string,
    lastName:string,
    email:string
}
const initialState:OAuth={
    status: false,
    userId: "",
    firstName: "",
    lastName: "",
    email: ""
}
export const authSlice=createSlice({
    name:'auth',
    initialState,
    reducers:{
        login:(state,action)=>{
            state.status=true,
            state.userId=action.payload.userId,
            state.firstName=action.payload.firstName,
            state.lastName=action.payload.lastName
            state.email=action.payload.email
        },
        logout:(state)=>{
            state.status=false,
            state.userId="",
            state.firstName="Guest",
            state.lastName="User",
            state.email=""
        },
    }
})


export const {login,logout}=authSlice.actions


export  const authreducer = authSlice.reducer;


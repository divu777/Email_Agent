import { createSlice } from "@reduxjs/toolkit"

const initialState={
    status:false,
    userId:"",
    firstName:"Guest",
    lastName:"User",
    email:""

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
        signout:(state)=>{
            state.status=false,
            state.userId="",
            state.firstName="Guest",
            state.lastName="User",
            state.email=""
        },
    }
})


export const {login,signout}=authSlice.actions


export  const authreducer = authSlice.reducer;


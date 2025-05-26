import express from 'express'
import { GoogleOAuthManager } from '../../google';
import { randomUUIDv7 } from 'bun';


const router=express.Router()


router.get("/authorizationUrl",(req,res)=>{
    try {

        const randomId = randomUUIDv7()
        const {url ,state} = GoogleOAuthManager.getAuthorizationURL(randomId);
        req.session.state=state

        res.redirect(url);
        
        
    } catch (error) {
        console.log("Error in gettting Authorization URl ",error);
        res.json({
            message:"Error in getting Auth URl",
            success:false
        })
        return
    }
})

router.get("/emails",(req,res)=>{
    
})



export default router
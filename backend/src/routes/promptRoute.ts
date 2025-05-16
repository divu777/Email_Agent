import e from "express"
import { db } from "../db"
import { prompts } from "../genai/prompts/prompts";


const router = e.Router()

router.post("/setprompt",async(req,res)=>{
    try {
        const {userId,prompt}=req.body;

        const result=await db.oAuth.update({
            where:{
                userId
            },
            data:{
                prompt,
                onboarding_complete:true
            }
        })

        if(!result){
            return res.status(200).json({
                message:"Could Not update userId",
                data:false
            })
        }


        return res.status(200).json({
            message:"Added prompt choice for the user, Onboarding complete",
            data:result
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"error in setting the prompt for the userId"
        })
    }
})


router.get("/getPrompts",(req,res)=>{
    try {

        const result=prompts
        if(!result){
            return res.status(200).json({
                message:"error in getting the prompts",
                success:false,
                status:200
            });
        }

        return res.status(200).json({
            message:"Prompts fetched Successfully",
            success:true,
            data:result
        })
        
    } catch (error) {
        console.log("Error in getting all the Prompts");
        return res.json({
            message:"error in getting all the prompts",
            success:false
        })
    }
})

router.get("/getPrompts/:userId",async(req,res)=>{
    try{
        const {userId}= req.params
        const result=await db.oAuth.findUnique({
            where:{
                userId
            }
        });

        if(!result){
            return res.status(200).json({
                message:"No Prompt found for this User"
            })
        }

        if(result && result.prompt){
            
        }

    }catch(err){
        
        console.log(err)
        return res.status(500).json({
            message:"Error in getting the Prompt",

        })
    }
})


export default router
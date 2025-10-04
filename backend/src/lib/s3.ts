import  axios  from 'axios';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner"

const SPACES_KEY = process.env.DIGITAL_OCEAN_ACCESS_KEY
const SPACES_SECRET = process.env.DIGITAL_OCEAN_SECRET_KEY;
const SPACE_NAME = "email-agent";
const SPACE_REGION = "blr1"; 
const SPACE_ENDPOINT = `https://${SPACE_REGION}.digitaloceanspaces.com`;

const s3client = new S3Client({
    endpoint:SPACE_ENDPOINT!,
    region: SPACE_REGION,
        forcePathStyle: true, 

    credentials:{
        accessKeyId:SPACES_KEY!,
        secretAccessKey:SPACES_SECRET!
    }
})


const uploadFilesToS3=async(filename:string,file: any)=>{
    const command = new PutObjectCommand({
    Bucket:SPACE_NAME,
    Key:filename,
    Body:file,
    ACL:"public-read"
})





try {
    await s3client.send(command);
    // const url = await generatePreSignedURL('upload/file1','pdf')
    
    console.log("File uploaded successfully to DigitalOcean Space!");
} catch (error) {
    console.error("Error uploading file:", error);
}}


export const generatePreSignedURL= async(filename:string,contentType: any)=>{

    const command = new PutObjectCommand({
        Bucket:SPACE_NAME,
        Key:filename,
        ContentType:contentType,
    })
    const url =await  getSignedUrl(s3client,command,{expiresIn:3600})

    return url
}

export const deleteFile = async(fileName:string)=>{
    const command = new DeleteObjectCommand({
        Bucket:SPACE_NAME,
        Key:fileName
    })

    const data= await s3client.send(command)
    console.log(JSON.stringify(data)+"--------------deleted")
    return data ? true : false
}


    // const url = await generatePreSignedURL('upload/file1','txt')
    
    // console.log("File uploaded successfully to DigitalOcean Space!"+url);

    // await axios.put(url,{
    //     file:'hello.txt'
    // },{
    //     headers:{
    //         "Content-Type":"txt"
    //     }
    // })

export const getFile = async(fileName:string)=>{
    const command = new GetObjectCommand({
        Bucket:SPACE_NAME,
        Key:fileName
    })

    const file = await s3client.send(command);
    //console.log(JSON.stringify(file))
    //console.log(file)

    const streamToBuffer = (stream:any)=>{
        return new Promise((resolve,reject)=>{
            const chunks:Buffer[] = []
            stream.on('data',(chunk:Buffer)=>chunks.push(chunk))
            stream.on('error', reject);
            stream.on('end', () => resolve(Buffer.concat(chunks)));
        })

    }
    
    const fileBuffer = await streamToBuffer(file.Body)
    return fileBuffer
}


import  jwt, { type JwtPayload }  from 'jsonwebtoken';
import { WebSocketServer } from "ws";
import config from "../config";
import { graph } from "../ai/langgraph";
import { prisma } from '../../prisma';
const wss = new WebSocketServer({
  port: config.WEBSOCKET_PORT,
});

async function verifyToken(token:string){
  const decode = jwt.verify(token,config.JWT_SECRET!) as JwtPayload

  if(!decode || !decode.email || !decode.id){
    console.log("unauthorized token")
    return {
      valid:false,
    }
  }

  const messagesExceeded = await prisma.user.findUnique({
    where:{
      id:decode.id
    },
    select:{
      messages:true
    }
  })

  if(!messagesExceeded){
    return{
      valid:false
    }
  }

  if(messagesExceeded.messages.length>=20){
    return{
      valid:false
    }
  }

  return {
    valid:true,
    data:{
      id:decode.id,
      email:decode.emai
    }
  }

}



wss.on("connection", async(socket,req) => {
  console.log("connected");
        const cookies = req.headers.cookie; 

        const parts = cookies?.split('email-agent=')!

        if(parts && parts?.length<1){
          socket.send("Unauthorized user, zaada smart mat bnn.")
          return
        }
        const ourcookie = parts.pop()?.split("; ").shift()!

        const verifiedToken = await verifyToken(ourcookie)

        if(!verifiedToken.valid){
          socket.send("Unauthorized user, zaada smart mat bnn.")
          return 
        }



  socket.on("message", async (data: string) => {



    //console.log("Recieved : " + data);
    const recievedData = JSON.parse(data);
   
    const messages = recievedData.messages;
    const fileName = recievedData.fileName
    if(messages.length==0){
      socket.send('nice try.')
      return
    }

    const latestMsg = messages[messages.length-1];


    const message = await prisma.message.create({
      data:{
        userId:verifiedToken.data?.id,
        content:latestMsg.content,
        role:latestMsg.role
      }
    })


    for await (const chunk of await graph.stream(
      {
        user_query: messages[messages.length-1].content,
        messages: messages,
        fileName : fileName? fileName : null,
        related_docs:null,
        embeddings_created:null
      },
      {
        streamMode: "updates",
      }
    )) {
     // console.log(JSON.stringify(chunk)+"--------------->chunk");


      if(chunk.chat_node || chunk.rag_llm){
        const llm_node = chunk.chat_node ? chunk.chat_node : chunk.rag_llm
        const lastMsg = llm_node?.messages[llm_node?.messages.length - 1]!;
       // console.log(lastMsg.content + "---------->/n");
        const message = await prisma.message.create({
          data:{
            userId:verifiedToken.data?.id,
            content:lastMsg.content as string,
            role: lastMsg.getType()=='ai' ? 'ai' : 'human'
          }
        })
        if (lastMsg.getType() == "ai") {
          
          
          socket.send(
            JSON.stringify({
              content: lastMsg.content,
              role: "assistant",
              id: recievedData.newMsgId,
            })
          );
        }
      }
    }
    });
});

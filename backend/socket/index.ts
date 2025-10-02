import  jwt, { JwtPayload }  from 'jsonwebtoken';
import { WebSocketServer } from "ws";
import config from "../src/config";
import { graph } from "../src/ai/langgraph";
import { de } from 'zod/v4/locales';
const wss = new WebSocketServer({
  port: config.WEBSOCKET_PORT,
});

function verifyToken(token:string){
  const decode = jwt.verify(token,config.JWT_SECRET!) as JwtPayload

  if(!decode || !decode.email || !decode.id){
    console.log("unauthorized token")
    return {
      valid:false,
    }
  }

  return {
    valid:true,
    data:{
      id:decode.id,
      email:decode.emai
    }
  }


  return true
}



wss.on("connection", (socket,req) => {
  console.log("connected");
        const cookies = req.headers.cookie; 

        const parts = cookies?.split('email-agent=')!

        if(parts && parts?.length<1){
          socket.send("Unauthorized user, zaada smart mat bnn.")
          return
        }
        const ourcookie = parts.pop()?.split("; ").shift()!

        const verifiedToken = verifyToken(ourcookie)

        if(!verifiedToken){
          socket.send("Unauthorized user, zaada smart mat bnn.")
          return 
        }



  socket.on("message", async (data: string) => {



    console.log("Recieved : " + data);
    const recievedData = JSON.parse(data);
   
    const messages = recievedData.messages;

    for await (const chunk of await graph.stream(
      {
        user_query: messages[messages.length-1].content,
        messages: messages,
      },
      {
        streamMode: "values",
      }
    )) {
      const lastMsg = chunk.messages[chunk.messages.length - 1];
      console.log(lastMsg.content + "---------->/n");
      if (lastMsg.getType() == "ai") {

        socket.send(
          JSON.stringify({
            content: lastMsg.content,
            type: "assistant",
            id: recievedData.newMsgId,
          })
        );
      }
    }
  });
});

import  jwt, { type JwtPayload }  from 'jsonwebtoken';
import { WebSocketServer, type WebSocket } from "ws";
import { Command } from "@langchain/langgraph";
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
      email:decode.email
    }
  }

}



// consumes a graph stream, forwarding final answers and pausing on interrupts.
// shared by both the initial invoke and the approval-resume path.
async function consumeGraphStream(
  socket: WebSocket,
  userId: string,
  msgId: string,
  chatId: string,
  streamIterable: AsyncIterable<any>
) {
  for await (const chunk of streamIterable) {
    if (chunk.__interrupt__) {
      const interruptValue = chunk.__interrupt__[0]?.value;

      await prisma.message.create({
        data: {
          userId,
          chatId,
          content: JSON.stringify(interruptValue),
          role: "toolcall",
        },
      });

      socket.send(
        JSON.stringify({
          type: "approval_request",
          id: msgId,
          ...interruptValue,
        })
      );
      return;
    }

    if (chunk.chat_node || chunk.rag_llm) {
      const llm_node = chunk.chat_node ? chunk.chat_node : chunk.rag_llm;
      const lastMsg = llm_node?.messages[llm_node?.messages.length - 1]!;

      await prisma.message.create({
        data: {
          userId,
          chatId,
          content: lastMsg.content as string,
          role: lastMsg.getType() == "ai" ? "ai" : "human",
        },
      });

      if (lastMsg.getType() == "ai") {
        socket.send(
          JSON.stringify({
            type: "final",
            content: lastMsg.content,
            role: "assistant",
            id: msgId,
          })
        );
      }
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

        const userId = verifiedToken.data!.id;

        let chat = await prisma.chat.findFirst({
          where: { userId },
          orderBy: { createdAt: "desc" },
        });
        if (!chat) {
          chat = await prisma.chat.create({ data: { userId } });
        }
        const graphConfig = { configurable: { thread_id: chat.id }, streamMode: "updates" as const };



  socket.on("message", async (data: string) => {



    //console.log("Recieved : " + data);
    const recievedData = JSON.parse(data);

    if (recievedData.type === "approval_response") {
      await prisma.message.create({
        data: {
          userId,
          chatId: chat.id,
          content: JSON.stringify({ approved: recievedData.approved }),
          role: "toolcall",
        },
      });

      await consumeGraphStream(
        socket,
        userId,
        recievedData.id,
        chat.id,
        await graph.stream(
          new Command({ resume: { approved: recievedData.approved } }),
          graphConfig
        )
      );
      return;
    }

    const messages = recievedData.messages;
    const fileName = recievedData.fileName
    if(messages.length==0){
      socket.send('nice try.')
      return
    }

    const latestMsg = messages[messages.length-1];


    await prisma.message.create({
      data:{
        userId,
        chatId: chat.id,
        content:latestMsg.content,
        role:latestMsg.role
      }
    })

   // console.log(JSON.stringify(verifiedToken))


    await consumeGraphStream(
      socket,
      userId,
      recievedData.newMsgId,
      chat.id,
      await graph.stream(
        {
          user_query: messages[messages.length-1].content,
          messages: messages,
          fileName : fileName? fileName : null,
          related_docs:null,
          embeddings_created:null,
          user_email:verifiedToken.data!.email
        },
        graphConfig
      )
    );
    });
});

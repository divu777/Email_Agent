import {WebSocketServer} from 'ws'
import config from "../src/config"
import {graph} from "../src/ai/langgraph"
const wss = new WebSocketServer({
    port:config.WEBSOCKET_PORT
})

wss.on('connection',(socket)=>{
    console.log("connected")
    socket.on('message',async(data:string)=>{
        console.log("Recieved : "+data)
const recievedData = JSON.parse(data)
const message = recievedData.message

for await (const chunk of await graph.stream({
    user_query:"hello how are you",
    messages:[{"role":"user","content":"hello how are you"}]
},{
    streamMode:'values'
})){
    console.log(chunk.messages[chunk.messages.length-1])
    if(chunk.messages[chunk.messages.length-1].getType()=="ai"){
        socket.send(JSON.stringify({"message":chunk.messages[chunk.messages.length-1].content,"type":"ai",id:Date.now()}))
    }


}
    })
})
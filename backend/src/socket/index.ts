import { Server as HTTPServer } from "http";
import { DefaultEventsMap, Server } from "socket.io";
import config from "../config";
let io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;

const socketUsers = new Map(); 

function IOinit(server:HTTPServer) {
  console.log("init hogya")
  io = new Server(4000, {
    cors: {
      origin: config.SOCKET_URL,
      methods: ["GET", "POST"],
    },
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('register', (userId) => {
      if (!socketUsers.has(userId)) {
        socketUsers.set(userId, socket.id);
        console.log('Registered userId:', userId);
      } else {
        console.log('UserId already registered:', userId);
      }
    });

    socket.on('disconnect', () => {
      for (const [userId, id] of socketUsers.entries()) {
        if (id === socket.id) {
          socketUsers.delete(userId);
          console.log('User disconnected:', userId);
          break;
        }
      }
    });
  });
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialized!');
  return io;
}

function getSocketId(userId:any) {
  return socketUsers.get(userId);
}

const settingNewEvent=(emailData: any,eventName:string)=>{
  const userId=emailData.userId;

  const socketId=getSocketId(userId);

  if(socketId){
      getIO().to(socketId).emit(eventName,emailData);
  }else{
      console.log("no socket id got from the map")
  }
}

export { IOinit,settingNewEvent };



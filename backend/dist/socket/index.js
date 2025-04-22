"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingNewEvent = void 0;
exports.IOinit = IOinit;
const socket_io_1 = require("socket.io");
let io;
const socketUsers = new Map();
function IOinit(server) {
    console.log("init hogya");
    io = new socket_io_1.Server(4000, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
        },
    });
    io.on('connection', (socket) => {
        console.log('Socket connected:', socket.id);
        socket.on('register', (userId) => {
            if (!socketUsers.has(userId)) {
                socketUsers.set(userId, socket.id);
                console.log('Registered userId:', userId);
            }
            else {
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
    if (!io)
        throw new Error('Socket.io not initialized!');
    return io;
}
function getSocketId(userId) {
    return socketUsers.get(userId);
}
const settingNewEvent = (emailData, eventName) => {
    const userId = emailData.userId;
    const socketId = getSocketId(userId);
    if (socketId) {
        getIO().to(socketId).emit(eventName, emailData);
    }
    else {
        console.log("no socket id got from the map");
    }
};
exports.settingNewEvent = settingNewEvent;

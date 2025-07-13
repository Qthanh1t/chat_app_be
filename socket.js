const {Server} = require('socket.io');
const Message = require('./models/Message');
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const socketServer = (server) => {
    const io = new Server(server,{
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });
    io.on("connection", (socket) => {
        console.log("Người dùng đã kết nối: " + socket.id);

        socket.on("join", (userId) => {
            socket.join(`user_${userId}`);
            console.log(`✅ User ${userId} đã join room user_${userId}`);
        });

        socket.on("send_message", async (data) => {
            try {
                const {senderId, receiverId, content, type} = data;

                const newMessage = new Message({
                    senderId,
                    receiverId,
                    content,
                    type: type || "text"
                });

                await newMessage.save();

                io.to(`user_${receiverId}`).to(`user_${senderId}`).emit("receive_message", newMessage);
                console.log(`📩 Tin nhắn từ ${senderId} gửi đến ${receiverId}`);
            } catch (err) {
                console.error("❌ Lỗi khi lưu tin nhắn:", err);
            }
        });
        socket.on("disconnect", () => {
            console.log("Người dùng đã ngắt kết nối: " + socket.id);
        });
    });
}

module.exports = socketServer;
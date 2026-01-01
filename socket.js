const { Server } = require('socket.io');
const Message = require('./models/Message');
const Conversation = require('./models/Conversation'); // Import Conversation

const socketServer = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log("Người dùng đã kết nối: " + socket.id);

        // Bước 1: User tham gia các room của HỌ
        socket.on("join", (userId) => {
            // Room cá nhân (để nhận thông báo)
            socket.join(`user_${userId}`);
            console.log(`✅ User ${userId} đã join room user_${userId}`);

            // Tự động join tất cả các conversation room
            Conversation.find({ participants: userId })
                .select('_id')
                .then(conversations => {
                    conversations.forEach(convo => {
                        socket.join(`conversation_${convo._id}`);
                        console.log(`✅ User ${userId} đã join room conversation_${convo._id}`);
                    });
                })
                .catch(err => console.error("Lỗi khi join conversation rooms:", err));
        });

        // Bước 2: Gửi tin nhắn (thay receiverId bằng conversationId)
        socket.on("send_message", async (data) => {
            try {
                // Data bây giờ là { senderId, conversationId, content, type }
                const { senderId, conversationId, content, type } = data;

                // 1. Lưu tin nhắn (giống API)
                const newMessage = new Message({
                    senderId,
                    conversationId,
                    content,
                    type: type || "text"
                });
                await newMessage.save();

                // 2. Cập nhật lastMessage trong Conversation (giống API)
                await Conversation.updateOne(
                    { _id: conversationId },
                    { lastMessage: newMessage._id, lastMessageAt: newMessage.timestamp }
                );

                // 3. Populate thông tin sender
                const populatedMessage = await newMessage.populate('senderId', 'username avatar');

                // 4. Gửi tin nhắn đến TẤT CẢ members trong room của conversation
                io.to(`conversation_${conversationId}`).emit("receive_message", populatedMessage);
                console.log(`📩 Tin nhắn từ ${senderId} gửi đến conversation ${conversationId}`);

            } catch (err) {
                console.error("❌ Lỗi khi xử lý send_message socket:", err);
            }
        });

        socket.on("join_conversation_room", (conversationId) => {
            if (!conversationId) return;
            const roomName = `conversation_${conversationId}`;
            socket.join(roomName);
            console.log(`✅ Socket ${socket.id} đã chủ động join room ${roomName}`);
        });

        socket.on("disconnect", () => {
            console.log("Người dùng đã ngắt kết nối: " + socket.id);
        });
    });
}

module.exports = socketServer;
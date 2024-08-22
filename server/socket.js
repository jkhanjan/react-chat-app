import { disconnect as mongooseDisconnect } from "mongoose";
import { Server as SocketIoServer } from "socket.io";
import Message from "./models/messageModel.js";
import channel from "./models/ChannelModel.js";

const setUpSocket = (server) => {
  const io = new SocketIoServer(server, {
    cors: {
      origin: process.env.ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const userSocketMap = new Map();

  const handleDisconnect = (socket) => {
    console.log(`Client disconnected: ${socket.id}`);
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        console.log(`User ${userId} removed from userSocketMap`);
        break;
      }
    }
  };

  const sendMessage = async (message) => {
    try {
      console.log("Received message to send:", message);

      const createdMessage = await Message.create(message);
      console.log("Message saved to database:", createdMessage);

      const messageData = await Message.findById(createdMessage._id)
        .populate("sender", "id email firstName lastName image color")
        .populate("recipient", "id email firstName lastName image color");

      console.log(
        "Message populated with sender and recipient data:",
        messageData
      );

      const recipientSocketId = userSocketMap.get(message.recipient);
      if (recipientSocketId) {
        console.log(`Sending message to recipient: ${recipientSocketId}`);
        io.to(recipientSocketId).emit("receiveMessage", messageData);
      }

      const senderSocketId = userSocketMap.get(message.sender);
      if (senderSocketId) {
        console.log(`Sending message back to sender: ${senderSocketId}`);
        io.to(senderSocketId).emit("receiveMessage", messageData);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const sendChannelMessage = async (message) => {
    const { channelId, sender, content, messageType, fileUrl } = message;

    const createdMessage = await Message.create({
      sender,
      recipient: null,
      content,
      messageType,
      timeStamp: new Date(),
      fileUrl,
    });
    const messageData = await Message.findById(createdMessage._id)
      .populate("sender", "id email firstName lastName image color")
      .exec();

    await channel.findByIdAndUpdate(channelId, {
      $push: { messages: createdMessage._id },
    });

    const channeles = await channel.findById(channelId).populate("members");
    const finalData = { ...messageData._doc, channelId: channeles._id };

    if (channeles && channeles.members) {
      channeles.members.forEach((member) => {
        const memberSocketId = userSocketMap.get(member._id.toString());
        if (memberSocketId) {
          io.to(memberSocketId).emit("received-channel-message", finalData);
        }
      });
      const adminSocketId = userSocketMap.get(channeles.admin._id.toString());
      if (adminSocketId) {
        io.to(adminSocketId).emit("received-channel-message", finalData);
      }
    }
  };

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      userSocketMap.set(userId, socket.id);
      console.log(`User connected: ${userId} with socket ID: ${socket.id}`);
    } else {
      console.log("User ID not provided during connection.");
    }

    socket.on("sendMessage", sendMessage);
    socket.on("send-channel-message", sendChannelMessage);
    socket.on("disconnect", () => handleDisconnect(socket));
  });
};

export default setUpSocket;

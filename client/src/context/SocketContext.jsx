import { useAppStore } from "@/store";
import { HOST } from "@/utils/constants";
import { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const socket = useRef();
  const { userInfo } = useAppStore();

  useEffect(() => {
    if (userInfo && userInfo.id) {
      socket.current = io(HOST, {
        withCredentials: true,
        query: { userId: userInfo.id },
        transports: ["websocket"],
      });

      socket.current.on("connect", () => {
        console.log("connected to server");
      });

      const handleReceiveMessage = (message) => {
        const {
          selectedChatData,
          selectedChatType,
          addMessage,

          addContactsInDMContacts,
        } = useAppStore.getState();

        if (
          selectedChatType &&
          selectedChatData &&
          (selectedChatData._id === message.sender._id ||
            selectedChatData._id === message.recipient._id)
        ) {
          console.log("message received", message);
          addMessage(message);
        }
      };

      const handleReceiveChannelMessage = (message) => {
        const {
          selectedChatData,
          selectedChatType,
          addMessage,
          addChannelInChannelList,
        } = useAppStore.getState();

        if (
          selectedChatType &&
          selectedChatData &&
          selectedChatData._id === message.channelId
        ) {
          addMessage(message);
        }
        addChannelInChannelList(message);
      };

      socket.current.on("receivedMessage", handleReceiveMessage);
      socket.current.on(
        "received-channel-message",
        handleReceiveChannelMessage
      );

      // Cleanup function
      return () => {
        if (socket.current) {
          socket.current.off("receivedMessage", handleReceiveMessage);
          socket.current.off(
            "received-channel-message",
            handleReceiveChannelMessage
          );
          socket.current.disconnect();
        }
      };
    }
  }, [userInfo?.id]);

  return (
    <SocketContext.Provider value={socket.current}>
      {children}
    </SocketContext.Provider>
  );
};

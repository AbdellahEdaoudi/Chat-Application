import { useEffect, useState } from 'react';
import { io } from "socket.io-client";
import { decryptMessage } from '../utils/encryption';

export const useSocket = (serverUrl, userDetails, setMessages, setOnlineUsers, privateKey) => {
    const [socket, setSocket] = useState(null);
    const [isTyping, setIsTyping] = useState(null); // from user ID

    useEffect(() => {
        if (userDetails) {
            const newSocket = io(serverUrl);
            setSocket(newSocket);

            newSocket.emit("c_user", userDetails._id);

            newSocket.on("getOnlineUsers", (users) => {
                setOnlineUsers(users);
            });

            newSocket.on("receiveMessage", (newMessage) => {
                let msgToProcess = newMessage;
                if (privateKey && newMessage.iv) {
                    msgToProcess = {
                        ...newMessage,
                        message: decryptMessage({ ...newMessage, userId: userDetails._id, fromId: newMessage.from?._id || newMessage.from }, privateKey)
                    };
                }
                setMessages((prev) => {
                    if (prev.some(msg => msg._id === msgToProcess._id)) return prev;
                    return [...prev, msgToProcess];
                });
            });

            newSocket.on("deletedMessage", (id) => {
                setMessages((prev) => prev.filter((msg) => msg._id !== id));
            });

            newSocket.on("updatedMessage", (updatedMsg) => {
                let msgToProcess = updatedMsg;
                if (privateKey && updatedMsg.iv) {
                    msgToProcess = {
                        ...updatedMsg,
                        message: decryptMessage({ ...updatedMsg, userId: userDetails._id, fromId: updatedMsg.from?._id || updatedMsg.from }, privateKey)
                    };
                }
                setMessages((prev) => prev.map((msg) => msg._id === msgToProcess._id ? { ...msg, ...msgToProcess } : msg));
            });

            newSocket.on("chat_cleared", ({ from }) => {
                setMessages((prev) => prev.filter((msg) =>
                    !((msg.from?._id === from && msg.to?._id === userDetails._id) ||
                        (msg.from?._id === userDetails._id && msg.to?._id === from))
                ));
            });

            newSocket.on("user_typing", ({ from }) => {
                setIsTyping(from);
            });

            newSocket.on("user_stop_typing", ({ from }) => {
                setIsTyping(null);
            });

            return () => {
                newSocket.disconnect();
            };
        }
    }, [userDetails?._id, serverUrl, privateKey]);

    return { socket, isTyping };
};

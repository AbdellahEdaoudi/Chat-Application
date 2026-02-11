"use client"
import { createContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import axios from 'axios';
import { useToast } from '../Components/toast';
import { useSocket } from '../Hooks/useSocket';
import { generateKeyPair, decryptMessage } from '../utils/encryption';

export const MyContext = createContext();

export const MyProvider = ({ children }) => {
  // const CLIENT_URL = "http://localhost:3000";
  // const SERVER_URL = "http://localhost:2222";
  // const SERVER_URL_V = "http://localhost:2222";
  const CLIENT_URL = "https://edchatflow.vercel.app"
  const SERVER_URL = "https://server-chat-application-s55v.onrender.com";
  const SERVER_URL_V = "https://chat-application-server-url.vercel.app";

  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [privateKey, setPrivateKey] = useState(null);
  const router = useRouter();
  const toast = useToast();

  const socket = useSocket(SERVER_URL, userDetails, setMessages, setOnlineUsers, privateKey);

  useEffect(() => {
    const data = localStorage.getItem("selectedUser");
    if (data) {
      setSelectedUser(JSON.parse(data));
    }
  }, []);

  // Load user from localStorage after mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUserDetails(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }
  }, []);

  // logout
  const logout = async () => {
    try {
      await axios.post(`${SERVER_URL_V}/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout failed", error);
    }
    if (socket) {
      socket.disconnect();
    }
    router.push('/auth/login');
    localStorage.removeItem('user');
    localStorage.removeItem('selectedUser');
    Cookies.remove('jwt');
    Cookies.remove('accessToken');
    setUserDetails(null);
    setMessages([]);
    setUsers([]);
    setSelectedUser(null);
  };

  // get messages
  const getMessages = async () => {
    try {
      const response = await axios.post(`${SERVER_URL_V}/get_messages`,
        {}, { withCredentials: true });

      const user = response.data.user;
      const storedPrivKey = localStorage.getItem(`privKey`);

      // Decrypt messages if private key exists
      const decryptedMsgs = response.data.messages.map(msg => {
        if (storedPrivKey && msg.iv) {
          return {
            ...msg,
            message: decryptMessage({ ...msg, userId: user._id, fromId: msg.from._id }, storedPrivKey)
          };
        }
        return msg;
      });

      setMessages(decryptedMsgs);
      setUserDetails(user);
      if (storedPrivKey) setPrivateKey(storedPrivKey);
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 401 || status === 403 || status === 404) {
          console.log(`Auth error (${status}). Logging out...`);
          let msg = "Session expired. Please login again.";
          if (status === 404) msg = "User not found. Please login again.";
          if (status === 401) msg = "Authentication required. Please login.";
          if (toast) toast.error(msg);
          logout();
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Recalculate Users List when Messages Change
  useEffect(() => {
    if (userDetails && messages.length > 0) {
      const currentUserId = userDetails._id;
      const seenUserIds = new Set();
      const uniqueUsers = [];

      for (let i = messages.length - 1; i >= 0; i--) {
        const msg = messages[i];
        const isFromMe = msg.from._id === currentUserId;
        const otherUser = isFromMe ? msg.to : msg.from;

        if (otherUser && !seenUserIds.has(otherUser._id)) {
          seenUserIds.add(otherUser._id);
          const unreadCount = messages.filter(m =>
            m.from._id === otherUser._id &&
            m.to._id === currentUserId &&
            m.readorno === false
          ).length;

          uniqueUsers.push({
            ...otherUser,
            lastMessage: msg.message,
            unreadCount: unreadCount,
          });
        }
      }
      setUsers(uniqueUsers);
    }
  }, [messages, userDetails]);

  // E2EE Key Initialization
  useEffect(() => {
    const initE2EE = async () => {
      if (!userDetails || !userDetails._id) return;

      const storedPrivKey = localStorage.getItem(`privKey_${userDetails._id}`);

      // Only generate if we have NOTHING: no local private key AND no public key on server
      if (!storedPrivKey && (!userDetails.publicKey || userDetails.publicKey === "")) {
        console.log("No E2EE keys found on device or server. Generating initial keys...");
        try {
          const { publicKey, privateKey } = await generateKeyPair();
          localStorage.setItem(`privKey_${userDetails._id}`, privateKey);
          setPrivateKey(privateKey);

          // Update public key on server - This only works if server's publicKey is empty
          await axios.put(`${SERVER_URL_V}/update-profile`,
            { publicKey, fullname: userDetails.fullname },
            { withCredentials: true }
          );
          console.log("Initial E2EE Keys generated and synced successfully.");
        } catch (error) {
          console.error("Error initializing E2EE keys:", error);
        }
      } else if (storedPrivKey) {
        // We have the private key, set it to state
        setPrivateKey(storedPrivKey);
      } else {
        // Public key exists on server, but missing private key on this device
        console.warn("Public key exists on server, but no matching private key on this device. Key change is prohibited.");
      }
    };

    if (!isLoading && userDetails) {
      initE2EE();
    }
  }, [userDetails, isLoading]);

  return (
    <MyContext.Provider
      value={{
        CLIENT_URL, SERVER_URL, SERVER_URL_V,
        logout, setUserDetails,
        userDetails, messages, setMessages, users, setUsers,
        isLoading, setIsLoading, selectedUser, setSelectedUser,
        email: userDetails?.email,
        getMessages, socket, onlineUsers,
        privateKey
      }}
    >
      {children}
    </MyContext.Provider>
  );
};

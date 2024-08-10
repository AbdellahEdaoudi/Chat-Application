"use client"
import { useUser } from '@clerk/nextjs';
import axios from 'axios';
import { createContext, useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

export const MyContext = createContext();

export const MyProvider = ({ children }) => {
  const [userDetails, setUserDetails] = useState([]);
  const [userLinks, setUserLinks] = useState([]);
  const [messages, setMessages] = useState([]);
  const { user } = useUser();
  const EmailUser = user?.emailAddresses[0].emailAddress;
  const [previousNotificationCount, setPreviousNotificationCount] = useState(0);

  // const CLIENT_URL = "http://localhost:3000";
  // const SERVER_URL = "http://localhost:9999" ;
  // const SERVER_URL_V = "http://localhost:9999" ;
  const CLIENT_URL = process.env.NEXT_PUBLIC_CLIENT_URL;
  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;
  const SERVER_URL_V = process.env.NEXT_PUBLIC_SERVER_URL_V;


  // Initialize Socket.io
  const socket = io(SERVER_URL, {
    transports: ['websocket'],
    reconnection: true,
  });

  const audioRef = useRef(null);

  useEffect(() => {
    // Connect to Socket.io
    socket.connect();

    // Listen for incoming messages
    socket.on('receiveMessage', (data) => {
      setMessages((prevMessages) => [data, ...prevMessages]);
    });

    socket.on('receiveUpdatedMessage', (data) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === data._id ? { ...msg, ...data } : msg
        )
      );
    });

    socket.on('receiveDeletedMessage', (id) => {
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== id)
      );
    });

    // Clean up on unmount
    return () => {
      socket.disconnect();
    };
  }, [SERVER_URL, socket]);

  // Fetch initial data
  useEffect(() => {
    axios
      .get(`${SERVER_URL_V}/users`)
      .then((res) => {
        setUserDetails(res.data);
      })
      .catch((error) => {
        console.error("Error fetching user details:", error);
      });
  }, [SERVER_URL_V]);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const response = await axios.get(`${SERVER_URL_V}/messages`);
        setMessages(response.data.reverse());
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    getMessages();
  }, [SERVER_URL_V]);
  // links
  useEffect(() => {
    axios
      .get(`${SERVER_URL_V}/links`)
      .then((res) => {
        setUserLinks(res.data);
      })
      .catch((error) => {
        console.error("Error fetching user details:", error);
      });
  }, [SERVER_URL_V]);

  const Notification = messages.filter(
    (fl) => fl.to === EmailUser && fl.from !== EmailUser
  );
  useEffect(() => {
    if (Notification.length > previousNotificationCount) {
      if (audioRef.current) {
        audioRef.current.play();
      }
    }
    setPreviousNotificationCount(Notification.length);
  }, [Notification.length, previousNotificationCount]);

  return (
    <MyContext.Provider
      value={{
        CLIENT_URL,
        SERVER_URL,
        userDetails,
        userLinks,
        setUserLinks,
        EmailUser,
        Notification,
        SERVER_URL_V,
        messages,
      }}
    >
      <audio ref={audioRef} src="/notification3.mp3" preload="auto" />
      {children}
    </MyContext.Provider>
  );
};

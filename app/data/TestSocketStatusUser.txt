import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { useEffect, useState } from "react";
import io from "socket.io-client";

function Test() {
  const { user } = useUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress;
  const [userDetails, setUserDetails] = useState([]);
  const SERVER_URL = 'http://localhost:9999';
  const socket = io(SERVER_URL);

  useEffect(() => {
    axios.get(`${SERVER_URL}/users`)
      .then((res) => {
        setUserDetails(res.data);
      })
      .catch((error) => {
        console.error('Error fetching user details:', error);
      });

    socket.on('updateUserStatus', (users) => {
      setUserDetails(users);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (userEmail) {
      const user = userDetails.find(user => user.email === userEmail);
      if (user) {
        socket.emit('userConnected', user._id);
      }
    }
  }, [userEmail, userDetails]);

  return (
    <div className="bg-white p-4">
      {userDetails.map((user, i) => (
        <div key={i} className="border-b-2 mb-4 pb-2">
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p className={`inline-block px-2 py-1 rounded ${user.isOnline ? 'bg-green-500' : 'bg-red-500'} text-white`}>
            {user.isOnline ? 'Online' : 'Offline'}
          </p>
        </div>
      ))}
    </div>
  );
}

export default Test;

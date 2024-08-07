import { useUser } from '@clerk/nextjs';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

function Users() {
  const [userDetails, setUserDetails] = useState([]);
  const [messages, setMessages] = useState([]);
  const {user} = useUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress;
  const SERVER_URL = 'http://localhost:9999';
  
  const filteredMessages = response.data.filter(msg => msg.to === userEmail && msg.to === userEmail);

  // Get Messages
  useEffect(() => {
    const GetMessages = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/messages`);
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    GetMessages();
  },[]);

  useEffect(() => {
    axios.get(`${SERVER_URL}/users`)
      .then((res) => {
        setUserDetails(res.data);
      })
      .catch((error) => {
        console.error('Error fetching user details:', error);
      });
  }, []); // Empty dependency array ensures this effect runs once on component mount

  return (
    <div>
      <h1>Users</h1>
      {userDetails.length > 0 ? (
        <ul>
          {userDetails.map((user) => (
            <li key={user._id}>
              <strong>Name:</strong> {user.fullname}, <strong>Email:</strong> {user.email}
              {/* Add more details as needed */}
            </li>
          ))}
        </ul>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default Users;

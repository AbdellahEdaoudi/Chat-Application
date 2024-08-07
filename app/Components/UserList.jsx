
'use client'
import { useUser } from '@clerk/nextjs';
import axios from 'axios';
import Image from 'next/image';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Skeleton } from "@/components/ui/skeleton"
import { MyContext } from '../Context/MyContext';


function UserList({selectedUser,setSelectedUser}) {
  const [userByEmail, setuserByEmail] = useState("");
  const {user} = useUser();
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);
  const lodd = Array.from({ length: 10 }, (_, index) => index + 1);
  const userEmail = user?.emailAddresses[0]?.emailAddress;
  const {SERVER_URL,userDetails} = useContext(MyContext);

  
  //  search input change
  const SearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  // Scroll To End
  useEffect(() => {
    const scrollMessagesToEnd = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
      }
    };
    const timeout = setTimeout(() => {
      scrollMessagesToEnd();
    },1);
    return () => clearTimeout(timeout);
  }, [messages]);


  // Get users By Email
  useEffect(() => {
    const getUserByEmail = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/usersE/${userEmail}`);
        setuserByEmail(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    if (userEmail) {
      getUserByEmail();
    }
  }, [SERVER_URL,userEmail]);

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
  },[SERVER_URL]);
  
  
  return (
    <div >
        <div className="bg-gray-800 rounded-lg text-white scrollbar-none mt-1  p-4 overflow-y-auto h-[516px]">
            {/* Search input */}
            <input
              type="search"
              placeholder="Search by Name or Email"
              value={searchQuery}
              onChange={SearchChange}
              className="w-full px-4 py-2 mb-4 rounded-md bg-gray-700 text-white focus:outline-none"
            />
            {/* Users List */}
            <div className="text-lg  border-yellow-500 font-bold mb-4 sticky top-0 border-b py-1 bg-gray-800 z-10">
              {searchQuery === "" ? "Friends" : "Users List"}
            </div>
            <div className=" overflow-y-auto max-h-[400px] scrollbar-none ">
              {userDetails.length === 0 ? (
                <div className="space-y-2">
                  {lodd.map((l, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : ( <div>
                {/* Users List */}
                <div className='overflow-y-auto max-h-[420px] scrollbar-none'>
                {userDetails
                    .filter((user) =>
                      user.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      user.email.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((User, i) => (
                      
                      <div 
                        key={i}
                        onClick={() => {
                          setSelectedUser(User);
                          localStorage.setItem("SelectedUser", JSON.stringify(User));
                          const scrollMessagesToEnd = () => {
                            if (messagesEndRef.current) {
                              messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
                            }
                          };
                          const timeout = setTimeout(() => {
                            scrollMessagesToEnd();
                          }, 1);
                          return () => clearTimeout(timeout);
                        }}
                        className={`${searchQuery === ""  ? "hidden" : ""} flex items-center gap-4 p-2 duration-500 hover:bg-gray-700 cursor-pointer rounded-lg transition ${
                          selectedUser && selectedUser.email === User.email ? 'bg-gray-700' : ''
                        }`}
                      >
                        <div className="relative w-12 h-12">
                        <div className=''>
                         <Image
                           src={User.urlimage}
                           alt="Profile"
                           className="rounded-full "
                           layout="fill"
                         />
                         {/* <div className={` ${User.isOnline === false ? "bg-gray-500": "bg-green-500"} absolute w-2 h-2 rounded-full left-2 top-0`}></div> */}
                         </div>
                        </div>
                        <div className='flex flex-col'>
                      <p className="text-lg">{User.fullname}</p>
                      <p className="text-[10px] text-gray-500">{User.email}</p>
                      </div>
                      </div>
                 ))}
                 {/* User ilya message */}
                 {userEmail && userEmail.length > 0 && 
                   userDetails.filter((userDetail) =>
                     userDetail.email === userEmail || 
                     messages.some((msg) => 
                       (msg.from === userEmail && msg.to === userDetail.email) || 
                       (msg.to === userEmail && msg.from === userDetail.email)
                     )
                   ).map((User, i) => (
                     <div
                       key={i}
                       onClick={() => {
                         setSelectedUser(User);
                         localStorage.setItem("SelectedUser", JSON.stringify(User));
                         const scrollMessagesToEnd = () => {
                           if (messagesEndRef.current) {
                             messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
                           }
                         };
                         const timeout = setTimeout(() => {
                           scrollMessagesToEnd();
                         }, 1);
                         return () => clearTimeout(timeout);
                       }}
                       className={`${searchQuery === "" ? "" : "hidden"} flex items-center gap-4 p-2 duration-500 hover:bg-gray-700 cursor-pointer rounded-lg transition ${
                         selectedUser && selectedUser.email === User.email ? 'bg-gray-700' : ''
                       }`}
                     >       
                       <div className="relative w-12 h-12">
                         <Image
                           src={User.urlimage}
                           alt="Profile"
                           className="rounded-full "
                           layout="fill"
                         />
                       </div>
                       <div className='flex flex-col'>
                         <p className="text-lg">{User.fullname}</p>
                         <p className="text-[10px] text-gray-500">{User.email}</p>
                       </div>
                     </div>
                   ))
                 }
                </div>       
                </div>
              )}
              
              
            </div>
        </div>
    </div>
  )
}

export default UserList
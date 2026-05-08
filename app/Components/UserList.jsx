"use client";
import Image from "next/image";
import React, { useContext, useEffect, useState } from "react";
import { MyContext } from "../Context/MyContext";
import axios from "axios";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useToast } from "./toast";

function UserList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const userId = Cookies.get("userId");
  const router = useRouter();
  const toast = useToast();
  const {
    users, setUsers, logout,
    isLoading, setSelectedUser,
    SERVER_URL_V, onlineUsers,
    messages, setMessages
  } = useContext(MyContext);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!searchQuery) {
        setAllUsers([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await axios.get(`${SERVER_URL_V}/users`, {
          withCredentials: true,
        });

        // Filter users
        const filtered = response.data.filter(
          (user) =>
            user.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setAllUsers(filtered);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (searchQuery) fetchUsers();
    }, 500); // Debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, SERVER_URL_V]);

  // Mark messages as read when a user is selected
  const markAsRead = async (user) => {
    const selecteduser = {
      _id: user._id,
      profileImage: user.profileImage,
      fullname: user.fullname,
      email: user.email,
      password: user.password,
      publicKey: user.publicKey,
    }
    localStorage.setItem("selectedUser", JSON.stringify(selecteduser))
    setSelectedUser(selecteduser);
    if (window.innerWidth < 768) {
      router.push(`/`);
    }
  };

  const displayList = searchQuery ? allUsers : users;

  return (
    <div className="bg-gray-800 text-white sleek-scrollbar md:border-r border-yellow-300 p-2 flex flex-col h-full overflow-hidden">
      {/* Search input */}
      <input
        type="search"
        placeholder="Search by Name or Email"
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
        }}
        className="w-full px-4 py-2 mb-4 rounded-md bg-gray-700 text-white focus:outline-none"
      />
      {/* Users List Label */}
      <div className="text-lg  border-yellow-500 font-bold mb-4 sticky top-0 border-b py-1 bg-gray-800 z-10">
        {searchQuery !== "" ? "Search Results" : "Friends"}
      </div>
      <div className="flex-1 overflow-y-auto sleek-scrollbar ">
        {isLoading || isSearching ? (
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg animate-pulse bg-gray-800/50">
                <div className="w-12 h-12 bg-gray-700 rounded-full shrink-0"></div>
                <div className="flex flex-col flex-1 gap-2">
                  <div className="h-4 bg-gray-700 rounded w-[95%]"></div>
                  <div className="h-3 bg-gray-600 rounded w-[70%]"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {/* Users List */}
            <div className="sleek-scrollbar">
              {displayList.map((user, i) => (
                <div
                  key={i}
                  onClick={() => markAsRead(user)}
                  className={`flex items-center gap-4 p-2 duration-500 hover:bg-gray-700 cursor-pointer rounded-lg transition ${userId && userId === user._id
                    ? "bg-gray-700"
                    : ""
                    }`}
                >
                  <div className="relative w-12 h-12 shrink-0">
                    <div className={`relative w-full h-full rounded-full overflow-hidden bg-gray-300 ${user.isOnline ? "border-2 border-green-500" : "border-2 border-gray-500"}`}>
                      <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                        </svg>
                      </div>
                      <Image
                        src={user.profileImage || "/default-avatar.png"}
                        alt="Profile"
                        fill
                        sizes="48px"
                        className="relative z-10 object-cover"
                      />
                    </div>
                    <div
                      className={` ${user.isOnline
                        ? "bg-green-500"
                        : "bg-gray-500"
                        } absolute w-3 h-3 rounded-full right-0 bottom-0 border-2 border-gray-800 z-20`}
                    ></div>
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex justify-between items-center w-full">
                      <p className="text-lg font-semibold truncate">
                        {user.fullname}
                      </p>
                      {user.unreadCount > 0 && !searchQuery && (
                        <div className="bg-green-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shrink-0">
                          {user.unreadCount}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col w-full">
                      {!searchQuery && (
                        <p className="text-sm line-clamp-1 text-gray-400 break-words">
                          {user.lastMessage.slice(0, 20)}{user.lastMessage.length > 20 ? "..." : ""}
                        </p>
                      )}
                      <p className={`${!searchQuery ? "hidden" : "block"} text-[12px] text-gray-500 truncate`}>
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {displayList.length === 0 && (
                <div className="text-center text-gray-500 mt-4">No users found</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserList;
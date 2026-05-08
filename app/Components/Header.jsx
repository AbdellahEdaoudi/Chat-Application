"use client";

import { Bell, MessagesSquare, Settings } from "@/app/Components/lucide-react/lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useRef, useState } from "react";
import { MyContext } from "../Context/MyContext";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

function Header() {
  const {
    logout, userDetails, users, setUsers,
    setSelectedUser, onlineUsers, SERVER_URL_V,
    messages, setMessages, toggleStatus
  } = useContext(MyContext);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  const unreadUsers = users.filter(u => u.unreadCount > 0);
  const totalUnread = unreadUsers.reduce((acc, curr) => acc + curr.unreadCount, 0);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (user) => {
    const selecteduser = {
      _id: user._id,
      profileImage: user.profileImage,
      fullname: user.fullname,
      email: user.email,
      password: user.password,
      publicKey: user.publicKey,
    }
    localStorage.setItem("selectedUser", JSON.stringify(selecteduser));
    setSelectedUser(selecteduser);
    setShowNotifications(false);
    router.push(`/`);
  };

  const Logout = async () => {
    setLoading(true);
    await logout();
    setLoading(false);
  };

  return (
    <div className="h-16 shadow-sm z-50 relative">
      <nav className="border-b drop-shadow-sm bg-white h-full flex items-center">
        <section className="md:container md:mx-auto sm:container sm:mx-auto mx-2">
          <div className="flex items-center justify-between  text-white">
            <Link href="/" className="hover:scale-105 duration-300 cursor-pointer">
              <Image
                src="/logo.svg"
                alt="EdChatFlow"
                width={180}
                height={40}
                priority
                className="w-[180px] h-auto"
              />
            </Link>

            {userDetails ? (
              <div className="flex items-center md:gap-6">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 cursor-pointer group p-1.5 pr-2 md:pr-4 rounded-full hover:bg-gray-100 transition-all duration-300 border border-transparent hover:border-gray-200"
                >
                  <div className="relative">
                    <div className="relative w-10 h-10 shrink-0 rounded-full overflow-hidden bg-gray-300 border-2 border-gray-100 group-hover:border-blue-500 transition-colors">
                      <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                        </svg>
                      </div>
                      <Image
                        src={userDetails.profileImage || "/default-avatar.png"}
                        alt="Profile"
                        fill
                        sizes="40px"
                        className="relative z-10 object-cover"
                      />
                    </div>
                    <span
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleStatus(!userDetails.isOnline); }}
                      className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full z-20 cursor-pointer hover:scale-125 transition-transform ${userDetails.isOnline ? "bg-green-500" : "bg-gray-400"}`}
                      title={userDetails.isOnline ? "Online - Click to go offline" : "Offline - Click to go online"}
                    ></span>
                  </div>
                  <div className="hidden md:flex flex-col">
                    <span className="font-bold text-gray-800 text-sm leading-tight group-hover:text-blue-600 transition-colors">
                      {userDetails.fullname}
                    </span>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleStatus(!userDetails.isOnline); }}
                      className={`text-[10px] font-bold text-left hover:underline decoration-dotted ${userDetails.isOnline ? "text-green-600" : "text-gray-400"}`}
                    >
                      {userDetails.isOnline ? "Online" : "Offline"}
                    </button>
                  </div>
                </Link>

                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-300 relative group"
                  >
                    <Bell size={24} className="group-hover:text-blue-600 transition-colors" />
                    {unreadUsers.length > 0 && (
                      <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border-2 border-white">
                        {unreadUsers.length}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotifications && (
                      <>
                        {/* Mobile Backdrop */}
                        <div
                          className="fixed inset-0 bg-black/5 z-[90] md:hidden"
                          onClick={() => setShowNotifications(false)}
                        />

                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="fixed inset-x-4 top-20 md:absolute md:inset-auto md:right-0 md:mt-3 md:w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[100] overflow-hidden"
                        >
                          <div className="p-4 border-b bg-gray-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">Notifications</h3>
                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-bold">
                              {unreadUsers.length} New
                            </span>
                          </div>

                          <div className="max-h-[400px] overflow-y-auto sleek-scrollbar">
                            {unreadUsers.length > 0 ? (
                              unreadUsers.map((user) => (
                                <div
                                  key={user._id}
                                  onClick={() => markAsRead(user)}
                                  className="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                                >
                                  <div className="relative w-10 h-10 shrink-0">
                                    <div className={`relative w-full h-full rounded-full overflow-hidden bg-gray-200 border border-gray-100`}>
                                      <Image
                                        src={user.profileImage || "/default-avatar.png"}
                                        alt="Profile"
                                        fill
                                        sizes="40px"
                                        className="object-cover"
                                      />
                                    </div>
                                    {user.isOnline && (
                                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center">
                                      <p className="text-sm font-bold text-gray-800 truncate">{user.fullname}</p>
                                      <span className="bg-blue-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                        {user.unreadCount}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-500 truncate mt-0.5">
                                      {user.lastMessage || "Sent a message"}
                                    </p>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-8 text-center bg-white">
                                <div className="mb-3 flex justify-center">
                                  <MessagesSquare className="text-gray-200" size={48} />
                                </div>
                                <p className="text-gray-400 font-medium italic">No new messages</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Admin Button */}
                {userDetails?.isAdmin && (
                  <Link
                    href="/admin"
                    className="hidden md:flex bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white border border-purple-200 px-4 py-2 rounded-lg transition-all duration-300 items-center gap-2 font-medium text-sm shadow-sm hover:shadow-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    <span>Admin</span>
                  </Link>
                )}

                {/* Logout Button */}
                <button
                  onClick={Logout}
                  disabled={loading}
                  className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 font-medium text-sm shadow-sm hover:shadow-md"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Exiting...</span>
                    </>
                  ) : (
                    <>
                      <span>Logout</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth/login" className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition">
                  Login
                </Link>
                <Link href="/auth/register" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition">
                  Register
                </Link>
              </div>
            )}
          </div>
        </section>
      </nav>
    </div >
  );
}

export default Header;

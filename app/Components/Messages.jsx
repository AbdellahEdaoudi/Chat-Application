"use client";
import axios from "axios";
import Image from "next/image";
import React, { useContext, useState, useRef, useEffect } from "react";
import { BsEmojiSmile, BsChatSquareDots } from "react-icons/bs";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { EllipsisVertical, Mail, Phone, CircleX, Send, Copy, Edit, Trash2 } from "@/app/Components/lucide-react/lucide-react";
import { encryptMessage, decryptMessage } from "../utils/encryption";
import Linkify from "linkify-react";
import { MyContext } from "../Context/MyContext";
import { useToast } from "./toast";
import { Spinner } from "./lucide-react/lucide-react";

function Messages() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingu, setLoadingu] = useState(false);
  const [loadingd, setLoadingd] = useState(false);
  const [loadingClear, setLoadingClear] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeMessageMenu, setActiveMessageMenu] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const messageInputRef = useRef(null);
  const umessageRef = useRef(null);
  const menuRef = useRef(null);
  const emojiRef = useRef(null);
  const skipScrollRef = useRef(false);

  const [idMsg, setIdMsg] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [umessage, setUMessage] = useState("");
  const [emoji, setEmoji] = useState(true);
  const { SERVER_URL_V, selectedUser, messages,
    setMessages, email, userDetails, logout, setUsers, socket, privateKey } = useContext(MyContext);

  const FilterMessages = messages.filter((fl) => {
    if (!userDetails || !selectedUser) return false;
    return (
      (fl.from?._id === userDetails._id &&
        fl.to?._id === selectedUser._id) ||
      (fl.from?._id === selectedUser._id &&
        fl.to?._id === userDetails._id)
    );
  });

  // scroll new message
  useEffect(() => {
    if (skipScrollRef.current) {
      skipScrollRef.current = false;
      return;
    }
    if (FilterMessages.length > 0) {
      const lastMsg = FilterMessages[FilterMessages.length - 1];
      // If the last message is from me, scroll to bottom
      if (lastMsg.from?._id === userDetails?._id) {
        const el = document.getElementById(lastMsg._id);
        if (el) el.scrollIntoView({ behavior: "instant" });
      } else {
        // Otherwise check for unread messages
        const firstUnread = FilterMessages.find(
          (m) => !m.readorno && m.from?._id === selectedUser?._id
        );
        if (firstUnread) {
          const el = document.getElementById(firstUnread._id);
          if (el) el.scrollIntoView({ behavior: "instant", block: "center" });
        } else {
          const el = document.getElementById(lastMsg._id);
          if (el) el.scrollIntoView({ behavior: "instant" });
        }
      }
    }
  }, [selectedUser, messages, userDetails]);

  // handle click outside from emoji and update mode
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close Message Menu
      if (activeMessageMenu && !event.target.closest('.message-menu-container')) {
        setActiveMessageMenu(null);
      }

      // Close Header Menu
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }

      // Close Emoji Picker
      if (emojiRef.current && !emojiRef.current.contains(event.target) && !event.target.closest('.emoji-toggle')) {
        setEmoji(true);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu, emoji, activeMessageMenu]);

  const sendMessage = async () => {
    if (!userDetails || !selectedUser) return;
    setLoading(true);

    try {
      let data = {
        from: userDetails._id,
        to: selectedUser._id,
        message: messageInput,
      };

      // Apply E2EE if public keys are available
      if (selectedUser.publicKey && userDetails.publicKey) {
        try {
          const encrypted = await encryptMessage(messageInput, selectedUser.publicKey, userDetails.publicKey);
          data = { ...data, ...encrypted };
        } catch (err) {
          console.error("Encryption error:", err);
        }
      }

      const response = await axios.post(`${SERVER_URL_V}/messages`, data, { withCredentials: true });
      console.log("message : ", {
        from: response.data.from._id,
        to: response.data.to._id,
        message: response.data.message,
      });
      const savedMsg = {
        ...response.data,
        message: messageInput // Display clear text on sender side
      };

      setMessages((prev) => [...prev, savedMsg]);
      setUsers((prev) => prev.map((u) => u._id === selectedUser._id ? { ...u, lastMessage: messageInput } : u));

      if (socket) {
        // Send the encrypted message from response.data so the recipient can decrypt it
        socket.emit("send_msg", { ...response.data, to: selectedUser });
      }

      toast.success("Sent successfully");
      setMessageInput("");
      setEmoji(true);
    } catch (error) {
      console.error("Error sending message:", error);
      if (error.response && (error.response.status === 403 || error.response.status === 401)) {
        logout();
      }
      const message = error.response?.data?.message || "Error sending message";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };
  const deleteMsg = async () => {
    setLoadingd(true);
    try {
      await axios.delete(`${SERVER_URL_V}/messages/${idMsg}`, { withCredentials: true });
      skipScrollRef.current = true;
      setMessages((prev) => prev.filter((msg) => msg._id !== idMsg));

      if (socket) {
        socket.emit("del_msg", { messageId: idMsg, to: selectedUser });
      }

      // Update users last message
      const newMessages = messages.filter((msg) => msg._id !== idMsg);
      const lastMsg = newMessages.length > 0 ? newMessages[newMessages.length - 1].message : "";
      setUsers((prev) => prev.map((u) => u._id === selectedUser._id ? { ...u, lastMessage: lastMsg } : u));

      toast.success("Deleted successfully");
      setEmoji(true);
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting message:", error);
      if (error.response && (error.response.status === 403 || error.response.status === 401)) {
        logout();
      }
      const message = error.response?.data?.message || "Error deleting message";
      toast.error(message);
    } finally {
      setLoadingd(false);
    }
  };
  const updateMsg = async () => {
    setLoadingu(true);
    let data = { message: umessage };

    // Apply E2EE for update
    if (selectedUser.publicKey && userDetails.publicKey) {
      try {
        const encrypted = await encryptMessage(umessage, selectedUser.publicKey, userDetails.publicKey);
        data = { ...data, ...encrypted };
      } catch (err) {
        console.error("Encryption error in update:", err);
      }
    }

    try {
      const response = await axios.put(`${SERVER_URL_V}/messages/${idMsg}`, data, { withCredentials: true });

      const updatedMsg = {
        ...response.data,
        message: umessage // Display clear text on sender side
      };

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === idMsg ? updatedMsg : msg
        )
      );

      if (socket) {
        // Send the encrypted version from the server so the recipient decrytps it correctly
        socket.emit("upd_msg", { ...response.data, to: selectedUser });
      }

      // Update users last message if it was the last one
      const isLast = messages.length > 0 && messages[messages.length - 1]._id === idMsg;
      if (isLast) {
        setUsers((prev) => prev.map((u) => u._id === selectedUser._id ? { ...u, lastMessage: umessage } : u));
      }

      toast.success("Updated successfully");
      setShowEditModal(false);
      setUMessage("");
      setIdMsg("");
      setEmoji(true);
    } catch (error) {
      console.error("Error updating message:", error);
      if (error.response && (error.response.status === 403 || error.response.status === 401)) {
        logout();
      }
      const message = error.response?.data?.message || "Error updating message";
      toast.error(message);
    } finally {
      setLoadingu(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
    setActiveMessageMenu(null);
  };
  // clear chat
  const clearChat = async () => {
    setLoadingClear(true);
    try {
      await axios.delete(`${SERVER_URL_V}/delete_messages_between_users`, {
        data: { from: selectedUser._id },
        withCredentials: true
      });

      // Remove messages from local state
      setMessages((prev) => prev.filter((msg) =>
        !((msg.from?._id === userDetails._id && msg.to?._id === selectedUser._id) ||
          (msg.from?._id === selectedUser._id && msg.to?._id === userDetails._id))
      ));

      // Update user last message
      setUsers((prev) => prev.map((u) => u._id === selectedUser._id ? { ...u, lastMessage: "" } : u));

      if (socket) {
        socket.emit("clear_chat", { from: userDetails._id, to: selectedUser });
      }

      toast.success("Chat cleared successfully");
      setShowClearModal(false);
      setShowMenu(false);
    } catch (error) {
      console.error("Error clearing chat:", error);
      if (error.response && (error.response.status === 403 || error.response.status === 401)) {
        logout();
      }
      const message = error.response?.data?.message || "Error clearing chat";
      toast.error(message);
    } finally {
      setLoadingClear(false);
    }
  };
  // add emoji
  const addEmoji = (e) => {
    const sym = e.unified.split("-");
    const codeArray = sym.map(el => "0x" + el);
    const emojiStr = String.fromCodePoint(...codeArray);

    if (!showEditModal) {
      const ref = messageInputRef.current;
      if (ref) {
        const start = ref.selectionStart;
        const end = ref.selectionEnd;
        ref.setRangeText(emojiStr, start, end, 'end');
        setMessageInput(ref.value);
        ref.focus();
      } else {
        setMessageInput(messageInput + emojiStr);
      }
    } else {
      const ref = umessageRef.current;
      if (ref) {
        const start = ref.selectionStart;
        const end = ref.selectionEnd;
        ref.setRangeText(emojiStr, start, end, 'end');
        setUMessage(ref.value);
        ref.focus();
      } else {
        setUMessage(umessage + emojiStr);
      }
    }
  };
  if (!selectedUser) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-56px)] bg-gray-900 space-y-6 animate-in fade-in duration-500">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
          <div className="relative bg-gray-800 p-6 rounded-full ring-1 ring-gray-700">
            <BsChatSquareDots size={48} className="text-indigo-400" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-white tracking-wide">
            Welcome to Edchatflow
          </h3>
          <p className="text-gray-400 text-lg max-w-xs mx-auto">
            Select a conversation to start chatting.
          </p>
        </div>
      </div>
    );
  }


  return (
    <div className="h-full flex flex-col bg-gray-800 overflow-hidden">
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex flex-col h-full p-2">
          <div className="flex-none">
            <h2 className="mb-2 bg-slate-200 py-1 rounded-lg px-4">
              {selectedUser ? (
                <div className="flex items-center justify-between gap-4">
                  <div
                    className="cursor-pointer hover:scale-105 duration-300 flex gap-2 items-center"
                    onClick={() => setShowProfileModal(true)}
                  >
                    <div className="relative w-12 h-12 shrink-0 rounded-full overflow-hidden bg-gray-300">
                      <Image
                        fill
                        sizes="48px"
                        src={selectedUser.profileImage || "/default-avatar.png"}
                        alt="Profile Image"
                        className="object-cover"
                      />
                    </div>
                    <p className="font-bold">{selectedUser.fullname}</p>
                  </div>

                  <p className="font-bold md:block hidden">
                    {selectedUser.email}
                  </p>
                  <p className="font-bold md:block hidden">
                    {selectedUser.phoneNumber}
                  </p>
                  <div className="relative" ref={menuRef}>
                    <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-gray-300 rounded-full transition">
                      <EllipsisVertical size={20} />
                    </button>
                    {showMenu && (
                      <div className="absolute right-0 top-10 bg-white shadow-md rounded-md p-2 z-10 w-40">
                        <button
                          onClick={() => {
                            setShowClearModal(true);
                            setShowMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 font-semibold rounded"
                        >
                          Clear Chat
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 items-center justify-between ">
                  <div className=" flex justify-around items-center">
                    <div className="w-12 h-12 rounded-full bg-gray-500 animate-pulse ml-2"></div>
                    <div className="rounded-full bg-gray-500 animate-pulse w-44 h-3 ml-2"></div>
                  </div>
                  <div className="rounded-full bg-gray-500 animate-pulse w-44 h-3 ml-2"></div>
                  <div className="rounded-full bg-gray-500 animate-pulse w-44 h-3 ml-2"></div>
                </div>
              )}
            </h2>
          </div>

          <div className="flex-1 bg-white p-4 rounded-lg shadow-lg sleek-scrollbar overflow-y-auto">
            <div className={`md:text-xs text-[10px] ${FilterMessages.length === 0 ? "hidden" : "flex"} justify-center mb-6`}>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 max-w-sm text-center shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-1 text-amber-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  <span className="font-bold uppercase tracking-wider">End-to-End Encrypted</span>
                </div>
                <p className="text-amber-800 leading-relaxed font-medium">
                  Messages are secured with RSA-2048 and AES-256. No one outside of this chat, not even EdChatFlow, can read them.
                </p>
              </div>
            </div>

            {FilterMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full rounded-lg">
                <div className="text-center p-4">
                  <h2 className="text-xl font-semibold text-gray-700 mb-2">
                    No Messages
                  </h2>
                  <p className="text-gray-500">
                    You don't have any messages yet.
                  </p>
                </div>
              </div>
            ) : (
              FilterMessages.map((msg, i) => {
                const DateMsg = new Date(msg.createdAt);
                const now = new Date();
                const yesterday = new Date();
                yesterday.setDate(now.getDate() - 1);
                const isToday = DateMsg.toDateString() === now.toDateString();
                const isYesterday = DateMsg.toDateString() === yesterday.toDateString();
                const dateLabel = isToday ? "Today," : isYesterday ? "Yesterday," : DateMsg.toLocaleDateString();

                return (
                  <div key={i} id={msg._id} className="mb-4">
                    <div className={`${msg.from?.email === email ? "flex items-start flex-row-reverse gap-2" : "flex items-start gap-2"}`}>
                      <div className="relative w-10 h-10 shrink-0 mt-1">
                        <Image alt="Logo"
                          src={msg.from?.profileImage || "/default-avatar.png"}
                          fill
                          sizes="40px"
                          className="hover:scale-105 cursor-pointer duration-300 rounded-full object-cover aspect-square"
                        />
                      </div>

                      <div className={`p-2 rounded-md md:text-base text-xs max-w-[75%] md:max-w-[70%] ${msg.from?.email === email ? "bg-sky-400" : "bg-green-400"}`}>
                        <div className="whitespace-pre-wrap break-words">
                          <Linkify>{msg.message}</Linkify>
                        </div>
                      </div>

                      <div className={`relative message-menu-container ${msg.from?.email === email ? "block" : "hidden"}`}>
                        <button
                          onClick={() => setActiveMessageMenu(activeMessageMenu === msg._id ? null : msg._id)}
                          className="hover:bg-gray-100 rounded-full transition-colors mt-1 text-gray-500"
                        >
                          <EllipsisVertical width={18} />
                        </button>

                        {activeMessageMenu === msg._id && (
                          <>
                            {/* Backdrop for mobile */}
                            <div
                              className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40 md:hidden"
                              onClick={() => setActiveMessageMenu(null)}
                            />

                            {/* Menu Container */}
                            <div className={`
                              fixed inset-x-0 bottom-0 z-50 p-3 bg-white rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom duration-300
                              md:absolute md:inset-auto md:-top-10 ${msg.from?.email === email ? "md:right-full md:mr-2" : "md:left-full md:ml-2"} 
                              md:bg-white md:border md:border-gray-100 md:shadow-xl md:rounded-xl md:p-1.5 md:z-30 md:min-w-[150px] md:animate-in md:fade-in md:zoom-in-95 md:duration-100
                            `}>
                              {/* Mobile Handle Bar */}
                              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-3 md:hidden" />

                              <button
                                onClick={() => copyToClipboard(msg.message)}
                                className="w-full flex items-center gap-3 px-4 py-2.5 md:px-3 md:py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl md:rounded-lg transition-colors text-left"
                              >
                                <Copy size={16} className="md:w-4 md:h-4" />
                                <span className="font-medium md:font-normal">Copy</span>
                              </button>

                              <button
                                onClick={() => {
                                  setIdMsg(msg._id);
                                  setUMessage(msg.message);
                                  setShowEditModal(true);
                                  setActiveMessageMenu(null);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 md:px-3 md:py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-xl md:rounded-lg transition-colors text-left"
                              >
                                <Edit size={16} className="md:w-4 md:h-4" />
                                <span className="font-medium md:font-normal">Edit</span>
                              </button>

                              <div className="h-px bg-gray-100 my-1 mx-2" />

                              <button
                                onClick={() => {
                                  setIdMsg(msg._id);
                                  setShowDeleteModal(true);
                                  setActiveMessageMenu(null);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 md:px-3 md:py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl md:rounded-lg transition-colors text-left font-semibold md:font-medium"
                              >
                                <Trash2 size={16} className="md:w-4 md:h-4" />
                                <span>Delete</span>
                              </button>

                              {/* Mobile Cancel Button */}
                              <button
                                onClick={() => setActiveMessageMenu(null)}
                                className="w-full mt-1 py-2 text-center text-gray-500 text-sm font-bold md:hidden"
                              >
                                Cancel
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className={`flex flex-col ${msg.from?.email === email ? "items-end mr-14" : "items-start ml-14"}`}>
                      <span className="text-[10px] text-gray-400">
                        {msg.updated && "Edited"}
                      </span>
                      <div className="flex gap-2 text-[11px] text-gray-500">
                        <p>{dateLabel}</p>
                        <p>{DateMsg.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex-none mt-2">
            <div className="bg-gray-100 p-2.5 rounded-xl border border-gray-200 shadow-sm mx-1">
              <div className="flex items-center gap-3">
                <div
                  onClick={() => setEmoji(!emoji)}
                  className="cursor-pointer p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all emoji-toggle mb-1"
                >
                  <BsEmojiSmile size={22} />
                </div>

                <textarea
                  ref={messageInputRef}
                  maxLength={1000}
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      // Only send on Enter if on Desktop (width > 768px)
                      if (window.innerWidth > 768) {
                        e.preventDefault();
                        if (messageInput.trim() && !loading) sendMessage();
                      }
                    }
                  }}
                  className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none max-h-32 sleek-scrollbar text-sm md:text-base text-gray-800 caret-indigo-600 shadow-sm placeholder:text-gray-400"
                  rows={1}
                />

                <button
                  onClick={() => sendMessage()}
                  disabled={loading || !messageInput.trim()}
                  className={`flex items-center justify-center w-11 h-11 shrink-0 rounded-xl transition-all duration-300 shadow-lg mb-0.5
                    ${loading || !messageInput.trim()
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 active:scale-95 shadow-indigo-200"}`}
                >
                  {loading ? <Spinner className="w-5 h-5 text-gray-400" /> : <Send size={20} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {!showEditModal && (
          <div ref={emojiRef} className={`absolute bottom-24 right-6 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200 ${emoji ? "hidden" : "block"}`}>
            <Picker
              data={data}
              onEmojiSelect={addEmoji}
              theme="light"
              previewPosition="none"
              skinTonePosition="none"
            />
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4 text-red-600">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 size={24} />
              </div>
              <h3 className="text-xl font-bold">Delete Message?</h3>
            </div>
            <p className="mb-6 text-gray-600 leading-relaxed">This action cannot be undone. The message will be permanently removed from the conversation.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-5 py-2.5 text-gray-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteMsg}
                disabled={loadingd}
                className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 font-bold min-w-[120px] shadow-lg shadow-red-200"
              >
                {loadingd ? <Spinner className="w-5 h-5 text-white" /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white p-4 md:p-6 rounded-2xl shadow-2xl w-full max-w-sm md:max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-3 md:mb-6">
              <div className="flex items-center gap-2 md:gap-3 text-indigo-600">
                <div className="p-1 md:p-2 bg-indigo-50 rounded-lg">
                  <Edit size={18} className="md:w-[22px] md:h-[22px]" />
                </div>
                <h3 className="text-base md:text-xl font-bold">Edit Message</h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
              >
                <CircleX size={20} className="md:w-6 md:h-6" />
              </button>
            </div>

            <div className="space-y-3 md:space-y-4">
              <div className="relative">
                <textarea
                  ref={umessageRef}
                  value={umessage}
                  onChange={(e) => setUMessage(e.target.value)}
                  placeholder="Update your message..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 md:p-4 min-h-[80px] md:min-h-[120px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-xs md:text-base text-gray-800 sleek-scrollbar"
                />
                <div className="absolute bottom-2 md:bottom-3 right-2 md:right-3 flex items-center gap-2">
                  <div
                    onClick={() => setEmoji(!emoji)}
                    className="cursor-pointer p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all emoji-toggle"
                  >
                    <BsEmojiSmile size={16} className="md:w-5 md:h-5" />
                  </div>
                </div>
                {showEditModal && (
                  <div ref={emojiRef}>
                    {/* Desktop Version */}
                    <div className={`absolute left-full top-1/2 -translate-y-1/2 ml-12 z-50 hidden lg:block transition-all duration-300 ease-out origin-left
                      ${emoji ? "opacity-0 scale-95 translate-x-4 pointer-events-none" : "opacity-100 scale-100 translate-x-0 pointer-events-auto"}`}>
                      <div className="shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
                        <Picker
                          data={data}
                          onEmojiSelect={addEmoji}
                          theme="light"
                          previewPosition="none"
                          skinTonePosition="none"
                        />
                      </div>
                    </div>
                    {/* Mobile Version */}
                    <div className={`absolute top-full left-1/2 -translate-x-[85%] mt-2 z-50 lg:hidden transition-all duration-300 ease-out origin-top-right
                      ${emoji ? "opacity-0 scale-75 -translate-y-4 pointer-events-none" : "opacity-100 scale-[0.8] translate-y-0 pointer-events-auto"}`}>
                      <div className="shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
                        <Picker
                          data={data}
                          onEmojiSelect={addEmoji}
                          theme="light"
                          previewPosition="none"
                          skinTonePosition="none"
                          perLine={7}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 md:gap-3 mt-3 md:mt-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-3 py-1.5 md:px-5 md:py-2.5 text-xs md:text-base text-gray-600 font-semibold rounded-lg md:rounded-xl hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={updateMsg}
                disabled={loadingu || !umessage.trim()}
                className="px-4 py-1.5 md:px-6 md:py-2.5 text-xs md:text-base bg-indigo-600 text-white rounded-lg md:rounded-xl hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 font-bold min-w-[80px] md:min-w-[140px] shadow-lg shadow-indigo-200"
              >
                {loadingu ? <Spinner className="w-3.5 h-3.5 md:w-5 md:h-5 text-white" /> : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showClearModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in fade-in duration-200"
          onClick={() => setShowClearModal(false)}
        >
          <div
            className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4 text-red-600">
              <div className="p-2 bg-red-50 rounded-full">
                <Trash2 size={24} />
              </div>
              <h3 className="text-xl font-bold">Clear Chat?</h3>
            </div>
            <p className="mb-6 text-gray-600 leading-relaxed">Are you sure you want to delete all messages with this user? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowClearModal(false)}
                className="px-5 py-2.5 text-gray-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={clearChat}
                disabled={loadingClear}
                className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 font-bold min-w-[140px] shadow-lg shadow-red-200"
              >
                {loadingClear ? <Spinner className="w-5 h-5 text-white" /> : "Clear Conversation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showProfileModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 animate-in zoom-in-95 duration-200 relative">
            <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
              <button
                onClick={() => setShowProfileModal(false)}
                className="absolute top-4 right-4 text-white hover:bg-white/20 p-1.5 rounded-full transition-colors z-10"
              >
                <CircleX size={24} />
              </button>
            </div>
            <div className="px-6 pb-8 relative">
              <div className="relative flex justify-center -mt-16 mb-4">
                <div className="p-1.5  bg-white rounded-full shadow-lg">
                  <Image
                    src={selectedUser.profileImage || "/default-avatar.png"}
                    alt={selectedUser.fullname}
                    width={128}
                    height={128}
                    className="absolute rounded-full object-cover w-32 h-32 border-4 border-indigo-50"
                    style={{ height: "auto" }}
                  />
                  <Image
                    src={"/default-avatar.png"}
                    alt={selectedUser.fullname}
                    width={128}
                    height={128}
                    className="rounded-full object-cover w-32 h-32 border-4 border-indigo-50"
                    style={{ height: "auto" }}
                  />
                </div>
              </div>
              <div className="text-center space-y-1 mb-8">
                <h3 className="text-2xl font-bold text-gray-800">{selectedUser.fullname}</h3>
                <p className="text-indigo-500 font-medium text-sm">@{selectedUser.username || selectedUser.email.split('@')[0]}</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors group">
                  <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-indigo-200 transition-colors">
                    <Mail size={20} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">Email</p>
                    <p className="text-gray-900 font-medium truncate text-sm" title={selectedUser.email}>
                      {selectedUser.email}
                    </p>
                  </div>
                </div>
                {selectedUser.phoneNumber && (
                  <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors group">
                    <div className="p-2.5 bg-green-100 text-green-600 rounded-lg group-hover:bg-green-200 transition-colors">
                      <Phone size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">Phone</p>
                      <p className="text-gray-900 font-medium text-sm">
                        {selectedUser.phoneNumber}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-8">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-sm tracking-wide hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 active:scale-[0.98]"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Messages;

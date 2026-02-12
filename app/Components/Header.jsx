"use client";

import { Bell, MessagesSquare, Settings } from "@/app/Components/lucide-react/lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useRef, useState } from "react";
import { MyContext } from "../Context/MyContext";

function Header() {
  const { logout, userDetails } = useContext(MyContext);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
                style={{ width: 'auto', height: 'auto' }}
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
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full z-20"></span>
                  </div>
                  <div className="hidden md:flex flex-col">
                    <span className="font-bold text-gray-800 text-sm leading-tight group-hover:text-blue-600 transition-colors">
                      {userDetails.fullname}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">Online</span>
                  </div>
                </Link>

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
    </div>
  );
}

export default Header;

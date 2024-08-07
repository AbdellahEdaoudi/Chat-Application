"use client";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import {Bell, MessagesSquare, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { MyContext } from "../Context/MyContext";

function Navbar() {
  const { user } = useUser();
  const [setting, setSetting] = useState(true);
  const [notification, setNotification] = useState(true);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [Adminfind, setAdminfind] = useState(false);
  const {userDetails,Notification,EmailUser} = useContext(MyContext);

  useEffect(() => {
    const User = userDetails.find(user => user.email === EmailUser);
    if (User && User.email === "abdellahedaoudi80@gmail.com") {
      setAdminfind(true);
    }
  }, [userDetails, EmailUser]);

  



  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 0);
    return () => clearTimeout(timer); 
  }, []);

  const filt = userDetails.filter(
    (fl) => fl.email === EmailUser
  );

  return (
    <div>
      <nav className=" border-b drop-shadow-2xl bg-white ">
        <section className="container mx-auto py-3">
          <div className="flex justify-between items-center text-white">
          <div className="flex items-center gap-1 hover:scale-105 duration-300 cursor-pointer">
            <Image
              onClick={() => {
                router.push("/");
                setSetting(true);
              }}
              src="/Logo.png"
              alt="Logo"
              width={160}
              height={15}
            />
          </div>
            <SignedIn>
              {user ? (
                filt.map((userr, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <UserButton  />
                      <span
                        onClick={() => {
                          setNotification(true)
                        }}
                        className="font-medium hidden  md:block text-black cursor-pointer hover:scale-105 transition duration-300"
                      >
                        {userr.fullname}
                      </span>
                      {/* Icons Navbar */}
                      <div className="flex items-center gap-6">
                        {/* Icon Notification */}
                      <div onClick={() => {
                        setNotification(!notification);
                      }} className="relative flex items-center">
                      <span 
                      className="text-black cursor-pointer ml-2 relative">
                      <MessagesSquare />
                      </span>
                      <div onClick={() => {
                        setNotification(!notification);
                      }} className=" w-6 h-4 text-[12px] flex cursor-pointer items-center justify-center absolute rounded-full bg-red-500 -right-1 -top-2">
                       {Notification.length}
                      </div>
                      </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                </div>
              )}
            </SignedIn>
            <SignedOut>
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[90px] md:w-[250px]" />
                  <Skeleton className="h-4 w-[90px] md:w-[200px]" />
                </div>
              ) : (
                <SignInButton className="bg-green-400 text-black py-2 px-3 hover:bg-green-500 hover:scale-105 transition duration-300 rounded-md" />
              )}
            </SignedOut>
          </div>
        </section>
      </nav>
      {/* notification */}
<nav
  onClick={() => {
    setNotification(!notification);
  }}
  className={`overflow-hidden transition-all overflow-y-auto duration-500 text-white bg-gray-800 rounded-md w-96 right-2 container absolute flex flex-col ${
    notification ? "max-h-0" : "max-h-60 p-4"
  }`}
>
    {Notification.length > 0 ? (
    Notification.map((nt, i) => {
      const DateMsg = new Date(nt.createdAt);
      const DateToday = new Date();
      
      // Date Message
      const year = DateMsg.getFullYear();
      const month = String(DateMsg.getMonth() + 1).padStart(2, "0"); 
      const day = String(DateMsg.getDate()).padStart(2, "0");
      const DateAll = `${year}/${month}/${day}`;
      
      // Date Today
      const yeart = DateToday.getFullYear();
      const montht = String(DateToday.getMonth() + 1).padStart(2, "0"); 
      const dayt = String(DateToday.getDate()).padStart(2, "0");
      const TodayDate = `${yeart}/${montht}/${dayt}`;
      
      // Date Yesterday
      const yeary = DateToday.getFullYear();
      const monthy = String(DateToday.getMonth() + 1).padStart(2, "0"); 
      const dayy = String(DateToday.getDate() - 1).padStart(2, "0");
      const YesterdayDate = `${yeary}/${monthy}/${dayy}`;
      
      // Determine display date
      let displayDate = "";
      if (DateAll === TodayDate) {
        displayDate = "Today";
      } else if (DateAll === YesterdayDate) {
        displayDate = "Yesterday";
      } else {
        displayDate = DateAll;
      }

      return (
        <div
        onClick={()=>{router.push(`/message/to/${nt.fromname}`)}}
          key={i}
          className="flex cursor-pointer hover:scale-105 duration-300 items-center p-2 mb-2 bg-gray-700 rounded-md shadow-md"
        >
          <Image width={40} height={40}
            src={nt.fromimg}
            alt="Sender Image"
            className="w-10 h-10 rounded-full mr-3"
          />
          <div>
            <nav className="flex gap-2 items-center">
            <h4 className="">{(nt.from).split("@")[0]}</h4>
            <div className="flex gap-1 text-[10px]">
            <p className="text-gray-300">{displayDate}</p>
            <p className="text-gray-300">
              {DateMsg.toLocaleTimeString()}
            </p>
            </div>
            </nav>
            <p className="text-sm text-gray-400 font-bold">{nt.message}</p>
            
          </div>
        </div>
      );
    })
  ) : (
    <p className="text-center text-sm text-gray-400">No notifications</p>
  )}
</nav>


    </div>
  );
}

export default Navbar;

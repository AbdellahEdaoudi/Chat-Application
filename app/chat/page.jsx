"use client";
import React, { useContext, useEffect } from "react";
import Messages from "@/app/Components/Messages";
import Header from "../Components/Header";
import { MyContext } from "../Context/MyContext";

import SkeletonLoading from "../Components/SkeletonLoading";

export default function MessagePage() {
  const { getMessages, isLoading } = useContext(MyContext);

  useEffect(() => {
    getMessages();
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-hidden">
          <SkeletonLoading />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 overflow-hidden">
        <Messages />
      </main>
    </div>
  );
}

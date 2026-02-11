"use client";
import { useContext, useEffect } from "react";
import { MyContext } from "./Context/MyContext";
import { useToast } from "./Components/toast";
import UserList from "./Components/UserList";
import Messages from "./Components/Messages";
import Header from "./Components/Header";

import SkeletonLoading from "./Components/SkeletonLoading";

export default function Home() {
  const { isLoading, setMessages, setIsLoading, SERVER_URL_V,
    userDetails, setUserDetails, logout, setUsers, getMessages
  } = useContext(MyContext);
  const toast = useToast();

  useEffect(() => {
    getMessages(toast);
  }, [SERVER_URL_V]);

  if (isLoading || !userDetails) {
    return (
      <div className="min-h-screen">
        <Header />
        <SkeletonLoading />
      </div>
    );
  }
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <main className="flex flex-1 overflow-hidden">
        <nav className="md:w-1/4 w-full h-full overflow-hidden">
          <UserList />
        </nav>
        <section className="flex-1 md:block hidden h-full overflow-hidden">
          <Messages />
        </section>
      </main>
    </div>
  );
}

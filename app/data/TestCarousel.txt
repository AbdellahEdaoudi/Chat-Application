"use client"
import React, { useEffect, useState } from 'react'
import UserListMobile from '../Components/UserListMobile'
import Messages from '../Components/Messages'

function TestCarousel() {

    const [selectedUser, setSelectedUser] = useState(null);
      // SelectedUser
      useEffect(() => {
        const UserSelected = localStorage.getItem("SelectedUser");
        if (UserSelected) {
          setSelectedUser(JSON.parse(UserSelected));
        }
      }, []);
  return (
    <div className="carousel w-full ">
  <div id="slide1" className="carousel-item relative w-full">
    <UserListMobile selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
  </div>
  <div id="slide2" className="carousel-item relative w-full">
    <Messages selectedUser={selectedUser} />
  </div>
</div>
  )
}

export default TestCarousel
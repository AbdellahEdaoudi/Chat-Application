"use client";
import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image'; // If using Next.js
import { useRouter } from 'next/navigation'; // If using Next.js
import { MyContext } from '../Context/MyContext';

const ContactForm = () => {
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [iduser, setIduser] = useState('');
  const [Loading, setLoading] = useState(false);
  const {userDetails,EmailUser,SERVER_URL_V}=useContext(MyContext);

  useEffect(() => {
    const user = userDetails.find(user => user.email === EmailUser);
    if (user) {
      setEmail(user.email);
      setPhoneNumber(user.phoneNumber);
      setIduser(user._id);
    }
  }, [userDetails, EmailUser]);

  const sendContact = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('Data Send:', { iduser ,email, phoneNumber, message });
      await axios.post(`${SERVER_URL_V}/contacts`, {iduser, email, phoneNumber, message });
      alert('Contact added successfully!');
      setMessage('');
    } catch (error) {
      console.error('Error adding contact:', error);
      alert('An error occurred while adding the contact.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="  pt-4 pb-28 px-4 flex flex-col-reverse md:flex-row items-center justify-center bg-gradient-to-r from-teal-50 to-teal-200">
      <div className='md:w-1/2 flex justify-center mb-6 md:mb-0'>
        <Image src={"/Conatct.png"} width={300} height={300} alt="Contact Image"/>
      </div>
      <div className="md:w-1/2 w-full bg-white p-6 rounded-lg shadow-md mb-3 md:mb-0">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Contact Us</h2>
        <form onSubmit={sendContact}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-base font-medium mb-1">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e)=>{setEmail(e.target.value)}}
              className="w-full px-3 py-2 border bg-white text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="number" className="block text-gray-700 text-base font-medium mb-1">Phone Number</label>
            <input
              type="text"
              id="number"
              value={phoneNumber}
              onChange={(e)=>{setPhoneNumber(e.target.value)}}
              className="w-full px-3 py-2 border bg-white text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
              placeholder="Enter your phone number"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="message" className="block text-gray-700 text-base font-medium mb-1">Message</label>
            <textarea
              id="message"
              value={message}
              onChange={(e)=>{setMessage(e.target.value)}}
              className="w-full px-3 py-2 border border-gray-300 text-black bg-white rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
              rows="3"
              placeholder="Enter your message"
              required
            />
          </div>
          <button
            disabled={Loading}
            type="submit"
            className="w-full bg-gradient-to-r from-teal-400 to-teal-500 text-white py-2 px-4 rounded-md hover:from-teal-500 hover:to-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-transform duration-200"
          >
            {Loading ? <>Sending <i className="fa fa-spinner fa-spin "></i></> : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;

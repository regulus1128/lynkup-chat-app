import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import NoChatSelected from '../components/NoChatSelected';
import ChatContainer from '../components/ChatContainer';
import Sidebar from '../components/Sidebar';

const HomePage = () => {
  const dispatch = useDispatch();
  const { users, messages, selectedUser, isUsersLoading, isMessagesLoading } = useSelector(state => state.chat);

  
  return (
    <div className="w-full h-screen bg-base-200">
  <div className="w-full h-full">
    <div className="bg-base-100 w-full h-full">
      <div className="flex h-full rounded-none overflow-hidden">
        <Sidebar />
        {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
      </div>
    </div>
  </div>
</div>
  )
}

export default HomePage
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { X } from "lucide-react";
import { setSelectedUser } from '../features/chatSlice';
import { useNavigate } from 'react-router-dom';

const ChatHeader = ({ onOpenAbout }) => {

    const { selectedUser, typing } = useSelector((state) => state.chat);
    const { onlineUsers } = useSelector((state) => state.socket);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const navigateToAbout = () => {
        // dispatch(setSelectedUser(null));
        navigate("/about");
    }


  return (
    <div className="p-2.5 mt-15 border-b border-base-300 hanken-grotesk backdrop-blur-lg bg-base-100/80">
    <div onClick={onOpenAbout} className="flex items-center justify-between cursor-pointer">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="avatar">
          <div className="size-10 rounded-full relative">
            <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
          </div>
        </div>
        
        {/* User info */}
        <div >
          <h3 className="font-medium text-primary">{selectedUser.fullName}</h3>
          <p className="text-sm text-primary">
            {typing ? (
              <span className="italic ">Typing...</span>
            ) : (
              onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"
            )}
          </p>
        </div>
      </div>
      
      {/* Close button */}
      <button className="cursor-pointer hover:text-primary" onClick={() => dispatch(setSelectedUser(null))}>
        <X />
      </button>
    </div>
  </div>
  )
}

export default ChatHeader
import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { getMessages } from '../features/chatSlice';
import ChatHeader from './ChatHeader';
import MessageInput from './MessageInput';
import MessageSkeleton from './skeletons/MessageSkeleton';
import { formatMessageTime } from '../lib/utils';

const ChatContainer = () => {
  const { messages, isMessagesLoading, selectedUser } = useSelector((state) => state.chat);
  const { authUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const messageEndRef = useRef(null);

  
  useEffect(() => {
    if(selectedUser?._id){
      const res = dispatch(getMessages(selectedUser._id));
      console.log('messages', res);
    }
  }, [dispatch, selectedUser?._id]);

  useEffect(() => {
    if(messageEndRef.current && messages.length > 0) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  
  }, [messages]);

  if(isMessagesLoading) { 
    return (
    <div className='flex-1 flex flex-col overflow-auto'>
      <ChatHeader/>
      <MessageSkeleton/>
      <MessageInput/>
    </div>
    )
  }




  return (
    <div className='flex-1 flex flex-col overflow-auto hanken-grotesk'>
      <ChatHeader/>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            No messages yet. Start a conversation!
          </div>
        )}
        
        {messages.map((message, index) => {
          const isLastMessage = index === messages.length - 1;
          return (
            <div
              key={message._id}
              className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
              ref={isLastMessage ? messageEndRef : null}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full">
                  <img
                    src={
                      message.senderId === authUser._id
                        ? authUser.profilePic || "/avatar.png"
                        : selectedUser.profilePic || "/avatar.png"
                    }
                    alt="profile pic"
                  />
                </div>
              </div>
              <div className="chat-header mb-1">
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>
              <div className="chat-bubble flex flex-col bg-primary text-primary-content"> 
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                )}
                {message.text && <p className=''>{message.text}</p>}
              </div>
            </div>
          )
        })}
      </div>

      <MessageInput/>
    </div>
  )
}

export default ChatContainer
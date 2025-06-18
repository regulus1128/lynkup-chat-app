import React, { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Image, Send, X, Smile } from "lucide-react";
import toast from "react-hot-toast";
import { sendMessage } from "../features/chatSlice";
import EmojiPicker from 'emoji-picker-react';
import { sendTypingStatus, socket } from "../features/socketSlice";

const MessageInput = () => {
  const dispatch = useDispatch();
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { selectedUser } = useSelector((state) => state.chat);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const typingTimeoutRef = useRef(null);
  const [hasNotifiedTyping, setHasNotifiedTyping] = useState(false);

  const isTypingRef = useRef(false);

  const handleTypingStatus = (newText) => {
    if (!selectedUser) return;
  
    const isGroup = selectedUser.members;
    const wasEmpty = !text.trim();
    const isEmpty = !newText.trim();
  
    const typingTarget = isGroup
      ? { groupId: selectedUser._id }
      : { receiverId: selectedUser._id };
  
    if (!isEmpty && (wasEmpty || !isTypingRef.current)) {
      sendTypingStatus(true, typingTarget);
      isTypingRef.current = true;
    } else if (isEmpty && isTypingRef.current) {
      sendTypingStatus(false, typingTarget);
      isTypingRef.current = false;
    }
  
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  
    if (!isEmpty) {
      typingTimeoutRef.current = setTimeout(() => {
        if (isTypingRef.current) {
          sendTypingStatus(false, typingTarget);
          isTypingRef.current = false;
        }
      }, 700);
    }
  };
  

  

  

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
  
      if (isTypingRef.current && selectedUser) {
        const isGroup = selectedUser.members;
        sendTypingStatus(false, {
          receiverId: isGroup ? null : selectedUser._id,
          groupId: isGroup ? selectedUser._id : null,
        });
        isTypingRef.current = false;
      }
    };
  }, [selectedUser]);
  

  

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
  
    const isGroup = selectedUser?.members;
  
    try {
      await dispatch(
        sendMessage({
          userId: isGroup ? null : selectedUser._id,
          messageData: {
            text: text.trim(),
            image: imagePreview,
            groupId: isGroup ? selectedUser._id : null,
          },
        })
      );
  
      // Clear form
      setText("");
      setImagePreview(null);
      setShowEmojiPicker(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (hasNotifiedTyping) {
        sendTypingStatus(false, {
          receiverId: isGroup ? null : selectedUser._id,
          groupId: isGroup ? selectedUser._id : null,
        });
        setHasNotifiedTyping(false);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };
  

  const onEmojiClick = (emojiData) => {
    const newText = text + emojiData.emoji;
    setText((prev) => prev + emojiData.emoji);
    handleTypingStatus(newText);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker((prev) => !prev);
  };

  const handleTyping = () => {
    if (selectedUser && socket?.connected) {
      socket.emit("typing", { receiverId: selectedUser._id });
    }
  };

  return (
    <div className="p-4 w-full hanken-grotesk">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="border py-1 pl-2 rounded-sm w-full input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => {
              const newText = e.target.value;
              setText(e.target.value);
              handleTypingStatus(newText);
              
            }}
            disabled={!selectedUser}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle
                     ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={toggleEmojiPicker}
              className="btn btn-circle text-zinc-400"
            >
              <Smile size={20} />
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-12 right-0 z-50">
                <EmojiPicker onEmojiClick={onEmojiClick} />
              </div>
            )}
          </div>

        </div>
        <button
          type="submit"
          className="btn btn-circle"
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;

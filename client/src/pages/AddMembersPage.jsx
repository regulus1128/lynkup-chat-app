import React, { useEffect, useState } from 'react'
import { X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getGroupDetails, getUsers } from "../features/chatSlice";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

const SYSTEM_ID = import.meta.env.VITE_SYSTEM_USER_ID;

const AddMembersPage = ({ onClose }) => {
    const dispatch = useDispatch();
    const { users, selectedUser } = useSelector((state) => state.chat);
    const { authUser } = useSelector((state) => state.auth);
    const [selectedMembers, setSelectedMembers] = useState([]);

    useEffect(() => {
      dispatch(getUsers());
    }, [getUsers]);

    // console.log("selected user", selectedUser);

    const excludedIds = [
        selectedUser?.createdBy?._id,
        ...selectedUser?.members.map(m => m._id)
    ];

    const availableUsers = users.filter(user => !excludedIds.includes(user._id));
  
    const toggleMember = (userId) => {
      setSelectedMembers((prev) =>
        prev.includes(userId)
          ? prev.filter((id) => id !== userId)
          : [...prev, userId]
      );
    };
  
    const handleAddMembers = async (groupId) => {
        if(selectedMembers.length === 0){
            toast.error("Please select at least one member!");
            return;
        }

        try {
            const res = await axiosInstance.post(`/group/${groupId}/add`, { newMembers: selectedMembers }, { withCredentials: true });
            console.log(res);

            if (res.status === 200) {
                toast.success("Members added successfully!");
                // dispatch(getMessages({ id: selectedUser._id, isGroup: true })); // Optional: refresh group messages if needed
                await dispatch(getGroupDetails(selectedUser._id));
                onClose(); // Close the popup
            }
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong!");
        }
    }
  
    return (
      <div className="h-full m-3 hanken-grotesk">
        <div className="max-w-2xl mx-auto relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-6 text-sm text-zinc-500 hover:text-accent cursor-pointer"
          >
            <X />
          </button>
          <div className="bg-base-300 rounded-xl p-6 space-y-8">
            {/* Info Section */}
            <div className="">
              <h1 className="text-xl">
                {selectedMembers.length}{" "}
                {selectedMembers.length > 0 ? "" : ""} out of {availableUsers.length - 1}{" "}
                selected
              </h1>
  
              <hr className="mt-2" />
              <div className="mt-2">
                <div
                  className="overflow-y-auto pr-2 scrollbar-thumb-custom 
                 scrollbar
                  scrollbar-thumb-rounded-full 
                 scrollbar-track-custom-light scrollbar-thumb-zinc-400 
                 scrollbar-hover:scrollbar-thumb-primary
                 scrollbar-active:scrollbar-thumb-primary"
                  style={{ maxHeight: "200px" }} // adjust as needed
                >
                  {Array.isArray(availableUsers) && availableUsers
                  .filter((user) => user._id !== SYSTEM_ID)
                  .map((user) => (
                    <div key={user._id} className="flex items-center gap-2 mt-3">
                      <img
                        src={user.profilePic || "/avatar.png"}
                        alt={user.name}
                        className="size-8 rounded-full"
                      />
                      <span>{user.fullName}</span>
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(user._id)}
                        onChange={() => toggleMember(user._id)}
                        className="ml-auto"
                      />
                    </div>
                  ))}
                </div>
  
                <button
                  onClick={() => handleAddMembers(selectedUser._id)}
                  className="btn btn-primary w-full mt-3"
                >
                  ADD
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}

export default AddMembersPage
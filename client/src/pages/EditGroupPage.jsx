import React, { useEffect, useState } from 'react'
import { Camera, Mail, User, IdCard, X } from "lucide-react";
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../features/authSlice';
import toast from 'react-hot-toast';
import { axiosInstance } from '../lib/axios';
import { getAllGroups, getGroupDetails, setSelectedUser } from '../features/chatSlice';

const EditGroupPage = ({ onClose }) => {

    const dispatch = useDispatch();
    const { selectedUser } = useSelector((state) => state.chat);
    const { authUser } = useSelector((state) => state.auth);
    const [groupName, setGroupName] = useState("");
    const [selectedImg, setSelectedImg] = useState("");
    const [base64Image, setBase64Image] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

    const isCreator = selectedUser?.createdBy?._id === authUser._id;

    useEffect(() => {
     if(selectedUser?._id){
      setGroupName(selectedUser.name || "");
      setSelectedImg(selectedUser.groupAvatar || "/avatar.png");
     } 
    }, [selectedUser]);


    const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if(!file) return;

      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onloadend = () => {
        setSelectedImg(reader.result);
        setBase64Image(reader.result);
      }
    };

    const handleUpdate = async () => {
      if(!isCreator){
        toast.error("Only the creator can update the group!");
        return;
      }

      try {
        setIsUpdating(true);
        const res = await axiosInstance.put(`/group/edit-group/${selectedUser._id}`, {
          groupPic: base64Image,
          groupName,
        }, { withCredentials: true });
        console.log(res);
        if(res.data.success){
          toast.success(res.data.message);
          dispatch(getGroupDetails(selectedUser._id));
          dispatch(getAllGroups());
          dispatch(setSelectedUser(res.data.updatedGroup));
          onClose();
        }
      } catch (error) {
        console.log(error);
        toast.error(error.response?.data?.message || "Failed to update group!");
      } finally {
        setIsUpdating(false);
      }
    };

  return (
    <div className="min-h-screen pt-20 hanken-grotesk">
      <div className="max-w-2xl mx-auto p-4 py-8 relative">
      <button
            onClick={onClose}
            className="absolute top-11 right-6 text-sm text-zinc-500 hover:text-accent cursor-pointer"
          >
            <X />
          </button>
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover"
              />
              <label
                htmlFor="avatar-upload"
                className={`absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  `
                }
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
          </div>

          {/* Editable Inputs */}
          <div className="space-y-6">
            <div className="space-y-1.5">
              <input
                type="text"
                className="border py-3 rounded-sm w-full pl-3"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                disabled={!isCreator || isUpdating}
                placeholder='Group name'
              />
            </div>

            

            <button
              className="btn btn-primary w-full"
              onClick={handleUpdate}
              disabled={!isCreator || isUpdating}
            >
              {isUpdating ? "Updating..." : "Save Changes"}
            </button>
          </div>

          
          
        </div>
      </div>
    </div>
  )
}

export default EditGroupPage
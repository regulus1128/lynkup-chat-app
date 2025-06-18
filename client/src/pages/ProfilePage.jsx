import React, { useEffect, useState } from 'react'
import { Camera, Mail, User, IdCard } from "lucide-react";
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../features/authSlice';



const ProfilePage = () => {
  const { authUser, isUpdatingProfile } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [selectedImg, setSelectedImg] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (authUser) {
      setFullName(authUser.fullName);
      setEmail(authUser.email);
      setBio(authUser.bio);
      setSelectedImg(authUser.profilePic);
    }
  }, [authUser]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await dispatch(updateProfile({ profilePic: base64Image }));
    };
  };

  const handleUpdate = () => {
    dispatch(updateProfile({
      fullName,
      email,
      bio,
      profilePic: selectedImg || authUser?.profilePic, // Ensure image is preserved
    }));
  };

  return (
    <div className="min-h-screen pt-20 hanken-grotesk">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold ">PROFILE</h1>
          </div>

          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-2"
              />
              <label
                htmlFor="avatar-upload"
                className={`absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}`}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm">
              {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>

          {/* Editable Inputs */}
          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-sm flex items-center gap-2 mb-2">
                <User className="w-4 h-4" />
                Full Name
              </label>
              <input
                type="text"
                className="border py-3 rounded-sm w-full pl-3"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isUpdatingProfile}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <input
                type="email"
                className="border py-3 rounded-sm w-full pl-3"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isUpdatingProfile}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm flex items-center gap-2 mb-2">
                {/* <Mail className="w-4 h-4" /> */}
                <IdCard className='w-4 h-4'/>
                Bio
              </label>
              <input
                type="email"
                className="border py-3 rounded-sm w-full pl-3"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={isUpdatingProfile}
              />
            </div>

            <button
              className="btn btn-primary rounded-full w-full"
              onClick={handleUpdate}
              disabled={isUpdatingProfile}
            >
              {isUpdatingProfile ? "Updating..." : "Save Changes"}
            </button>
          </div>

          {/* Info Section */}
          <div className=" bg-base-300 rounded-xl p-6">
            <div className=" text-sm">
              <div className="flex items-center justify-between py-2">
                <span>Member Since</span>
                <span>{new Date(authUser.createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}</span>
                
              </div>
              {/* <button className="btn btn-secondary w-full mt-4">Delete Account</button> */}
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default ProfilePage
import { EyeOff, MessageSquare, User, Eye, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import AuthImagePattern from "../components/AuthImagePattern";
import toast, { Toaster } from 'react-hot-toast';
import { signup } from "../features/authSlice";
import { CiUser } from "react-icons/ci";
import { CiLock } from "react-icons/ci";
import { MdOutlineEmail } from "react-icons/md";




const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    bio: "",
  });
  const { isSigningUp } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = validateForm();

    if (success === true) dispatch(signup(formData));
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 hanken-grotesk" >
      {/* left side  */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* logo  */}
          <div className="text-center mt-6">
            <div className="flex flex-col items-center gap-2 group">
              <div className="size-12 rounded-sm bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Create Account</h1>
              <p className="text-base-content/60">
                Get started with your free account
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium mb-2">Full Name</span>
              </label>
              
              <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CiUser size={20}/>
                </div>
                
                <input
                  type="text"
                  className={`border py-3 rounded-sm w-full pl-10`}
                  placeholder="John Does"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text font-medium mb-2">Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MdOutlineEmail size={20}/>
                </div>
                <input
                  type="email"
                  className={`border py-3 rounded-sm w-full pl-10`}
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text font-medium mb-2">Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CiLock size={20}/>

                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className={`border py-3 rounded-sm w-full pl-10`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-base-content/40" />
                  ) : (
                    <Eye className="h-5 w-5 text-base-content/40" />
                  )}
                </button>
              </div>
            </div>
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text font-medium mb-2">Bio (optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">

                </div>
                <input
                  type="text"
                  className={`border py-3 rounded-sm w-full pl-3`}
                  placeholder="Tell us about yourself"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary rounded-sm w-full mt-5"
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                </>
              ) : (
                "CREATE ACCOUNT"
              )}
            </button>
          </form>
          <div className="text-center mt-2">
            <p className="text-base-content">
              Already have an account?{" "}
              <Link to="/login" className="hover:link hover:link-primary">
                Click here to sign in.
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* right side  */}
      <AuthImagePattern
      title={"Join our community"}
      subtitle={"Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti maxime dolore consequuntur fugit"}/>
    </div>
  );
};

export default SignUpPage;

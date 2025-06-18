import React from 'react'
import { LogOut, MessageSquare, Settings, User, Users } from "lucide-react";
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../features/authSlice';
import { Link } from 'react-router-dom'


const Navbar = ({ onStartGroupChat }) => {
  const { authUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const logout = async () => {
    try {
      await dispatch(logoutUser());
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className='hanken-grotesk'>
       <header
      className="border-b border-base-300 fixed w-full top-0 z-40 
    backdrop-blur-lg bg-base-100/80"
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-xl font-bold">LYNKUP</h1>
            </Link>
          </div>

          

          <div className="flex items-center gap-2">
          {authUser && (
              <>
                <button onClick={onStartGroupChat} className={`btn btn-sm gap-2`}>
                  <Users className="size-5" />
                  <span className="hidden sm:inline">Start a group chat</span>
                </button>
              </>
            )}
            <Link
              to={"/settings"}
              className={`
              btn btn-sm gap-2 transition-colors
              
              `}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline rounded-full">Settings</span>
            </Link>

            {authUser && (
              <>
                <Link to={"/profile"} className={`btn btn-sm gap-2`}>
                  <User className="size-5" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>

                <button className="flex gap-2 btn btn-sm transition-colors items-center" onClick={logout}>
                  <LogOut className="size-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
    </div>
  )
}

export default Navbar
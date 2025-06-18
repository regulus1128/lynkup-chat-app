import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "./features/authSlice";
import { Loader } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { connectSocket } from "./features/socketSlice";
import AboutPage from "./pages/AboutPage";
import GroupPage from "./pages/GroupPage";

const App = () => {
  const dispatch = useDispatch();
  const { authUser, isCheckingAuth } = useSelector((state) => state.auth);
  const { onlineUsers } = useSelector((state) => state.socket);
  const theme = useSelector((state) => state.theme.theme);
  const [showGroupModal, setShowGroupModal] = useState(false);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    if (authUser) {
      // console.log("authUser is ready in component:", authUser);
      dispatch(connectSocket());
    }
  }, [authUser, dispatch]);

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <div data-theme={theme}>
      <Navbar onStartGroupChat={() => setShowGroupModal(true)} />
      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route path="/settings" element={<SettingsPage />} />
        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/about"
          element={
            authUser ? (
              <AboutPage/>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
      {showGroupModal && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-lg mt-20 rounded-lg relative">
            <GroupPage onClose={() => setShowGroupModal(false)} />
          </div>
        </div>
      )}
      <Toaster />
    </div>
  );
};

export default App;

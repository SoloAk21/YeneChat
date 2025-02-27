import React, { useState } from "react";
import useAuthStore from "../store/useAuthStore";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { User, Settings, LogOut, Menu } from "lucide-react";

function Navbar() {
  const { authUser, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully!");
    } catch (error) {
      console.error("Logout error", error);
      toast.error("Logout failed. Try again.");
    }
    setIsMenuOpen(false); // Close the menu after logout
  };

  const handleMenuItemClick = () => {
    setIsMenuOpen(false); // Close the menu when any item is clicked
  };

  return (
    <nav className="fixed z-50 top-0 left-0 right-0  shadow-md">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        {/* Left side (App name) */}
        <div className="text-xl font-bold">
          <Link to="/">YeneChat</Link>
        </div>

        {/* Right side (Hamburger Menu for Mobile) */}
        <div className="flex items-center gap-4 md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 focus:outline-none"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Collapsed Menu for Mobile */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 right-4  p-4 rounded-md shadow-md">
            {authUser ? (
              <div className="flex flex-col gap-2">
                <Link
                  to="/profile"
                  className="btn btn-ghost flex items-center gap-1"
                  onClick={handleMenuItemClick}
                >
                  <User className="w-5 h-5" />
                  Profile
                </Link>

                <Link
                  to="/settings"
                  className="btn btn-ghost flex items-center gap-1"
                  onClick={handleMenuItemClick}
                >
                  <Settings className="w-5 h-5" />
                  Settings
                </Link>

                <button
                  onClick={handleLogout}
                  className="btn btn-ghost flex items-center gap-1"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  className="btn btn-ghost"
                  onClick={handleMenuItemClick}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="btn btn-ghost"
                  onClick={handleMenuItemClick}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4">
          {authUser ? (
            <>
              <Link
                to="/profile"
                className="btn btn-ghost flex items-center gap-1"
              >
                <User className="w-5 h-5" />
                Profile
              </Link>

              <Link
                to="/settings"
                className="btn btn-ghost flex items-center gap-1"
              >
                <Settings className="w-5 h-5" />
                Settings
              </Link>

              <button
                onClick={handleLogout}
                className="btn btn-ghost flex items-center gap-1"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">
                Login
              </Link>
              <Link to="/signup" className="btn btn-ghost">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

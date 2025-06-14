import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, User, LogOut, Menu, X, BarChart3 } from "lucide-react";
import api from "../services/api";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await api.get("/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUserName(response.data.name);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      // אם נכשל בקבלת הפרופיל, אולי הטוקן לא תקין
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setUserName("");
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      fetchUserProfile();
    } else {
      setIsLoggedIn(false);
      setUserName("");
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUserName("");
    navigate("/");
  };

  const handleDashboardClick = (e) => {
    if (!isLoggedIn) {
      e.preventDefault();
      navigate("/login", {
        state: {
          message: "You need to log in to access the dashboard",
          redirectTo: "/dashboard",
        },
      });
    }
  };

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  if (isAuthPage) {
    return null; // Don't show navbar on auth pages
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white shadow-soft border-b border-gray-200 sticky top-0 z-40"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center group-hover:bg-primary-700 transition-colors">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
              NotifySDK
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {/* Dashboard Link - Always visible but with different behavior */}
            <Link
              to={isLoggedIn ? "/dashboard" : "/login"}
              onClick={handleDashboardClick}
              className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </Link>

            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-600" />
                  </div>
                  <span className="text-sm font-medium">{userName}</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-gray-600 hover:text-error-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="btn-outline">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 py-4"
          >
            <div className="space-y-4">
              {/* Dashboard Link - Always visible in mobile */}
              <Link
                to={isLoggedIn ? "/dashboard" : "/login"}
                onClick={(e) => {
                  handleDashboardClick(e);
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </Link>

              {isLoggedIn ? (
                <>
                  <div className="flex items-center gap-2 text-gray-700 py-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-600" />
                    </div>
                    <span className="text-sm font-medium">{userName}</span>
                  </div>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-2 text-gray-600 hover:text-error-600 transition-colors w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <Link
                    to="/login"
                    className="block w-full text-center btn-outline"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block w-full text-center btn-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}

export default Navbar;

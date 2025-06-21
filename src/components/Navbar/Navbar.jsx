import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";
import { Usercontext } from "../../context/Usercontext";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { SearchContext } from "../../context/Searchcontext"; // Use consistent casing

const Navbar = () => {
  const [searchInput, setSearchInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(Usercontext);
  const location = useLocation();
  const { setSearch } = useContext(SearchContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    const symbol = searchInput.trim().toUpperCase();
    if (symbol) {
      setSearch({ term: symbol, page: location.pathname });
      setSearchInput("");
    }
  };

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light"
    );
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="navbar-title">Market Pulse</span>
      </div>
      <form className="navbar-search" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
      <div className="navbar-links">
        <Link to="/">DashBoard</Link>
        <Link to="/stocks">Stocks</Link>
        <Link to="/crypto">Crypto</Link>
        <Link to="/news">News</Link>
        <div
          className="navbar-profile"
          onMouseEnter={() => setShowDropdown(true)}
          onMouseLeave={() => setShowDropdown(false)}
        >
          <span>{user ? user.displayName || user.email : "Profile"}</span>
          {showDropdown && (
            <div className="profile-dropdown">
              <button onClick={handleSignOut}>Sign Out</button>
            </div>
          )}
        </div>
      </div>
      <button className="theme-toggle-btn" onClick={toggleTheme}>
        {darkMode ? "🌙" : "🔆"}
      </button>
    </nav>
  );
};

export default Navbar;

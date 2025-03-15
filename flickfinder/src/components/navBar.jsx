import React from "react";
import "../styles/navBar.css";
import FlickFinderLogo from "../assets/FlickFinder-transparant.png"
function NavBar() {
  return (
      <div className="nav-bar">
        <div className="nav-buttons">
          <img src={FlickFinderLogo} alt="" />
            <button type="button">Movies</button>
            <button type="button">TV Shows</button>
            <button type="button">People</button>
        </div>
        <div className="search-bar">
          <input type="text" name="search" id="search-input" placeholder="Search..." />
          <button type="submit">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
      </div>
  );
}

export default NavBar;

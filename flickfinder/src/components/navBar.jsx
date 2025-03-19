import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/navBar.css";
import FlickFinderLogo from "../assets/FlickFinder-transparant.png";

function NavBar() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResult([]);
      setShowDropdown(false);
      return;
    }
    const fetchResults = async () => {
      const encodedQuery = encodeURIComponent(query);
      try {
        const response = await axios.get(`http://localhost:3131/api/search/multi?query=${encodedQuery}`);
        setResult(response.data.results);
        setShowDropdown(response.data.results.length > 0); // Show only if results exist
      } catch (error) {
        console.log(`Error getting Search Result: ${error.message}`);
      }
    };
    fetchResults();
  }, [query]);

  return (
    <div className="nav-bar">
      <div className="nav-buttons">
        <img src={FlickFinderLogo} alt="FlickFinder Logo" />
        <button type="button">Movies</button>
        <button type="button">TV Shows</button>
        <button type="button">People</button>
      </div>
      <div className="search-bar">
        <div className="search-container">
          <input
            value={query}
            type="text"
            name="search"
            id="search-input"
            placeholder="Search..."
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim() && setShowDropdown(true)}
            onBlur={(e) => {
              if (!e.relatedTarget || !e.relatedTarget.closest(".showSearchResult")) {
                setShowDropdown(false);
              }
            }}
          />
          {showDropdown && (
            <div className="showSearchResult" tabIndex="0">
              <ul>
                {result.map((item) => (
                  <li key={item.id}>{item.title || item.name}, {item.media_type}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
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

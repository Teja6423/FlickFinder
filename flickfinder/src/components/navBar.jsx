import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../styles/navBar.css";
import FlickFinderLogo from "../assets/FlickFinder-transparant.png";

function NavBar() {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [result, setResult] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const delayRef = useRef(null);

    useEffect(() => {
        if (delayRef.current) clearTimeout(delayRef.current);

        if (!query.trim()) {
            setResult([]);
            setShowDropdown(false);
            return;
        }

        delayRef.current = setTimeout(() => {
            const fetchResults = async () => {
                try {
                    const response = await axios.get(`http://localhost:3131/api/search/multi?query=${encodeURIComponent(query)}`);
                    setResult(response.data.results);
                    setShowDropdown(response.data.results.length > 0);
                } catch (error) {
                    console.error(`Error getting search result: ${error.message}`);
                }
            };
            fetchResults();
        }, 500); // ✅ Debounce delay

        return () => clearTimeout(delayRef.current);
    }, [query]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="nav-bar">
            <div className="nav-buttons">
                <Link to="/"><img src={FlickFinderLogo} alt="FlickFinder Logo" /></Link>
                <button type="button">Movies</button>
                <button type="button">TV Shows</button>
                <button type="button">People</button>
            </div>
            <div className="search-bar">
                <div className="search-container">
                    <input
                        value={query}
                        type="text"
                        placeholder="Search..."
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => query.trim() && setShowDropdown(true)}
                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)} // ✅ Allow clicks before hiding
                    />
                    {showDropdown && (
                        <div className="showSearchResult" ref={dropdownRef}>
                            <ul>
                                {result.map((item) => (
                                    <li key={item.id} 
                                        onClick={() => {
                                            navigate(`/${item.media_type}/${item.id}`);
                                            setShowDropdown(false); // ✅ Close dropdown on selection
                                        }}>
                                        {item.title || item.name}, {item.media_type}, {item.first_air_date?.split("-")[0] || item.release_date?.split("-")[0] || "N/A"}
                                    </li>
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

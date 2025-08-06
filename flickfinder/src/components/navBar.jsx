import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import FlickFinderLogo from "../assets/FlickFinder-transparant.png";
import posterAlt from "../assets/Poster_Not_Available2.webp";

const weblink = import.meta.env.VITE_API_URL;

function NavBar() {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [result, setResult] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const delayRef = useRef(null);

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const fetchDataWithRetry = async (url, retries = 5) => {
        for (let attempts = 1; attempts <= retries; attempts++) {
            try {
                const response = await axios.get(url);
                return response.data;
            } catch (error) {
                console.log(`Attempt ${attempts} failed for ${url}`, error);
                if (attempts < retries) {
                    await delay(500);
                } else {
                    console.error(`Failed to fetch after ${retries} attempts: ${url}`);
                    throw new Error(`Failed to fetch data from ${url} after ${retries} attempts`);
                }
            }
        }
        return null;
    };

    useEffect(() => {
        if (delayRef.current) clearTimeout(delayRef.current);

        if (!query.trim()) {
            setResult([]);
            setShowDropdown(false);
            setError(false);
            return;
        }

        delayRef.current = setTimeout(() => {
            const fetchResults = async () => {
                try {
                    setLoading(true);
                    setError(false);
                    setShowDropdown(true);

                    const response = await fetchDataWithRetry(
                        `${weblink}/search/multi?query=${encodeURIComponent(query)}`
                    );

                    // Sort by popularity
                    const sortedResults = [...response.results].sort(
                        (a, b) => (b.popularity || 0) - (a.popularity || 0)
                    );

                    setResult(sortedResults);
                } catch (error) {
                    console.error(`Error getting search result: ${error.message}`);
                    setError(true);
                    setShowDropdown(true);
                } finally {
                    setLoading(false);
                }
            };
            fetchResults();
        }, 900);

        return () => clearTimeout(delayRef.current);
    }, [query]);

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
            </div>
            <div className="search-bar">
                <div className="search-container">
                    <input
                        value={query}
                        type="text"
                        placeholder="Search..."
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => query.trim() && setShowDropdown(true)}
                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    />
                    {showDropdown && (
                        <div className="showSearchResult" ref={dropdownRef}>
                            <ul>
                                {error ? (
                                    <p style={{ color: "red", padding: "10px" }}>API Error: search again...</p>
                                ) : loading ? (
                                    <p style={{ padding: "10px" }}>Loading...</p>
                                ) : result.length > 0 ? (
                                    result.map((item) => (
                                        <li
                                            key={item.id}
                                            onClick={() => {
                                                navigate(`/${item.media_type}/${item.id}`);
                                                setShowDropdown(false);
                                            }}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "12px",
                                                padding: "8px",
                                                borderBottom: "1px solid #eee",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <img
                                                src={
                                                    item.media_type === "person"
                                                        ? (item.profile_path
                                                            ? `https://image.tmdb.org/t/p/w92/${item.profile_path}`
                                                            : posterAlt) // fallback if no profile picture
                                                        : (item.poster_path
                                                            ? `https://image.tmdb.org/t/p/w92/${item.poster_path}`
                                                            : posterAlt) // fallback if no poster
                                                }
                                                alt={item.title || item.name}
                                                style={{
                                                    width: "50px",
                                                    height: "75px",
                                                    objectFit: "cover",
                                                    borderRadius: "4px",
                                                }}
                                            />
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 600 }}>{item.title || item.name}</p>
                                                <p style={{ margin: 0, fontSize: "0.85rem", color: "#666" }}>
                                                    {item.media_type.charAt(0).toUpperCase() + item.media_type.slice(1)}
                                                    {item.media_type !== "person" && (
                                                        `, ${item.first_air_date?.split("-")[0] ||
                                                        item.release_date?.split("-")[0] ||
                                                        "N/A"}`
                                                    )}
                                                </p>
                                            </div>
                                        </li>
                                    ))
                                ) : (
                                    <p style={{ padding: "10px" }}>No results found...</p>
                                )}
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

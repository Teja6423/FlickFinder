import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import FlickFinderLogo from "../assets/FlickFinder-transparant.png";
import posterAlt from "../assets/Poster_Not_Available2.webp";
import { fetchDataWithRetry } from "../api";

const weblink = import.meta.env.VITE_API_URL;

const BADGE_CONFIG = {
    movie:  { label: "Movie",  cls: "badge-movie"  },
    tv:     { label: "TV",     cls: "badge-tv"     },
    person: { label: "Person", cls: "badge-person" },
};

function NavBar() {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [result, setResult] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);
    const delayRef = useRef(null);

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

                    if (!response) {
                        setError(true);
                        return;
                    }

                    // Sort by popularity
                    const sortedResults = [...response.results].sort(
                        (a, b) => (b.popularity || 0) - (a.popularity || 0)
                    );

                    setResult(sortedResults);
                } catch (err) {
                    console.error(`Error getting search result: ${err.message}`);
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
        setActiveIndex(-1);
    }, [result]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleKeyDown = (e) => {
        if (!showDropdown || result.length === 0) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex(prev => Math.min(prev + 1, result.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex(prev => Math.max(prev - 1, -1));
        } else if (e.key === "Enter" && activeIndex >= 0) {
            e.preventDefault();
            const item = result[activeIndex];
            navigate(`/${item.media_type}/${item.id}`);
            setShowDropdown(false);
            setQuery("");
        } else if (e.key === "Escape") {
            setShowDropdown(false);
        }
    };

    const clearSearch = () => {
        setQuery("");
        setShowDropdown(false);
        setResult([]);
        setActiveIndex(-1);
        inputRef.current?.focus();
    };

    const handleResultClick = (item) => {
        navigate(`/${item.media_type}/${item.id}`);
        setShowDropdown(false);
        setQuery("");
    };

    return (
        <div className="nav-bar">
            <div className="nav-buttons">
                <Link to="/"><img src={FlickFinderLogo} alt="FlickFinder Logo" /></Link>
            </div>
            <form
                className="search-bar"
                ref={dropdownRef}
                onSubmit={(e) => {
                    e.preventDefault();
                    if (query.trim()) setShowDropdown(true);
                }}
            >
                <div className="search-container">
                    <input
                        ref={inputRef}
                        value={query}
                        type="text"
                        placeholder="Search movies, shows, people..."
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => query.trim() && setShowDropdown(true)}
                        onKeyDown={handleKeyDown}
                    />
                    {showDropdown && (
                        <div className="showSearchResult">
                            {!loading && !error && result.length > 0 && (
                                <div className="search-result-header">
                                    {result.length} result{result.length !== 1 ? "s" : ""} for <em>"{query}"</em>
                                </div>
                            )}
                            <ul>
                                {error ? (
                                    <li className="result-state-item">
                                        <span className="result-state-icon">⚠</span>
                                        <span>API error — try again</span>
                                    </li>
                                ) : loading ? (
                                    [1, 2, 3].map(i => (
                                        <li key={i} className="result-skeleton">
                                            <div className="skeleton-img" />
                                            <div className="skeleton-text">
                                                <div className="skeleton-line skeleton-title-line" />
                                                <div className="skeleton-line skeleton-meta-line" />
                                            </div>
                                        </li>
                                    ))
                                ) : result.length > 0 ? (
                                    result.map((item, index) => {
                                        const badge = BADGE_CONFIG[item.media_type] || { label: item.media_type, cls: "" };
                                        const year = item.first_air_date?.split("-")[0] || item.release_date?.split("-")[0];
                                        return (
                                            <li
                                                key={item.id}
                                                className={`result-item${index === activeIndex ? " result-active" : ""}`}
                                                onClick={() => handleResultClick(item)}
                                            >
                                                <img
                                                    src={
                                                        item.media_type === "person"
                                                            ? (item.profile_path ? `https://image.tmdb.org/t/p/w92/${item.profile_path}` : posterAlt)
                                                            : (item.poster_path ? `https://image.tmdb.org/t/p/w92/${item.poster_path}` : posterAlt)
                                                    }
                                                    alt={item.title || item.name}
                                                />
                                                <div className="result-info">
                                                    <p className="result-title">{item.title || item.name}</p>
                                                    <div className="result-meta-row">
                                                        <span className={`result-badge ${badge.cls}`}>{badge.label}</span>
                                                        {year && item.media_type !== "person" && (
                                                            <span className="result-year">{year}</span>
                                                        )}
                                                        {item.media_type !== "person" && item.vote_average > 0 && (
                                                            <span className="result-rating">★ {item.vote_average.toFixed(1)}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })
                                ) : (
                                    <li className="result-state-item">
                                        <span className="result-state-icon">🔍</span>
                                        <span>No results for <em>"{query}"</em></span>
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>
                {query && (
                    <button
                        type="button"
                        className="search-clear-btn"
                        onClick={clearSearch}
                        aria-label="Clear search"
                    >
                        ✕
                    </button>
                )}
                <button type="submit" aria-label="Search">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </button>
            </form>
        </div>
    );
}

export default NavBar;

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../styles/popular-content.css";

function PopularContent() {
    const [content, setContent] = useState([]);
    const [active, setActive] = useState(true);
    const scrollRef = useRef(null);
    
    // Store cached data
    const [cache, setCache] = useState({ movies: [], shows: [] });

    useEffect(() => {
        const fetchContent = async () => {
            const controller = new AbortController();
            const link = active
                ? "http://localhost:3131/api/popular/movies"
                : "http://localhost:3131/api/popular/shows";

            // Check if data is already cached
            if (active && cache.movies.length > 0) {
                setContent(cache.movies);
                return;
            } 
            if (!active && cache.shows.length > 0) {
                setContent(cache.shows);
                return;
            }

            try {
                const response = await axios.get(link, { signal: controller.signal });
                setContent(response.data.results);
                
                // Cache the response
                setCache(prevCache => ({
                    ...prevCache,
                    [active ? "movies" : "shows"]: response.data.results
                }));
            } catch (error) {
                if (axios.isCancel(error)) {
                    console.log("Request canceled:", error.message);
                } else {
                    console.error("Error fetching Content:", error);
                }
            }

            return () => controller.abort(); // Cleanup
        };

        if (scrollRef.current) {
            scrollRef.current.scrollLeft = 0;
        }

        fetchContent();
    }, [active, cache]); // Depend on cache to prevent unnecessary fetches

    // Function to handle horizontal scrolling
    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = 300; // Adjust this value for more/less scroll per click
            scrollRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    return (
        <div className="popular-movies">
            <h2>
                Popular
                <button className={`switchButton ${active ? "active" : ""}`} type="button" onClick={() => setActive(true)}>
                    Movies
                </button>{" "}
                /{" "}
                <button className={`switchButton ${!active ? "active" : ""}`} type="button" onClick={() => setActive(false)}>
                    TV Shows
                </button>
            </h2>
            <div className="slider-container">
                <button className="arrow left" onClick={() => scroll("left")}>&#8249;</button>
                <div className="scroll-container" ref={scrollRef}>
                    {content.map((movie, index) => (
                        <div key={index} className="movie">
                            <img src={`https://image.tmdb.org/t/p/w200/${movie.poster_path}`} alt="movie." />
                            <div>
                                <p className="movie-title">{movie.title || movie.name}</p>
                                <p className="movie-r-date">
                                    {movie.release_date || movie.first_air_date
                                        ? new Date(movie.release_date || movie.first_air_date).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })
                                        : ""}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
                <button className="arrow right" onClick={() => scroll("right")}>&#8250;</button>
            </div>
        </div>
    );
}

export default PopularContent;

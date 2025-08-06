import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import posterAlt from "../assets/Poster_Not_Available2.webp";


const weblink = import.meta.env.VITE_API_URL;

function GetContent({ type, category, content_id }) {
    const navigate = useNavigate();
    const [content, setContent] = useState([]);
    const [active, setActive] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        const controller = new AbortController();
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    
        const fetchWithRetry = async (url, retries = 5, delayMs = 500) => {
            for (let attempt = 0; attempt < retries; attempt++) {
                try {
                    const response = await axios.get(url, { signal: controller.signal });
                    setContent(response.data.results);
                    setLoading(false);
                    setError(false);
                    return; // Exit if successful
                } catch (error) {
                    if (axios.isCancel(error)) {
                        console.log("Request canceled:", error.message);
                        return;
                    }
                    console.error(`Error fetching ${url} (Attempt ${attempt + 1}):`, error);
                    if (attempt < retries - 1) {
                        await delay(delayMs * (attempt + 1));
                    } else {
                        setError(true);
                        setLoading(false);
                    }
                }
            }
        };
    
        const fetchContent = async () => {
            setLoading(true);
            setError(false);
            let link = type === "recommendations"
                ? `${weblink}/${category}/${content_id}/recommendations`
                : `${weblink}/${type}/${active ? "movies" : "shows"}`;
    
            await fetchWithRetry(link);
        };
    
        fetchContent();
    
        return () => controller.abort();
    }, [active, type, category, content_id]);
    

    useEffect(() => {
        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollLeft = 0;
            }
        }, 200);
    }, [active, type, category, content_id]);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = 300;
            scrollRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    return (
        <div className="popular-movies">
            <h2>
                {type}

                {!(type === "recommendations") && (
                    <>
                        <button
                            className={`switchButton ${active ? "active" : ""}`}
                            type="button"
                            onClick={() => setActive(true)}
                        >
                            Movies
                        </button>
                        /
                        <button
                            className={`switchButton ${!active ? "active" : ""}`}
                            type="button"
                            onClick={() => setActive(false)}
                        >
                            TV Shows
                        </button>
                    </>
                )}
            </h2>
            <div className="slider-container">
                <button className="arrow left" onClick={() => scroll("left")}>&#8249;</button>
                <div className="scroll-container" ref={scrollRef}>
                    {loading ? (
                        <p>Loading...</p>
                    ) : error ? (
                        <p>Failed to fetch content from the API, try reloading....</p>
                    ) : content.length===0 ? (<p>{type} not available...</p>) : (
                        content.map((movie) => (
                            <div 
                                key={movie.id} 
                                onClick={() => navigate(`/${movie.media_type || (active ? "movie" : "tv")}/${movie.id}`)}
                                className="movie">
                                <img 
                                    src={movie.poster_path 
                                        ? `https://image.tmdb.org/t/p/w200/${movie.poster_path}` 
                                        : posterAlt}
                                     
                                    alt={movie.title || movie.name} 
                                />
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
                        ))
                    )}
                </div>
                <button className="arrow right" onClick={() => scroll("right")}>&#8250;</button>
            </div>
        </div>
    );
}

export default GetContent;

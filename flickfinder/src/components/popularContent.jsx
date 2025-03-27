import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/popular-content.css";

function PopularContent({ type }) {
    console.log(type)
    const navigate = useNavigate();
    const [content, setContent] = useState([]);
    const [active, setActive] = useState(true);
    const scrollRef = useRef(null);

    useEffect(() => {
        const controller = new AbortController();

        const fetchContent = async () => {
            const link = `http://localhost:3131/api/${type}/${active ? "movies" : "shows"}`;
                

            try {
                const response = await axios.get(link, { signal: controller.signal });
                setContent(response.data.results);
                console.log("Content fetched:", response.data.results);
            } catch (error) {
                if (axios.isCancel(error)) {
                    console.log("Request canceled:", error.message);
                } else {
                    console.error("Error fetching Content:", error);
                }
            }
        };

        fetchContent();

        return () => controller.abort();
    }, [active, type]);
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollLeft = 0;
        }
    }, [active, type]);
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
                    {content.length === 0 ? (
                        <p>Loading Popular Content...</p>
                    ) : (
                        content.map((movie) => (
                            <div 
                                key={movie.id} 
                                onClick={() => navigate(`/${movie.media_type || (active ? "movie" : "tv")}/${movie.id}`)}
                                className="movie">
                                <img 
                                    src={movie.poster_path ? `https://image.tmdb.org/t/p/w200/${movie.poster_path}` : "/fallback-poster.jpg"} 
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

export default PopularContent;

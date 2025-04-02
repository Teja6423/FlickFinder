import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/popular-content.css";

const weblink = "http://localhost:3131/api";

function GetContent({ type, category, content_id }) {
    const navigate = useNavigate();
    const [content, setContent] = useState([]);
    const [active, setActive] = useState(true);
    const scrollRef = useRef(null);

    useEffect(() => {
        const controller = new AbortController();

        const fetchContent = async () => {
            let link = "";
            if (type === "recommendations") {
                link = `${weblink}/${category}/${content_id}/recommendations`;
            }else {
                link = `${weblink}/${type}/${active ? "movies" : "shows"}`;
            }

            try {
                const response = await axios.get(link, { signal: controller.signal });
                setContent(response.data.results);
            } catch (error) {
                if (axios.isCancel(error)) {
                    console.log("Request canceled:", error.message);
                } else {
                    console.error("Error fetching Content:", error);
                }
            }
        };

        fetchContent();

        return () => controller.abort(); // ✅ Cleanup API call on unmount
    }, [active, type, category, content_id]);

    useEffect(() => {
        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollLeft = 0;
            }
        }, 100); // ✅ Fix potential issues with immediate scroll reset
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
                    {content.length === 0 ? (
                        <p>Failed to fetch content from the API, try reloading....</p>
                    ) : (
                        content.map((movie) => (
                            <div 
                                key={movie.id} 
                                onClick={() => navigate(`/${movie.media_type || (active ? "movie" : "tv")}/${movie.id}`)}
                                className="movie">
                                <img 
                                    src={movie.poster_path ? `https://image.tmdb.org/t/p/w200/${movie.poster_path}` : "../assets/Poster_Not_Available2.webp"} 
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

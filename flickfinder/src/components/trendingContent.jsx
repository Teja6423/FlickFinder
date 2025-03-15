import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../styles/popular-content.css";

function TrendingContent() {
    const [content, setContent] = useState([]);
    const [active, setActive] = useState(true);
    const scrollRef = useRef(null);

    useEffect(() => {
        const fetchContent = async () => {
            const controller = new AbortController();
            const link = active
                ? "http://localhost:3131/api/trending/movies"
                : "http://localhost:3131/api/trending/shows";

            try {
                const response = await axios.get(link, { signal: controller.signal });
                setContent(response.data.results);
                console.log("Content fetched:", response.data.results);
            } catch (error) {
                if (axios.isCancel(error)) {
                    console.log("Request canceled:", error.message);
                } else {
                    console.error("Error fetching content:", error);
                }
            }

            return () => controller.abort(); // Cleanup
        };
        if (scrollRef.current) {
            scrollRef.current.scrollLeft = 0;
        }
        

        fetchContent();
    }, [active]);

    const scrollLeft = () => {
        if (scrollRef.current) scrollRef.current.scrollLeft -= 300;
    };

    const scrollRight = () => {
        if (scrollRef.current) scrollRef.current.scrollLeft += 300;
    };

    return (
        <div className="popular-movies">
            <h2>
                Trending
                <button className={`switchButton ${active ? "active" : ""}`} type="button" onClick={() => setActive(true)}>
                    Movies
                </button>{" "}
                /{" "}
                <button className={`switchButton ${!active ? "active" : ""}`} type="button" onClick={() => setActive(false)}>
                    TV Shows
                </button>
            </h2>

            <div className="slider-container">
                <button className="arrow left" onClick={scrollLeft}>{"<"}</button>
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
                <button className="arrow right" onClick={scrollRight}>{">"}</button>
            </div>
        </div>
    );
}

export default TrendingContent;

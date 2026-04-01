import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import posterAlt from "../assets/Poster_Not_Available2.webp";
import Skeleton from "./skeleton";
import { fetchDataWithRetry } from "../api";


const weblink = import.meta.env.VITE_API_URL;

function GetContent({ type, category, content_id }) {
    const navigate = useNavigate();
    const [content, setContent] = useState([]);
    const [active, setActive] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(false);
    const scrollRef = useRef(null);
    const hideLeftTimer = useRef(null);
    const hideRightTimer = useRef(null);

    useEffect(() => {
        const controller = new AbortController();

        const fetchContent = async () => {
            setLoading(true);
            setError(false);
            const link = type === "recommendations"
                ? `${weblink}/${category}/${content_id}/recommendations`
                : `${weblink}/${type}/${active ? "movies" : "shows"}`;

            const data = await fetchDataWithRetry(link, 5, controller.signal);
            if (controller.signal.aborted) return;
            if (data) {
                setContent(data.results);
                setError(false);
            } else {
                setError(true);
            }
            setLoading(false);
        };

        fetchContent();

        return () => controller.abort();
    }, [active, type, category, content_id]);
    

    useEffect(() => {
        const timer = setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollLeft = 0;
            }
        }, 200);
        return () => clearTimeout(timer);
    }, [active, type, category, content_id]);

    const scheduleHide = useCallback((side) => {
        if (side === "left") {
            if (hideLeftTimer.current) clearTimeout(hideLeftTimer.current);
            hideLeftTimer.current = setTimeout(() => setShowLeft(false), 1500);
        } else {
            if (hideRightTimer.current) clearTimeout(hideRightTimer.current);
            hideRightTimer.current = setTimeout(() => setShowRight(false), 1500);
        }
    }, []);

    const updateArrows = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        const atStart = el.scrollLeft <= 2;
        const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;

        if (atStart) {
            scheduleHide("left");
        } else {
            clearTimeout(hideLeftTimer.current);
            setShowLeft(true);
        }
        if (atEnd) {
            scheduleHide("right");
        } else {
            clearTimeout(hideRightTimer.current);
            setShowRight(true);
        }
    }, [scheduleHide]);

    // Re-check arrows after content loads
    useEffect(() => {
        if (loading) return;
        const t = setTimeout(updateArrows, 100);
        return () => clearTimeout(t);
    }, [loading, content, updateArrows]);

    // Attach scroll listener
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        el.addEventListener("scroll", updateArrows, { passive: true });
        return () => el.removeEventListener("scroll", updateArrows);
    }, [updateArrows]);

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            clearTimeout(hideLeftTimer.current);
            clearTimeout(hideRightTimer.current);
        };
    }, []);

    const scroll = (direction) => {
        const el = scrollRef.current;
        if (!el) return;
        const atStart = el.scrollLeft <= 2;
        const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;

        // At edge and still clicking — reset the hide timer to keep button visible
        if (direction === "left" && atStart) {
            scheduleHide("left");
            return;
        }
        if (direction === "right" && atEnd) {
            scheduleHide("right");
            return;
        }

        el.scrollBy({
            left: direction === "left" ? -300 : 300,
            behavior: "smooth",
        });
    };

    return (
        <div className="popular-movies">
            <h2>
                {type.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}

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
                <button className={`arrow left${showLeft ? "" : " arrow-hidden"}`} onClick={() => scroll("left")} aria-label="Scroll left">
                    <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                <div className="scroll-container" ref={scrollRef}>
                    {loading ? (
                        <Skeleton type="slider" />
                    ) : error ? (
                        <p>Failed to fetch content from the API, try reloading....</p>
                    ) : content.length===0 ? (<p>{type.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} not available...</p>) : (
                        content.map((movie) => (
                            <div
                                key={movie.id}
                                onClick={() => navigate(`/${movie.media_type || (active ? "movie" : "tv")}/${movie.id}`)}
                                className="movie"
                            >
                                <div className="movie-poster-wrap">
                                    <img
                                        className="movie-poster"
                                        src={movie.poster_path
                                            ? `https://image.tmdb.org/t/p/w200/${movie.poster_path}`
                                            : posterAlt}
                                        alt={movie.title || movie.name}
                                    />
                                    {movie.vote_average > 0 && (
                                        <span className="movie-rating">
                                            ★ {movie.vote_average.toFixed(1)}
                                        </span>
                                    )}
                                </div>
                                <div className="movie-info">
                                    <p className="movie-title">{movie.title || movie.name}</p>
                                    <p className="movie-r-date">
                                        {movie.release_date || movie.first_air_date
                                            ? new Date(movie.release_date || movie.first_air_date).toLocaleDateString("en-US", {
                                                month: "short",
                                                year: "numeric",
                                            })
                                            : ""}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <button className={`arrow right${showRight ? "" : " arrow-hidden"}`} onClick={() => scroll("right")} aria-label="Scroll right">
                    <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
            </div>
        </div>
    );
}

export default GetContent;

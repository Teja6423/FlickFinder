import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import profileAlt from "../assets/profile-alt.png";
import posterAlt from "../assets/Poster_Not_Available2.webp";
import GetContent from "./getContent";
import ReactPlayer from "react-player/youtube";
import Skeleton from "./skeleton";
import { fetchDataWithRetry } from "../api";


const weblink = import.meta.env.VITE_API_URL;

function ContentDetails() {
    const { type, id } = useParams();
    const [content, setContent] = useState(null);
    const [cast, setCast] = useState(null);
    const [gallery, setGallery] = useState(null);
    const [trailer, setTrailer] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [ytTrailer, setYtTrailer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [popup, setPopup] = useState(false);
    const [videoPopup, setVideoPopup] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        const fetchDetails = async () => {
            setLoading(true);

            const [details, castData, images, videos] = await Promise.all([
                fetchDataWithRetry(`${weblink}/${type}/${id}`, 5, controller.signal),
                fetchDataWithRetry(`${weblink}/${type}/${id}/credits`, 5, controller.signal),
                fetchDataWithRetry(`${weblink}/${type}/${id}/images`, 5, controller.signal),
                fetchDataWithRetry(`${weblink}/${type}/${id}/videos`, 5, controller.signal),
            ]);

            if (controller.signal.aborted) return;

            setContent(details);
            setCast(castData?.cast || null);
            setGallery(images?.backdrops || null);

            if (videos?.results) {
                const officialTrailer = videos.results.find(
                    (video) =>
                        video.site === "YouTube" &&
                        video.name?.toLowerCase().includes("official trailer") &&
                        video.type?.toLowerCase() === "trailer"
                );
                setTrailer(officialTrailer || null);
            }

            setLoading(false);
        };

        fetchDetails();
        return () => controller.abort();
    }, [type, id]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [type, id]);

    const openImageModal = (imageUrl) => {
        setPopup(true);
        setSelectedImage(imageUrl);
    };

    const closeImageModal = () => {
        setPopup(false);
        setSelectedImage(null);
    };

    const openVideoPlayer = (videoUrl) => {
        setVideoPopup(true);
        setYtTrailer(videoUrl);
    };

    const closeVideoPlayer = () => {
        setVideoPopup(false);
        setYtTrailer(null);
    };

    if (loading) return <Skeleton type="content-details"/>;
    if (!content) return <p>Content not found. Might be an API error, try reloading...</p>;

    return (
        <div className="main">
            <div
                className="content-details"
                style={{
                    backgroundImage: content.backdrop_path
                        ? `url(https://image.tmdb.org/t/p/w1280/${content.backdrop_path})`
                        : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            >
                <div className="overlay"></div>
                <div className="details-container">
                    <div>
                        <img
                            id="poster"
                            src={content.poster_path ? `https://image.tmdb.org/t/p/w342/${content.poster_path}` : posterAlt}
                            alt={content.title || content.name}
                        />
                    </div>
                    <div id="details">
                        <h2>{content.title || content.name}</h2>
                        {content.genres?.length > 0 && (
                            <div className="genre-chips">
                                {content.genres.map(g => (
                                    <span key={g.id} className="genre-chip">{g.name}</span>
                                ))}
                            </div>
                        )}
                        <p className="overview-text">{content.overview}</p>
                        <div className="details">
                            <p><b>Release Date:</b> {content.release_date || content.first_air_date || "N/A"}</p>
                            <p><span className="rating-badge">★ {content.vote_average?.toFixed(1) ?? "N/A"}</span> / 10</p>
                            <p>
                                {type === "movie" ? (
                                    <><b>Runtime:</b> {content.runtime ? `${content.runtime} min` : "N/A"}</>
                                ) : (
                                    <><b>Episodes:</b> {content.number_of_episodes ?? "N/A"}</>
                                )}
                            </p>
                            {trailer && (
                                <button
                                    className="watch_trailer"
                                    onClick={() => openVideoPlayer(`https://www.youtube.com/watch?v=${trailer.key}`)}
                                >
                                    Trailer
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="castDetails">
                <h2>Cast</h2>
                <div className="cast">
                    {cast && cast.length > 0 ? (
                        cast.map((actor) => (
                            <Link to={`/person/${actor.id}`} key={actor.id} className="actor-link">
                                <div className="actor">
                                    <div className="actor-photo-wrap">
                                        <img
                                            className="actor-photo"
                                            src={actor.profile_path ? `https://image.tmdb.org/t/p/w185/${actor.profile_path}` : profileAlt}
                                            alt={actor.name}
                                        />
                                    </div>
                                    <div className="actor-info">
                                        <p className="actor-name-text">{actor.name}</p>
                                        <p className="actor-character-text">{actor.character}</p>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <p>Cast data not available...</p>
                    )}
                </div>
            </div>


            <div className="contentGallery">
                <h2>
                    Gallery <span className="gallery-count">{gallery?.length ?? 0} images</span>
                </h2>
                <div className="images">
                    {gallery && gallery.length > 0 ? (
                        gallery.map((image) => (
                            <div key={image.file_path}>
                                <img
                                    className="image"
                                    src={`https://image.tmdb.org/t/p/w300/${image.file_path}`}
                                    alt="Gallery image"
                                    onClick={() => openImageModal(`https://image.tmdb.org/t/p/original/${image.file_path}`)}
                                    style={{ cursor: "pointer" }}
                                />
                            </div>
                        ))
                    ) : (
                        <p>Failed to Fetch Images from the API...</p>
                    )}
                </div>
            </div>

            <GetContent type={"recommendations"} category={type} content_id={id} />

            {popup && (
                <div className="popupImage" onClick={closeImageModal}>
                    <button className="popup_close_button" onClick={closeImageModal}>✕</button>
                    <img src={selectedImage} alt="Image Not Available" onClick={(e) => e.stopPropagation()} />
                </div>
            )}

            {videoPopup && (
                <div className="VideoPlayer" onClick={closeVideoPlayer}>
                    <button className="popup_close_button" onClick={closeVideoPlayer}>✕</button>
                    <div className="trailer-wrapper" onClick={(e) => e.stopPropagation()}>
                        <ReactPlayer className="trailer-player" url={ytTrailer} controls playing width="100%" height="100%" />
                    </div>
                </div>
            )}
        </div>
    );
}

export default ContentDetails;

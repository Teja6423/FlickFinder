import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/details.css"
import profileAlt from "../assets/profile-alt.png";
import GetContent from "./getContent";
import ReactPlayer from "react-player/youtube"

const weblink = "http://localhost:3131/api";
function ContentDetails() {
    const { type, id } = useParams();
    const [content, setContent] = useState(null);
    const [cast,setCast] = useState(null)
    const [loading, setLoading] = useState(true);
    const [gallery,setGallery] = useState(null)
    const [trailer, setTrailer] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [popup, setPopup] =useState(false)
    const [ytTrailer , setYtTrailer] = useState(null)
    const [videoPopup , setVideoPopup] = useState(false)

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
    
            const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    
            try {
                const response = await axios.get(`${weblink}/${type}/${id}`);
                setContent(response.data);
                await delay(150); // Wait 500ms before next request
            } catch (error) {
                console.error("Error fetching content details:", error);
            }
    
            try {
                const rescast = await axios.get(`${weblink}/${type}/${id}/credits`);
                setCast(rescast.data.cast);
                await delay(150);
            } catch (error) {
                console.error("Error fetching cast details:", error);
            }
    
            try {
                const images = await axios.get(`${weblink}/${type}/${id}/images`);
                setGallery(images.data.backdrops ?? null);
                await delay(150);
            } catch (error) {
                console.error("Error fetching images:", error);
            }
    
            try {
                const getvideos = await axios.get(`${weblink}/${type}/${id}/videos`);
                const videoResults = getvideos.data.results;
                await delay(150);
                const officialTrailer = videoResults.find(video => 
                    video.site === "YouTube" &&
                    video.name?.toLowerCase().includes("official trailer") &&
                    video.type?.toLowerCase() === "trailer"
                );
                setTrailer(officialTrailer || null);
            } catch (error) {
                console.error("Error fetching videos:", error);
            }
    
            setLoading(false);
        };
        
            fetchDetails();
            window.scrollTo({ top: 0, behavior: "smooth" });
        }, [type, id]);
    
    
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [type, id]);
    const openImageModal = (imageUrl) =>{
        setPopup(true)
        setSelectedImage(imageUrl)
    }
    const closeImageModal = () =>{
        setPopup(false)
        setSelectedImage(null)
    }
    const openVideoPlayer = (videoUrl)=>{
        setVideoPopup(true)
        setYtTrailer(videoUrl)
    }
    const closeVideoPlayer = ()=>{
        setVideoPopup(false)
        setYtTrailer(null)
    }
    

    if (loading) return <p>Loading details...</p>;
    if (!content) return <p>Content not found. Might be the API error, try reloading...</p>;

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
                    backgroundRepeat: "no-repeat"
                }}
            >
                <div className="overlay"></div> 
                <div className="details-container">
                    <div>
                        <img id="poster" src={`https://image.tmdb.org/t/p/w200/${content.poster_path}`} alt="Poster Not Available..." />
                    </div>
                    <div id="details">
                        <h2>{content.title || content.name}</h2>
                        <p>{content.overview}</p>
                        <div className="details">
                            <p><b>Release Date:</b> {content.release_date || content.first_air_date}</p>
                            <p><b>Rating:</b> {content.vote_average}/10</p>
                            <p>
                                {type === "movie" ? (
                                    <>
                                    <b>Runtime:</b> {content.runtime ? `${content.runtime} min` : "N/A"}
                                    </>
                                ) : (
                                    <>
                                    <b>Episodes:</b> {content.number_of_episodes}
                                    </>
                                )}
                            </p>
                            {trailer && (
                                <p key={trailer.id}>
                                    <button className="watch_trailer"
                                        onClick={() => openVideoPlayer(`https://www.youtube.com/watch?v=${trailer.key}`)}
                                    >
                                        Trailer
                                    </button>
                                </p>
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
                        <div key={actor.id} className="actor">
                            <img id="actor-img"
                                src={actor.profile_path ? `https://image.tmdb.org/t/p/w200/${actor.profile_path}` : profileAlt} 
                                alt={actor.name} 
                            />
                            <p><b>{actor.name}</b></p>
                            <p style={{ color: "grey" }}>{actor.character}</p>
                            
                        </div>
                    ))
                ) : (
                    <p>Cast data not available...</p>
                )}
                </div>
            </div>
            <div className="contentGallery">
                <h2>{type} Gallery - <span style={{ color: "grey" }}>{gallery ? gallery.length : 0}</span></h2>
                <div className="images">
                    {gallery && gallery.length > 0 ? (
                        gallery.map((image) => (
                            <div key={image.file_path}>
                                <img className="image"
                                    src={`https://image.tmdb.org/t/p/w300/${image.file_path}`} 
                                    alt="Gallery image" 
                                    onClick={()=> openImageModal(`https://image.tmdb.org/t/p/original/${image.file_path}`)}
                                    style={{ cursor: "pointer" }} // Make image clickable}
                                />
                            </div>
                        ))
                    ) : (
                        <p>Failed to Fetch Images from the API...</p>
                    )}
                </div>
            </div>
            <div>
            <GetContent type={"recommendations"} category={type} content_id={id} />
            </div>
            {popup && (
                <div className="popupImage">
                    <button className="popup_close_button" onClick={closeImageModal}>X</button>
                    <img src={selectedImage} alt="Image Not Available" />
                </div>
            )}
            {videoPopup && (
                <div className="VideoPlayer">
                    <button className="popup_close_button" onClick={closeVideoPlayer}>X</button>
                    <ReactPlayer className="trailer-player" url={ytTrailer} controls playing />
                </div>
            )}

        </div>
    );
    
}

export default ContentDetails;

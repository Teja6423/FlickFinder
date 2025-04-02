import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/details.css"
import profileAlt from "../assets/profile-alt.png";
import GetContent from "./getContent";

const weblink = "http://localhost:3131/api";
function ContentDetails() {
    const { type, id } = useParams();
    const [content, setContent] = useState(null);
    const [cast,setCast] = useState(null)
    const [loading, setLoading] = useState(true);
    const [gallery,setGallery] = useState(null)
    const [trailer, setTrailer] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await axios.get(`${weblink}/${type}/${id}`);
                setContent(response.data);
    
                const castEndpoint = type === "movie" 
                    ? `${weblink}/${type}/${id}/credits` 
                    : `${weblink}/${type}/${id}/credits`;
    
                const rescast = await axios.get(castEndpoint);
                setCast(rescast.data.cast);
    
                const images = await axios.get(`${weblink}/${type}/${id}/images`);     
                setGallery(images.data.backdrops ?? null);
    
                const getvideos = await axios.get(`${weblink}/${type}/${id}/videos`);
                const videoResults = getvideos.data.results;
    
                // Find the first "Official Trailer"
                const officialTrailer = videoResults.find(video => 
                    video.site === "YouTube" &&
                    video.name?.toLowerCase().includes("official trailer") &&
                    video.type?.toLowerCase() === "trailer"
                );
    
                setTrailer(officialTrailer || null);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching content details:", error);
                setLoading(false);
            }
        };
    
        fetchDetails();
    }, [type, id]);
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [type, id]);
    
    

    if (loading) return <p>Loading details...</p>;
    if (!content) return <p>Content not found.</p>;

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
                <div className="overlay"></div> {/* Dark overlay for readability */}
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
                                        onClick={() => window.open(`https://www.youtube.com/watch?v=${trailer.key}`, "_blank")}
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
            <GetContent type={"similar"} category={type} content_id={id} />
            </div>
        </div>
    );
    
}

export default ContentDetails;

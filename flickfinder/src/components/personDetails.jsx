import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchDataWithRetry } from '../api';
import profileAlt from '../assets/profile-alt.png';
import Skeleton from './skeleton';

const PersonDetails = () => {
    const { personId } = useParams();
    const [person, setPerson] = useState(null);
    const [credits, setCredits] = useState([]);
    const [images, setImages] = useState([]);
    const [error, setError] = useState(false);
    const [popup, setPopup] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const [expanded, setExpanded] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

    const weblink = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const getPersonData = async () => {
            try {
            const [personDetails, combinedCredits, imagesData] = await Promise.all([
                fetchDataWithRetry(`${weblink}/person/${personId}`),
                fetchDataWithRetry(`${weblink}/person/${personId}/combined_credits`),
                fetchDataWithRetry(`${weblink}/person/${personId}/images`)
            ]);

            setPerson(personDetails);

            setCredits((combinedCredits.cast || []).sort((a, b) => {
                const dateA = new Date(a.release_date || a.first_air_date || '1900-01-01');
                const dateB = new Date(b.release_date || b.first_air_date || '1900-01-01');
                return dateB - dateA;
            }));
                setImages(imagesData.profiles || []);

            } catch (err) {
                console.error('Failed to load person details:', err.message);
                setError(true);
                setPerson({});
            }
        };

        getPersonData();

        const handleResize = () => {
            setIsMobile(window.innerWidth < 900);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);

    }, [personId, weblink]);

    const openImageModal = (imageUrl) => {
        setPopup(true);
        setSelectedImage(imageUrl);
    };

    const closeImageModal = () => {
        setPopup(false);
        setSelectedImage(null);
    };

    if (error) return <p>Error loading person details. Please try again later.</p>;
    if (!person) return <Skeleton type="person-details"/>

    const bioText = person.biography || "No biography available.";
    const shortBio = bioText.length > 400 ? bioText.substring(0, 400) + "..." : bioText;

    return (
        <div className="person-details">
            {/* Profile Header */}
            <div className="profile-header">
                <img
                    src={person.profile_path
                        ? `https://image.tmdb.org/t/p/w300${person.profile_path}`
                        : profileAlt}
                    alt={person.name}
                />
                <div className="bio">
                    <h2>{person.name}</h2>
                    <p><strong>Known for:</strong> {person.known_for_department}</p>
                    <p><strong>Birthday:</strong> {person.birthday}</p>
                    {person.place_of_birth && <p><strong>Place:</strong> {person.place_of_birth}</p>}

                    {/* Bio with mobile toggle */}
                    <p>
                        {isMobile && !expanded ? shortBio : bioText}
                    </p>
                    {isMobile && bioText.length > 400 && (
                        <button
                            className="see-more-btn"
                            onClick={() => setExpanded(!expanded)}
                        >
                            {expanded ? "See Less" : "See More"}
                        </button>
                    )}
                </div>
            </div>

            {/* Image Gallery */}
            {images.length > 0 && (
                <div className="contentGallery">
                    <h2>
                        Images - <span style={{ color: "grey" }}>{images.length}</span>
                    </h2>
                    <div className="images">
                        {images.map((image) => (
                            <div key={image.file_path}>
                                <img
                                    className="image"
                                    src={`https://image.tmdb.org/t/p/w300/${image.file_path}`}
                                    alt="Profile image"
                                    onClick={() =>
                                        openImageModal(`https://image.tmdb.org/t/p/original/${image.file_path}`)
                                    }
                                    style={{ cursor: "pointer" }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Credits */}
            <h3>Credits</h3>
            <div className="credits-grid">
                {credits.length > 0 ? (
                    credits.map((item) => {
                        const contentType = item.release_date ? "movie" : "tv";
                        return (
                            <Link
                                to={`/${contentType}/${item.id}`}
                                key={`${item.credit_id}-${item.id}`}
                                className="credit-card"
                            >
                                <img
                                    src={item.poster_path
                                        ? `https://image.tmdb.org/t/p/w200${item.poster_path}`
                                        : profileAlt}
                                    alt={item.title || item.name}
                                />
                                <p>{item.title || item.name} ({(item.release_date || item.first_air_date || 'N/A').split("-")[0]})</p>
                                <p className="role">{item.character ? `as ${item.character}` : item.job ? item.job : ''}</p>
                            </Link>
                        );
                    })
                ) : (
                    <p>No credits available.</p>
                )}
            </div>

            {/* Popup Modal */}
            {popup && (
                <div className="popupImage">
                    <button className="popup_close_button" onClick={closeImageModal}>X</button>
                    <img src={selectedImage} alt="Image Not Available" />
                </div>
            )}
        </div>
    );
};

export default PersonDetails;

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchDataWithRetry } from '../api';
import "../styles/personDetails.css";
import profileAlt from '../assets/profile-alt.png';

const PersonDetails = () => {
    const { personId } = useParams();
    const [person, setPerson] = useState(null);
    const [credits, setCredits] = useState([]);
    const [error, setError] = useState(false);

    const weblink = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const getPersonData = async () => {
            try {
                // Fetch person details
                const personDetails = await fetchDataWithRetry(`${weblink}/person/${personId}`);
                setPerson(personDetails);

                // Fetch combined credits (movies + TV)
                const combinedCreditsData = await fetchDataWithRetry(`${weblink}/person/${personId}/combined_credits`);

                // Sort by date (latest first)
                const sortedCredits = (combinedCreditsData.cast || []).sort((a, b) => {
                    const dateA = new Date(a.release_date || a.first_air_date || '1900-01-01');
                    const dateB = new Date(b.release_date || b.first_air_date || '1900-01-01');
                    return dateB - dateA;
                });

                setCredits(sortedCredits);
            } catch (err) {
                console.error('Failed to load person details:', err.message);
                setError(true);
                setPerson({}); // prevents infinite loading
            }
        };

        getPersonData();
    }, [personId, weblink]);

    if (error) return <p>Error loading person details. Please try again later.</p>;
    if (!person) return <p>Loading...</p>;

    return (
        <div className="person-details">
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
                    <p><strong>Birthday:</strong> {person.birthday || "N/A"}</p>
                    {person.place_of_birth && <p><strong>Place:</strong> {person.place_of_birth}</p>}
                    <p>{person.biography || "No biography available."}</p>
                </div>
            </div>

            <h3>Credits</h3>
            <div className="credits-grid">
                {credits.length > 0 ? (
                    credits.map((item) => {
                        const contentType = item.media_type; // 'movie' or 'tv'
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
                                <p>
                                    {item.title || item.name}{" "}
                                    ({(item.release_date || item.first_air_date || 'N/A').split("-")[0]})
                                </p>
                                <p>{item.character ? `as ${item.character}` : item.job || ''}</p>
                            </Link>
                        );
                    })
                ) : (
                    <p>No credits available.</p>
                )}
            </div>
        </div>
    );
};

export default PersonDetails;

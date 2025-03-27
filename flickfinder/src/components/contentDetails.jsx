import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

function ContentDetails() {
    const { type, id } = useParams();
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:3131/api/${type}/${id}`);
                setContent(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching content details:", error);
                setLoading(false);
            }
        };

        fetchDetails();
    }, [type, id]);

    if (loading) return <p>Loading details...</p>;
    if (!content) return <p>Content not found.</p>;

    return (
        <div className="content-details">
            <h2>{content.title || content.name}</h2>
            <img src={`https://image.tmdb.org/t/p/w500/${content.poster_path}`} alt="poster" />
            <p>{content.overview}</p>
            <p>Release Date: {content.release_date || content.first_air_date}</p>
            <p>Rating: {content.vote_average}/10</p>
        </div>
    );
}

export default ContentDetails;

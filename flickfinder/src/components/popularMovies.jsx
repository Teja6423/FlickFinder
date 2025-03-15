import {useState,useEffect} from "react";
import axios from "axios";
import "../styles/popular-movies.css"

function PopularMovies(){
    const [movies,setMovies]=useState([])

    useEffect(()=>{
        const fetchMovies=async ()=>{
            try {
                const response = await axios.get("http://localhost:3131/api/popular");
                setMovies(response.data.results);
                console.log("Movies fetched:", response.data.results); // Moved after state update
            } catch (error) {
                console.error("Error fetching movies:", error);
            }
        }
        fetchMovies()
    },[])

    return(
        <div  className="popular-movies">
            <h2>Popular Movies</h2>
            <div className="popular-movie">
                {movies.map((movie,index)=>(
                    <div key={index} className="movie">
                        <img src={`https://image.tmdb.org/t/p/w200/${movie.poster_path}`} alt="movie." />
                        <div>
                            <p className="movie-title">{movie.title}</p>
                            <p className="movie-r-date">
                                {new Date(movie.release_date).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            
        </div>
    )
}
export default PopularMovies;
import {useState,useEffect} from "react";
import axios from "axios";
import "../styles/navBar.css";
import FlickFinderLogo from "../assets/FlickFinder-transparant.png"
function NavBar() {
  const[query,setQuery]=useState("")
  const[result,setResult]=useState([]);
  useEffect(()=>{
    if (!query.trim()){
      setResult([]);
      return;
    }
    const fetchReults = async ()=>{
      const encodedQuery = encodeURIComponent(query);
      try{
        const response = await axios.get(`http://localhost:3131/api/search/multi?query=${encodedQuery}`);
        setResult(response.data.results);
        console.log("Content fetched:", response.data);
      } catch(error){
        console.log(`Error getting Search Result: ${error.message}`)
      }
    }
    fetchReults();
  },[query]);
  return (
      <div className="nav-bar">
        <div className="nav-buttons">
          <img src={FlickFinderLogo} alt="" />
            <button type="button">Movies</button>
            <button type="button">TV Shows</button>
            <button type="button">People</button>
        </div>
        <div className="search-bar">
          <input type="text" name="search" id="search-input" placeholder="Search..." onChange={(data)=>(setQuery(data.target.value))}/>
          <button type="submit">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
      </div>
  );
}

export default NavBar;

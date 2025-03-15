import { useState } from 'react';
import NavBar from './components/navBar';
import PopularMovies from './components/popularMovies';
import './styles/style.css';
function App() {

  return (
    <div className='container'>
      <NavBar />
      <PopularMovies />
    </div>
    
  )
};

export default App;

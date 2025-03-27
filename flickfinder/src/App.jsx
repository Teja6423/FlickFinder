import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from './components/navBar';
import './styles/style.css';
import PopularContent from './components/popularContent';
import ContentDetails from './components/contentDetails';

function App() {
  return (
    <Router>
      <div className='container'>
        <NavBar />
        <Routes>
          <Route path='/' element={
            <>
              <PopularContent type="trending" />
              <PopularContent type="popular" />
              <PopularContent type="top-rated" />
            </>
          } />
          <Route path='/:type/:id' element={<ContentDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

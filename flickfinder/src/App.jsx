import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from './components/navBar';
import HomePage from './components/homepage';
import ContentDetails from './components/contentDetails';
import PersonDetails from './components/personDetails';
import TMDbNote from './components/TMDbNote';

function App() {
  return (
    <Router>
      <div className="container">
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/:type/:id" element={<ContentDetails />} />
          <Route path="/person/:personId" element={<PersonDetails />} />
        </Routes>
        <TMDbNote />
      </div>
    </Router>
  );
}
export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from './components/navBar';
import HomePage from './components/homepage';
import './styles/style.css';
import ContentDetails from './components/contentDetails';

function App() {
  return (
    <Router>
      <div className="container">
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/:type/:id" element={<ContentDetails />} />
        </Routes>
      </div>
    </Router>
  );
}
export default App;

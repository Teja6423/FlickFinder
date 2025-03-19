import React from 'react';
import NavBar from './components/navBar';
import './styles/style.css';
import PopularContent from './components/popularContent';
import TrendingContent from './components/trendingContent';
function App() {

  return (
    <div className='container'>
      <NavBar />
      <TrendingContent />
      <PopularContent />
    </div>
    
  )
};

export default App;

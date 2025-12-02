import React from "react";

const Skeleton = ({ type }) => {
  switch (type) {
    case "content-details":
      return (
        <div className="main">
          <div className="content-details skeleton-backdrop">
            <div className="overlay"></div>
            <div className="details-container">
              <div>
                <div className="skeleton poster"></div>
              </div>
              <div id="details">
                <div className="skeleton title"></div>
                <div className="skeleton overview"></div>
                <div className="skeleton overview short"></div>
                <div className="details">
                  <div className="skeleton meta"></div>
                  <div className="skeleton meta"></div>
                  <div className="skeleton meta"></div>
                  <div className="skeleton trailer-btn"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="castDetails">
            <h2>Cast</h2>
            <div className="cast">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="actor skeleton-actor">
                  <div className="skeleton actor-img"></div>
                  <div className="skeleton actor-name"></div>
                  <div className="skeleton actor-role"></div>
                </div>
              ))}
            </div>
          </div>

          <div className="contentGallery">
            <h2>Movie Gallery</h2>
            <div className="images">
              {[...Array(5)].map((_, i) => (
                <div key={i}>
                  <div className="skeleton gallery-image"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations Skeleton */}
          <div className="recommendations">
            <h2>Recommendations</h2>
            <div className="slider-container">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton movie-card"></div>
              ))}
            </div>
          </div>
        </div>
      );


    case "person-details":
      return (
        <div className="person-details">
          {/* Profile Header Skeleton */}
          <div className="profile-header">
            <div className="skeleton poster"></div>
            <div className="bio">
              <div className="skeleton title"></div>
              <div className="skeleton line"></div>
              <div className="skeleton line short"></div>
              <div className="skeleton line"></div>
            </div>
          </div>

          {/* Image Gallery Skeleton */}
          <div className="contentGallery">
            <h3>Images</h3>
            <div className="images">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton gallery-image"></div>
              ))}
            </div>
          </div>

          {/* Credits Skeleton */}
          <h3>Credits</h3>
          <div className="credits-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton credit-card">
                <div className="skeleton actor-img"></div>
                <div className="skeleton actor-name"></div>
                <div className="skeleton actor-role"></div>
              </div>
            ))}
          </div>
        </div>
      );

    
    case "slider":
      return (
        <div className="slider-container">
          {[...Array(20)].map((_, j) => (
            <div key={j} className="skeleton movie-card"></div>
          ))}
        </div>
      );

    default:
      return null;
  }
};

export default Skeleton;

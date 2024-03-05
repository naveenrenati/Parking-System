// Home.js

import React from 'react';
import { Link } from 'react-router-dom';
import './Home1.css'; // Import the CSS file

const Home = () => {
  return (
      <div className="container">
       <div className="box">
        <h2>Welcome to the Home Page</h2>
      <div className="link-container">
        <Link to="/admin-login" className="link">Login</Link>
        <Link to="/admin-signup" className="link">Signup</Link>
      </div>
    </div>
    </div>
  );
};

export default Home;

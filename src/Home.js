import React from 'react';
import { useNavigate } from 'react-router-dom';

import './Home.css'; // Make sure to import your CSS file
import logo from './Loading1.gif';
import './Home-client.js';
import './Home-admin.js';

const Header = () => {
  const navigate = useNavigate();

  const handleClientClick = () => {
    navigate('/Home-client');
  };

  const handleAdminClick = () => {
    navigate('/Home-admin');
  };
  
  

 

  return (
    <div className="d-flex justify-content-center align-items-center  vh-100">
       <img src={logo} className="logo" alt="scinlabs" />
      
            <div className="bg-white p-3 rounded w-15">
              
                <button className="btn btn-primary" style={{ marginRight:"30px"}} onClick={handleClientClick}>
                  Client
                </button>
                
                <button className="btn btn-primary ml-2"   style={{ marginRight:"10px"}} onClick={handleAdminClick}>
                  Admin
                </button>

               

                </div>
              </div>
            
          
  );
};

export default Header;
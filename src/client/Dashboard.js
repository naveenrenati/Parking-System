// Import necessary libraries
import React, { useEffect, useState } from 'react';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import QRCode from 'react-qr-code';
import { useNavigate } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import './clientcss1.css'; // Import your CSS file

// ClientDashboard component
const ClientDashboard = () => {
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [allUserslots, setAllUserslots] = useState({});
  const [selectedslots, setSelectedslots] = useState([]);
  const [qrCode, setQrCode] = useState(null);
  const [adminDetails, setAdminDetails] = useState({});
  const [selectedAdminPlace, setSelectedAdminPlace] = useState(null);
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [cname, setcname] = useState('');
  const [carNumber, setCarNumber] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showdetails, setShowdetails] = useState(false);
  const [showselected, setShowselected] = useState(false);
  const [timeRanges, setTimeRanges] = useState([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState(null);

  const toggleShowdetails = () => {
    setShowdetails(true);
    setShowselected(false);
  };
  const toggleShowselected = () => {
    setShowdetails(false);
    setShowselected(true);
  }

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);

      if (user) {
        // Fetch user details from Realtime Database
        const db = getDatabase();
        const userRef = ref(db, `users/${user.uid}`);
        onValue(userRef, (snapshot) => {
          const userData = snapshot.val();
          setUserData(userData);

          // Populate profile information
          if (userData) {
            setcname(userData.cname|| '');
            setMobileNumber(userData.mobileNumber || '');
            setAddress(userData.address || '');
            setCarNumber(userData.carNumber || '');
          }
        });

        // Fetch all slot information from userslots data path
        const userslotsRef = ref(db, 'userslots');
        onValue(userslotsRef, (slotsSnapshot) => {
          const slotsData = slotsSnapshot.val();
          if (slotsData) {
            setAllUserslots(slotsData);
          }
        });
      }
    });

    return () => unsubscribeAuth();
  }, [auth]);
  
  useEffect(() => {
    toggleShowdetails();
  }, []);

  useEffect(() => {
    // Fetch admin details based on admin UID
    const fetchAdminDetails = async (adminUid) => {
      const db = getDatabase();
      const adminRef = ref(db, `admin/${adminUid}`);
      onValue(adminRef, (snapshot) => {
        const adminData = snapshot.val();
        setAdminDetails((prevDetails) => ({
          ...prevDetails,
          [adminUid]: adminData,
        }));
      });
    };

    // Fetch admin details for each admin UID in allUserslots
    Object.keys(allUserslots).forEach((adminUid) => {
      fetchAdminDetails(adminUid);
    });
  }, [allUserslots]);

  useEffect(() => {
    // Fetch time ranges based on selectedAdminPlace and admin UID
    const fetchTimeRanges = async () => {
      if (selectedAdminPlace && adminDetails[selectedAdminPlace]) {
        const adminUid = selectedAdminPlace;
        const db = getDatabase();
        const timeRangesRef = ref(db, `timeranges/${adminUid}`);
        onValue(timeRangesRef, (snapshot) => {
          const timeRangesData = snapshot.val();
          if (timeRangesData) {
            setTimeRanges(timeRangesData);
          }
        });
      }
    };

    fetchTimeRanges();
  }, [selectedAdminPlace, adminDetails]);

  const handleslotToggle = (adminUid, slotId) => {
    // Check if the slot is unoccupied
    if (allUserslots[adminUid] && allUserslots[adminUid][slotId] === false) {
      // Toggle the selected status of the slot
      setSelectedslots((prevslots) => {
        const slotIndex = prevslots.findIndex((slot) => slot.adminUid === adminUid && slot.slotId === slotId);

        if (slotIndex !== -1) {
          // slot is already selected, so deselect it
          const updatedslots = [...prevslots];
          updatedslots.splice(slotIndex, 1);
          return updatedslots;
        } else {
          // slot is not selected, so select it
          return [{ adminUid, slotId }];
        }
      });
    }
  };

  const handleTimeRangeSelect = (timeRange) => {
    setSelectedTimeRange(timeRange);
  };

  const isSubmitButtonDisabled = !(selectedslots.length === 1 && selectedTimeRange);

  const handleSubmitslots = async () => {
    // Generate a unique QR code based on selected slots
    const clientInfo = {
      adminUid: selectedslots.length > 0 ? selectedslots[0].adminUid : null,
      name: userData.name,
      email: user.email,
      id: userData.userId,
      slots: selectedslots.map(({ slotId }) => slotId),
      timeRange: selectedTimeRange,
    };
    const qrCodeData = JSON.stringify(clientInfo);
    setQrCode(qrCodeData);

    // Update the userslots data path with the selected slots
    const db = getDatabase();
    const userslotsRef = ref(db, 'userslots');
    const updatedslots = { ...allUserslots };

    selectedslots.forEach(({ adminUid, slotId }) => {
      updatedslots[adminUid][slotId] = true; // Mark the slot as occupied
    });

    await set(userslotsRef, updatedslots);

    // Clear the selected slots and time range after submission
    setSelectedslots([]);
    setSelectedTimeRange(null);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    // Update the user profile information in the Realtime Database
    const db = getDatabase();
    const userId = userData ? userData.userId : ''; // Get userId from userData
    const userRef = ref(db, `users/${userId}`);
  
    await set(userRef, {
      ...userData,
      cname,
      mobileNumber,
      address,
      carNumber,
    });
  
    setIsEditingProfile(false);
  };
  
  

  console.log('Rendering ClientDashboard');

  return (
    <>
    <input type="checkbox" id="nav-toggle"/>
    <section className="sidebar">

        <div className="sidebar-menu">
            <ul>
                <li>
                    <a href="#" onClick={toggleShowdetails}>
                    <span><i class="bi bi-person-circle" style={{fontSize:"19px"}}></i></span>
                        <span>Profile</span>
                    </a>
                </li>
                <li>
                    <a href="#" onClick={toggleShowselected}>
                    <span><i class="bi bi-ticket-perforated" style={{fontSize:"19px"}}></i></span>
                        <span>Slots</span>
                    </a>
                </li>
                <li>
                    <a href="#" class="active"onClick={handleLogout}> 
                    <span><i class="bi bi-box-arrow-right" style={{fontSize:"19px"}}></i></span>
                        <span>Logout</span> 
                    </a>
                </li>
                
    
                
            </ul>
        </div>
    </section>
    
    <div className='main-content'>
    <header>

      <div className="header-title">
          <h2>  
            <label htmlFor="nav-toggle">
              <i class="bi bi-list"></i>
              </label>
              Welcome to the <span className='name-span'> Client Dashboard </span>
          </h2>
      </div>
      </header>
    <main>
    {showdetails && (
    <div className='cards'>

    <div className="card-single">
      
          
          
          <div className="dashboard-page">
            <h3 style={{color:"#FF416C"}}>Profile Information</h3>
            {isEditingProfile ? (
              <>
                
                <label htmlFor="name"><span>Name:</span></label>
                <input type="text" id="name"class="form-control" value={cname} onChange={(e) => setcname(e.target.value)} />
                <br />

                <label htmlFor="mobileNumber"><span>Mobile Number:</span></label>
                <input type="text" id="mobileNumber" class="form-control" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)}/>
                <br />

                <label htmlFor="address"><span>Address:</span></label>
                <input type="text" id="address" class="form-control"value={address} onChange={(e) => setAddress(e.target.value)} />
                <br />

                <label htmlFor="carNumber"><span>Car Number:</span></label>
                <input type="text" id="carNumber"class="form-control" value={carNumber} onChange={(e) => setCarNumber(e.target.value)} />
                <br />
                <button type="button" class="btn btn-primary" onClick={handleSaveProfile} style={{ backgroundColor: '#4caf50', borderColor: '#4caf50' }}>
                  Save Profile
                </button>
              </>
            ) : (
              <>
                <p style={{ color: 'black' }}>Name: {cname}</p>
                <p style={{ color: 'black' }}>Mobile Number: {mobileNumber}</p>
                <p style={{ color: 'black' }}>Address: {address}</p>
                <p style={{ color: 'black' }}>Car Number: {carNumber}</p>
                <button
                 type="button"
          className="btn btn-primary"
  onClick={handleEditProfile}
  style={{ backgroundColor: '#4caf50', borderColor: '#4caf50', padding: '10px 15px', fontSize: '18px' }}
       >
  Edit Profile
</button>

              </>
            )}
          </div>
         
       
      
    </div>
    </div>
    )}

{showselected &&(
            <>
          <div className='card-single'>
            <label htmlFor="adminPlace">Select Admin Place:</label>
            <select id="adminPlace" class= "form-control" onChange={(e) => setSelectedAdminPlace(e.target.value)}>
              <option value="">Select...</option>
              {Object.keys(adminDetails).map((adminUid) => (
                <option key={adminUid} value={adminUid}>
                  {adminDetails[adminUid] && adminDetails[adminUid].place}
                </option>
              ))}
            </select>
          </div>
          {selectedAdminPlace && (
            <div className="card-single" style={{marginTop:"12px"}}>
              {/* Fetch admin information based on selectedAdminPlace */}
              {adminDetails[selectedAdminPlace] && (
                <>
                  <p style={{ color: 'black' }}>Admin Name: {adminDetails[selectedAdminPlace].name}</p>
                  <p style={{ color: 'black' }}>Admin Description: {adminDetails[selectedAdminPlace].description}</p>
                  <p style={{ color: 'black' }}>Admin Place: {adminDetails[selectedAdminPlace].place}</p>
                  <p style={{ color: 'black' }}>Time Ranges:</p>
                  <ul class="naveen">
                    {timeRanges.map((timeRange, index) => (
                      <li class="naveen" style={{ color: 'black' }}
                        key={index}
                        onClick={() => handleTimeRangeSelect(timeRange)}
                        className={selectedTimeRange === timeRange ? 'selected' : ''}
                      >
                        {timeRange}
                      </li>
                    ))}
                  </ul>
                  <table class="table">
                    <thead>
                      <tr>
                        <th>slot ID</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(allUserslots[selectedAdminPlace]).map(([slotId, status]) => (
                        <tr key={slotId}>
                          <td>{slotId}</td>
                          <td>{status ? 'Occupied' : 'Not Occupied'}</td>
                          <td>
                            {status === false && (
                              <button
                              type="button"
                              className="btn btn-light"
                              style={{ padding: '5px 10px', fontSize: '15px', color:'black' }}
                              onClick={() => handleslotToggle(selectedAdminPlace, slotId)}
                            >
                              {selectedslots.find(
                                (slot) => slot.adminUid === selectedAdminPlace && slot.slotId === slotId
                              )
                                ? 'Deselect'
                                : 'Select'}
                            </button>
                            
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          )}
          {selectedslots.length === 1 && selectedTimeRange && (
            <div className="card-single" style={{marginTop:"12px"}}>
              <h3 style={{ color: 'black' }}>Selected slot and Time Range:</h3>
              <p style={{ color: 'black' }}>
                Admin UID: {selectedslots[0].adminUid}, slot ID: {selectedslots[0].slotId}, Time Range: {selectedTimeRange}
              </p>
              <button
  type="button"
  className="btn btn-primary"
  onClick={handleSubmitslots}
  disabled={isSubmitButtonDisabled}
  style={{
    backgroundColor: '#4caf50',
    borderColor: '#4caf50',
    padding: '8px 16px', // Adjust padding to change button size
    fontSize: '15px', 
    color: 'black'   // Adjust font size to change button size
  }}
>
  Submit slot
</button>

            </div>
          )}
          {qrCode && (
            <div className="dashboard-page">
              <h3 style={{ color: 'black' }}>QR Code:</h3>
              <QRCode value={qrCode} />
            </div>
          )}
          </>
          )}
    </main>
    </div>
    </>
  );
};

export default ClientDashboard;

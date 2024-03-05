// AdminDashboard.js

import React, { useEffect, useState } from 'react';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref as databaseRef, onValue, set, update, get } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import './clientcss2.css'; // Import your CSS file


const AdminDashboard = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(0);
  const [selectedTimeRanges, setSelectedTimeRanges] = useState([]);
  const [slotStatus, setslotStatus] = useState({});
  const [numslots, setNumslots] = useState(0); // Initial number of slots
  const [showdetails, setShowdetails] = useState(false);
  const [showselected, setShowselected] = useState(false);

  const timeOptions = [
    { value: '10:00 AM - 11:00 AM', label: '10:00 AM - 11:00 AM' },
    { value: '11:00 AM - 12:00 PM', label: '11:00 AM - 12:00 PM' },
    { value: '12:00 PM - 1:00 PM', label: '12:00 AM - 1:00 PM' },
    { value: '1:00 PM - 2:00 PM', label: '1:00 PM - 2:00 PM' },
    { value: '2:00 PM - 3:00 PM', label: '2:00 AM - 3:00 PM' },
    { value: '3:00 PM - 4:00 PM', label: '3:00 PM - 4:00 PM' },
    { value: '4:00 PM - 5:00 PM', label: '4:00 AM - 5:00 PM' },
    { value: '5:00 PM - 6:00 PM', label: '5:00 PM - 6:00 PM' },
    // Add more options as needed
  ];

  const [editingProfile, setEditingProfile] = useState(false);
  const [newProfile, setNewProfile] = useState({
    name: '',
    description: '',
    place: '',
  });

  const toggleShowdetails = () => {
    setShowdetails(true);
    setShowselected(false);
  };
  const toggleShowselected = () => {
    setShowdetails(false);
    setShowselected(true);
  }

  useEffect(() => {
    toggleShowdetails();
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const db = getDatabase();
    
        const numslotsRef = databaseRef(db, `admin/${user.uid}/totalslots`);
        onValue(numslotsRef, (snapshot) => {
          const numslotsData = snapshot.val();
          if (numslotsData !== null) {
            setNumslots(numslotsData);
          }
        });

        const adminRef = databaseRef(db, `admin/${user.uid}`);

        onValue(adminRef, (snapshot) => {
          const adminUserData = snapshot.val();
          setAdminUser(adminUserData);

          const userslotsRef = databaseRef(db, `userslots/${user.uid}`);
          onValue(userslotsRef, (slotsSnapshot) => {
            const slotsData = slotsSnapshot.val();
            if (slotsData) {
              setslotStatus(slotsData);
            }
            if (slotsData && slotsData.timeRanges) {
              setSelectedTimeRanges(slotsData.timeRanges);
            }
          });
        });

        const timeRangesRef = databaseRef(db, `timeranges/${user.uid}`);
        onValue(timeRangesRef, (snapshot) => {
          const timeRangesData = snapshot.val();

          if (timeRangesData) {
            // Convert the object to an array of options for react-select
            const timeRangesArray = Object.values(timeRangesData).map((value) => ({
              value,
              label: value,
            }));

            setSelectedTimeRanges(timeRangesArray);
          }
        });


      }
    });

    return () => unsubscribeAuth();
  }, [auth]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleScannerButtonClick = () => {
    window.open('https://cuddly-smiling-cattle.ngrok-free.app/', '_blank');
  };

  const handleslotStatusChange = (slotNumber) => {
    setslotStatus((prevStatus) => ({
      ...prevStatus,
      [slotNumber]: !prevStatus[slotNumber],
    }));
  };

  const handleSubmitslotStatus = () => {
    const currentUser = auth.currentUser;
  
    if (currentUser) {
      const { uid } = currentUser;
      const db = getDatabase();
  
      set(databaseRef(db, `admin/${uid}/totalslots`), numslots);
  
      const userslotsRef = databaseRef(db, `userslots/${uid}`);
      set(userslotsRef, { ...slotStatus })
        .then(() => {
          // Successfully updated slot status
        })
        .catch((error) => {
          console.error('Error updating slot status:', error.message);
        });
    } else {
      console.error('auth.currentUser is null');
    }
  };
  
  const handleNumslotsChange = (e) => {
    const newNumslots = parseInt(e.target.value, 10);
    setNumslots(isNaN(newNumslots) ? 0 : newNumslots);
  };

  const handleEditProfile = () => {
    setEditingProfile(true);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setNewProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleSubmitTimeRanges = () => {
    const { uid } = auth.currentUser;
    const db = getDatabase();

    const timeRangesObject = selectedTimeRanges.reduce((acc, timeRange, index) => {
      acc[index] = timeRange.value; // Assuming 'value' contains the time range string
      return acc;
    }, {});

    const timeRangesRef = databaseRef(db, `timeranges/${uid}`);
    set(timeRangesRef, timeRangesObject)
      .then(() => {
        alert('Time ranges submitted successfully!');
      })
      .catch((error) => {
        console.error('Error updating time ranges:', error.message);
      });
  };

  const handleSaveProfile = () => {
    const { uid } = auth.currentUser;
    const db = getDatabase();

    const adminRef = databaseRef(db, `admin/${uid}`);
    update(adminRef, newProfile)
      .then(() => {
        alert('Profile updated successfully!');
        setEditingProfile(false);
      })
      .catch((error) => {
        console.error('Error updating profile:', error.message);
      });
  };

  const handleCancelEditProfile = () => {
    setEditingProfile(false);
    setNewProfile({
      name: adminUser ? adminUser.name : '',
      description: adminUser ? adminUser.description : '',
      place: adminUser ? adminUser.place : '',
    });
  };

  const handleUpdateslots = async () => {
    try {
      const { uid } = auth.currentUser;
      const db = getDatabase();
  
      // Get the current user slots
      const userslotsRef = databaseRef(db, `userslots/${uid}`);
      const userslotsSnapshot = await get(userslotsRef);
      const slotsData = userslotsSnapshot.val();
  
      // Get the total number of slots
      const totalslotsRef = databaseRef(db, `admin/${uid}/totalslots`);
      const totalslotsSnapshot = await get(totalslotsRef);
      const totalslotsData = totalslotsSnapshot.val();
  
      // Update the missing slots
      const updatedslots = {};
      for (let slotNumber = 1; slotNumber <= totalslotsData; slotNumber++) {
        const slotKey = `slot${slotNumber}`;
        updatedslots[slotKey] = slotsData && slotKey in slotsData ? slotsData[slotKey] : false;
      }
  
      // Save the updated slots to the database
      await set(userslotsRef, updatedslots);
      alert('slots updated successfully!');
    } catch (error) {
      console.error('Error updating slots:', error.message);
    }
  };
  
  
  // Create an array with slot numbers from 1 to numslots
  const slotNumbers = Array.from({ length: numslots }, (_, index) => index + 1);

  const slotsPerRow = 6;

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
                    <a href="#" onClick={handleScannerButtonClick}> 
                    <span><i class="bi bi-qr-code-scan" style={{fontSize:"19px"}}></i></span>
                        <span>Scanner</span> 
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
              Welcome to the <span className='name-span'> Admin Dashboard </span>
          </h2>
      </div>
      </header>
    <main>
    {showdetails && (
    <div className='cards'>

    <div className="card-single">
    
          <div className="dashboard-page">
            <h3 style={{color:"#FF416C"}}>Profile Information</h3>
            {editingProfile ? (
              <div className="profile-container">
              <div className="edit-profile-form">
                <h3  style={{color:'black'}}>Edit Profile</h3>
                <label  style={{color:'black'}}>
                  Name:
                  <input
                    type="text"
                    name="name"
                    value={newProfile.name}
                    onChange={handleProfileChange}
                  />
                </label>
                <br />
                <label  style={{color:'black'}}>
                  Description:
                  <textarea
                    name="description"
                    value={newProfile.description}
                    onChange={handleProfileChange}
                  />
                </label>
                <br />
                <label  style={{color:'black'}}>
                  Place:
                  <input
                    type="text"
                    name="place"
                    value={newProfile.place}
                    onChange={handleProfileChange}
                  />
                </label >
                <br />
                <button type="button" onClick={handleSaveProfile}>
                  Save
                </button>
                <span style={{ margin: '0 10px' }}></span>
                <button type="button" onClick={handleCancelEditProfile}>
                  Cancel
                </button>
              </div>
              </div>
            ) : (
              <div className="profile-info">
                
                <p style={{color:'black'}}>Name: {adminUser.name}</p>
                <p style={{color:'black'}}>Description: {adminUser.description}</p>
                <p style={{color:'black'}}>Place: {adminUser.place}</p>
                <button type="button" onClick={handleEditProfile} >
                  Edit Profile
                </button>
              </div>
            )}
          </div>
         
        </div>
      
    </div>
    )}

{showselected && (
  <div className="slot-management-container">
    <div className="slot-input-container">
      <label className="slot-label"  style={{color:'black'}}>
        Number of slots:
        <input
          className="slot-input"
          type="number"
          min="1"
          value={numslots}
          onChange={handleNumslotsChange}
        />
      </label>
    </div>
    <div className="slot-checkbox-container">
      {slotNumbers.map((slotNumber) => (
        <div key={`slot${slotNumber}`} className="slot-checkbox">
          <label  style={{color:'black'}}>
            slot {slotNumber}:
            <input
              type="checkbox"
              checked={slotStatus[`slot${slotNumber}`]}
              onChange={() => handleslotStatusChange(`slot${slotNumber}`)}
            />
          </label>
        </div>
      ))}
    </div>

    <button className="slot-submit-btn" type="button" onClick={handleSubmitslotStatus}>
      Submit slot Status
    </button>
    <span style={{ margin: '0 10px' }}></span>
    <button className="slot-update-btn" type="button" onClick={handleUpdateslots}>
      Update slots
    </button>

    <label className="time-label"  style={{color:'black'}}>
      Select Time Ranges:
      <Select
        className="time-select"
        isMulti
        options={timeOptions}
        value={selectedTimeRanges}
        onChange={(selectedOptions) => {
          setSelectedTimeRanges(selectedOptions);
        }}
      />
    </label>
    <button className="time-submit-btn" type="button" onClick={handleSubmitTimeRanges}>
      Submit Time Ranges
    </button>
  </div>
)}

    </main>
    </div>
    </>
  );
};

export default AdminDashboard;

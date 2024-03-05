<div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <h2>Welcome to the Admin Dashboard</h2>
        {adminUser && (
          <div>
            <div>
              <label>
                Number of slots:
                <input
                  type="number"
                  min="1"
                  value={numslots}
                  onChange={handleNumslotsChange}
                />
              </label>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
              {slotNumbers.map((slotNumber) => (
                <div key={`slot${slotNumber}`} style={{ marginRight: '10px', marginBottom: '10px', width: `${100 / slotsPerRow}%` }}>
                  <label>
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

            <button type="button" onClick={handleSubmitslotStatus}>
              Submit slot Status
            </button>
            <button type="button" onClick={handleUpdateslots}>
              Update slots
            </button>
    

            {editingProfile ? (
              <div>
                <h3>Edit Profile</h3>
                <label>
                  Name:
                  <input
                    type="text"
                    name="name"
                    value={newProfile.name}
                    onChange={handleProfileChange}
                  />
                </label>
                <br />
                <label>
                  Description:
                  <textarea
                    name="description"
                    value={newProfile.description}
                    onChange={handleProfileChange}
                  />
                </label>
                <br />
                <label>
                  Place:
                  <input
                    type="text"
                    name="place"
                    value={newProfile.place}
                    onChange={handleProfileChange}
                  />
                </label>
                <br />
                <button type="button" onClick={handleSaveProfile}>
                  Save
                </button>
                <button type="button" onClick={handleCancelEditProfile}>
                  Cancel
                </button>
              </div>
            ) : (
              <div>
                <p>Name: {adminUser.name}</p>
                <p>Description: {adminUser.description}</p>
                <p>Place: {adminUser.place}</p>
                <button type="button" onClick={handleEditProfile}>
                  Edit Profile
                </button>
              </div>
            )}
            <label>
              Select Time Ranges:
              <Select
                isMulti
                options={timeOptions}
                value={selectedTimeRanges}
                onChange={(selectedOptions) => {
                  setSelectedTimeRanges(selectedOptions);
                }}
              />
            </label>
            <button type="button" onClick={handleSubmitTimeRanges}>Submit Time Ranges</button>
            
          </div>
        )}
        <button type="button" onClick={handleScannerButtonClick}>
          Scanner
        </button>
        <button type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;

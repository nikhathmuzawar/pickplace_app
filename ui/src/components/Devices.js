import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const token = localStorage.getItem('token'); // Retrieve the token from localStorage
        if (!token) {
          throw new Error('No token found. Please log in.');
        }
    
        const response = await axios.get('http://localhost:8000/devices', {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        });
    
        console.log('Devices:', response.data);
        setDevices(response.data);
      } catch (error) {
        console.error('Error fetching devices:', error);
      }
    };

    fetchDevices();
  }, []);

  const handleDeviceClick = (deviceName) => {
    // Navigate to /prompt and pass deviceName using state
    navigate('/teleop', { state: { deviceName } }); 
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Available Devices</h1>
      <div className="row">
        {devices.map((device) => (
          <div key={device._id} className="col-md-4">
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">{device.name}</h5>
                <p className="card-text">
                  Status: <span className={device.status  ? 'text-success' : 'text-danger'}>{device.status ? 'Active' : 'Inactive'}</span>
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => handleDeviceClick(device.name)} > Connect </button>
              </div>
            </div>
          </div>
        ))}
        <button onClick={() => navigate('/')} className="btn btn-primary">
        Sign Out
      </button>
      </div>
    </div>
  );
};

export default Devices;

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Settings = () => {
  const [devices, setDevices] = useState([]);
  const [newDevice, setNewDevice] = useState({ name: "", desc: "", status: "" });

  
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await axios.get('http://localhost:8000/');
        setDevices(response.data);
      } catch (error) {
        console.error('Error fetching devices:', error);
      }
    };

    fetchDevices();
  }, []);

  
  const handleAddDevice = async () => {
    try {
      await axios.post('http://localhost:8000/', newDevice);
      setDevices([...devices, newDevice]); 
      setNewDevice({ name: "", desc: "", status: "" }); 
    } catch (error) {
      console.error('Error adding device:', error);
    }
  };

  const handleDeleteDevice = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/${id}`);
      setDevices(devices.filter(device => device._id !== id)); 
    } catch (error) {
      console.error('Error deleting device:', error);
    }
  };

  return (
    <div>
      <h1>Device Settings</h1>

      <h2>Add Device</h2>
      <input
        type="text"
        placeholder="Device Name"
        value={newDevice.name}
        onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
      />
      <input
        type="text"
        placeholder="Device Desc"
        value={newDevice.desc}
        onChange={(e) => setNewDevice({ ...newDevice, desc: e.target.value })}
      />
      <input
        type="text"
        placeholder="Device Status"
        value={newDevice.status}
        onChange={(e) => setNewDevice({ ...newDevice, status: e.target.value })}
      />
      <button onClick={handleAddDevice}>Add Device</button>

      <h2>Delete Device</h2>
      <ul>
        {devices.map(device => (
          <li key={device._id}>
            <strong>{device.name}</strong>: {device.status}
            <button onClick={() => handleDeleteDevice(device._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Settings;

import React, { useState } from 'react';
import axios from 'axios';

const Signup = () => {
  const [devices, setDevices] = useState([]);
  const [newDevice, setNewDevice] = useState({ name: "", desc: "", status: "", username: "", password: "" });

  const handleAddDevice = async () => {
    try {
      await axios.post('/api', newDevice);
      setDevices([...devices, newDevice]);
      setNewDevice({ name: "", desc: "", status: "", username: "", password: "" });
    } catch (error) {
      console.error('Error adding device:', error);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Sign Up</h1>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card p-4 shadow-sm">
            <div className="form-group mb-3">
              <label>Username</label>
              <input
                type="text"
                className="form-control"
                placeholder="Username"
                value={newDevice.username}
                onChange={(e) => setNewDevice({ ...newDevice, username: e.target.value })}
              />
            </div>
            <div className="form-group mb-3">
              <label>Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                value={newDevice.password}
                onChange={(e) => setNewDevice({ ...newDevice, password: e.target.value })}
              />
            </div>
            <div className="form-group mb-3">
              <label>Device Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Device Name"
                value={newDevice.name}
                onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
              />
            </div>
            <div className="form-group mb-3">
              <label>Device Description</label>
              <input
                type="text"
                className="form-control"
                placeholder="Device Description"
                value={newDevice.desc}
                onChange={(e) => setNewDevice({ ...newDevice, desc: e.target.value })}
              />
            </div>
            <div className="form-group mb-4">
              <label>Device Status</label>
              <input
                type="text"
                className="form-control"
                placeholder="Device Status"
                value={newDevice.status}
                onChange={(e) => setNewDevice({ ...newDevice, status: e.target.value })}
              />
            </div>
            <button className="btn btn-primary w-100" onClick={handleAddDevice}>
              Add Device
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;

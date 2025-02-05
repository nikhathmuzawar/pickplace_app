import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './PromptPage.css';

const Settings = () => {
  const [firstOption, setFirstOption] = useState('');
  const [secondOption, setSecondOption] = useState('');
  const [secondOptions, setSecondOptions] = useState([]);
  const [responseMessage, setResponseMessage] = useState('');
  const location = useLocation();

  const { deviceName } = location.state || {};
  const navigate = useNavigate();

  const firstDropdownOptions = ['ABB', 'Kuka', 'Fanuc'];

  
  useEffect(() => {
    if (firstOption) {
      const optionsMap = {
        'ABB': ['V 1.1', 'V 1.2'],
        'Kuka': ['V 2.1', 'V 2.2'],
        'Fanuc': ['V 3.1', 'V 3.2'],
      };
      setSecondOptions(optionsMap[firstOption] || []);
      setSecondOption(''); 
    }
  }, [firstOption]);

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http//:localhost:8000/manuf', {
        firstOption,
        secondOption,
      });
      setResponseMessage(response.data.message);
    } catch (error) {
      console.error('Error submitting data:', error);
      setResponseMessage('Error submitting data');
    }
  };

  const handleDiscard = () => {
    setFirstOption('');
    setSecondOption(''); 
    setResponseMessage(''); 
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <NavLink className="navbar-brand" to="/devices">Sapien Robotics{deviceName && <p className='dev'> {deviceName}</p>}</NavLink>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <NavLink 
                  className="nav-link" 
                  to="/teleop" 
                  activeClassName="active"
                  state={{ deviceName }}
                >
                  Teleoperation
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink 
                  className="nav-link" 
                  to="/prompt" 
                  activeClassName="active"
                  state={{ deviceName }}
                >
                  Train Task
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink 
                  className="nav-link" 
                  to="/settings" 
                  activeClassName="active"
                  state={{ deviceName }}
                >
                  Settings
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
        <button onClick={() => navigate('/devices')} className="btn btn-primary">
          BACK
        </button>
      </nav>

      

      <div className="cont">
      <nav aria-label="breadcrumb" className="mt-3">
        <ol className="breadcrumb">
          {deviceName && <li className="breadcrumb-item"><a href="/devices">{deviceName}</a></li>}
          <li className="breadcrumb-item active" aria-current="page">Settings</li>
        </ol>
      </nav>
        <h1 className="display-5">Settings</h1>
        <div className="mb-3">
          <label className="form-label">Select Manufacturer:</label>
          <select
            className="form-select"
            value={firstOption}
            onChange={(e) => setFirstOption(e.target.value)}
          >
            <option value="">Select Manufacturer</option>
            {firstDropdownOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {firstOption && (
          <div className="mb-3">
            <label className="form-label">Select Model:</label>
            <select
              className="form-select"
              value={secondOption}
              onChange={(e) => setSecondOption(e.target.value)}
            >
              <option value="">Select Model</option>
              {secondOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mb-3">
          <button 
            className="btn btn-success me-2"
            onClick={handleSubmit} 
            disabled={!secondOption}
          >
            Submit
          </button>
          <button 
            className="btn btn-secondary"
            onClick={handleDiscard}
          >
            Discard
          </button>
        </div>

        {responseMessage && (
          <div className="alert alert-info mt-3">
            {responseMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;

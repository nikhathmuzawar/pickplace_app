import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './PromptPage.css'; 
import 'bootstrap/dist/css/bootstrap.min.css';


const Teleop = () => {
  const navigate = useNavigate(); 
  const [position, setPosition] = useState(''); 
  const [gripper, setGripper] = useState('');
  const [teleopEnabled, setTeleopEnabled] = useState(false);
  const location = useLocation();
  const { deviceName } = location.state || {}; // State to handle teleoperation

  useEffect(() => {
    const fetchPosition = async () => {
      try {
        const response = await axios.get('http//:localhost:8000/position');
        setPosition(response.data.position);
        setGripper(response.data.gripper);
      } catch (error) {
        console.error('Error fetching position:', error);
      }
    }; 

    fetchPosition();

    const interval = setInterval(() => {
      fetchPosition();
    }, 5000); 

    return () => clearInterval(interval);
  }, []); 

  const handleButtonClick = async () => {
    {/*if (teleopEnabled) {
      await axios.get('http//:localhost:8000/stop_detection');
    } else {
      await axios.get('http//:localhost:8000/start_detection');
    }*/}
    setTeleopEnabled(!teleopEnabled);
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
                <NavLink className="nav-link" to="/teleop" activeClassName="active" state={{ deviceName }}>Teleoperation</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/prompt" activeClassName="active" state={{ deviceName }}>Train Task</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/settings" activeClassName="active" state={{ deviceName }}>Settings</NavLink>
              </li>
            </ul>
          </div>
        </div>
        <button onClick={() => navigate('/devices')} className="btn btn-primary">BACK</button>
      </nav>
      
      <div className="cont">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            {deviceName && <li className="breadcrumb-item"><a href="/devices">{deviceName}</a></li>}
            <li className="breadcrumb-item active" aria-current="page">Teleoperation</li>
          </ol>
        </nav>
        <div className="row">
          <div className="col-md-8">
          <div className="video-grid">
              {/* 4 video frames with labels */}
              <div className="video-frame">
              
                <p className="video-label">Side View</p>
              </div>
              <div className="video-frame">

                <p className="video-label">Workspace View</p>
              </div>
              <div className="video-frame">
                <video className="video-element">
                  <source src="http//:localhost:8000/gripperView" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <p className="video-label">Gripper Close up</p>
              </div>
              <div className="video-frame">
                <video className="video-element">
                  <source src="http//:localhost:8000/isometricView" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <p className="video-label">Isometric View</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="chat-container">
              <div className="chat-box">
                <h2>Control Interface</h2>
                <center>
                <button onClick={handleButtonClick} className="btn btn-primary btn-lg">
        {teleopEnabled ? "Disable Teleoperation" : "Enable Teleoperation"}
      </button>
                </center><br/>
                {teleopEnabled && (
                  <div className="video-frame">
                    {/*<img 
                      src="http//:localhost:8000/video_feed" 
                      alt="Operator View" 
                      className="video-element" 
                    />*/}
                    
                    <p className="video-label">Operator View</p>
                  </div>
                )}
                <div className="status-position-box mt-4">
                  <h3>Status and Position</h3>
                  <p>Current Position: {position}</p>
                  <p>Gripper status: {gripper}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Teleop;
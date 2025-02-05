import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './PromptPage.css'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import VideoStream from './WebRTCReciever';

const PromptPage = () => {
  const navigate = useNavigate();
  const [inputString, setInputString] = useState('');  
  const [responseString, setResponseString] = useState('');  
  const [position, setPosition] = useState(''); 
  const [gripper, setGripper] = useState('');
  const [message, setMessage] = useState('');
  const [videoStarted, setVideoStarted] = useState(false); 
  const videoRef = useRef(null); 
  const location = useLocation();
  const { deviceName } = location.state || {};

  const handleInputChange = (e) => {
    setInputString(e.target.value);
  };

  useEffect(() => {
    const fetchPosition = async () => {
      try {
        const response = await axios.get('http://13.51.70.254:8000/api/get-coordinates-string');
        const mes = await axios.get('http://13.51.70.254:8000/api/get-latest-string');
        setPosition(response.data.coordinates_string);
        setGripper(response.data.gripper);
        setMessage(mes.data.message);
      } catch (error) {
        console.error('Error fetching position:', error);
      }
    };

    fetchPosition();

    const interval = setInterval(() => {
      fetchPosition();
    }, 1000); 

    return () => clearInterval(interval);
  }, []); 

  // to stop the camera stream from the arm if necessary
  const handleNav = async () => {
    fetch("http//:13.51.70.254:8000/stopStream", { method: "POST" })
    .then(response => {
      console.log("Stream stopped successfully");
    })
    .catch(err => {
      console.error("Error stopping the stream:", err);
    });
  }

  const handleButtonClick = async () => {
    try {
      const response = await axios.post('http://13.51.70.254:8000/api/prompt', { input: inputString });
      setResponseString(response.data.message);  
      setVideoStarted(true);  

      if (videoRef.current) {
        videoRef.current.play(); 
      }
    } catch (error) {
      console.error('Error sending prompt to backend:', error);
    }
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
                <li>
                
                </li>
              <li className="nav-item">
              <NavLink 
    className="nav-link" 
    to="/teleop" 
    activeClassName="active"
    state={{ deviceName }}
    //onClick={handleNav}  
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
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
        {deviceName && <li class="breadcrumb-item"><a href="/devices">{deviceName}</a></li>}
            <li class="breadcrumb-item active" aria-current="page">Train a new Task</li>
        </ol>
    </nav>
        
        <div className="row">
          <div className="col-md-8">
            <div className="video-grid">
              <div className="video-frame">
              
                <p className="video-label">Side View</p>
              </div>
              <div className="video-frame">
              {/*displaying the video feed from arm camera */}
              <img className='video-element'
                  src="/api/video_feed"
              />
                <p className="video-label">Workspace View</p>
              </div>
              <div className="video-frame">
                 {/*displaying video from directory */}
                <video> </video>
                <p className="video-label">Top View</p>
              </div>
              <div className="video-frame">
                <VideoStream />
              <p className="video-label">Isometric View</p>
            </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="chat-container">
              <div className="chat-box">
                <h2>Control Interface</h2>
                <input
                  type="text"
                  value={inputString}
                  onChange={handleInputChange}
                  placeholder="Type a string here"
                  className="form-control"
                />
                <button onClick={handleButtonClick} className="btn btn-primary mt-2">Enter</button>

                {responseString && (
                  <div className="response-box mt-3">
                    <h3>Reply:</h3>
                    <p>{responseString}</p>
                    <p>{message}</p>
                  </div>
                )}
              </div>
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
  );
};

export default PromptPage;

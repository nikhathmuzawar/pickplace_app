import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import './ImageVideoPage.css';

const ImageVideoPage = () => {
  const [image, setImage] = useState("");
  const [points, setPoints] = useState([]);
  const [draggingPointIndex, setDraggingPointIndex] = useState(null);
  const imageRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { deviceName } = location.state || {};
  const [mode, setMode] = useState("auto");
  const [isRunning, setIsRunning] = useState(true);

  const handleStopStart = async () => {
    const newStatus = !isRunning;
    setIsRunning(newStatus);
  
    try {
      const response = await fetch("http://localhost:8000/api/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus ? "start" : "stop" }),
      });
  
      if (response.ok) {
        console.log(`Status changed to ${newStatus ? "running" : "stopped"}`);
      }
    } catch (error) {
      console.error("Error sending status change:", error);
    }
  };

  const handleToggle = async () => {
    const newMode = mode === "manual" ? "auto" : "manual";
    setMode(newMode);

    try {
      const response = await fetch("http://localhost:8000/api/mode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mode: newMode }),
      });

      if (response.ok) {
        console.log(`Mode changed to ${newMode}`);
      }
    } catch (error) {
      console.error("Error sending mode change:", error);
    }
  };

  useEffect(() => {
    const fetchImageData = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/image-data");
        const { image, points } = response.data;
        setImage(`data:image/jpeg;base64,${image}`);
        setPoints(points);
      } catch (error) {
        console.error("Error fetching image data:", error);
      }
    };
    fetchImageData();
  }, []);

  const handleImageClick = (e) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (mouseX < 0 || mouseY < 0 || mouseX > rect.width || mouseY > rect.height) {
      return;
    }

    const normalizedX = mouseX / rect.width;
    const normalizedY = mouseY / rect.height;

    setPoints([...points, { x: normalizedX, y: normalizedY }]);
  };

  const handleDragStart = (index) => {
    setDraggingPointIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (draggingPointIndex !== null && imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();

      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (mouseX < 0 || mouseY < 0 || mouseX > rect.width || mouseY > rect.height) {
        return;
      }

      const normalizedX = mouseX / rect.width;
      const normalizedY = mouseY / rect.height;

      const updatedPoints = [...points];
      updatedPoints[draggingPointIndex] = { x: normalizedX, y: normalizedY };
      setPoints(updatedPoints);
      setDraggingPointIndex(null);
    }
  };

  const handleRightClick = (e, index) => {
    e.preventDefault(); // Prevent the default context menu
    const updatedPoints = points.filter((_, i) => i !== index);
    setPoints(updatedPoints);
  };

  const handleConfirm = async () => {
    try {
      // Send points to the server
      await axios.post("http://localhost:8000/api/confirm-points", { points });
  
      // After successful confirmation, fetch the updated image data
      try {
        const response = await axios.get("http://localhost:8000/api/image-data");
        const { image, points: newPoints } = response.data;
        setImage(`data:image/jpeg;base64,${image}`);
        setPoints(newPoints || []); // Ensure points is always an array
      } catch (error) {
        console.error("Error fetching updated image data:", error);
        // Keep existing points if fetch fails
      }
    } catch (error) {
      console.error("Error confirming points:", error);
      if (error.response && error.response.status === 503) {
        alert("Device not connected. Please check the connection and try again.");
      } else {
        alert("Error confirming points. Please try again.");
      }
    }
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <NavLink className="navbar-brand" to="/devices">
            Sapien Robotics{deviceName && <p className="dev"> {deviceName}</p>}
          </NavLink>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
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
          <button onClick={() => navigate("/devices")} className="btn btn-primary">
            BACK
          </button>
        </div>
      </nav>
      <div className="cont">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            {deviceName && (
              <li className="breadcrumb-item">
                <a href="/devices">{deviceName}</a>
              </li>
            )}
            <li className="breadcrumb-item active" aria-current="page">
              Teleoperation
            </li>
          </ol>
        </nav>
        <div className="container-fluid">
          <div className="row">
            <div className="col-xl-8 mb-4">
              <div className="card">
                <div
                  className="card-body position-relative"
                  style={{
                    background: "#f8f9fa",
                    overflow: "hidden",
                    cursor: "crosshair",
                  }}
                >
                  {image ? (
                    <img
                      ref={imageRef}
                      src={image}
                      alt="Workspace"
                      className="img-fluid"
                      style={{ width: "100%", height: "100%", objectFit: "fill" }}
                      onClick={handleImageClick}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    />
                  ) : (
                    <p className="text-center text-muted">Loading image...</p>
                  )}
                  {points.map((point, index) => (
                    <div
                      key={index}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onContextMenu={(e) => handleRightClick(e, index)} // Handle right-click
                      className="position-absolute"
                      style={{
                        top: `${point.y * 100}%`,
                        left: `${point.x * 100}%`,
                        width: "12px",
                        height: "12px",
                        backgroundColor: "red",
                        borderRadius: "50%",
                        transform: "translate(-50%, -50%)",
                        cursor: "move",
                      }}
                    ></div>
                  ))}
                </div>
              </div>
              <br></br>
              <button 
  className={`btn ${isRunning ? 'btn-danger' : 'btn-success'}`}
  onClick={handleStopStart}
  style={{ marginRight: "10px" }}
>
  <i className={`bi ${isRunning ? 'bi-stop-circle' : 'bi-play-circle'}`}></i>
  {isRunning ? 'Stop' : 'Start'}
</button>
                
                <button 
                  className="btn btn-secondary"
                  style={{ marginLeft: "10px" }}
                >
                  <i className="bi bi-arrow-clockwise"></i>
                  Reset
                </button>
            </div>
            <div className="col-md-4 mb-4">
              <div>
              <p className="text-center" style={{
                fontSize: "24px", 
                fontWeight: "bold", 
                color: mode === "manual" ? "red" : "green",
              }}>
                Current Mode: {mode.toUpperCase()}
              </p>
                <button 
                  onClick={handleToggle}
                  className="btn btn-secondary mb-3 w-100"
                >
                  Switch to {mode === "manual" ? "Auto" : "Manual"} Mode
                </button>
              </div>
              <div>
                <div>
                  <center>
                  <img
                    src="http://localhost:8000/api/video_feed"
                    alt="place"
                    className="img-thumbnail"
                    style={{ maxWidth: "400px" }}
                  />
                  </center>
                </div>
              </div>
              <div>
                <div>
                  <center>
                  <p className="video-label">Isometric View</p>
                  <img
                    src="http://localhost:8000/api/video_feed"
                    alt="place"
                    className="img-thumbnail"
                    style={{ maxWidth: "400px" }}
                  />
                  </center>
                </div>
              </div>
              <div className="card-footer text-center mt-3">
                <button 
                  className="btn btn-success"
                  onClick={handleConfirm}
                  style={{ marginRight: "10px" }}
                >
                  Confirm
                </button>
                
                <button 
                  className="btn btn-secondary"
                  style={{ marginLeft: "10px" }}
                  
                >
                  Clear
                </button>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};

export default ImageVideoPage;

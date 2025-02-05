import React, { useRef, useEffect } from 'react';

const VideoStream = () => {
  const videoRef = useRef(null);

  const startWebRTC = async () => {
    const pc = new RTCPeerConnection();
  
    // Create an offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);  // Set local description first
  
    // Send the offer to the backend
    const response = await fetch('http://localhost:8000/offer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sdp: pc.localDescription.sdp,
        type: pc.localDescription.type,
      }),
    });
  
    // Get the answer from the server and set it as the remote description
    const { sdp, type } = await response.json();
    const answer = new RTCSessionDescription({ sdp, type });
    await pc.setRemoteDescription(answer);
  
    // Set the track event to show the stream in the video element
    pc.ontrack = (event) => {
      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
      }
    };
  };
  

  return <video ref={videoRef} autoPlay playsInline></video>;
};

export default VideoStream;

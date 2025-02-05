import React, { useEffect, useState } from "react";

const VideoStream = () => {
  const [frame, setFrame] = useState("");

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:800/video_ws");

    ws.onmessage = (event) => {
      const data = event.data;
      if (data && data.startsWith("/9j/")) { // Basic JPEG base64 validation
        setFrame(`data:image/jpeg;base64,${data}`);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
    };

    return () => ws.close();
  }, []);

  return (
    <div>
      {frame ? (
        <img
          src={frame}
          alt="Video Stream"
          style={{ width: "100%", height: "auto" }}
        />
      ) : (
        <p>Loading video stream...</p>
      )}
    </div>
  );
};

export default VideoStream;

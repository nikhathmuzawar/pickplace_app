import React, { useEffect, useState } from "react";

const VideoStream = () => {
  const [frame, setFrame] = useState("");

  useEffect(() => {
    const ws = new WebSocket("ws://<your-server-ip>:8000/video_ws");

    ws.onmessage = (event) => {
      setFrame(event.data); // Receive base64-encoded frames
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
    };

    return () => ws.close();
  }, []);

  return (
    <div>
      {frame && (
        <img
          src={`data:image/jpeg;base64,${frame}`}
          alt="Video Stream"
          style={{ width: "100%", height: "auto" }}
        />
      )}
    </div>
  );
};

export default VideoStream;

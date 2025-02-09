"use client";
import { useEffect } from "react";
import { useSocket } from "@/hooks/use-socket";

const HomePage = () => {
  const { socket, sensorData } = useSocket();

  console.log(sensorData, socket);

  useEffect(() => {
    if (sensorData) {
      console.log("📥 Received sensor data in page:", sensorData);
    }
  }, [sensorData]);

  return (
    <div>
      <h1>Welcome to the WebSocket Example</h1>
      {sensorData ? (
        <pre>{JSON.stringify(sensorData, null, 2)}</pre>
      ) : (
        <p>Waiting for sensor data...</p>
      )}
    </div>
  );
};

export default HomePage;

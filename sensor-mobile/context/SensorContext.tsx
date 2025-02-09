import React, { createContext, useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import * as Device from "expo-device";

// Define the interface for Sensor Data
interface SensorData {
  latitude: number | null;
  longitude: number | null;
  location: string | null;
  accuracy: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
  device: {
    model: string;
    brand: string;
    os: string;
    osVersion: string;
  };
  gyroscope: { x: number; y: number; z: number };
  accelerometer: { x: number; y: number; z: number };
}

// Context Props
interface SensorContextProps {
  sensorData: SensorData;
  setSensorData: React.Dispatch<React.SetStateAction<SensorData>>;
}

// Default Sensor Data
const defaultSensorData: SensorData = {
  latitude: null,
  longitude: null,
  location: null,
  accuracy: null,
  altitudeAccuracy: null,
  heading: null,
  speed: null,
  device: {
    model: "",
    brand: "",
    os: "",
    osVersion: "",
  },
  gyroscope: { x: 0, y: 0, z: 0 },
  accelerometer: { x: 0, y: 0, z: 0 },
};

// Create the Context
export const SensorContext = createContext<SensorContextProps>({
  sensorData: defaultSensorData,
  setSensorData: () => {},
});

const SERVER_URL = "http://raspberrypi.local:5000";

export const SensorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [sensorData, setSensorData] = useState<SensorData>(defaultSensorData);
  const [socket, setSocket] = useState<Socket | any>(null);

  useEffect(() => {
    const newSocket = io(SERVER_URL);

    newSocket.on("connect", () => {
      console.log("✅ Connected to WebSocket server");
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ Connection Error:", error);
    });

    newSocket.on("disconnect", () => {
      console.log("⚠️ Disconnected from WebSocket server");
    });

    setSocket(newSocket);

    return () => {
      console.log("🛑 Closing socket connection...");
      newSocket.disconnect(); // Cleanup socket on unmount
    };
  }, []);

  // 🔹 Send sensor data every second (only when socket is connected)
  useEffect(() => {
    if (!socket || !socket.connected) {
      console.warn(
        "⚠️ WebSocket not connected. Skipping sensor data emission."
      );
      return;
    }

    const sendData = () => {
      socket.emit("sensor_data", {
        timestamp: Date.now(),
        ...sensorData,
      });
      console.log("📤 Sent sensor data:", sensorData);
    };

    sendData();
  }, [socket, sensorData]);

  // 🔹 Update device information on mount
  useEffect(() => {
    setSensorData((prev) => ({
      ...prev,
      device: {
        model: Device.modelName || "",
        brand: Device.brand || "",
        os: Device.osName || "",
        osVersion: Device.osVersion || "",
      },
    }));
  }, []);

  return (
    <SensorContext.Provider value={{ sensorData, setSensorData }}>
      {children}
    </SensorContext.Provider>
  );
};

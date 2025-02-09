/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";

const SOCKET_URL = "https://c0d2-184-146-142-196.ngrok-free.app"; // Replace with your backend URL

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

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gyroChartData, setGyroChartData] = useState<any[]>([]); // Store gyroscope data
  const [accelChartData, setAccelChartData] = useState<any[]>([]); // Store accelerometer data
  const [sensorData, setSensorData] = useState<SensorData | null>(null); // Store all sensor data

  useEffect(() => {
    // Ensure the code runs only on the client side
    console.log("🔌 Connecting to WebSocket server...");
    if (typeof window !== "undefined") {
      const newSocket = io(SOCKET_URL, {
        transports: ["websocket"], // Ensure the socket uses WebSocket transport
      });

      newSocket.on("connect", () => {
        console.log("✅ Connected to WebSocket server");
      });

      newSocket.on("sensor_data", (data) => {
        setSensorData(data);

        if (data.gyroscope) {
          const timestamp = new Date().toLocaleTimeString();

          setGyroChartData((prev) => [
            ...prev.slice(-19),
            { ...data.gyroscope, timestamp },
          ]);
        }

        if (data.accelerometer) {
          const timestamp = new Date().toLocaleTimeString();

          setAccelChartData((prev) => {
            const updatedData = [
              ...prev.slice(-19),
              { ...data.accelerometer, timestamp },
            ];
            return updatedData;
          });
        }
      });

      newSocket.on("disconnect", () => {
        console.log("⚠️ Disconnected from WebSocket server");
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect(); // Cleanup socket on component unmount
      };
    }
  }, []);

  return { socket, sensorData, gyroChartData, accelChartData };
};

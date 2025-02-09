import os
import csv
from flask import Flask
from flask_socketio import SocketIO, emit
from datetime import datetime

socketio = SocketIO(cors_allowed_origins="*", async_mode="eventlet")

def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = "secret!"
    socketio.init_app(app)
    return app

app = create_app()


CSV_FILE = "sensor_data.csv"

if not os.path.exists(CSV_FILE):
    with open(CSV_FILE, mode="w", newline="") as file:
        writer = csv.writer(file)
        writer.writerow([
            "timestamp", "latitude", "longitude", "location",
            "accuracy", "altitude_accuracy", "heading", "speed",
            "gyro_x", "gyro_y", "gyro_z", 
            "accel_x", "accel_y", "accel_z",
            "device_model", "device_brand", "device_os", "device_os_version"
        ])  # Header row

# When a client sends sensor data
@socketio.on("sensor_data")
def handle_sensor_data(data):
    print(f"Received sensor data: {data}")

    # Extract necessary fields and round values to 4 decimal places
    sensor_entry = [
        # Timestamp handling (convert from milliseconds to human-readable format)
        datetime.utcfromtimestamp(data["timestamp"] / 1000).strftime('%Y-%m-%d %H:%M:%S'),
        
        round(data["latitude"], 4) if data["latitude"] else None,
        round(data["longitude"], 4) if data["longitude"] else None,
        data["location"] if data["location"] else "N/A",
        
        round(data["accuracy"], 4) if data["accuracy"] else None,
        round(data["altitudeAccuracy"], 4) if data["altitudeAccuracy"] else None,
        
        round(data["heading"], 4) if data["heading"] else None,
        round(data["speed"], 4) if data["speed"] else None,

        round(data["gyroscope"]["x"], 4) if data["gyroscope"]["x"] else None,
        round(data["gyroscope"]["y"], 4) if data["gyroscope"]["y"] else None,
        round(data["gyroscope"]["z"], 4) if data["gyroscope"]["z"] else None,

        round(data["accelerometer"]["x"], 4) if data["accelerometer"]["x"] else None,
        round(data["accelerometer"]["y"], 4) if data["accelerometer"]["y"] else None,
        round(data["accelerometer"]["z"], 4) if data["accelerometer"]["z"] else None,

        # Device information
        data["device"]["model"] if data["device"]["model"] else "Unknown",
        data["device"]["brand"] if data["device"]["brand"] else "Unknown",
        data["device"]["os"] if data["device"]["os"] else "Unknown",
        data["device"]["osVersion"] if data["device"]["osVersion"] else "Unknown"
    ]


    with open(CSV_FILE, mode="a", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(sensor_entry)

    emit("sensor_data", data, broadcast=True)

@app.route("/")
def index():
    return "Hello World"

if __name__ == "__main__":
    socketio.run(app, debug=True)

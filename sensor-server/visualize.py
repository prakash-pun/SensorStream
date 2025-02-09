import plotly.express as px
import matplotlib.pyplot as plt
from geopy.distance import geodesic
import numpy as np
import pandas as pd

# Load the CSV file
file_path = "sensor_data.csv"
df = pd.read_csv(file_path)

# Convert timestamp to datetime format
df["timestamp"] = pd.to_datetime(df["timestamp"])

# Display first few rows
print(df.head())


# Calculate total acceleration
df["total_acceleration"] = np.sqrt(
    df["accel_x"]**2 + df["accel_y"]**2 + df["accel_z"]**2)

# Display acceleration values
print(df[["timestamp", "total_acceleration"]].head())

# Calculate rotation speed
df["rotation_speed"] = np.sqrt(
    df["gyro_x"]**2 + df["gyro_y"]**2 + df["gyro_z"]**2)

# Display results
print(df[["timestamp", "rotation_speed"]].head())


# Function to calculate speed from consecutive GPS points

# def calculate_speed(lat1, lon1, lat2, lon2, time1, time2):
#     if pd.isnull(lat2) or pd.isnull(lon2):  # Handle missing values
#         return 0
#     distance = geodesic((lat1, lon1), (lat2, lon2)
#                         ).meters  # Distance in meters
#     time_diff = (time2 - time1).total_seconds()  # Time difference in seconds
#     return (distance / time_diff) if time_diff > 0 else 0  # Speed in m/s


# # Apply function to dataset
# df["speed"] = df.apply(lambda row: calculate_speed(
#     row["latitude"], row["longitude"],
#     row["latitude"].shift(-1), row["longitude"].shift(-1),
#     row["timestamp"], row["timestamp"].shift(-1)
# ), axis=1)

# # Display speed values
# print(df[["timestamp", "speed"]].head())

plt.figure(figsize=(10, 5))
plt.plot(df["timestamp"], df["total_acceleration"],
         label="Total Acceleration", color="b")
plt.xlabel("Time")
plt.ylabel("Acceleration (m/s²)")
plt.title("Acceleration Over Time")
plt.legend()
plt.grid()
plt.show()


plt.figure(figsize=(10, 5))
plt.plot(df["timestamp"], df["rotation_speed"],
         label="Rotation Speed", color="r")
plt.xlabel("Time")
plt.ylabel("Angular Velocity (rad/s)")
plt.title("Rotation Speed Over Time")
plt.legend()
plt.grid()
plt.show()

plt.figure(figsize=(10, 5))
plt.plot(df["timestamp"], df["speed"], label="Speed", color="g")
plt.xlabel("Time")
plt.ylabel("Speed (m/s)")
plt.title("Speed Over Time")
plt.legend()
plt.grid()
plt.show()


fig = px.scatter_mapbox(df, lat="latitude", lon="longitude", hover_name="timestamp",
                        mapbox_style="open-street-map", title="GPS Route")
fig.show()

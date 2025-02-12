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

# Drop rows with missing values
df = df.dropna()

# Calculate total acceleration
df["total_acceleration"] = np.sqrt(
    df["accel_x"]**2 + df["accel_y"]**2 + df["accel_z"]**2
)

# Display total acceleration values
print(df[["timestamp", "total_acceleration"]].head())

# Calculate rotation speed
df["rotation_speed"] = np.sqrt(
    df["gyro_x"]**2 + df["gyro_y"]**2 + df["gyro_z"]**2
)

# Display rotation speed values
print(df[["timestamp", "rotation_speed"]].head())

# Plot Total Acceleration over Time
plt.figure(figsize=(10, 5))
plt.plot(df["timestamp"], df["total_acceleration"], label="Total Acceleration", color="b")
plt.xlabel("Time")
plt.ylabel("Acceleration (m/s²)")
plt.title("Acceleration Over Time")
plt.legend()
plt.grid()
plt.savefig("total_acceleration_plot.png")  # Save the plot as a PNG file
plt.show()

# Plot Rotation Speed over Time
plt.figure(figsize=(10, 5))
plt.plot(df["timestamp"], df["rotation_speed"], label="Rotation Speed", color="r")
plt.xlabel("Time")
plt.ylabel("Angular Velocity (rad/s)")
plt.title("Rotation Speed Over Time")
plt.legend()
plt.grid()
plt.savefig("rotation_speed_plot.png")  # Save the plot as a PNG file
plt.show()

# Plot Speed over Time
plt.figure(figsize=(10, 5))
plt.plot(df["timestamp"], df["speed"], label="Speed", color="g")
plt.xlabel("Time")
plt.ylabel("Speed (m/s)")
plt.title("Speed Over Time")
plt.legend()
plt.grid()
plt.savefig("speed_plot.png")  # Save the plot as a PNG file
plt.show()

# Plot GPS Route on Map
fig = px.scatter_mapbox(df, lat="latitude", lon="longitude", hover_name="timestamp",
                        mapbox_style="open-street-map", title="GPS Route")
fig.write_html("gps_route_plot.html")  # Save the plot as an interactive HTML file
fig.show()

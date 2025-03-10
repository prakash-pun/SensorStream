import json
import dash
from dash.dependencies import Output, Input
from dash import dcc, html
import dash_leaflet as dl
from datetime import datetime
import plotly.graph_objs as go
from collections import deque
from flask import Flask, request

server = Flask(__name__)
app = dash.Dash(__name__, server=server)

MAX_DATA_POINTS = 1000
UPDATE_FREQ_MS = 100

# Data storage
time = deque(maxlen=MAX_DATA_POINTS)
accel_x = deque(maxlen=MAX_DATA_POINTS)
accel_y = deque(maxlen=MAX_DATA_POINTS)
accel_z = deque(maxlen=MAX_DATA_POINTS)

gyro_time = deque(maxlen=MAX_DATA_POINTS)
gyro_x = deque(maxlen=MAX_DATA_POINTS)
gyro_y = deque(maxlen=MAX_DATA_POINTS)
gyro_z = deque(maxlen=MAX_DATA_POINTS)

gps_time = deque(maxlen=MAX_DATA_POINTS)
gps_lat = deque(maxlen=MAX_DATA_POINTS)
gps_lon = deque(maxlen=MAX_DATA_POINTS)

# App layout
app.layout = html.Div(
    [
        dcc.Markdown(children="""
            # Sensor Data Dashboard
            """),
        
        html.H2("Location Tracking"),
        dl.Map(
            [
                dl.TileLayer(),
                dl.Marker(id="gps_marker", position=[0, 0]),  # Default position
            ],
            id="gps_map",
            center=[0, 0],  # Default map center
            zoom=10,
            style={"height": "300px"},
        ),
        
        html.H2("Accelerometer Data"),
        dcc.Graph(id="accel_graph"),  # Acceleration graph
        
        html.H2("Gyroscope Data"),
        dcc.Graph(id="gyro_graph"),   # Gyroscope graph
        
        dcc.Interval(id="counter", interval=UPDATE_FREQ_MS),
    ]
)

# Callback to update graphs and map
@app.callback(
    [
        Output("accel_graph", "figure"),
        Output("gyro_graph", "figure"),
        Output("gps_marker", "position"),
        Output("gps_map", "center"),
    ],
    Input("counter", "n_intervals"),
)
def update_data(_counter):
    # Acceleration Graph
    accel_graph = {
        "data": [
            go.Scatter(x=list(time), y=list(d), name=name)
            for d, name in zip([accel_x, accel_y, accel_z], ["X", "Y", "Z"])
        ],
        "layout": go.Layout(
            xaxis={"type": "date"},
            yaxis={"title": "Acceleration (m/s²)"},
        ),
    }

    # Gyroscope Graph
    gyro_graph = {
        "data": [
            go.Scatter(x=list(gyro_time), y=list(d), name=name)
            for d, name in zip([gyro_x, gyro_y, gyro_z], ["X", "Y", "Z"])
        ],
        "layout": go.Layout(
            xaxis={"type": "date"},
            yaxis={"title": "Angular Velocity (rad/s)"},
        ),
    }

    # Update map with latest GPS coordinates
    if gps_lat and gps_lon:
        latest_position = [gps_lat[-1], gps_lon[-1]]
    else:
        latest_position = [0, 0]  # Default to (0,0)

    return accel_graph, gyro_graph, latest_position, latest_position


@server.route("/data", methods=["POST"])
def sensor_data():
    if str(request.method) == "POST":
        response = json.loads(request.data)
        for data in response["payload"]:
            ts = datetime.fromtimestamp(data["time"] / 1e9)

            # Accelerometer Data
            if data.get("name") == "accelerometer":
                if len(time) == 0 or ts > time[-1]:
                    time.append(ts)
                    accel_x.append(data["values"]["x"])
                    accel_y.append(data["values"]["y"])
                    accel_z.append(data["values"]["z"])

            # Gyroscope Data
            elif data.get("name") == "gyroscope":
                if len(gyro_time) == 0 or ts > gyro_time[-1]:
                    gyro_time.append(ts)
                    gyro_x.append(data["values"]["x"])
                    gyro_y.append(data["values"]["y"])
                    gyro_z.append(data["values"]["z"])

            # GPS Data
            elif data.get("name") == "location":
                if len(gps_time) == 0 or ts > gps_time[-1]:
                    gps_time.append(ts)
                    gps_lat.append(data["values"]["latitude"])
                    gps_lon.append(data["values"]["longitude"])

    return "success"




if __name__ == "__main__":
    app.run_server(port=8000, host="0.0.0.0")

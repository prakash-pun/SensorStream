import { Acce } from "@/components/acce";
import { Gyro } from "@/components/gyro";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { type EventSubscription } from "expo-modules-core";
import * as Sensors from "expo-sensors";
import React, { useContext, useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SensorContext } from "@/context/SensorContext";

const FAST_INTERVAL = 16;
const SLOW_INTERVAL = 1000;

export default class SensorScreen extends React.Component {
  static navigationOptions = {
    title: "Sensors",
  };

  static contextType = SensorContext;

  handleClick = () => {
    // Access the toggle function from the context
    const { sendSensorToggle, setSendSensorToggle }: any = this.context;
    setSendSensorToggle(!sendSensorToggle);
    console.log("Send Stream Sensor Toggled");
    Alert.alert(
      sendSensorToggle ? "Sending Sensor Data" : "Stopped Sending Sensor Data"
    );
  };

  render() {
    const { sendSensorToggle }: any = this.context; // Access the state from the context

    return (
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      >
        <Acce />

        <Gyro />
        <LightSensor />
        <DeviceMotionSensor />
        <PedometerSensor />
        <ThemedView
          style={{
            marginBottom: 20,
            width: "100%",
          }}
        >
          <TouchableOpacity
            onPress={this.handleClick}
            style={{
              width: "100%",
              alignItems: "center",
              backgroundColor: "#eee",
              padding: 10,
              marginTop: 10,
              borderRadius: 5,
            }}
          >
            <Text>
              {sendSensorToggle ? "Stop Sensor Stream" : "Send Sensor Stream"}
            </Text>
          </TouchableOpacity>
        </ThemedView>
      </ParallaxScrollView>
    );
  }
}

type State<Measurement> = {
  data: Measurement;
  isListening: boolean;
  isAvailable?: boolean;
};

abstract class SensorBlock<Measurement> extends React.Component<
  object,
  State<Measurement>
> {
  readonly state: State<Measurement> = {
    data: {} as Measurement,
    isListening: false,
  };

  _subscription?: EventSubscription;

  componentDidMount() {
    this.checkAvailability();
  }

  checkAvailability = async () => {
    const isAvailable = await this.getSensor().isAvailableAsync();
    this.setState({ isAvailable });
  };

  componentWillUnmount() {
    this._unsubscribe();
  }

  abstract getName: () => string;
  abstract getSensor: () => Sensors.DeviceSensor<Measurement>;

  _toggle = () => {
    if (this._subscription) {
      this._unsubscribe();
      this.setState({ isListening: false });
    } else {
      this._subscribe();
      this.setState({ isListening: true });
    }
  };

  _slow = () => {
    this.getSensor().setUpdateInterval(SLOW_INTERVAL);
  };

  _fast = () => {
    this.getSensor().setUpdateInterval(FAST_INTERVAL);
  };

  _subscribe = () => {
    this._subscription = this.getSensor().addListener((data: Measurement) => {
      this.setState({ data });
    });
  };

  _unsubscribe = () => {
    this._subscription && this._subscription.remove();
    this._subscription = undefined;
  };

  renderData() {
    return (
      this.state.data && (
        <ThemedText>
          {Object.entries(this.state.data)
            .sort(([keyA], [keyB]) => {
              return keyA.localeCompare(keyB);
            })
            .map(
              ([key, value]) =>
                `${key}: ${typeof value === "number" ? round(value) : 0}`
            )
            .join("\n")}
        </ThemedText>
      )
    );
  }

  render() {
    if (this.state.isAvailable !== true) {
      return null;
    }
    return (
      <View style={styles.sensor}>
        <ThemedText style={{ fontWeight: "bold" }}>
          {this.getName()}:
        </ThemedText>
        {this.renderData()}
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={this._toggle} style={styles.button}>
            <Text>{this.state.isListening ? "Stop" : "Start"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this._slow}
            style={[styles.button, styles.middleButton]}
          >
            <Text>Slow</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this._fast} style={styles.button}>
            <Text>Fast</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

class GyroscopeSensor extends SensorBlock<Sensors.GyroscopeMeasurement> {
  getName = () => "Gyroscope";
  getSensor = () => Sensors.Gyroscope;
}

class AccelerometerSensor extends SensorBlock<Sensors.AccelerometerMeasurement> {
  getName = () => "Accelerometer";
  getSensor = () => Sensors.Accelerometer;

  renderData = () => (
    <View>
      <ThemedText>
        Accelerometer: x: {round(this.state.data.x)} y:{" "}
        {round(this.state.data.y)} z: {round(this.state.data.z)}
      </ThemedText>
    </View>
  );
}

class DeviceMotionSensor extends SensorBlock<Sensors.DeviceMotionMeasurement> {
  getName = () => "DeviceMotion";
  getSensor = () => Sensors.DeviceMotion;
  renderXYZBlock = (
    name: string,
    event: null | { x?: number; y?: number; z?: number } = {}
  ) => {
    if (!event) return null;
    const { x, y, z } = event;
    return (
      <ThemedText>
        {name}: x: {round(x)} y: {round(y)} z: {round(z)}
      </ThemedText>
    );
  };
  renderABGBlock = (
    name: string,
    event: null | { alpha?: number; beta?: number; gamma?: number } = {}
  ) => {
    if (!event) return null;

    const { alpha, beta, gamma } = event;
    return (
      <ThemedText>
        {name}: α: {round(alpha)} β: {round(beta)} γ: {round(gamma)}
      </ThemedText>
    );
  };
  renderData = () => (
    <View>
      {this.renderXYZBlock("Acceleration", this.state.data.acceleration)}
      {this.renderXYZBlock(
        "Acceleration w/gravity",
        this.state.data.accelerationIncludingGravity
      )}
      {this.renderABGBlock("Rotation", this.state.data.rotation)}
      {this.renderABGBlock("Rotation rate", this.state.data.rotationRate)}
      <ThemedText>
        Orientation:{" "}
        {Sensors.DeviceMotionOrientation[this.state.data.orientation]}
      </ThemedText>
    </View>
  );
}

class LightSensor extends SensorBlock<Sensors.LightSensorMeasurement> {
  getName = () => "LightSensor";
  getSensor = () => Sensors.LightSensor;
  renderData = () => (
    <View>
      <ThemedText>Illuminance: {this.state.data.illuminance}</ThemedText>
    </View>
  );
}

const PedometerSensor = () => {
  const [isPedometerAvailable, setIsPedometerAvailable] = useState("checking");
  const [pastStepCount, setPastStepCount] = useState(0);
  const [currentStepCount, setCurrentStepCount] = useState(0);

  useEffect(() => {
    let listener: EventSubscription;
    const subscribe = async () => {
      const isAvailable = await Sensors.Pedometer.isAvailableAsync();
      setIsPedometerAvailable(String(isAvailable));

      if (isAvailable) {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 1);

        const pastStepCountResult = await Sensors.Pedometer.getStepCountAsync(
          start,
          end
        );
        if (pastStepCountResult) {
          setPastStepCount(pastStepCountResult.steps);
        }

        listener = Sensors.Pedometer.watchStepCount((result) => {
          setCurrentStepCount(result.steps);
        });
      }
    };

    subscribe();
    return () => listener && listener.remove();
  }, []);

  return (
    <ThemedView style={styles.sensor}>
      <ThemedText style={{ fontWeight: "bold" }}>Pedometer:</ThemedText>
      <ThemedText>Is available: {isPedometerAvailable}</ThemedText>
      <ThemedText>Steps taken in the last 24 hours: {pastStepCount}</ThemedText>
      <ThemedText>Watch step count: {currentStepCount}</ThemedText>
    </ThemedView>
  );
};

function round(n?: number) {
  return n ? Math.floor(n * 100) / 100 : 0;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "stretch",
    marginTop: 15,
  },
  button: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eee",
    padding: 10,
  },
  middleButton: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#ccc",
  },
  sensor: {
    marginTop: 10,
    backgroundColor: "rgba(161, 206, 220, 0.1)",
    padding: 16,
    borderRadius: 8,
  },
});

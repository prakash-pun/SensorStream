import { useState, useEffect, useContext } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Accelerometer } from "expo-sensors";
import { ThemedText } from "./ThemedText";
import { SensorContext } from "@/context/SensorContext";

function round(n?: number) {
  return n ? Math.floor(n * 100) / 100 : 0;
}

export const Acce = () => {
  const { sensorData, setSensorData } = useContext(SensorContext);
  const [{ x, y, z }, setData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });
  const [subscription, setSubscription] = useState<any>(null);
  const [activeSpeed, setActiveSpeed] = useState<"slow" | "fast" | null>(
    "fast"
  );

  const _slow = () => {
    Accelerometer.setUpdateInterval(2000);
    setActiveSpeed("slow");
  };
  const _fast = () => {
    Accelerometer.setUpdateInterval(16);
    setActiveSpeed("fast");
  };

  const _subscribe = () => {
    setSubscription(
      Accelerometer.addListener((data) => {
        setData(data);
        setSensorData((prev) => ({ ...prev, accelerometer: data }));
      })
    );
  };

  const _unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  useEffect(() => {
    _slow();
    _subscribe();
    return () => _unsubscribe();
  }, []);

  return (
    <View style={styles.sensor}>
      <ThemedText style={{ fontWeight: "bold" }}>Accelerometer:</ThemedText>
      <ThemedText>x: {round(x)}</ThemedText>
      <ThemedText>y: {round(y)}</ThemedText>
      <ThemedText>z: {round(z)}</ThemedText>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={subscription ? _unsubscribe : _subscribe}
          style={styles.button}
        >
          <Text>{subscription ? "Stop" : "Start"}</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity
          onPress={_slow}
          style={[
            styles.button,
            styles.middleButton,
            activeSpeed === "slow" && styles.activeButton,
          ]}
        >
          <Text>Slow</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={_fast}
          style={[styles.button, activeSpeed === "fast" && styles.activeButton]}
        >
          <Text>Fast</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
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
  activeButton: {
    backgroundColor: "#4CAF50", // Green for active buttons
  },
});

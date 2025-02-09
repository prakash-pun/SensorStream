import * as ScreenOrientation from "expo-screen-orientation";
import * as Device from "expo-device";
import { Accelerometer } from "expo-sensors";
import React from "react";

import {
  ActivityIndicator,
  Button,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { Colors } from "@/constants/Colors";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { HelloWave } from "@/components/HelloWave";

const COUNT = 5;
const ITEM_SIZE = Dimensions.get("window").width / COUNT;
const PERSPECTIVE = 200;

interface Position {
  x: number;
  y: number;
}

interface BallProps {
  index: number;
  position: Position;
}

function useLockedScreenOrientation() {
  React.useEffect(() => {
    ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT_UP
    ).catch(() => null);
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.ALL).catch(
        () => null
      );
    };
  }, []);
}

export default function HomeScreen() {
  useLockedScreenOrientation();

  const [position, setPosition] = React.useState<Position>({ x: 0, y: 0 });
  const [error, setError] = React.useState<string | null>(null);
  const [isSetup, setSetup] = React.useState<boolean>(false);
  const [shouldUseReanimated, setShouldUseReanimated] =
    React.useState<boolean>(false);

  React.useEffect(() => {
    (async () => {
      const { status } = await Accelerometer.getPermissionsAsync();
      if (status === "denied") {
        setError(`Cannot start demo!\nMotion permission is ${status}.`);
      } else if (status === "undetermined") {
        return;
      }
      if (!(await Accelerometer.isAvailableAsync())) {
        setError("Accelerometer is not available on this device!");
        return;
      }

      setSetup(true);
    })();
  }, []);

  React.useEffect(() => {
    if (!isSetup) return;

    const sub = Accelerometer.addListener(({ x, y }) => {
      setPosition({ x, y });
    });
    return () => sub.remove();
  }, [isSetup]);

  const switchComponent = React.useCallback(() => {
    setShouldUseReanimated(!shouldUseReanimated);
  }, [shouldUseReanimated]);

  if (error) {
    return (
      <Container>
        <Text style={[styles.text, { color: "red" }]}>{error}</Text>
      </Container>
    );
  }

  if (!isSetup) {
    return (
      <Container>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <Text
          style={[
            styles.text,
            {
              marginTop: 16,
            },
          ]}
        >
          Checking Permissions
        </Text>

        <Button
          title="Ask Permission"
          onPress={async () => {
            const { status } = await Accelerometer.requestPermissionsAsync();
            if (status !== "granted") {
              setError(`Cannot start demo!\nMotion permission is ${status}.`);
            }
            if (!(await Accelerometer.isAvailableAsync())) {
              setError("Accelerometer is not available on this device!");
              return;
            }

            setSetup(true);
          }}
        />
      </Container>
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Sensor Stream</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.ballContainer}>
        {Array(COUNT)
          .fill(null)
          .map((_, index) => {
            const props = { key: `ball-${index}`, index, position };
            return <ReanimatedBall {...props} />;
          })}
      </ThemedView>
      <ThemedView
        style={{
          flexDirection: "column",
          gap: 8,
          backgroundColor: "rgba(161, 206, 220, 0.2)",
          borderRadius: 8,
        }}
      >
        <ThemedView style={styles.titleContainer}>
          <ThemedText style={{ fontWeight: "bold" }}>Device Brand:</ThemedText>
          <ThemedText>{Device.brand}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.titleContainer}>
          <ThemedText style={{ fontWeight: "bold" }}>Device Model:</ThemedText>
          <ThemedText>{Device.modelName}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.titleContainer}>
          <ThemedText style={{ fontWeight: "bold" }}>Device Year:</ThemedText>
          <ThemedText>{Device.deviceYearClass}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.titleContainer}>
          <ThemedText style={{ fontWeight: "bold" }}>Device OS:</ThemedText>
          <ThemedText>{Device.osName}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.titleContainer}>
          <ThemedText style={{ fontWeight: "bold" }}>
            Device OS Version:
          </ThemedText>
          <ThemedText>{Device.osVersion}</ThemedText>
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

function ReanimatedBall({ index, position }: BallProps) {
  const translate = useSharedValue({
    x: position.x,
    y: position.y,
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: (index + 1) / COUNT,
      transform: [
        { translateX: translate.value.x },
        { translateY: translate.value.y },
      ],
    };
  }, [index]);

  React.useEffect(() => {
    translate.value = withSpring(calculateTranslateValue(index, position));
  }, [index, position.x, position.y]);

  return <Reanimated.View style={[styles.ball, animatedStyle]} />;
}

function calculateTranslateValue(index: number, position: any): any {
  return {
    x: (Number(position.x.toFixed(1)) * PERSPECTIVE * (index + 1)) / COUNT,
    y: (-position.y.toFixed(1) * PERSPECTIVE * (index + 1)) / COUNT,
  };
}

HomeScreen.navigationOptions = {
  title: "Accel",
};

const Container = (props: any) => <View {...props} style={styles.container} />;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  ballContainer: {
    flexDirection: "row",
    height: Dimensions.get("window").width,
    flex: 1,
    justifyContent: "center",
    gap: 8,
  },
  text: {
    padding: 24,
    zIndex: 1,
    fontWeight: "800",
    color: Colors.light.tint,
    textAlign: "center",
  },
  ball: {
    position: "absolute",
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: ITEM_SIZE,
    backgroundColor: "red",
  },
  switchComponentButton: {
    margin: 24,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});

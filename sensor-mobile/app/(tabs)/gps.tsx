import * as React from "react";
import { Image, StyleSheet, Platform, Dimensions, Switch } from "react-native";
import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import MapView, { Marker, Region } from "react-native-maps";
import * as Location from "expo-location";
import { SensorContext } from "@/context/SensorContext";

export default function GPSScreen() {
  const { sensorData, setSensorData } = React.useContext(SensorContext);
  const [location, setLocation] =
    React.useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [address, setAddress] =
    React.useState<Location.LocationGeocodedAddress | null>(null);

  const mapRef = React.useRef<MapView | null>(null); // MapView reference

  const requestLocationPermission = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied");
      return;
    }

    let currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation);

    console.log("Current Location: ", currentLocation);
    if (currentLocation) {
      const [geocodedAddress] = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
      setAddress(geocodedAddress);
      setSensorData({
        ...sensorData,
        latitude: currentLocation.coords.latitude,
        accuracy: currentLocation.coords.accuracy,
        altitudeAccuracy: currentLocation.coords.altitudeAccuracy,
        heading: currentLocation.coords.heading,
        speed: currentLocation.coords.speed,
        longitude: currentLocation.coords.longitude,
        location: `${geocodedAddress?.city || ""}, ${
          geocodedAddress?.region || ""
        } ${geocodedAddress?.postalCode || ""} ${
          geocodedAddress?.country || ""
        }`,
      });

      // Animate to the new location when it's found
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    }
  };

  React.useEffect(() => {
    requestLocationPermission();
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">GPS</ThemedText>
        <HelloWave />
      </ThemedView>

      {errorMsg ? (
        <ThemedView style={styles.infoContainer}>
          <ThemedText style={styles.errorText}>{errorMsg}</ThemedText>
          <ThemedView
            style={styles.retryButton}
            onTouchEnd={requestLocationPermission}
          >
            <ThemedText style={styles.retryText}>
              Request Permission Again
            </ThemedText>
          </ThemedView>
        </ThemedView>
      ) : location ? (
        <ThemedView style={styles.infoContainer}>
          <ThemedText>
            Latitude: {location.coords.latitude.toFixed(4)}
          </ThemedText>
          <ThemedText>
            Longitude: {location.coords.longitude.toFixed(4)}
          </ThemedText>
          {address && (
            <>
              <ThemedText>Address: {address.street}</ThemedText>
              <ThemedText>
                {address.city}, {address.region} {address.postalCode}
              </ThemedText>
              <ThemedText>{address.country}</ThemedText>
            </>
          )}
        </ThemedView>
      ) : (
        <ThemedView style={styles.infoContainer}>
          <ThemedText>Loading location...</ThemedText>
        </ThemedView>
      )}

      <ThemedView>
        <MapView
          ref={mapRef} // Reference to MapView
          style={styles.map}
          zoomEnabled
          initialRegion={{
            latitude: location?.coords.latitude || 43.6532,
            longitude: location?.coords.longitude || -79.3832,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {location && (
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="You are here"
              description={address?.street || ""}
            />
          )}
        </MapView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  infoContainer: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: "rgba(161, 206, 220, 0.1)",
  },
  errorText: {
    color: "#ff6b6b",
  },
  map: {
    width: "100%",
    height: Dimensions.get("window").width,
    borderRadius: 16,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  retryButton: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "rgba(161, 206, 220, 0.2)",
    borderRadius: 8,
    alignItems: "center",
  },
  retryText: {
    fontWeight: "600",
  },
});

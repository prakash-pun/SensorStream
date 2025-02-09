import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accel",
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={28} name="filter-tilt-shift" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="gyro"
        options={{
          title: "Gyro",
          tabBarIcon: ({ color }) => (
            <MaterialIcons size={28} name="compass-calibration" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="gps"
        options={{
          title: "Gps",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="gps-fixed" size={28} color={color} />
            // <IconSymbol size={28} name="compass" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

import { Tabs, useSegments } from "expo-router";
import React from "react";
import { View, StyleSheet } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const isVoiceScreen = segments.some((segment) => segment === "voice");

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarInactiveTintColor: "#8E8E93",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: isVoiceScreen
          ? { display: "none" }
          : {
              backgroundColor: "#28282D",
              borderTopWidth: 0,
              height: 90,
              paddingBottom: 20,
              paddingTop: 10,
            },
      }}
      initialRouteName="schedule"
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
          href: null,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: "Schedule",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="magnifyingglass" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="voice"
        options={{
          title: "",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.voiceButtonContainer,
                { backgroundColor: "#A78BFA" },
              ]}
            >
              <IconSymbol size={28} name="waveform" color="#FFFFFF" />
            </View>
          ),
          tabBarButton: (props) => (
            <View style={styles.voiceButtonWrapper}>
              <HapticTab {...props} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: "Notes",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="bookmark.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          ),
          href: null,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="onboarding"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  voiceButtonContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  voiceButtonWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
});

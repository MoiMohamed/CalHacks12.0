import React from "react";
import { View, Image, StyleSheet } from "react-native";

// Status bar icons - replace with real assets if available
const imgRectangle =
  "https://www.figma.com/api/mcp/asset/498bc27f-95e4-4d18-b236-c2f93da41cc7";
const imgCombinedShape =
  "https://www.figma.com/api/mcp/asset/eeeee3cb-bd93-4d82-9d4d-2237a4219d41";
const imgRectangle1 =
  "https://www.figma.com/api/mcp/asset/f1ee118b-6968-49a2-9fbf-aba379a21dd0";
const imgWifi =
  "https://www.figma.com/api/mcp/asset/ea6eb349-f8d6-4c86-8c8c-d57d48c2ec38";
const imgMobileSignal =
  "https://www.figma.com/api/mcp/asset/ba5685fc-ac5a-4091-af84-915e88cad245";
const img941 =
  "https://www.figma.com/api/mcp/asset/d9b01cf2-d63f-4e6f-a8e5-602ab8532689";

export const StatusBarUI = () => {
  return (
    <View style={styles.statusBar}>
      <View style={styles.statusBarLeft}>
        <Image source={{ uri: img941 }} style={styles.timeImage} />
      </View>
      <View style={styles.statusBarRight}>
        <Image source={{ uri: imgMobileSignal }} style={styles.signalImage} />
        <Image source={{ uri: imgWifi }} style={styles.wifiImage} />
        <View style={styles.batteryContainer}>
          <Image source={{ uri: imgRectangle }} style={styles.batteryOutline} />
          <Image source={{ uri: imgCombinedShape }} style={styles.batteryTip} />
          <Image source={{ uri: imgRectangle1 }} style={styles.batteryFill} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Exact styles matching ScheduleComponent status bar
  statusBar: {
    position: "absolute",
    height: 44,
    left: 0,
    right: 0,
    top: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBarLeft: {
    position: "absolute",
    left: 33.453514099121094,
    top: 17.16748046875,
    width: 28.42616844177246,
    height: 11.0888671875,
  },
  timeImage: {
    width: 28,
    height: 11,
  },
  statusBarRight: {
    position: "absolute",
    right: 14.67,
    top: 17.33,
    width: 66.66140747070312,
    height: 11.336193084716797,
    flexDirection: "row",
    alignItems: "center",
  },
  signalImage: {
    width: 17,
    height: 10.667,
    position: "absolute",
    left: 0,
    top: 0.33593738079071045,
  },
  wifiImage: {
    width: 15.272,
    height: 10.966,
    position: "absolute",
    left: 22.027069091796875,
    top: 0,
  },
  batteryContainer: {
    width: 24.32803726196289,
    height: 11.333333015441895,
    position: "absolute",
    left: 42.333343505859375,
    top: 0.0026854276657104492,
  },
  batteryOutline: {
    width: 22,
    height: 11,
    position: "absolute",
    left: 0,
    top: 0,
    opacity: 0.35,
  },
  batteryTip: {
    width: 1,
    height: 4,
    position: "absolute",
    left: 23,
    top: 3.666666030883789,
    opacity: 0.4,
  },
  batteryFill: {
    width: 18,
    height: 7,
    position: "absolute",
    left: 2,
    top: 2,
  },
});

export default StatusBarUI;

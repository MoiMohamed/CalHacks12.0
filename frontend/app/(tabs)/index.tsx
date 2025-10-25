import { Image } from "expo-image";
import {
  Platform,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";

import { HelloWave } from "@/components/hello-wave";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Link } from "expo-router";
import { heathApi } from "@/services/api";
import { SimpleVapiTest } from "@/components/SimpleVapiTest";

export default function HomeScreen() {
  const handleHealthCheck = async () => {
    try {
      const result = await heathApi.getHealth();
      Alert.alert("Health Check Success", JSON.stringify(result, null, 2));
    } catch (error) {
      Alert.alert(
        "Health Check Failed",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  };

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
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Hii{" "}
          <Text className="font-bold text-red-500 text-lg">
            app/(tabs)/index.tsx
          </Text>{" "}
          to see changes. Press{" "}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: "cmd + d",
              android: "cmd + m",
              web: "F12",
            })}
          </ThemedText>{" "}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Link href="/modal">
          <Link.Trigger>
            <ThemedText type="subtitle">Step 2: Explore</ThemedText>
          </Link.Trigger>
          <Link.Preview />
          <Link.Menu>
            <Link.MenuAction
              title="Action"
              icon="cube"
              onPress={() => alert("Action pressed")}
            />
            <Link.MenuAction
              title="Share"
              icon="square.and.arrow.up"
              onPress={() => alert("Share pressed")}
            />
            <Link.Menu title="More" icon="ellipsis">
              <Link.MenuAction
                title="Delete"
                icon="trash"
                destructive
                onPress={() => alert("Delete pressed")}
              />
            </Link.Menu>
          </Link.Menu>
        </Link>

        <ThemedText>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          {`When you're ready, run `}
          <ThemedText type="defaultSemiBold">
            npm run reset-project
          </ThemedText>{" "}
          to get a fresh <ThemedText type="defaultSemiBold">app</ThemedText>{" "}
          directory. This will move the current{" "}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{" "}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>

      {/* NativeWind Test Section */}
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">🎨 NativeWind Test</ThemedText>
        <View className="bg-blue-100 p-4 rounded-lg mb-2">
          <Text className="text-blue-800 font-semibold text-lg">
            Blue Background Test
          </Text>
          <Text className="text-gray-600 mt-1 text-base">
            This should have a light blue background
          </Text>
        </View>

        <View className="bg-green-200 p-3 rounded-md mb-2">
          <Text className="text-green-800 font-bold text-lg">
            Green Background Test
          </Text>
          <Text className="text-green-600 text-base">
            This should have a light green background
          </Text>
        </View>

        <View className="bg-purple-300 p-2 rounded-full mb-2">
          <Text className="text-purple-900 text-center font-bold text-lg">
            Purple Rounded Test
          </Text>
        </View>

        <Text className="text-red-500 font-bold text-xl mt-2">
          If you see colored backgrounds and styled text, NativeWind is working!
          🎉
        </Text>
      </ThemedView>

      {/* API Test Section */}
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">🔗 API Test</ThemedText>
        <TouchableOpacity
          onPress={handleHealthCheck}
          className="bg-blue-500 px-6 py-3 rounded-lg mb-2"
        >
          <Text className="text-white font-semibold text-center text-lg">
            Test Health API
          </Text>
        </TouchableOpacity>
        <ThemedText>
          Tap the button above to test the backend health check endpoint.
        </ThemedText>
      </ThemedView>

      {/* Simple VAPI Test */}
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">🎤 Simple VAPI Test</ThemedText>
        <SimpleVapiTest />
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
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});

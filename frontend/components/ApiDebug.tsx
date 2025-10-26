import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { apiURL } from "@/services/api_client";
import { missionsApi } from "@/services/api";

const HARDCODED_USER_ID = "ac22a45c-fb5b-4027-9e41-36d6b9abaebb";

export default function ApiDebug() {
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testApi = async () => {
    setIsLoading(true);
    setTestResult({ status: "testing..." });

    try {
      console.log("Testing API at:", apiURL);

      // Test 1: Fetch missions
      const missions = await missionsApi.getUserMissions(HARDCODED_USER_ID);
      console.log("✅ Missions fetched:", missions);

      setTestResult({
        status: "SUCCESS",
        apiUrl: apiURL,
        missionCount: missions.length,
        missions: missions.slice(0, 3), // First 3 missions
      });
    } catch (error: any) {
      console.error("❌ API Test Failed:", error);
      setTestResult({
        status: "ERROR",
        apiUrl: apiURL,
        error: error.message || String(error),
        details: error.response?.data || error.toString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    testApi();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>API Debug Panel</Text>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.label}>API URL:</Text>
          <Text style={styles.value}>{apiURL}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>User ID:</Text>
          <Text style={styles.value}>{HARDCODED_USER_ID}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Test Result:</Text>
          <Text style={styles.value}>
            {JSON.stringify(testResult, null, 2)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={testApi}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Testing..." : "Retry Test"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#262135",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 20,
    marginTop: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 15,
    borderRadius: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#A78BFA",
    marginBottom: 5,
  },
  value: {
    fontSize: 14,
    color: "#FFFFFF",
    fontFamily: "monospace",
  },
  button: {
    backgroundColor: "#A78BFA",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

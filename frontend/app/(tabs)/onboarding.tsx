// frontend/app/(tabs)/onboarding.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { VapiOnboarding } from "@/components/VapiOnboarding";

export default function OnboardingScreen() {
  const [onboardingMethod, setOnboardingMethod] = useState<
    "choose" | "form" | "voice"
  >("choose");
  const [completedUserId, setCompletedUserId] = useState<string | null>(null);

  const handleOnboardingComplete = (userId: string) => {
    setCompletedUserId(userId);
    Alert.alert("Success!", `Onboarding complete! User ID: ${userId}`);
  };

  if (completedUserId) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🎉 Welcome to Neuri!</Text>
        <Text style={styles.subtitle}>Your onboarding is complete!</Text>
        <Text style={styles.userId}>User ID: {completedUserId}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setOnboardingMethod("choose");
            setCompletedUserId(null);
          }}
        >
          <Text style={styles.buttonText}>Start Over</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (onboardingMethod === "form") {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setOnboardingMethod("choose")}
        >
          <Text style={styles.backButtonText}>← Back to Options</Text>
        </TouchableOpacity>
        <OnboardingFlow />
      </View>
    );
  }

  if (onboardingMethod === "voice") {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setOnboardingMethod("choose")}
        >
          <Text style={styles.backButtonText}>← Back to Options</Text>
        </TouchableOpacity>
        <VapiOnboarding onComplete={handleOnboardingComplete} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Neuri! 🎉</Text>
      <Text style={styles.subtitle}>Choose your onboarding method:</Text>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => setOnboardingMethod("form")}
        >
          <Text style={styles.optionEmoji}>📝</Text>
          <Text style={styles.optionTitle}>Form Setup</Text>
          <Text style={styles.optionDescription}>
            Quick and reliable form-based setup
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => setOnboardingMethod("voice")}
        >
          <Text style={styles.optionEmoji}>🎤</Text>
          <Text style={styles.optionTitle}>Voice Setup</Text>
          <Text style={styles.optionDescription}>
            Natural voice conversation setup
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>💡 For Testing:</Text>
        <Text style={styles.infoText}>
          • Form setup works immediately{"\n"}• Voice setup is in development
          {"\n"}• Both create the same user account
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: "#666",
  },
  userId: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 20,
    color: "#999",
    fontFamily: "monospace",
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: "#1976d2",
    fontWeight: "500",
  },
  optionsContainer: {
    gap: 16,
    marginBottom: 30,
  },
  optionButton: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  infoContainer: {
    backgroundColor: "#e3f2fd",
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#1976d2",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1976d2",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#1976d2",
    lineHeight: 20,
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

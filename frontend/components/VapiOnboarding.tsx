// frontend/components/VapiOnboarding.tsx
import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useCreateUser, useUpdateUser } from "@/hooks/useUsers";
import { useCreateCategory } from "@/hooks/useCategories";
import { VAPI_CREDENTIALS } from "@/config/vapi-credentials";

// Import VAPI SDKs based on platform
let VapiWeb: any = null;
let VapiNative: any = null;

// Only load the SDK for the current platform to avoid conflicts
if (Platform.OS === "web") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    VapiWeb = require("@vapi-ai/web").default;
    console.log("VAPI Web SDK loaded for web platform");
  } catch (error) {
    console.log("VAPI Web SDK not available:", error);
  }
} else {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    VapiNative = require("@vapi-ai/react-native").default;
    console.log("VAPI React Native SDK loaded for native platform");
  } catch (error) {
    console.log("VAPI React Native SDK not available:", error);
  }
}

interface VapiOnboardingProps {
  onComplete: (userId: string) => void;
}

export const VapiOnboarding: React.FC<VapiOnboardingProps> = ({
  onComplete,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const createCategory = useCreateCategory();

  // Initialize VAPI instance (with fallback)
  const vapi = useMemo(() => {
    if (Platform.OS === "web" && VapiWeb) {
      console.log("Creating VAPI Web instance");
      return new VapiWeb(VAPI_CREDENTIALS.PUBLIC_KEY);
    } else if (Platform.OS !== "web" && VapiNative) {
      console.log("Creating VAPI React Native instance");
      return new VapiNative(VAPI_CREDENTIALS.PUBLIC_KEY);
    }
    console.log("No VAPI SDK available for platform:", Platform.OS);
    return null;
  }, []);

  const handleCompleteOnboarding = useCallback(
    async (userData: any) => {
      try {
        setIsLoading(true);
        setMessages((prev) => [...prev, "Setting up your account..."]);

        // Generate a simple user ID
        const userId = `user-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        // Create user
        const user = await createUser.mutateAsync({
          id: userId,
          name: userData.name || "Voice User",
          email: `${(userData.name || "user").toLowerCase()}@example.com`,
        });

        // Create categories if provided
        if (userData.categories && userData.categories.length > 0) {
          for (const categoryName of userData.categories) {
            await createCategory.mutateAsync({
              name: categoryName,
              user_id: user.id,
            });
          }
        }

        // Update user profile if provided
        if (userData.pace || userData.workTime) {
          await updateUser.mutateAsync({
            id: user.id,
            data: {
              pace: userData.pace,
              preferred_work_time: userData.workTime,
            },
          });
        }

        setMessages((prev) => [
          ...prev,
          "Welcome to Neuri! Your setup is complete!",
        ]);
        setTimeout(() => onComplete(user.id), 2000);
      } catch (error) {
        console.error("Onboarding error:", error);
        setMessages((prev) => [
          ...prev,
          "Something went wrong. Please try again.",
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [createUser, createCategory, updateUser, onComplete]
  );

  // Set up event listeners (only if VAPI is available)
  React.useEffect(() => {
    if (!vapi) {
      console.log("VAPI not available, using fallback mode");
      return;
    }

    const handleCallStart = () => {
      console.log("🎤 Voice conversation started!");
      setIsConnected(true);
      setMessages((prev) => [...prev, "Voice conversation started"]);
    };

    const handleCallEnd = () => {
      console.log("🔚 Voice conversation ended!");
      setIsConnected(false);
      setMessages((prev) => [...prev, "Voice conversation ended"]);
    };

    const handleMessage = (message: any) => {
      console.log("📨 VAPI message:", message);
      console.log("📨 VAPI message type:", typeof message);
      console.log("📨 VAPI message keys:", Object.keys(message || {}));

      // Log ALL message data for debugging
      if (message && typeof message === "object") {
        console.log(
          "📨 Full message object:",
          JSON.stringify(message, null, 2)
        );
      }

      try {
        const data =
          typeof message === "string" ? JSON.parse(message) : message;

        // Handle transcript messages
        if (data.type === "transcript") {
          if (data.role === "user") {
            setMessages((prev) => [...prev, `You: ${data.transcript}`]);
          } else if (data.role === "assistant") {
            setMessages((prev) => [...prev, `Assistant: ${data.transcript}`]);
            console.log("🎤 Assistant speaking:", data.transcript);
          }
        }
        // Handle structured onboarding messages from assistant
        else if (data.type === "category_created") {
          console.log("Category created:", data.category_name);
          setMessages((prev) => [
            ...prev,
            `✅ Created category: ${data.category_name}`,
          ]);
        } else if (data.type === "profile_updated") {
          console.log("Profile updated:", data);
          setMessages((prev) => [
            ...prev,
            `✅ Profile updated for ${data.name}`,
          ]);
        } else if (data.type === "onboarding_complete") {
          console.log("Onboarding complete!");
          setMessages((prev) => [
            ...prev,
            "🎉 Onboarding complete! Welcome to Neuri!",
          ]);
          // Complete the onboarding with the collected data
          handleCompleteOnboarding(data);
        }
        // Handle function calls (tool responses)
        else if (data.type === "function-call") {
          console.log("Tool called:", data.functionCall);
          setMessages((prev) => [...prev, `Tool: ${data.functionCall.name}`]);
        }
        // Handle legacy structured onboarding data
        else if (
          data.user_name ||
          data.categories ||
          data.pace ||
          data.work_time
        ) {
          setMessages((prev) => [...prev, "Processing your information..."]);
          handleCompleteOnboarding(data);
        }
        // Handle status updates
        else if (data.type === "status-update") {
          console.log("Status update:", data.status);
          if (data.status === "in-progress") {
            setMessages((prev) => [...prev, "Assistant is thinking..."]);
          } else if (data.status === "ended") {
            console.log("Call ended reason:", data.endedReason);
            setMessages((prev) => [...prev, `Call ended: ${data.endedReason}`]);
          }
        }
        // Handle any other message types
        else {
          console.log("Unknown message type:", data.type);
          console.log("Full message data:", JSON.stringify(data, null, 2));
          setMessages((prev) => [
            ...prev,
            `📨 Received: ${data.type || "unknown"}`,
          ]);
        }
      } catch (error) {
        console.error("Error parsing VAPI message:", error);
      }
    };

    const handleError = (error: any) => {
      console.error("VAPI error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));

      let errorMessage = "Voice connection error. Please try again.";
      if (error.message) {
        errorMessage = `Error: ${error.message}`;
      } else if (error.status) {
        errorMessage = `HTTP ${error.status}: ${error.statusText || "Authentication failed"}`;
      }

      setMessages((prev) => [...prev, errorMessage]);
      setIsConnected(false);
    };

    vapi.on("call-start", handleCallStart);
    vapi.on("call-end", handleCallEnd);
    vapi.on("message", handleMessage);
    vapi.on("error", handleError);

    return () => {
      if (vapi) {
        console.log("Cleaning up VAPI instance");
        vapi.off("call-start", handleCallStart);
        vapi.off("call-end", handleCallEnd);
        vapi.off("message", handleMessage);
        vapi.off("error", handleError);
        vapi.stop();
      }
    };
  }, [handleCompleteOnboarding, vapi]);

  // Voice call handlers using VAPI instance
  const handleStartVoice = async () => {
    if (!vapi) {
      setMessages((prev) => [...prev, "VAPI not available on this platform"]);
      return;
    }

    try {
      console.log("VAPI credentials:", VAPI_CREDENTIALS);
      console.log("Platform:", Platform.OS);
      console.log(
        "Starting voice conversation with assistant:",
        VAPI_CREDENTIALS.ASSISTANT_ID
      );

      setMessages((prev) => [...prev, "Connecting to assistant..."]);

      if (Platform.OS === "web") {
        // Web SDK approach
        await vapi.start(VAPI_CREDENTIALS.ASSISTANT_ID);
      } else {
        // React Native SDK approach
        await vapi.start(VAPI_CREDENTIALS.ASSISTANT_ID);
      }

      console.log("VAPI start() completed successfully");
    } catch (error) {
      console.error("Failed to start voice conversation:", error);
      setMessages((prev) => [
        ...prev,
        `Failed to start voice conversation: ${error.message || error}`,
      ]);
    }
  };

  const handleEndVoice = () => {
    if (vapi) {
      vapi.stop();
    }
  };

  const handleToggleMute = () => {
    if (!vapi) return;

    if (isMuted) {
      vapi.setMuted(false);
      setIsMuted(false);
    } else {
      vapi.setMuted(true);
      setIsMuted(true);
    }
  };

  const getButtonText = () => {
    if (!vapi) {
      return "VAPI Not Available";
    }
    if (isConnected) {
      return "End Conversation";
    }
    return "Start Voice Chat";
  };

  const getButtonColor = () => {
    if (!vapi) {
      return "#6b7280"; // Gray for disabled
    }
    if (isConnected) {
      return "#FF4444"; // Red for stop
    }
    return "#007AFF"; // Blue for start (like ChatGPT)
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Neuri Voice Assistant</Text>

      {/* Conversation Messages */}
      <View style={styles.messagesContainer}>
        {messages.length === 0 ? (
          <Text style={styles.welcomeText}>
            Hi! I&apos;m your ADHD companion. Let&apos;s chat and I&apos;ll help
            you set up your personalized experience.
          </Text>
        ) : (
          messages.map((message, index) => (
            <View key={index} style={styles.messageBubble}>
              <Text style={styles.messageText}>{message}</Text>
            </View>
          ))
        )}
      </View>

      {/* Voice Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.voiceButton, { backgroundColor: getButtonColor() }]}
          onPress={isConnected ? handleEndVoice : handleStartVoice}
          disabled={isLoading || !vapi}
        >
          <Text style={styles.voiceButtonText}>
            {isLoading ? "⏳ Processing..." : getButtonText()}
          </Text>
        </TouchableOpacity>

        {isConnected && vapi && (
          <TouchableOpacity
            style={styles.muteButton}
            onPress={handleToggleMute}
          >
            <Text style={styles.muteButtonText}>
              {isMuted ? "🔊 Unmute" : "🔇 Mute"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Status Indicator */}
      {isConnected && (
        <View style={styles.statusContainer}>
          <View style={styles.pulseDot} />
          <Text style={styles.statusText}>Listening...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 30,
    color: "#1a1a1a",
  },
  messagesContainer: {
    flex: 1,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginTop: 50,
  },
  messageBubble: {
    backgroundColor: "#f7f7f8",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    maxWidth: "85%",
  },
  messageText: {
    fontSize: 16,
    color: "#1a1a1a",
    lineHeight: 22,
  },
  controlsContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  voiceButton: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  voiceButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  muteButton: {
    backgroundColor: "#6b7280",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  muteButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10b981",
    marginRight: 8,
    // Add pulse animation here if needed
  },
  statusText: {
    fontSize: 14,
    color: "#10b981",
    fontWeight: "500",
  },
});

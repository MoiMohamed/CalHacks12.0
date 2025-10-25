// Simple VAPI test component following the official documentation
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { VAPI_CREDENTIALS } from "@/config/vapi-credentials";

// Import VAPI Web SDK
let Vapi: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Vapi = require("@vapi-ai/web").default;
} catch (error: unknown) {
  console.log("VAPI Web SDK not available:", error);
}

interface SimpleVapiTestProps {
  onComplete?: (data: any) => void;
}

export const SimpleVapiTest: React.FC<SimpleVapiTestProps> = ({
  onComplete,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [vapi, setVapi] = useState<any>(null);

  useEffect(() => {
    if (!Vapi) {
      console.log("VAPI SDK not available");
      return;
    }

    // Create VAPI instance following the documentation exactly
    const vapiInstance = new Vapi(VAPI_CREDENTIALS.PUBLIC_KEY);
    setVapi(vapiInstance);

    // Listen for events following the documentation exactly
    vapiInstance.on("call-start", () => {
      console.log("Call started");
      setIsConnected(true);
      setMessages((prev) => [...prev, "Call started"]);
    });

    vapiInstance.on("call-end", () => {
      console.log("Call ended");
      setIsConnected(false);
      setMessages((prev) => [...prev, "Call ended"]);
    });

    vapiInstance.on("message", (message: any) => {
      console.log("Message received:", message);

      if (message.type === "transcript") {
        const transcriptMessage = `${message.role}: ${message.transcript}`;
        console.log(transcriptMessage);
        setMessages((prev) => [...prev, transcriptMessage]);
      } else {
        console.log("Other message type:", message.type);
        setMessages((prev) => [...prev, `Other: ${message.type}`]);
      }
    });

    vapiInstance.on("error", (error: any) => {
      console.error("VAPI error:", error);
      setMessages((prev) => [...prev, `Error: ${error.message || error}`]);
    });

    // Cleanup
    return () => {
      if (vapiInstance) {
        vapiInstance.stop();
      }
    };
  }, []);

  const handleStart = async () => {
    if (!vapi) {
      setMessages((prev) => [...prev, "VAPI not available"]);
      return;
    }

    try {
      console.log(
        "Starting call with assistant:",
        VAPI_CREDENTIALS.ASSISTANT_ID
      );
      await vapi.start(VAPI_CREDENTIALS.ASSISTANT_ID);
    } catch (error) {
      console.error("Failed to start call:", error);
      setMessages((prev) => [
        ...prev,
        `Start failed: ${(error as Error).message || error}`,
      ]);
    }
  };

  const handleStop = () => {
    if (vapi) {
      vapi.stop();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simple VAPI Test</Text>

      <View style={styles.messagesContainer}>
        {messages.length === 0 ? (
          <Text style={styles.welcomeText}>
            Click &quot;Start Call&quot; to test VAPI integration
          </Text>
        ) : (
          messages.map((message, index) => (
            <View key={index} style={styles.messageBubble}>
              <Text style={styles.messageText}>{message}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: isConnected ? "#FF4444" : "#007AFF" },
          ]}
          onPress={isConnected ? handleStop : handleStart}
        >
          <Text style={styles.buttonText}>
            {isConnected ? "Stop Call" : "Start Call"}
          </Text>
        </TouchableOpacity>
      </View>

      {isConnected && (
        <View style={styles.statusContainer}>
          <View style={styles.pulseDot} />
          <Text style={styles.statusText}>Connected</Text>
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
    fontSize: 24,
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
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 14,
    color: "#1a1a1a",
  },
  controlsContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10b981",
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: "#10b981",
    fontWeight: "500",
  },
});

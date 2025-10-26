import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

interface VoiceInterfaceProps {
  isActive?: boolean;
  isConnecting?: boolean;
  isMuted?: boolean;
  isPaused?: boolean;
  onSpeakerPress?: () => void;
  onMutePress?: () => void;
  onPausePress?: () => void;
  onEndPress?: () => void;
  audioData?: number[]; // Real-time audio frequency data
}

// Custom sound wave component that responds to real audio
const SoundWave: React.FC<{ isActive: boolean; audioData?: number[] }> = ({
  isActive,
  audioData,
}) => {
  const barCount = 120;
  const animValues = useRef(
    Array.from({ length: barCount }, () => new Animated.Value(0.1))
  ).current;
  const smoothedData = useRef(Array.from({ length: barCount }, () => 0.1));

  useEffect(() => {
    if (!isActive) {
      // Reset all bars to minimum height when inactive
      animValues.forEach((value) => {
        Animated.timing(value, {
          toValue: 0.1,
          duration: 300,
          useNativeDriver: false,
        }).start();
      });
      smoothedData.current = Array.from({ length: barCount }, () => 0.1);
      return;
    }

    // If we have real audio data, use it
    if (audioData && audioData.length > 0) {
      // Check if there's actual audio activity
      const maxValue = Math.max(...audioData);
      const hasAudio = maxValue > 10; // Threshold for detecting audio

      // Map audio frequency data to bar heights
      const mappedData = Array.from({ length: barCount }, (_, i) => {
        // Map barCount bars to the available audioData
        // Use a non-linear mapping to emphasize interesting frequencies
        const normalizedPosition = i / barCount;
        // Weight towards lower-mid frequencies (where voice is)
        const audioIndex = Math.floor(
          Math.pow(normalizedPosition, 1.5) * audioData.length
        );
        const rawValue =
          audioData[Math.min(audioIndex, audioData.length - 1)] || 0;

        // Normalize the value (0-1 range)
        const normalizedValue = Math.min(rawValue / 255, 1);

        // Apply adaptive smoothing - faster response for changes, slower decay
        const isIncreasing = normalizedValue > smoothedData.current[i];
        const smoothingFactor = isIncreasing ? 0.5 : 0.2; // Faster rise, slower fall

        const smoothed =
          smoothedData.current[i] * (1 - smoothingFactor) +
          normalizedValue * smoothingFactor;
        smoothedData.current[i] = smoothed;

        // Apply minimum threshold for better visual
        const minHeight = hasAudio ? 0.15 : 0.1;
        return Math.max(smoothed, minHeight);
      });

      // Animate bars to match audio data with spring-like motion
      mappedData.forEach((value, index) => {
        Animated.spring(animValues[index], {
          toValue: value,
          tension: 100,
          friction: 10,
          useNativeDriver: false,
        }).start();
      });
    } else {
      // Fallback: gentle idle animation when no audio data available
      const animations = animValues.map((value, index) => {
        const phase = (index / barCount) * Math.PI * 2;
        const targetValue = 0.15 + Math.sin(Date.now() / 500 + phase) * 0.1;

        return Animated.timing(value, {
          toValue: Math.max(targetValue, 0.1),
          duration: 200,
          useNativeDriver: false,
        });
      });

      Animated.parallel(animations).start();
    }
  }, [isActive, audioData, animValues]);

  // Base heights for each bar to create a natural waveform pattern
  const baseHeights = Array.from({ length: barCount }, (_, i) => {
    // Create a varied waveform pattern with multiple frequencies
    const x = i / barCount;
    const height1 = Math.sin(x * Math.PI * 12) * 0.5;
    const height2 = Math.sin(x * Math.PI * 24) * 0.3;
    const height3 = Math.sin(x * Math.PI * 6) * 0.2;
    return Math.abs(height1 + height2 + height3) * 40 + 8;
  });

  return (
    <View
      style={{
        height: 70,
        width: width,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          width: width,
          height: 70,
        }}
      >
        {animValues.map((animValue, index) => {
          const baseHeight = baseHeights[index];
          const barHeight = animValue.interpolate({
            inputRange: [0, 1],
            outputRange: [baseHeight * 0.3, baseHeight * 2.2],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={index}
              style={{
                width: width / barCount - 1.5,
                height: barHeight,
                backgroundColor: "#FFFFFF",
                marginHorizontal: 0.5,
                borderRadius: 1,
              }}
            />
          );
        })}
      </View>
    </View>
  );
};

export const VoiceInterface: React.FC<VoiceInterfaceProps> = ({
  isActive = true,
  isConnecting = false,
  isMuted = false,
  isPaused = false,
  onSpeakerPress,
  onMutePress,
  onPausePress,
  onEndPress,
  audioData,
}) => {
  const insets = useSafeAreaInsets();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulsing animation for connecting state
  useEffect(() => {
    if (isConnecting) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.5,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isConnecting, pulseAnim]);

  // Calculate dynamic height based on screen size
  // Min 260px, max 300px for most phones
  const interfaceHeight = Math.min(Math.max(height * 0.35, 260), 300);

  return (
    <View
      className="absolute bottom-0 left-0 right-0"
      style={{
        height: interfaceHeight,
        paddingBottom: insets.bottom,
        zIndex: 99999,
        elevation: 99999,
        backgroundColor: "#2E273F",
        borderTopLeftRadius: 50,
        borderTopRightRadius: 50,
        overflow: "hidden",
      }}
    >
      {/* Background Image positioned at bottom halfway */}
      <Image
        source={require("../../assets/images/image.png")}
        style={{
          position: "absolute",
          top: -200,
          left: width / 2 - 353.5,
          width: 707,
          height: 707,
          opacity: 0.5,
        }}
        resizeMode="cover"
      />

      {/* Background and Content */}
      <View
        style={{
          flex: 1,
          paddingTop: 12,
          paddingHorizontal: 24,
          paddingBottom: 12,
        }}
      >
        <View style={{ flex: 1, justifyContent: "flex-start" }}>
          {/* Top Handle */}
          <View className="w-9 h-1 bg-white/40 rounded-full self-center mb-6" />

          {/* Sound Wave Visualization */}
          <View className="h-[100] w-full justify-center items-center mb-4">
            {isConnecting ? (
              <Animated.View
                className="flex-1 justify-center items-center"
                style={{ opacity: pulseAnim }}
              >
                <Text
                  className="text-white text-lg mb-2"
                  style={{
                    fontFamily: "MontserratAlternates_600SemiBold",
                  }}
                >
                  Connecting...
                </Text>
                <Text
                  className="text-white/70 text-sm"
                  style={{
                    fontFamily: "Montserrat_400Regular",
                  }}
                >
                  Starting voice assistant
                </Text>
              </Animated.View>
            ) : (
              <SoundWave
                isActive={isActive && !isPaused}
                audioData={audioData}
              />
            )}
          </View>

          {/* Control Buttons */}
          <View className="flex-row justify-around items-start px-3 mb-4">
            {/* Speaker Button */}
            <View className="items-center">
              <TouchableOpacity
                className="w-14 h-14 rounded-full bg-white/20 justify-center items-center mb-1.5"
                onPress={onSpeakerPress}
                activeOpacity={0.7}
              >
                <Ionicons name="volume-high" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text
                className="text-[11px] text-center"
                style={{
                  fontFamily: "MontserratAlternates_500Medium",
                  color: "#FFFFFF",
                }}
              >
                Speaker
              </Text>
            </View>

            {/* Mute Button */}
            <View className="items-center">
              <TouchableOpacity
                className={`w-14 h-14 rounded-full justify-center items-center mb-1.5 ${
                  isMuted ? "bg-white/30" : "bg-white/20"
                }`}
                onPress={onMutePress}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isMuted ? "mic-off" : "mic-off-outline"}
                  size={24}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
              <Text
                className="text-[11px] text-center"
                style={{
                  fontFamily: "MontserratAlternates_500Medium",
                  color: "#FFFFFF",
                }}
              >
                Mute
              </Text>
            </View>

            {/* Pause Button */}
            <View className="items-center">
              <TouchableOpacity
                className={`w-14 h-14 rounded-full justify-center items-center mb-1.5 ${
                  isPaused ? "bg-white/30" : "bg-white/20"
                }`}
                onPress={onPausePress}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isPaused ? "play" : "pause"}
                  size={24}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
              <Text
                className="text-[11px] text-center"
                style={{
                  fontFamily: "MontserratAlternates_500Medium",
                  color: "#FFFFFF",
                }}
              >
                Pause
              </Text>
            </View>

            {/* End Button */}
            <View className="items-center">
              <TouchableOpacity
                className="w-14 h-14 rounded-full bg-[#EB5545] justify-center items-center mb-1.5"
                onPress={onEndPress}
                activeOpacity={0.7}
              >
                <Text className="text-[28px] text-white text-center font-light">
                  ×
                </Text>
              </TouchableOpacity>
              <Text
                className="text-[11px] text-center"
                style={{
                  fontFamily: "MontserratAlternates_500Medium",
                  color: "#FFFFFF",
                }}
              >
                End
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

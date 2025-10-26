import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Defs,
  RadialGradient as SvgRadialGradient,
  Stop,
  Ellipse,
} from "react-native-svg";

const { width, height } = Dimensions.get("window");

interface VoiceInterfaceProps {
  isActive?: boolean;
  isMuted?: boolean;
  isPaused?: boolean;
  onSpeakerPress?: () => void;
  onMutePress?: () => void;
  onPausePress?: () => void;
  onEndPress?: () => void;
}

// SiriWave component wrapper for React Native
const SiriWave: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const canvasRef = useRef<any>(null);
  const [siriwave, setSiriwave] = useState<any>(null);

  useEffect(() => {
    if (Platform.OS === "web" && canvasRef.current) {
      // Dynamically import siriwave only on web
      import("siriwave").then((SiriWaveModule) => {
        const SiriWaveClass = SiriWaveModule.default;
        const wave = new SiriWaveClass({
          container: canvasRef.current,
          style: "ios9",
          amplitude: isActive ? 2.5 : 0.3,
          speed: 0.2,
          autostart: true,
          cover: true,
          width: width,
          height: 100,
          color: "#FFFFFF",
          frequency: 6,
          ratio: 1,
        });
        setSiriwave(wave);

        return () => {
          if (wave) {
            wave.dispose();
          }
        };
      });
    }
  }, []);

  useEffect(() => {
    if (siriwave) {
      siriwave.setAmplitude(isActive ? 2.5 : 0.3);
      siriwave.setSpeed(isActive ? 0.25 : 0.15);
    }
  }, [isActive, siriwave]);

  if (Platform.OS !== "web") {
    // Animated fallback wave visualization for native
    const AnimatedFallback = () => {
      const pulse1 = useRef(new Animated.Value(0.6)).current;
      const pulse2 = useRef(new Animated.Value(0.4)).current;
      const pulse3 = useRef(new Animated.Value(0.2)).current;

      useEffect(() => {
        const createPulseAnimation = (
          animValue: Animated.Value,
          delay: number
        ) => {
          return Animated.loop(
            Animated.sequence([
              Animated.timing(animValue, {
                toValue: 1,
                duration: isActive ? 800 : 1500,
                delay,
                useNativeDriver: true,
              }),
              Animated.timing(animValue, {
                toValue: isActive ? 0.6 : 0.2,
                duration: isActive ? 800 : 1500,
                useNativeDriver: true,
              }),
            ])
          );
        };

        const animation1 = createPulseAnimation(pulse1, 0);
        const animation2 = createPulseAnimation(pulse2, 200);
        const animation3 = createPulseAnimation(pulse3, 400);

        animation1.start();
        animation2.start();
        animation3.start();

        return () => {
          animation1.stop();
          animation2.stop();
          animation3.stop();
        };
      }, [isActive]);

      return (
        <View style={styles.fallbackWave}>
          <View style={styles.nativeWaveContainer}>
            <Animated.View
              style={[
                styles.nativeWave,
                { opacity: pulse1, transform: [{ scaleX: pulse1 }] },
              ]}
            />
            <Animated.View
              style={[
                styles.nativeWave,
                { opacity: pulse2, transform: [{ scaleX: pulse2 }] },
              ]}
            />
            <Animated.View
              style={[
                styles.nativeWave,
                { opacity: pulse3, transform: [{ scaleX: pulse3 }] },
              ]}
            />
          </View>
        </View>
      );
    };

    return <AnimatedFallback />;
  }

  return <div ref={canvasRef} style={{ width: width, height: 100 }} />;
};

export const VoiceInterface: React.FC<VoiceInterfaceProps> = ({
  isActive = true,
  isMuted = false,
  isPaused = false,
  onSpeakerPress,
  onMutePress,
  onPausePress,
  onEndPress,
}) => {
  const insets = useSafeAreaInsets();

  // Calculate dynamic height based on screen size
  // Min 260px, max 300px for most phones
  const interfaceHeight = Math.min(Math.max(height * 0.35, 260), 300);

  // Calculate glow position with wide ellipse that covers the full width
  const glowRadiusX = width * 1.1; // Horizontal radius - very wide
  const glowRadiusY = width * 0.35; // Vertical radius - much shorter for stretched effect
  const targetIntersectionFromBottom = interfaceHeight / 5; // 1/5 from bottom
  // Position ellipse so it intersects at the target height from bottom
  const glowBottom = -(glowRadiusY - targetIntersectionFromBottom);

  // Container dimensions for the ellipse
  const svgWidth = glowRadiusX * 2;
  const svgHeight = glowRadiusY * 2;

  return (
    <View
      style={[
        styles.container,
        { height: interfaceHeight, paddingBottom: insets.bottom },
      ]}
    >
      {/* Gradient Overlay - bottom to top */}
      <LinearGradient
        colors={["#23202A", "#272236"]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={styles.gradient}
      >
        {/* Purple Glow Effect - SVG with smooth radial gradient */}
        <View
          style={[
            styles.glowContainer,
            {
              bottom: glowBottom,
              width: svgWidth,
              height: svgHeight,
              marginLeft: -glowRadiusX,
            },
          ]}
        >
          <Svg height={svgHeight} width={svgWidth} style={styles.glowSvg}>
            <Defs>
              <SvgRadialGradient id="purpleGlow" cx="50%" cy="50%">
                <Stop
                  offset="0%"
                  stopColor="rgb(204, 145, 255)"
                  stopOpacity="0.5"
                />
                <Stop
                  offset="15%"
                  stopColor="rgb(204, 145, 255)"
                  stopOpacity="0.4"
                />
                <Stop
                  offset="30%"
                  stopColor="rgb(204, 145, 255)"
                  stopOpacity="0.3"
                />
                <Stop
                  offset="45%"
                  stopColor="rgb(204, 145, 255)"
                  stopOpacity="0.2"
                />
                <Stop
                  offset="60%"
                  stopColor="rgb(204, 145, 255)"
                  stopOpacity="0.12"
                />
                <Stop
                  offset="75%"
                  stopColor="rgb(204, 145, 255)"
                  stopOpacity="0.06"
                />
                <Stop
                  offset="90%"
                  stopColor="rgb(204, 145, 255)"
                  stopOpacity="0.02"
                />
                <Stop
                  offset="100%"
                  stopColor="rgb(204, 145, 255)"
                  stopOpacity="0"
                />
              </SvgRadialGradient>
            </Defs>
            <Ellipse
              cx={glowRadiusX}
              cy={glowRadiusY}
              rx={glowRadiusX}
              ry={glowRadiusY}
              fill="url(#purpleGlow)"
            />
          </Svg>
        </View>

        <View style={styles.contentContainer}>
          {/* Top Handle */}
          <View style={styles.handleSmall} />

          {/* SiriWave Visualization */}
          <View style={styles.waveContainer}>
            <SiriWave isActive={isActive && !isPaused} />
          </View>

          {/* Control Buttons */}
          <View style={styles.controlsContainer}>
            {/* Speaker Button */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={onSpeakerPress}
                activeOpacity={0.7}
              >
                <Ionicons name="volume-high" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.controlLabel}>Speaker</Text>
            </View>

            {/* Mute Button */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.controlButton,
                  isMuted && styles.controlButtonActive,
                ]}
                onPress={onMutePress}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isMuted ? "mic-off" : "mic-off-outline"}
                  size={24}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
              <Text style={styles.controlLabel}>Mute</Text>
            </View>

            {/* Pause Button */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.controlButton,
                  isPaused && styles.controlButtonActive,
                ]}
                onPress={onPausePress}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isPaused ? "play" : "pause"}
                  size={24}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
              <Text style={styles.controlLabel}>Pause</Text>
            </View>

            {/* End Button */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.endButton}
                onPress={onEndPress}
                activeOpacity={0.7}
              >
                <Text style={styles.endIcon}>×</Text>
              </TouchableOpacity>
              <Text style={styles.controlLabel}>End</Text>
            </View>
          </View>

          {/* Spacer to push bottom indicator down */}
          <View style={{ flex: 1 }} />

          {/* Bottom Indicator */}
          <View style={styles.bottomIndicator} />
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#272236",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: "hidden",
  },
  glowContainer: {
    position: "absolute",
    left: "50%",
    zIndex: 1,
  },
  glowSvg: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 12,
    zIndex: 4,
  },
  contentContainer: {
    flex: 1,
    zIndex: 5,
    justifyContent: "flex-start",
  },
  handleSmall: {
    width: 36,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 999,
    alignSelf: "center",
    marginBottom: 16,
  },
  waveContainer: {
    height: 100,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    marginHorizontal: -20,
  },
  fallbackWave: {
    height: 100,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  nativeWaveContainer: {
    width: "100%",
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  nativeWave: {
    position: "absolute",
    width: "100%",
    height: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
  },
  waveText: {
    fontSize: 40,
    marginBottom: 8,
  },
  waveSubtext: {
    fontSize: 11,
    color: "#FFFFFF80",
    fontFamily: "MontserratAlternates_500Medium",
    marginTop: 4,
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-start",
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  buttonContainer: {
    alignItems: "center",
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.20)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  controlButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.30)",
  },
  endButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#EB5545",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  endIcon: {
    fontSize: 28,
    color: "#FFFFFF",
    fontWeight: "300",
    textAlign: "center",
  },
  controlLabel: {
    fontSize: 11,
    fontFamily: "MontserratAlternates_500Medium",
    color: "#FFFFFF",
    textAlign: "center",
  },
  bottomIndicator: {
    width: 120,
    height: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    alignSelf: "center",
    marginBottom: 8,
  },
});

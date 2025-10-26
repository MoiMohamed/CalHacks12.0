import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

interface RoutineCardProps {
  emoji?: string;
  title: string;
  frequency?: string;
  time?: string;
  colorIndex?: number;
  enabled?: boolean;
  onToggleRoutine?: (enabled: boolean) => void;
}

// Predefined color palettes for routine cards
const ROUTINE_COLORS = {
  background: ["#553160"],
};

export const RoutineCard: React.FC<RoutineCardProps> = ({
  emoji,
  title,
  frequency,
  time,
  colorIndex = 0,
  enabled = true,
  onToggleRoutine,
}) => {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const togglePosition = useSharedValue(enabled ? 1 : 0);

  const backgroundColor =
    ROUTINE_COLORS.background[colorIndex % ROUTINE_COLORS.background.length];

  const handleToggleRoutine = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    togglePosition.value = withSpring(newState ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });
    onToggleRoutine?.(newState);
  };

  const animatedToggleStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: togglePosition.value === 1 ? "#F1DAF6" : "#FFFFFF40",
    };
  });

  const animatedKnobStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: togglePosition.value * 14.392,
        },
      ],
    };
  });

  return (
    <View style={[styles.card, { backgroundColor }]}>
      <View style={styles.content}>
        {emoji && (
          <View style={styles.emojiCircle}>
            <Text style={styles.emoji}>{emoji}</Text>
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {time && <Text style={styles.time}>{time}</Text>}
          {frequency && <Text style={styles.frequency}>{frequency}</Text>}
        </View>
        <Pressable onPress={handleToggleRoutine} style={styles.toggleContainer}>
          <Animated.View style={[styles.toggle, animatedToggleStyle]}>
            <Animated.View style={[styles.toggleKnob, animatedKnobStyle]} />
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 11.5,
    padding: 12,
    marginBottom: 8,
    borderWidth: 0.288,
    borderColor: "#FFFFFF",
  },
  content: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  emojiCircle: {
    width: 21.88,
    height: 21.88,
    borderRadius: 10.94,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6.08,
    flexShrink: 0,
  },
  emoji: {
    fontSize: 10.94,
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "400",
  },
  textContainer: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 13,
    fontFamily: "MontserratAlternates_500Medium",
    color: "#EDEBFF",
    lineHeight: 18,
    letterSpacing: 0.432,
    marginBottom: 2,
  },
  time: {
    fontSize: 12,
    fontFamily: "Montserrat_600SemiBold",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  frequency: {
    fontSize: 11,
    fontFamily: "Montserrat_400Regular",
    color: "rgba(237, 235, 255, 0.7)",
  },
  toggleContainer: {
    alignSelf: "flex-start",
  },
  toggle: {
    width: 34.54,
    height: 20.148,
    borderRadius: 10.074,
    backgroundColor: "#FFFFFF40",
    justifyContent: "center",
    paddingHorizontal: 2,
    flexShrink: 0,
  },
  toggleKnob: {
    width: 16.148,
    height: 16.148,
    borderRadius: 8.074,
    backgroundColor: "#5E3967",
  },
});

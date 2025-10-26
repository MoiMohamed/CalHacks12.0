import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

interface ReminderCardProps {
  title: string;
  time?: string;
  date?: string;
  colorIndex?: number;
  enabled?: boolean;
  onToggle?: (enabled: boolean) => void;
}

// Predefined color palettes for reminder cards
const REMINDER_COLORS = {
  background: ["#6B5E7B"],
};

export const ReminderCard: React.FC<ReminderCardProps> = ({
  title,
  time,
  date,
  colorIndex = 0,
  enabled = true,
  onToggle,
}) => {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const togglePosition = useSharedValue(enabled ? 1 : 0);

  const backgroundColor =
    REMINDER_COLORS.background[colorIndex % REMINDER_COLORS.background.length];

  const handleToggle = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    togglePosition.value = withSpring(newState ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });
    onToggle?.(newState);
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
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {time && <Text style={styles.time}>{time}</Text>}
          {date && <Text style={styles.date}>{date}</Text>}
        </View>
        <Pressable onPress={handleToggle} style={styles.toggleContainer}>
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
    padding: 16,
    marginBottom: 16,
    borderWidth: 0.288,
    borderColor: "#FFFFFF",
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontFamily: "MontserratAlternates_500Medium",
    color: "#EDEBFF",
    lineHeight: 19,
    letterSpacing: 0.432,
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    fontFamily: "Montserrat_600SemiBold",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    fontFamily: "Montserrat_400Regular",
    color: "rgba(255, 255, 255, 0.7)",
  },
  toggleContainer: {
    marginLeft: 12,
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

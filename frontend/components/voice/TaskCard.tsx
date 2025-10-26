import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

interface SubTask {
  id: string;
  name: string;
  completed: boolean;
}

interface TaskCardProps {
  title: string;
  date?: string;
  subtasks?: SubTask[];
  colorIndex?: number;
  enabled?: boolean;
  onToggle?: (enabled: boolean) => void;
}

// Predefined color palettes for task cards
const TASK_COLORS = {
  background: ["#5F7E63"],
};

export const TaskCard: React.FC<TaskCardProps> = ({
  title,
  date,
  subtasks = [],
  colorIndex = 0,
  enabled = true,
  onToggle,
}) => {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const togglePosition = useSharedValue(enabled ? 1 : 0);

  const backgroundColor =
    TASK_COLORS.background[colorIndex % TASK_COLORS.background.length];

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
          {date && <Text style={styles.date}>{date}</Text>}
        </View>
        <Pressable onPress={handleToggle} style={styles.toggleContainer}>
          <Animated.View style={[styles.toggle, animatedToggleStyle]}>
            <Animated.View style={[styles.toggleKnob, animatedKnobStyle]} />
          </Animated.View>
        </Pressable>
      </View>

      {subtasks.length > 0 && (
        <View style={styles.subtasksContainer}>
          {subtasks.map((subtask, index) => (
            <View key={subtask.id} style={styles.subtaskRow}>
              <View style={styles.subtaskCheck}>
                {subtask.completed && <View style={styles.subtaskCheckmark} />}
              </View>
              <Text
                style={[
                  styles.subtaskName,
                  subtask.completed && styles.subtaskNameCompleted,
                ]}
              >
                {subtask.name}
              </Text>
            </View>
          ))}
        </View>
      )}
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
  subtasksContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 0.288,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  subtaskRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  subtaskCheck: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.5)",
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  subtaskCheckmark: {
    width: 8,
    height: 4,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: "#FFFFFF",
    transform: [{ rotate: "-45deg" }],
  },
  subtaskName: {
    fontSize: 12,
    fontFamily: "Montserrat_400Regular",
    color: "#FFFFFF",
    flex: 1,
  },
  subtaskNameCompleted: {
    opacity: 0.5,
    textDecorationLine: "line-through",
  },
});

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
  completed?: boolean;
  onToggle?: (enabled: boolean) => void;
  onComplete?: () => void;
  status?: "pending" | "confirmed";
  onAccept?: () => void;
  onReject?: () => void;
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
  completed = false,
  onToggle,
  onComplete,
  status = "confirmed",
  onAccept,
  onReject,
}) => {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [isCompleted, setIsCompleted] = useState(completed);
  const togglePosition = useSharedValue(enabled ? 1 : 0);
  const checkScale = useSharedValue(completed ? 1 : 0);

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

  const animatedCheckStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: checkScale.value }],
      opacity: checkScale.value,
    };
  });

  const handleComplete = () => {
    if (isCompleted) return; // Already completed

    setIsCompleted(true);
    checkScale.value = withSpring(1, {
      damping: 10,
      stiffness: 200,
    });
    onComplete?.();
  };

  return (
    <View
      style={[styles.card, { backgroundColor, opacity: isCompleted ? 0.6 : 1 }]}
    >
      <View style={styles.content}>
        <Pressable onPress={handleComplete} style={styles.checkButton}>
          <View style={styles.checkCircle}>
            <Animated.View style={[styles.checkmark, animatedCheckStyle]}>
              <Text style={styles.checkmarkText}>✓</Text>
            </Animated.View>
          </View>
        </Pressable>
        <View style={styles.textContainer}>
          <Text style={[styles.title, isCompleted && styles.completedText]}>
            {title}
          </Text>
          {date && (
            <Text style={[styles.date, isCompleted && styles.completedText]}>
              {date}
            </Text>
          )}
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

      {status === "pending" && (
        <View style={styles.confirmationContainer}>
          <Pressable
            style={[styles.confirmationButton, styles.acceptButton]}
            onPress={onAccept}
          >
            <Text style={styles.confirmationButtonText}>Accept</Text>
          </Pressable>
          <Pressable
            style={[styles.confirmationButton, styles.rejectButton]}
            onPress={onReject}
          >
            <Text style={styles.confirmationButtonText}>Reject</Text>
          </Pressable>
        </View>
      )}
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
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  checkButton: {
    marginRight: 10,
    padding: 2,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  checkmark: {
    position: "absolute",
  },
  checkmarkText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
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
  date: {
    fontSize: 12,
    fontFamily: "Montserrat_400Regular",
    color: "rgba(255, 255, 255, 0.7)",
  },
  completedText: {
    textDecorationLine: "line-through",
    opacity: 0.7,
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
  confirmationContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 0.288,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  confirmationButton: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginLeft: 8,
  },
  acceptButton: {
    backgroundColor: "#FFFFFF40",
  },
  rejectButton: {
    backgroundColor: "#00000040",
  },
  confirmationButtonText: {
    color: "#FFFFFF",
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 12,
  },
});

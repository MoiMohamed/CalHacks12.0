import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  FadeOut,
  SlideOutRight,
  runOnJS,
} from "react-native-reanimated";

interface RoutineTask {
  id: string;
  emoji: string;
  name: string;
  day?: string;
  completed: boolean;
}

interface RoutineCardProps {
  title: string;
  tasks: RoutineTask[];
  colorIndex?: number;
  enabled?: boolean;
  onToggleRoutine?: (enabled: boolean) => void;
  onTaskToggle?: (taskId: string) => void;
  onTaskRemoved?: (taskId: string) => void;
}

// Predefined color palettes for routine cards
const ROUTINE_COLORS = {
  background: ["#553160"],
  taskCircles: ["#F5E8FF", "#FFE8F0", "#E8F0FF", "#FFF0E8"],
};

// Animated Task Row Component
const AnimatedTaskRow: React.FC<{
  task: RoutineTask;
  colorIndex: number;
  taskIndex: number;
  onTaskToggle: () => void;
  onRemoveComplete: () => void;
}> = ({ task, colorIndex, taskIndex, onTaskToggle, onRemoveComplete }) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const scale = useSharedValue(1);
  const checkScale = useSharedValue(task.completed ? 1 : 0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    checkScale.value = withSpring(task.completed ? 1 : 0, {
      damping: 12,
      stiffness: 150,
    });
  }, [task.completed]);

  const handleToggle = () => {
    // Haptic feedback animation
    scale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );

    onTaskToggle();

    // If completing task, trigger removal animation after delay
    if (!task.completed) {
      setTimeout(() => {
        setIsRemoving(true);
      }, 600);
    }
  };

  const animatedRowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const animatedCheckStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  if (isRemoving) {
    return (
      <Animated.View
        exiting={SlideOutRight.duration(400).withCallback(() => {
          runOnJS(onRemoveComplete)();
        })}
      >
        <Animated.View style={[styles.taskRow, animatedRowStyle]}>
          <View
            style={[
              styles.emojiCircle,
              {
                backgroundColor:
                  ROUTINE_COLORS.taskCircles[
                    taskIndex % ROUTINE_COLORS.taskCircles.length
                  ],
              },
            ]}
          >
            <Text style={styles.emoji}>{task.emoji}</Text>
          </View>
          <Text
            style={[
              styles.taskName,
              task.completed && styles.taskNameCompleted,
            ]}
          >
            {task.name}
          </Text>
          {task.day && <Text style={styles.day}>{task.day}</Text>}
          <TouchableOpacity
            onPress={handleToggle}
            style={styles.taskToggleContainer}
          >
            <View
              style={[
                styles.taskToggle,
                task.completed && styles.taskToggleActive,
              ]}
            >
              <Animated.View
                style={[styles.taskToggleKnob, animatedCheckStyle]}
              />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.taskRow, animatedRowStyle]}>
      <View
        style={[
          styles.emojiCircle,
          {
            backgroundColor:
              ROUTINE_COLORS.taskCircles[
                taskIndex % ROUTINE_COLORS.taskCircles.length
              ],
          },
        ]}
      >
        <Text style={styles.emoji}>{task.emoji}</Text>
      </View>
      <Text
        style={[styles.taskName, task.completed && styles.taskNameCompleted]}
      >
        {task.name}
      </Text>
      {task.day && <Text style={styles.day}>{task.day}</Text>}
      <TouchableOpacity
        onPress={handleToggle}
        style={styles.taskToggleContainer}
      >
        <View
          style={[styles.taskToggle, task.completed && styles.taskToggleActive]}
        >
          <Animated.View style={[styles.taskToggleKnob, animatedCheckStyle]} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const RoutineCard: React.FC<RoutineCardProps> = ({
  title,
  tasks,
  colorIndex = 0,
  enabled = true,
  onToggleRoutine,
  onTaskToggle,
  onTaskRemoved,
}) => {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [visibleTasks, setVisibleTasks] = useState(tasks);
  const togglePosition = useSharedValue(enabled ? 1 : 0);

  useEffect(() => {
    setVisibleTasks(tasks);
  }, [tasks]);

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

  const handleTaskToggle = (taskId: string) => {
    onTaskToggle?.(taskId);
  };

  const handleTaskRemoved = (taskId: string) => {
    setVisibleTasks((prev) => prev.filter((t) => t.id !== taskId));
    onTaskRemoved?.(taskId);
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
          translateX: togglePosition.value * 14.392, // 34.54 - 16.148 - 4 = 14.392
        },
      ],
    };
  });

  return (
    <View style={[styles.card, { backgroundColor }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Pressable onPress={handleToggleRoutine} style={styles.toggleContainer}>
          <Animated.View style={[styles.toggle, animatedToggleStyle]}>
            <Animated.View style={[styles.toggleKnob, animatedKnobStyle]} />
          </Animated.View>
        </Pressable>
      </View>

      {visibleTasks.map((task, index) => (
        <AnimatedTaskRow
          key={task.id}
          task={task}
          colorIndex={colorIndex}
          taskIndex={index}
          onTaskToggle={() => handleTaskToggle(task.id)}
          onRemoveComplete={() => handleTaskRemoved(task.id)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 324,
    borderRadius: 11.5,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    marginBottom: 16,
    borderWidth: 0.288,
    borderColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 11.84,
  },
  title: {
    fontSize: 14,
    fontFamily: "MontserratAlternates_500Medium",
    color: "#EDEBFF",
    lineHeight: 19,
    letterSpacing: 0.432,
    flex: 1,
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
  toggleActive: {
    backgroundColor: "#F1DAF6",
    alignItems: "flex-end",
  },
  toggleKnob: {
    width: 16.148,
    height: 16.148,
    borderRadius: 8.074,
    backgroundColor: "#5E3967",
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7.04,
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
  taskName: {
    fontSize: 10,
    fontFamily: "Montserrat_500Medium",
    color: "#FFFFFF",
    flex: 1,
  },
  taskNameCompleted: {
    opacity: 0.6,
    textDecorationLine: "line-through",
  },
  day: {
    fontSize: 10,
    fontFamily: "Montserrat_500Medium",
    color: "rgba(255, 255, 255, 0.90)",
    textAlign: "right",
    marginRight: 9.92,
  },
  taskToggleContainer: {
    marginLeft: 0,
  },
  taskToggle: {
    width: 18.24,
    height: 18.24,
    borderRadius: 9.12,
    borderWidth: 1.824,
    borderColor: "#E7E3FF",
    justifyContent: "center",
    alignItems: "center",
  },
  taskToggleActive: {
    borderColor: "#E7E3FF",
  },
  taskToggleKnob: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E7E3FF",
  },
});

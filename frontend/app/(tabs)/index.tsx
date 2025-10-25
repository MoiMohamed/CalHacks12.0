import { Image } from "expo-image";
import {
  Platform,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  FlatList,
} from "react-native";

import { HelloWave } from "@/components/hello-wave";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Link } from "expo-router";
import { heathApi } from "@/services/api";
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from "@/hooks/useTasks";
import type { Task } from "@/types/api";

export default function HomeScreen() {
  // Tasks hooks
  const { data: tasks, isLoading, error } = useTasks();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  const handleHealthCheck = async () => {
    try {
      const result = await heathApi.getHealth();
      Alert.alert("Health Check Success", JSON.stringify(result, null, 2));
    } catch (error) {
      Alert.alert(
        "Health Check Failed",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  };

  const handleCreateTask = async () => {
    try {
      await createTaskMutation.mutateAsync({
        title: "New Task",
        description: "This is a test task created from the app",
        completed: false,
      });
      Alert.alert("Success", "Task created successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to create task");
    }
  };

  const handleToggleTask = async (task: Task) => {
    try {
      await updateTaskMutation.mutateAsync({
        id: task.id,
        data: { completed: !task.completed },
      });
    } catch (error) {
      Alert.alert("Error", "Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTaskMutation.mutateAsync(taskId);
      Alert.alert("Success", "Task deleted successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to delete task");
    }
  };

  const renderTask = ({ item: task }: { item: Task }) => (
    <View className="bg-gray-100 p-3 rounded-lg mb-2 flex-row items-center justify-between">
      <View className="flex-1">
        <Text
          className={`font-semibold text-lg ${task.completed ? "line-through text-gray-500" : "text-gray-800"}`}
        >
          {task.title}
        </Text>
        <Text className="text-gray-600 text-sm">{task.description}</Text>
        <Text className="text-xs text-gray-400 mt-1">
          Created: {new Date(task.created_at).toLocaleDateString()}
        </Text>
      </View>
      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={() => handleToggleTask(task)}
          className={`px-3 py-1 rounded ${task.completed ? "bg-green-500" : "bg-yellow-500"}`}
        >
          <Text className="text-white text-xs font-semibold">
            {task.completed ? "Done" : "Pending"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteTask(task.id)}
          className="bg-red-500 px-3 py-1 rounded"
        >
          <Text className="text-white text-xs font-semibold">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Hii{" "}
          <Text className="font-bold text-red-500 text-lg">
            app/(tabs)/index.tsx
          </Text>{" "}
          to see changes. Press{" "}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: "cmd + d",
              android: "cmd + m",
              web: "F12",
            })}
          </ThemedText>{" "}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Link href="/modal">
          <Link.Trigger>
            <ThemedText type="subtitle">Step 2: Explore</ThemedText>
          </Link.Trigger>
          <Link.Preview />
          <Link.Menu>
            <Link.MenuAction
              title="Action"
              icon="cube"
              onPress={() => alert("Action pressed")}
            />
            <Link.MenuAction
              title="Share"
              icon="square.and.arrow.up"
              onPress={() => alert("Share pressed")}
            />
            <Link.Menu title="More" icon="ellipsis">
              <Link.MenuAction
                title="Delete"
                icon="trash"
                destructive
                onPress={() => alert("Delete pressed")}
              />
            </Link.Menu>
          </Link.Menu>
        </Link>

        <ThemedText>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          {`When you're ready, run `}
          <ThemedText type="defaultSemiBold">
            npm run reset-project
          </ThemedText>{" "}
          to get a fresh <ThemedText type="defaultSemiBold">app</ThemedText>{" "}
          directory. This will move the current{" "}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{" "}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>

      {/* NativeWind Test Section */}
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">🎨 NativeWind Test</ThemedText>
        <View className="bg-blue-100 p-4 rounded-lg mb-2">
          <Text className="text-blue-800 font-semibold text-lg">
            Blue Background Test
          </Text>
          <Text className="text-gray-600 mt-1 text-base">
            This should have a light blue background
          </Text>
        </View>

        <View className="bg-green-200 p-3 rounded-md mb-2">
          <Text className="text-green-800 font-bold text-lg">
            Green Background Test
          </Text>
          <Text className="text-green-600 text-base">
            This should have a light green background
          </Text>
        </View>

        <View className="bg-purple-300 p-2 rounded-full mb-2">
          <Text className="text-purple-900 text-center font-bold text-lg">
            Purple Rounded Test
          </Text>
        </View>

        <Text className="text-red-500 font-bold text-xl mt-2">
          If you see colored backgrounds and styled text, NativeWind is working!
          🎉
        </Text>
      </ThemedView>

      {/* API Test Section */}
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">🔗 API Test</ThemedText>
        <TouchableOpacity
          onPress={handleHealthCheck}
          className="bg-blue-500 px-6 py-3 rounded-lg mb-2"
        >
          <Text className="text-white font-semibold text-center text-lg">
            Test Health API
          </Text>
        </TouchableOpacity>
        <ThemedText>
          Tap the button above to test the backend health check endpoint.
        </ThemedText>
      </ThemedView>

      {/* Tasks Test Section */}
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">📝 Tasks Management</ThemedText>

        <TouchableOpacity
          onPress={handleCreateTask}
          className="bg-green-500 px-6 py-3 rounded-lg mb-4"
          disabled={createTaskMutation.isPending}
        >
          <Text className="text-white font-semibold text-center text-lg">
            {createTaskMutation.isPending ? "Creating..." : "Create New Task"}
          </Text>
        </TouchableOpacity>

        {isLoading && (
          <Text className="text-center text-gray-500 py-4">
            Loading tasks...
          </Text>
        )}

        {error && (
          <Text className="text-center text-red-500 py-4">
            Error loading tasks: {error.message}
          </Text>
        )}

        {tasks && tasks.length > 0 ? (
          <FlatList
            data={tasks}
            renderItem={renderTask}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          !isLoading && (
            <Text className="text-center text-gray-500 py-4">
              No tasks yet. Create your first task!
            </Text>
          )
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});

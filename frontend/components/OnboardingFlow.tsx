// frontend/components/OnboardingFlow.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";
import { useCreateUser, useUpdateUser } from "@/hooks/useUsers";
import { useCreateCategory } from "@/hooks/useCategories";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
}

export const OnboardingFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    categories: [] as string[],
    pace: "",
    workTime: "",
  });

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const createCategory = useCreateCategory();

  const handleCompleteOnboarding = async () => {
    try {
      // Generate a simple user ID
      const userId = `user-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Create user
      const user = await createUser.mutateAsync({
        id: userId,
        name: formData.name,
        email: `${formData.name.toLowerCase()}@example.com`, // Temporary email
      });

      // Create categories
      for (const categoryName of formData.categories) {
        await createCategory.mutateAsync({
          name: categoryName,
          user_id: user.id,
        });
      }

      // Update user profile
      await updateUser.mutateAsync({
        id: user.id,
        data: {
          pace: formData.pace,
          preferred_work_time: formData.workTime,
        },
      });

      Alert.alert(
        "Welcome to Neuri!",
        "Your setup is complete. Let's start organizing your tasks!"
      );
    } catch (error) {
      console.error("Onboarding error:", error);
      Alert.alert("Setup Error", "Something went wrong. Please try again.");
    }
  };

  const steps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Welcome to Neuri! 🎉",
      description: "Your ADHD-friendly task companion",
      component: (
        <View style={styles.stepContainer}>
          <Text style={styles.stepDescription}>
            I&apos;m here to help you stay organized and focused. Let&apos;s get
            you set up in just a few quick steps!
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setCurrentStep(1)}
          >
            <Text style={styles.buttonText}>Let&apos;s Get Started!</Text>
          </TouchableOpacity>
        </View>
      ),
    },
    {
      id: "name",
      title: "What should I call you? 👋",
      description: "Just your first name is perfect",
      component: (
        <View style={styles.stepContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Enter your name"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            autoFocus
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setCurrentStep(0)}
            >
              <Text style={styles.secondaryButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                !formData.name && styles.disabledButton,
              ]}
              onPress={() => formData.name && setCurrentStep(2)}
              disabled={!formData.name}
            >
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      ),
    },
    {
      id: "categories",
      title: "Organize Your Life 📂",
      description: "What categories help you stay organized?",
      component: (
        <View style={styles.stepContainer}>
          <Text style={styles.stepDescription}>
            Think about how you naturally organize your tasks. Common ones are:
          </Text>
          <View style={styles.categorySuggestions}>
            {["Work", "Study", "Personal", "Health", "Finance"].map(
              (category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    formData.categories.includes(category) &&
                      styles.selectedChip,
                  ]}
                  onPress={() => {
                    const newCategories = formData.categories.includes(category)
                      ? formData.categories.filter((c) => c !== category)
                      : [...formData.categories, category];
                    setFormData({ ...formData, categories: newCategories });
                  }}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      formData.categories.includes(category) &&
                        styles.selectedChipText,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>

          <TextInput
            style={styles.textInput}
            placeholder="Or add your own category..."
            onSubmitEditing={(e) => {
              const newCategory = e.nativeEvent.text.trim();
              if (newCategory && !formData.categories.includes(newCategory)) {
                setFormData({
                  ...formData,
                  categories: [...formData.categories, newCategory],
                });
              }
            }}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setCurrentStep(1)}
            >
              <Text style={styles.secondaryButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                formData.categories.length === 0 && styles.disabledButton,
              ]}
              onPress={() =>
                formData.categories.length > 0 && setCurrentStep(3)
              }
              disabled={formData.categories.length === 0}
            >
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      ),
    },
    {
      id: "preferences",
      title: "Your Preferences ⚙️",
      description: "Help me personalize your experience",
      component: (
        <View style={styles.stepContainer}>
          <Text style={styles.stepDescription}>How do you like to work?</Text>

          <View style={styles.preferenceSection}>
            <Text style={styles.preferenceLabel}>Pace:</Text>
            <View style={styles.preferenceOptions}>
              {["relaxed", "focused"].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.preferenceButton,
                    formData.pace === option && styles.selectedPreference,
                  ]}
                  onPress={() => setFormData({ ...formData, pace: option })}
                >
                  <Text
                    style={[
                      styles.preferenceButtonText,
                      formData.pace === option && styles.selectedPreferenceText,
                    ]}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.preferenceSection}>
            <Text style={styles.preferenceLabel}>Best work time:</Text>
            <View style={styles.preferenceOptions}>
              {["morning", "evening", "flexible"].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.preferenceButton,
                    formData.workTime === option && styles.selectedPreference,
                  ]}
                  onPress={() => setFormData({ ...formData, workTime: option })}
                >
                  <Text
                    style={[
                      styles.preferenceButtonText,
                      formData.workTime === option &&
                        styles.selectedPreferenceText,
                    ]}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setCurrentStep(2)}
            >
              <Text style={styles.secondaryButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                (!formData.pace || !formData.workTime) && styles.disabledButton,
              ]}
              onPress={handleCompleteOnboarding}
              disabled={!formData.pace || !formData.workTime}
            >
              <Text style={styles.buttonText}>Complete Setup!</Text>
            </TouchableOpacity>
          </View>
        </View>
      ),
    },
  ];

  const currentStepData = steps[currentStep];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{currentStepData.title}</Text>
        <Text style={styles.description}>{currentStepData.description}</Text>

        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index <= currentStep && styles.progressDotActive,
              ]}
            />
          ))}
        </View>
      </View>

      {currentStepData.component}

      {/* Voice option */}
      <TouchableOpacity style={styles.voiceOption}>
        <Text style={styles.voiceOptionText}>🎤 Prefer voice setup?</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  header: {
    marginBottom: 30,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  progressContainer: {
    flexDirection: "row",
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ddd",
  },
  progressDotActive: {
    backgroundColor: "#4CAF50",
  },
  stepContainer: {
    flex: 1,
    justifyContent: "center",
  },
  stepDescription: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: "white",
    marginBottom: 20,
  },
  categorySuggestions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#e3f2fd",
    borderWidth: 1,
    borderColor: "#1976d2",
  },
  selectedChip: {
    backgroundColor: "#1976d2",
  },
  categoryChipText: {
    color: "#1976d2",
    fontWeight: "500",
  },
  selectedChipText: {
    color: "white",
  },
  preferenceSection: {
    marginBottom: 24,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  preferenceOptions: {
    flexDirection: "row",
    gap: 12,
  },
  preferenceButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  selectedPreference: {
    backgroundColor: "#4CAF50",
  },
  preferenceButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  selectedPreferenceText: {
    color: "white",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "transparent",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  voiceOption: {
    alignItems: "center",
    paddingVertical: 16,
    marginTop: 20,
  },
  voiceOptionText: {
    color: "#1976d2",
    fontSize: 14,
    fontWeight: "500",
  },
});

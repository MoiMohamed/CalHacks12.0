import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";
import { RoutineCard } from "@/components/voice/RoutineCard";
import { NoteCard } from "@/components/voice/NoteCard";
import { TaskCard } from "@/components/voice/TaskCard";
import { ReminderCard } from "@/components/voice/ReminderCard";
import { VoiceInterface } from "@/components/voice/VoiceInterface";
import { CelebrationConfetti } from "@/components/voice/CelebrationConfetti";
import { VAPI_CREDENTIALS } from "@/config/vapi-credentials";
import Vapi from "@vapi-ai/web";

const { height } = Dimensions.get("window");

export default function VoiceScreen() {
  const router = useRouter();
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [toolResponses, setToolResponses] = useState<any[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [audioData, setAudioData] = useState<number[]>([]);

  const vapiRef = React.useRef<any>(null);
  const taskIdCounter = React.useRef(1000);
  const processedMessageIds = React.useRef(new Set<string>());
  const processedMissions = React.useRef(new Set<string>());
  const processedRoutines = React.useRef(new Set<string>());
  const callStartedAtRef = React.useRef<number | null>(null);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const analyserRef = React.useRef<AnalyserNode | null>(null);
  const animationFrameRef = React.useRef<number | null>(null);
  const isAssistantSpeakingRef = React.useRef(false);
  const isUserSpeakingRef = React.useRef(false);

  const handleMissionCreation = React.useCallback((missionData: any) => {
    if (!missionData || !missionData.title) {
      console.warn("Invalid mission data:", missionData);
      return;
    }

    const normalize = (s: string | undefined) => (s || "").trim().toLowerCase();
    const normalizedTitle = normalize(missionData.title);
    const normalizedType = normalize(missionData.type || "task");
    const deadline =
      missionData.personal_deadline || missionData.true_deadline || "";
    const normalizedDeadline = normalize((deadline as string).slice(0, 10));
    const bodySnippet = normalize((missionData.body as string) || "").slice(
      0,
      50
    );
    const missionKey = `${normalizedType}|${normalizedTitle}|${normalizedDeadline}|${bodySnippet}`;
    if (processedMissions.current.has(missionKey)) {
      console.log(
        "⚠️ Duplicate mission detected, skipping:",
        missionData.title
      );
      return;
    }
    processedMissions.current.add(missionKey);

    const formatDate = (dateStr: string) => {
      if (!dateStr) return "No deadline";
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
    };

    const missionType = missionData.type || "task";

    if (missionType === "note") {
      const newNote = {
        id: `note-${taskIdCounter.current++}`,
        title: missionData.title,
        body: missionData.body
          ? missionData.body.split("\n").filter((line: string) => line.trim())
          : [],
      };
      setNotes((prevNotes) => [newNote, ...prevNotes]);
    } else if (missionType === "reminder") {
      const deadline =
        missionData.personal_deadline || missionData.true_deadline;
      const reminderDate = deadline ? new Date(deadline) : new Date();

      const newReminder = {
        id: `reminder-${taskIdCounter.current++}`,
        title: missionData.title,
        time: reminderDate.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        date: reminderDate.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        }),
        enabled: true,
      };
      setReminders((prevReminders) => [newReminder, ...prevReminders]);
    } else {
      const deadline =
        missionData.personal_deadline || missionData.true_deadline;
      const formattedDate = deadline ? formatDate(deadline) : "No deadline";

      const newTask = {
        id: `task-${taskIdCounter.current++}`,
        title: missionData.title,
        date: formattedDate,
        enabled: true,
        subtasks: [],
      };
      setTasks((prevTasks) => [newTask, ...prevTasks]);
    }
  }, []);

  const handleRoutineCreation = React.useCallback((routineData: any) => {
    if (!routineData || !routineData.title) {
      console.warn("Invalid routine data:", routineData);
      return;
    }

    const routineKey = `routine-${routineData.title}-${
      routineData.created_at || Date.now()
    }`;
    if (processedMissions.current.has(routineKey)) {
      console.log(
        "⚠️ Duplicate routine detected, skipping:",
        routineData.title
      );
      return;
    }
    processedMissions.current.add(routineKey);

    let frequency = "Custom schedule";
    let time = "";
    if (routineData.schedule) {
      try {
        const scheduleData =
          typeof routineData.schedule === "string"
            ? JSON.parse(routineData.schedule)
            : routineData.schedule;
        if (Array.isArray(scheduleData) && scheduleData.length > 0) {
          const days = scheduleData.map((s: any) => s.day).join(", ");
          frequency = days || "Custom schedule";
          // Extract time from the first schedule entry
          if (scheduleData[0]?.time) {
            time = scheduleData[0].time;
          }
        }
      } catch (e) {
        console.error("Error parsing schedule:", e);
      }
    }

    const newRoutine = {
      id: `routine-${taskIdCounter.current++}`,
      emoji: "⚡",
      title: routineData.title,
      frequency,
      time,
      enabled: true,
    };
    setRoutines((prevRoutines) => [newRoutine, ...prevRoutines]);
  }, []);

  // Setup audio analysis for real-time visualization
  React.useEffect(() => {
    const setupAudioAnalysis = async () => {
      try {
        // Check if we're in a web environment with Web Audio API
        if (typeof window === "undefined" || !window.AudioContext) {
          return;
        }

        // Initialize audio context
        const audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;

        // Create analyser node
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 512; // Gives us 256 frequency bins (more detail)
        analyser.smoothingTimeConstant = 0.7; // Smooth out audio transitions
        analyserRef.current = analyser;

        // Capture microphone input for visualization
        // Note: This will show the user's voice. The agent's audio is harder to capture
        // without complex audio routing, but the visualization will still be active
        // based on the conversation state (isAssistantSpeaking, isUserSpeaking)
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
              },
            });
            const micSource = audioContext.createMediaStreamSource(stream);
            micSource.connect(analyser);
            console.log("✅ Audio visualization connected to microphone");
          } catch (err) {
            console.log("⚠️ Microphone access not available:", err);
          }
        }

        // Start analyzing audio
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        let assistantAudioPhase = 0;

        const updateAudioData = () => {
          if (!analyserRef.current) return;

          analyserRef.current.getByteFrequencyData(dataArray);

          // If assistant is speaking, generate synthetic audio visualization
          // This provides visual feedback even though we can't capture speaker output
          let processedData = Array.from(dataArray);

          if (isAssistantSpeakingRef.current) {
            // Generate natural-looking wave pattern for assistant speech
            assistantAudioPhase += 0.08;
            processedData = processedData.map((value, index) => {
              // Create a wave pattern that simulates speech frequencies
              const frequency = index / bufferLength;
              const speechFreq =
                Math.sin(assistantAudioPhase + frequency * 15) * 40 +
                Math.sin(assistantAudioPhase * 1.5 + frequency * 8) * 60 +
                Math.sin(assistantAudioPhase * 0.7 + frequency * 25) * 30;

              // Blend with any actual audio (like user's voice being picked up)
              const synthetic = Math.abs(speechFreq) + 30;
              return Math.max(value, synthetic);
            });
          } else {
            assistantAudioPhase = 0;
            // Apply post-processing to user's microphone input
            processedData = processedData.map((value, index) => {
              // Boost lower frequencies slightly for better visualization
              const boost = index < bufferLength / 4 ? 1.3 : 1.0;
              return Math.min(value * boost, 255);
            });
          }

          setAudioData(processedData);
          animationFrameRef.current = requestAnimationFrame(updateAudioData);
        };

        updateAudioData();
      } catch (err) {
        console.error("Error setting up audio analysis:", err);
      }
    };

    setupAudioAnalysis();

    return () => {
      // Cleanup
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Initialize VAPI (Web SDK) and route tool outputs into UI
  React.useEffect(() => {
    if (vapiRef.current) return;

    const vapi = new Vapi(VAPI_CREDENTIALS.PUBLIC_KEY);
    vapiRef.current = vapi;

    const handleCallStart = () => {
      setIsConnecting(false);
      setIsConnected(true);
    };
    const handleCallEnd = () => {
      setIsConnected(false);
      setIsConnecting(false);
      setIsPaused(false);
      setIsMuted(false);
    };
    const userSpeakingTimeoutRef: { current: any } = { current: null };
    const handleMessage = (message: any) => {
      const messageId =
        message?.messageId ||
        message?.id ||
        `${message?.type}-${Date.now()}-${Math.random()}`;

      // Persist recent tool responses for debugging
      if (
        message?.type === "tool-calls-result" ||
        message?.type === "tool-call-result" ||
        message?.toolCallResult ||
        message?.result?.data
      ) {
        setToolResponses((prev) => [
          {
            timestamp: new Date().toLocaleTimeString(),
            type: message.type,
            data: message,
          },
          ...prev.slice(0, 9),
        ]);
      }

      if (message?.type === "transcript") {
        if (message.role === "user") {
          setIsUserSpeaking(true);
          isUserSpeakingRef.current = true;
          if (userSpeakingTimeoutRef.current)
            clearTimeout(userSpeakingTimeoutRef.current);
          userSpeakingTimeoutRef.current = setTimeout(() => {
            setIsUserSpeaking(false);
            isUserSpeakingRef.current = false;
          }, 1200);
        }
      }

      // Extract missions/routines from any message shape
      const extractDataFromMessage = (
        obj: any
      ): { missions: any[]; routines: any[] } => {
        const missions: any[] = [];
        const routines: any[] = [];
        const visit = (o: any) => {
          if (!o || typeof o !== "object") return;
          if (
            o?.title &&
            o?.type &&
            ["task", "project", "note", "reminder"].includes(o.type)
          ) {
            missions.push(o);
          }
          if (o?.title && (o?.schedule || o?.frequency)) {
            routines.push(o);
          }
          for (const k in o) {
            if (o[k] && typeof o[k] === "object") visit(o[k]);
          }
        };
        visit(obj);
        return { missions, routines };
      };

      if (!message?.type?.includes("transcript")) {
        const { missions, routines } = extractDataFromMessage(message);
        if (
          (missions.length > 0 || routines.length > 0) &&
          !processedMessageIds.current.has(messageId)
        ) {
          processedMessageIds.current.add(messageId);
          missions.forEach((m) => handleMissionCreation(m));
          routines.forEach((r) => handleRoutineCreation(r));
        }
      }
    };
    const handleError = (error: any) => {
      console.error("VAPI error:", error);
    };
    const handleSpeechStart = () => {
      setIsAssistantSpeaking(true);
      isAssistantSpeakingRef.current = true;
    };
    const handleSpeechEnd = () => {
      setIsAssistantSpeaking(false);
      isAssistantSpeakingRef.current = false;
    };

    vapi.on("call-start", handleCallStart);
    vapi.on("call-end", handleCallEnd);
    vapi.on("message", handleMessage);
    vapi.on("error", handleError);
    vapi.on("speech-start", handleSpeechStart);
    vapi.on("speech-end", handleSpeechEnd);

    // Auto-start on web, with a user-interaction fallback if autoplay is blocked
    const assistantId = getAssistantId();
    if (assistantId) {
      setIsConnecting(true);
      const tryStart = () => vapi.start(assistantId);
      tryStart().catch((err: any) => {
        console.warn("Auto-start blocked, waiting for user interaction", err);
        setIsConnecting(false);
        const resume = () => {
          setIsConnecting(true);
          tryStart().catch((e: any) => {
            console.error("Start after interaction failed", e);
            setIsConnecting(false);
          });
          window.removeEventListener("click", resume);
          window.removeEventListener("touchstart", resume);
        };
        window.addEventListener("click", resume, { once: true } as any);
        window.addEventListener("touchstart", resume, { once: true } as any);
      });
    } else {
      console.warn("No VAPI assistant ID configured for auto-start");
    }

    return () => {
      try {
        vapi.off("call-start", handleCallStart);
        vapi.off("call-end", handleCallEnd);
        vapi.off("message", handleMessage);
        vapi.off("error", handleError);
        vapi.off("speech-start", handleSpeechStart);
        vapi.off("speech-end", handleSpeechEnd);
        vapi.stop?.();
      } catch {}
      vapiRef.current = null;
    };
  }, [handleMissionCreation, handleRoutineCreation]);

  // Clear UI when navigating away from the voice screen
  useFocusEffect(
    React.useCallback(() => {
      // Cleanup when screen loses focus
      return () => {
        console.log("Voice screen losing focus - clearing UI");
        setTasks([]);
        setRoutines([]);
        setNotes([]);
        setReminders([]);
        setToolResponses([]);
        processedMessageIds.current.clear();
        processedMissions.current.clear();
        processedRoutines.current.clear();
      };
    }, [])
  );

  const getAssistantId = () =>
    VAPI_CREDENTIALS.MAIN_ASSISTANT_ID || VAPI_CREDENTIALS.ASSISTANT_ID;

  const handleStartCall = async () => {
    if (!vapiRef.current) return;
    const assistantId = getAssistantId();
    if (!assistantId) {
      console.warn("No VAPI assistant ID configured");
      return;
    }
    try {
      setIsConnecting(true);
      await vapiRef.current.start(assistantId);
    } catch (e) {
      console.error("Failed to start call", e);
      setIsConnecting(false);
    }
  };

  const handleStopCall = () => {
    try {
      vapiRef.current?.stop?.();
    } catch (e) {
      console.error("Failed to stop call", e);
    }
  };

  const handleToggleMute = () => {
    try {
      vapiRef.current?.setMuted?.(!isMuted);
      setIsMuted((m) => !m);
    } catch (e) {
      console.error("Failed to toggle mute", e);
    }
  };

  const handleTogglePause = () => {
    try {
      vapiRef.current?.setPaused?.(!isPaused);
      setIsPaused((p) => !p);
    } catch (e) {
      console.error("Failed to toggle pause", e);
    }
  };

  // Calculate spacer height to match VoiceInterface height
  const interfaceHeight = Math.min(Math.max(height * 0.35, 260), 300);

  // Dynamic lists populated from Vapi tool outputs
  const [routines, setRoutines] = useState<
    {
      id: string;
      emoji: string;
      title: string;
      frequency: string;
      time?: string;
      enabled: boolean;
    }[]
  >([]);
  const [notes, setNotes] = useState<
    { id: string; title: string; body: string[] }[]
  >([]);
  const [tasks, setTasks] = useState<
    {
      id: string;
      title: string;
      date: string;
      enabled: boolean;
      completed?: boolean;
      subtasks?: { id: string; name: string; completed: boolean }[];
    }[]
  >([]);
  const [reminders, setReminders] = useState<
    {
      id: string;
      title: string;
      time: string;
      date: string;
      enabled: boolean;
    }[]
  >([]);

  // Handler for toggling entire routine on/off
  const handleToggleRoutine = (routineId: string, enabled: boolean) => {
    setRoutines((prev) =>
      prev.map((routine) =>
        routine.id === routineId ? { ...routine, enabled } : routine
      )
    );
    console.log(`Routine ${routineId} ${enabled ? "enabled" : "disabled"}`);
  };

  // Handler for task completion with celebration
  const handleTaskComplete = async (taskId: string) => {
    console.log(`Task ${taskId} completed! 🎉`);

    // Show confetti celebration
    setShowCelebration(true);

    // Haptic feedback (vibration) on mobile
    if (Platform.OS !== "web") {
      try {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
      } catch (error) {
        console.log("Could not trigger haptics:", error);
      }
    }

    // Mark task as completed
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: true } : task
      )
    );
  };

  // Limit displayed items to prevent UI overflow (show most recent 10 of each type)
  const MAX_ITEMS_DISPLAYED = 10;
  const displayedTasks = tasks.slice(0, MAX_ITEMS_DISPLAYED);
  const displayedRoutines = routines.slice(0, MAX_ITEMS_DISPLAYED);
  const displayedNotes = notes.slice(0, MAX_ITEMS_DISPLAYED);
  const displayedReminders = reminders.slice(0, MAX_ITEMS_DISPLAYED);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.container} edges={["top"]}>
        {showCelebration && (
          <CelebrationConfetti onComplete={() => setShowCelebration(false)} />
        )}
        <View style={styles.header}>
          <Text style={styles.title}>Neuri Voice</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              onPress={() => {
                setTasks([]);
                setRoutines([]);
                setNotes([]);
                setReminders([]);
                setToolResponses([]);
                processedMessageIds.current.clear();
                processedMissions.current.clear();
              }}
              style={[styles.debugButton, { backgroundColor: "#FF6B6B" }]}
            >
              <Text style={styles.debugButtonText}>🧹 Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                // Test task
                handleMissionCreation({
                  title: "Test Task",
                  type: "task",
                  personal_deadline: new Date(
                    Date.now() + 24 * 60 * 60 * 1000
                  ).toISOString(),
                });
                // Test note
                setTimeout(() => {
                  handleMissionCreation({
                    title: "Test Note",
                    type: "note",
                    body: "Line 1\nLine 2\nLine 3",
                  });
                }, 100);
                // Test reminder
                setTimeout(() => {
                  handleMissionCreation({
                    title: "Test Reminder",
                    type: "reminder",
                    personal_deadline: new Date(
                      Date.now() + 2 * 60 * 60 * 1000
                    ).toISOString(),
                  });
                }, 200);
                // Test routine
                setTimeout(() => {
                  handleRoutineCreation({
                    title: "Test Routine",
                    schedule: [
                      { day: "Monday", time: "9:00 AM" },
                      { day: "Friday", time: "9:00 AM" },
                    ],
                  });
                }, 300);
              }}
              style={styles.debugButton}
            >
              <Text style={styles.debugButtonText}>🧪 Test All</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {toolResponses.length > 0 && (
            <View style={styles.debugSection}>
              <Text style={styles.debugTitle}>
                🔍 Tool Responses (for debugging)
              </Text>
              {toolResponses.map((response, index) => (
                <View key={index} style={styles.debugResponseCard}>
                  <Text style={styles.debugResponseTime}>
                    {response.timestamp} - {response.type}
                  </Text>
                  <ScrollView
                    horizontal
                    style={styles.debugResponseScroll}
                    showsHorizontalScrollIndicator={false}
                  >
                    <Text style={styles.debugResponseJson}>
                      {JSON.stringify(response.data, null, 2)}
                    </Text>
                  </ScrollView>
                </View>
              ))}
            </View>
          )}

          {displayedTasks.length === 0 &&
            displayedRoutines.length === 0 &&
            displayedNotes.length === 0 &&
            displayedReminders.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>Start a conversation</Text>
                <Text style={styles.emptyStateText}>
                  Tell Neuri what you need to do, and watch your tasks appear
                  here in real-time.
                </Text>
              </View>
            )}
          {/* Tasks Section */}
          {displayedTasks.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Setting tasks{" "}
                {tasks.length > MAX_ITEMS_DISPLAYED &&
                  `(${displayedTasks.length}/${tasks.length})`}
              </Text>
              {displayedTasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  title={task.title}
                  date={task.date}
                  subtasks={task.subtasks}
                  colorIndex={index}
                  enabled={task.enabled}
                  completed={task.completed}
                  onComplete={() => handleTaskComplete(task.id)}
                  onToggle={(enabled) =>
                    setTasks((prev) =>
                      prev.map((t) =>
                        t.id === task.id ? { ...t, enabled } : t
                      )
                    )
                  }
                />
              ))}
            </View>
          )}

          {/* Routines Section */}
          {displayedRoutines.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Setting habits{" "}
                {routines.length > MAX_ITEMS_DISPLAYED &&
                  `(${displayedRoutines.length}/${routines.length})`}
              </Text>
              {displayedRoutines.map((routine, index) => (
                <RoutineCard
                  key={routine.id}
                  emoji={routine.emoji}
                  title={routine.title}
                  frequency={routine.frequency}
                  time={routine.time}
                  colorIndex={index}
                  enabled={routine.enabled}
                  onToggleRoutine={(enabled) =>
                    handleToggleRoutine(routine.id, enabled)
                  }
                />
              ))}
            </View>
          )}

          {/* Notes Section */}
          {displayedNotes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Writing notes{" "}
                {notes.length > MAX_ITEMS_DISPLAYED &&
                  `(${displayedNotes.length}/${notes.length})`}
              </Text>
              {displayedNotes.map((note, index) => (
                <NoteCard
                  key={note.id}
                  title={note.title}
                  body={note.body}
                  colorIndex={index}
                />
              ))}
            </View>
          )}

          {/* Reminders Section */}
          {displayedReminders.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Setting reminders{" "}
                {reminders.length > MAX_ITEMS_DISPLAYED &&
                  `(${displayedReminders.length}/${reminders.length})`}
              </Text>
              {displayedReminders.map((reminder, index) => (
                <ReminderCard
                  key={reminder.id}
                  title={reminder.title}
                  time={reminder.time}
                  date={reminder.date}
                  colorIndex={index}
                  enabled={reminder.enabled}
                  onToggle={(enabled) =>
                    setReminders((prev) =>
                      prev.map((r) =>
                        r.id === reminder.id ? { ...r, enabled } : r
                      )
                    )
                  }
                />
              ))}
            </View>
          )}

          {/* Spacer for voice interface */}
          <View style={{ height: interfaceHeight + 20 }} />
        </ScrollView>

        {/* Voice Interface - Fixed at bottom */}
        <VoiceInterface
          isActive={
            isConnected && !isPaused && (isAssistantSpeaking || isUserSpeaking)
          }
          isConnecting={isConnecting}
          isMuted={isMuted}
          isPaused={isPaused}
          audioData={audioData}
          onSpeakerPress={() => {
            if (!isConnected && !isConnecting) handleStartCall();
          }}
          onMutePress={handleToggleMute}
          onPausePress={handleTogglePause}
          onEndPress={() => {
            handleStopCall();
            router.push("/(tabs)");
          }}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontFamily: "MontserratAlternates_700Bold",
    color: "#2C2438",
    letterSpacing: -0.5,
  },
  debugButton: {
    backgroundColor: "#A78BFA",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  debugButtonText: {
    color: "#FFFFFF",
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Montserrat_600SemiBold",
    color: "#2C2438",
    marginBottom: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 80,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontFamily: "MontserratAlternates_700Bold",
    color: "#2C2438",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: "Montserrat_400Regular",
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 24,
  },
  debugSection: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#A78BFA",
  },
  debugTitle: {
    fontSize: 16,
    fontFamily: "Montserrat_600SemiBold",
    color: "#2C2438",
    marginBottom: 12,
  },
  debugResponseCard: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  debugResponseTime: {
    fontSize: 12,
    fontFamily: "Montserrat_600SemiBold",
    color: "#666",
    marginBottom: 8,
  },
  debugResponseScroll: {
    maxHeight: 200,
  },
  debugResponseJson: {
    fontSize: 10,
    fontFamily: "Courier",
    color: "#333",
    lineHeight: 14,
  },
});

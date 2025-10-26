import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  PanResponder,
  Animated,
} from "react-native";
import Svg, { Path, Circle } from "react-native-svg";

// Status bar icons - you'll need to replace these with your actual image URLs
const imgRectangle =
  "https://www.figma.com/api/mcp/asset/498bc27f-95e4-4d18-b236-c2f93da41cc7";
const imgCombinedShape =
  "https://www.figma.com/api/mcp/asset/eeeee3cb-bd93-4d82-9d4d-2237a4219d41";
const imgRectangle1 =
  "https://www.figma.com/api/mcp/asset/f1ee118b-6968-49a2-9fbf-aba379a21dd0";
const imgWifi =
  "https://www.figma.com/api/mcp/asset/ea6eb349-f8d6-4c86-8c8c-d57d48c2ec38";
const imgMobileSignal =
  "https://www.figma.com/api/mcp/asset/ba5685fc-ac5a-4091-af84-915e88cad245";
const img941 =
  "https://www.figma.com/api/mcp/asset/d9b01cf2-d63f-4e6f-a8e5-602ab8532689";
const imgIconChevronRight =
  "https://www.figma.com/api/mcp/asset/f258ed8e-516d-4a16-86a5-a3c00601325d";
const imgIconChevronLeft =
  "https://www.figma.com/api/mcp/asset/2cdde513-81ce-41a1-b288-36c057f2ce40";
const img =
  "https://www.figma.com/api/mcp/asset/71503cfd-dbc6-4c38-ae14-db3f5f4e87c5";
const img1 =
  "https://www.figma.com/api/mcp/asset/d0fbe81e-cc7e-4bac-83ac-f03589d84c5a";

// Task emoji circle backgrounds
const imgEllipse5 =
  "https://www.figma.com/api/mcp/asset/140956af-94d5-446b-9e53-b3ccd4432f4b";
const imgEllipse6 =
  "https://www.figma.com/api/mcp/asset/0d4fced8-78d0-4127-b67d-0c383a400c0c";
const imgEllipse7 =
  "https://www.figma.com/api/mcp/asset/fa8d6f1e-e2fb-419f-abfb-aee628554866";
const imgEllipse8 =
  "https://www.figma.com/api/mcp/asset/3cefa44c-05d5-492d-89ff-cec3c5160da5";
const imgEllipse9 =
  "https://www.figma.com/api/mcp/asset/9a476da6-2e57-41ef-89bf-ee6896721d85";
const imgEllipse10 =
  "https://www.figma.com/api/mcp/asset/d77c1a2e-b8fa-45e3-8d9a-cef92413bdce";
const imgEllipse11 =
  "https://www.figma.com/api/mcp/asset/6d3680d6-05ea-418e-84df-cea46838344c";
const imgEllipse12 =
  "https://www.figma.com/api/mcp/asset/8f1fb3f7-709e-4a1d-ba9b-c4da99b9fdbe";
const imgEllipse13 =
  "https://www.figma.com/api/mcp/asset/74f70563-b395-4814-8b1e-0869803ed50c";
const imgEllipse14 =
  "https://www.figma.com/api/mcp/asset/f9e9bb06-d6c0-4b4e-9087-9b29ea7af975";
const imgEllipse15 =
  "https://www.figma.com/api/mcp/asset/e9d6642b-eec5-4352-96d6-d167635fef26";

interface Task {
  id: string;
  emoji: string;
  title: string;
  completed: boolean;
  timeStart?: string;
  timeEnd?: string;
  backgroundColor: string;
  circleImage: string;
  checkboxImage: string;
}

interface TaskSection {
  id: string;
  emoji: string;
  title: string;
  count: number;
  backgroundColor: string;
  isExpanded: boolean;
  tasks: Task[];
}

export default function ScheduleComponent() {
  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 11)); // October 11, 2025
  const [selectedDate, setSelectedDate] = useState(11);
  const [viewIndex, setViewIndex] = useState(0); // 0 = first half, 1 = second half, 2 = third chunk if needed

  // Draggable bottom sheet state
  const bottomSheetY = useRef(new Animated.Value(380)).current;
  const MIN_Y = 130; // Fully expanded (covers calendar)
  const MAX_Y = 360; // Default position (folded with space)

  // Task sections state
  const [taskSections, setTaskSections] = useState<TaskSection[]>([
    {
      id: "high-priority",
      emoji: "🔥",
      title: "HIGH PRIORITY",
      count: 3,
      backgroundColor: "#FCECED",
      isExpanded: true,
      tasks: [
        {
          id: "hp-1",
          emoji: "💰",
          title: "Pay my bills",
          completed: false,
          backgroundColor: "#F5D0F9",
          circleImage: imgEllipse6,
          checkboxImage: imgEllipse7,
        },
        {
          id: "hp-2",
          emoji: "💻",
          title: "Complete my CS110 assignmnet",
          completed: false,
          backgroundColor: "#FDEDE0",
          circleImage: imgEllipse5,
          checkboxImage: imgEllipse7,
        },
        {
          id: "hp-3",
          emoji: "✍️",
          title: "Write my B111 thesis",
          completed: false,
          backgroundColor: "#EBE9FC",
          circleImage: imgEllipse8,
          checkboxImage: imgEllipse7,
        },
      ],
    },
    {
      id: "routine",
      emoji: "🌳",
      title: "ROUTINE",
      count: 5,
      backgroundColor: "#F3FDD3",
      isExpanded: true,
      tasks: [
        {
          id: "rt-1",
          emoji: "🧘",
          title: "Meditation",
          completed: false,
          timeStart: "11 AM",
          timeEnd: "12 PM",
          backgroundColor: "#F3FDD3",
          circleImage: imgEllipse9,
          checkboxImage: imgEllipse7,
        },
        {
          id: "rt-2",
          emoji: "💪",
          title: "Gym",
          completed: false,
          timeStart: "2 PM",
          timeEnd: "3 PM",
          backgroundColor: "#F9D0D1",
          circleImage: imgEllipse10,
          checkboxImage: imgEllipse7,
        },
        {
          id: "rt-3",
          emoji: "🍗",
          title: "Lunch",
          completed: false,
          timeStart: "3 PM",
          timeEnd: "3:30 PM",
          backgroundColor: "#D3FDF2",
          circleImage: imgEllipse11,
          checkboxImage: imgEllipse7,
        },
        {
          id: "rt-4",
          emoji: "📘",
          title: "Reading",
          completed: false,
          timeStart: "9 PM",
          timeEnd: "9:45 PM",
          backgroundColor: "#D3E4FD",
          circleImage: imgEllipse12,
          checkboxImage: imgEllipse7,
        },
      ],
    },
    {
      id: "others",
      emoji: "🤌",
      title: "OTHERS",
      count: 2,
      backgroundColor: "#D3EEFD",
      isExpanded: true,
      tasks: [
        {
          id: "ot-1",
          emoji: "🐕‍🦺",
          title: "Walk the dog",
          completed: false,
          backgroundColor: "#FDE0D3",
          circleImage: imgEllipse13,
          checkboxImage: imgEllipse14,
        },
        {
          id: "ot-2",
          emoji: "📺",
          title: "Watch the new episode of AOT",
          completed: false,
          backgroundColor: "#DED0F9",
          circleImage: imgEllipse15,
          checkboxImage: imgEllipse14,
        },
      ],
    },
  ]);

  const monthNames = [
    "JANUARY",
    "FEBRUARY",
    "MARCH",
    "APRIL",
    "MAY",
    "JUNE",
    "JULY",
    "AUGUST",
    "SEPTEMBER",
    "OCTOBER",
    "NOVEMBER",
    "DECEMBER",
  ];

  const dayNames = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  const getDayName = (date: Date) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[date.getDay()];
  };

  const getTotalViews = () => {
    const calendarDays = generateCalendarDays();
    const totalRows = Math.ceil(calendarDays.length / 7);
    return Math.ceil(totalRows / 2); // Number of 2-row views needed
  };

  const goToPreviousWeeks = () => {
    if (viewIndex > 0) {
      // Go to previous view in current month
      setViewIndex(viewIndex - 1);
    } else {
      // Go to previous month, last view
      const newDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        1
      );
      setCurrentDate(newDate);
      setSelectedDate(1);
      // Calculate how many views the previous month has and set to last view
      const prevMonthDays = new Date(
        newDate.getFullYear(),
        newDate.getMonth() + 1,
        0
      ).getDate();
      const prevMonthRows = Math.ceil(prevMonthDays / 7);
      const prevMonthViews = Math.ceil(prevMonthRows / 2);
      setViewIndex(prevMonthViews - 1);
    }
  };

  const goToNextWeeks = () => {
    const totalViews = getTotalViews();
    if (viewIndex < totalViews - 1) {
      // Go to next view in current month
      setViewIndex(viewIndex + 1);
    } else {
      // Go to next month, first view
      const newDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1
      );
      setCurrentDate(newDate);
      setSelectedDate(1);
      setViewIndex(0);
    }
  };

  const selectDate = (day: number) => {
    setSelectedDate(day);
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    setCurrentDate(newDate);
  };

  const generateCalendarDays = () => {
    const daysInMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ).getDate();
    const days: (number | null)[] = [];

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    const remainder = days.length % 7;
    if (remainder !== 0) {
      for (let i = 0; i < 7 - remainder; i++) {
        days.push(null);
      }
    }

    return days;
  };

  const toggleSection = (sectionId: string) => {
    setTaskSections((sections) =>
      sections.map((section) =>
        section.id === sectionId
          ? { ...section, isExpanded: !section.isExpanded }
          : section
      )
    );
  };

  const toggleTask = (sectionId: string, taskId: string) => {
    setTaskSections((sections) =>
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              tasks: section.tasks.map((task) =>
                task.id === taskId
                  ? { ...task, completed: !task.completed }
                  : task
              ),
            }
          : section
      )
    );
  };

  // Pan responder for draggable bottom sheet
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newY = MAX_Y + gestureState.dy;
        if (newY >= MIN_Y && newY <= MAX_Y) {
          bottomSheetY.setValue(newY);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const currentY = MAX_Y + gestureState.dy;
        const snapPoint = currentY < (MIN_Y + MAX_Y) / 2 ? MIN_Y : MAX_Y;

        Animated.spring(bottomSheetY, {
          toValue: snapPoint,
          useNativeDriver: false,
          tension: 50,
          friction: 8,
        }).start();
      },
    })
  ).current;

  const calendarDays = generateCalendarDays();
  const rows: (number | null)[][] = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    rows.push(calendarDays.slice(i, i + 7));
  }

  // Show 2 rows based on viewIndex
  const startRow = viewIndex * 2;
  const visibleRows = rows.slice(startRow, startRow + 2);

  return (
    <View style={styles.container}>
      {/* Status Bar */}
      <View style={styles.statusBar}>
        <View style={styles.statusBarLeft}>
          <Image source={{ uri: img941 }} style={styles.timeImage} />
        </View>
        <View style={styles.statusBarRight}>
          <Image source={{ uri: imgMobileSignal }} style={styles.signalImage} />
          <Image source={{ uri: imgWifi }} style={styles.wifiImage} />
          <View style={styles.batteryContainer}>
            <Image
              source={{ uri: imgRectangle }}
              style={styles.batteryOutline}
            />
            <Image
              source={{ uri: imgCombinedShape }}
              style={styles.batteryTip}
            />
            <Image source={{ uri: imgRectangle1 }} style={styles.batteryFill} />
          </View>
        </View>
      </View>

      {/* Header Section */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.monthText}>
            {monthNames[currentDate.getMonth()]}, {currentDate.getFullYear()}
          </Text>
          <Text style={styles.dayText}>{getDayName(currentDate)}</Text>
        </View>
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            onPress={goToPreviousWeeks}
            style={styles.navButton}
          >
            <Image
              source={{ uri: imgIconChevronLeft }}
              style={styles.chevronImage}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={goToNextWeeks} style={styles.navButton}>
            <Image
              source={{ uri: imgIconChevronRight }}
              style={styles.chevronImage}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarScrollView}>
        <View style={styles.calendarContainer}>
          {/* Day Names Header */}
          <View style={styles.dayNamesRow}>
            {dayNames.map((day, index) => (
              <View key={index} style={styles.dayNameCell}>
                <Text style={styles.dayNameText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Dates - Only 2 rows */}
          {visibleRows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.calendarRow}>
              {row.map((day, dayIndex) => (
                <TouchableOpacity
                  key={dayIndex}
                  onPress={() => day && selectDate(day)}
                  disabled={!day}
                  style={[
                    styles.dateCell,
                    day === selectedDate && styles.selectedDateCell,
                    day && day !== selectedDate && styles.defaultDateCell,
                  ]}
                >
                  {day && (
                    <Text
                      style={[
                        styles.dateText,
                        day === selectedDate
                          ? styles.selectedDateText
                          : styles.defaultDateText,
                      ]}
                    >
                      {day}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </View>

      {/* Bottom section with tasks */}
      <Animated.View style={[styles.bottomSection, { top: bottomSheetY }]} />
      <Animated.View
        style={[styles.handleBar, { top: Animated.subtract(bottomSheetY, 13) }]}
        {...panResponder.panHandlers}
      />

      {/* Task Sections */}
      <Animated.ScrollView
        style={[styles.taskScrollView, { top: Animated.add(bottomSheetY, 17) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.taskSectionsContainer}>
          {taskSections.map((section) => (
            <View key={section.id} style={styles.taskSection}>
              {/* Section Header */}
              <TouchableOpacity
                onPress={() => toggleSection(section.id)}
                style={[
                  styles.sectionHeader,
                  { backgroundColor: section.backgroundColor },
                ]}
              >
                <Text style={styles.sectionEmoji}>{section.emoji}</Text>
                <Text style={styles.sectionTitle}>
                  {section.title} ({section.count})
                </Text>
                <View style={styles.chevronIconContainer}>
                  <Image
                    source={{ uri: section.isExpanded ? img : img1 }}
                    style={[
                      styles.chevronIcon,
                      !section.isExpanded && styles.chevronIconRotated,
                    ]}
                  />
                </View>
              </TouchableOpacity>

              {/* Section Tasks */}
              {section.isExpanded && (
                <View
                  style={[
                    styles.tasksContainer,
                    {
                      backgroundColor: `${section.backgroundColor}40`,
                      borderColor: "rgba(0,0,0,0.03)",
                    },
                  ]}
                >
                  {section.tasks.map((task) => (
                    <View key={task.id} style={styles.taskRow}>
                      <View style={styles.taskEmojiContainer}>
                        <View
                          style={[
                            styles.taskCircleBackground,
                            { backgroundColor: task.backgroundColor },
                          ]}
                        />
                        <Text style={styles.taskEmoji}>{task.emoji}</Text>
                      </View>
                      <Text
                        style={[
                          styles.taskTitle,
                          task.completed && styles.taskTitleCompleted,
                        ]}
                      >
                        {task.title}
                      </Text>
                      {task.timeStart && task.timeEnd && (
                        <Text style={styles.taskTime}>
                          {task.timeStart} → {task.timeEnd}
                        </Text>
                      )}
                      <TouchableOpacity
                        onPress={() => toggleTask(section.id, task.id)}
                        style={styles.checkboxContainer}
                      >
                        {task.completed ? (
                          <Svg width="20" height="20" viewBox="0 0 20 20">
                            <Circle
                              cx="10"
                              cy="10"
                              r="9"
                              stroke="#262135"
                              strokeWidth="2"
                              fill="#262135"
                            />
                            <Path
                              d="M6 10L9 13L14 7"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </Svg>
                        ) : (
                          <Image
                            source={{ uri: task.checkboxImage }}
                            style={styles.checkboxImage}
                          />
                        )}
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Main container - matches .schedule-1 from CSS
  container: {
    flex: 1,
    backgroundColor: "rgba(38, 33, 53, 1)",
    overflow: "hidden",
    position: "relative",
  },

  // Status Bar - matches iOS status bar styling
  statusBar: {
    position: "absolute",
    height: 44,
    left: 0,
    right: 0,
    top: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBarLeft: {
    position: "absolute",
    left: 33.453514099121094,
    top: 17.16748046875,
    width: 28.42616844177246,
    height: 11.0888671875,
  },
  timeImage: {
    width: 28,
    height: 11,
  },
  statusBarRight: {
    position: "absolute",
    right: 14.67,
    top: 17.33,
    width: 66.66140747070312,
    height: 11.336193084716797,
    flexDirection: "row",
    alignItems: "center",
  },
  signalImage: {
    width: 17,
    height: 10.667,
    position: "absolute",
    left: 0,
    top: 0.33593738079071045,
  },
  wifiImage: {
    width: 15.272,
    height: 10.966,
    position: "absolute",
    left: 22.027069091796875,
    top: 0,
  },
  batteryContainer: {
    width: 24.32803726196289,
    height: 11.333333015441895,
    position: "absolute",
    left: 42.333343505859375,
    top: 0.0026854276657104492,
  },
  batteryOutline: {
    width: 22,
    height: 11,
    position: "absolute",
    left: 0,
    top: 0,
    opacity: 0.35,
  },
  batteryTip: {
    width: 1,
    height: 4,
    position: "absolute",
    left: 23,
    top: 3.666666030883789,
    opacity: 0.4,
  },
  batteryFill: {
    width: 18,
    height: 7,
    position: "absolute",
    left: 2,
    top: 2,
  },

  // Header section - matches frame-92-61 and related styles
  headerContainer: {
    marginTop: 69,
    marginHorizontal: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 8,
  },
  headerTextContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-start",
  },
  monthText: {
    alignSelf: "stretch",
    fontFamily: "Montserrat_400Regular",
    fontSize: 14,
    color: "#FFF",
    textTransform: "uppercase",
    lineHeight: 15.12,
  },
  dayText: {
    alignSelf: "stretch",
    fontFamily: "MontserratAlternates_600SemiBold",
    fontSize: 36,
    color: "#FFF",
    lineHeight: 38.88,
  },
  navigationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  navButton: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  chevronImage: {
    width: 17,
    height: 25,
    opacity: 0.2,
  },

  // Calendar section - matches days-2 and related styles
  calendarScrollView: {
    marginHorizontal: 28,
    marginTop: 22,
  },
  calendarContainer: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  dayNamesRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  dayNameCell: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 40,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  dayNameText: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 11,
    color: "#C7C7C7",
    textAlign: "center",
  },
  calendarRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  dateCell: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 40,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  defaultDateCell: {
    borderWidth: 1.383,
    borderColor: "rgba(255, 255, 255, 0.47)",
    borderStyle: "solid",
  },
  selectedDateCell: {
    backgroundColor: "rgba(214, 167, 255, 1)",
    borderWidth: 1.383,
    borderColor: "rgba(255, 255, 255, 0.47)",
    borderStyle: "solid",
  },
  dateText: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 11,
    textAlign: "center",
  },
  defaultDateText: {
    color: "rgba(255, 255, 255, 0.47)",
  },
  selectedDateText: {
    color: "rgba(38, 33, 53, 1)",
  },

  // Bottom section - matches rectangle-35-48
  bottomSection: {
    position: "absolute",
    backgroundColor: "rgba(252, 249, 251, 1)",
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 25,
  },
  handleBar: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 1)",
    height: 5,
    borderRadius: 4.5,
    width: 77,
    alignSelf: "center",
    left: "50%",
    marginLeft: -38.5,
  },
  taskScrollView: {
    position: "absolute",
    left: 17,
    right: 17,
    bottom: 20,
  },
  taskSectionsContainer: {
    gap: 10,
  },
  taskSection: {
    gap: 10,
    marginBottom: 10,
  },

  // Task section headers - matches component-1-71, component-2-94, component-3-124
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    gap: 7,
  },
  sectionEmoji: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 15,
    color: "rgba(0, 0, 0, 1)",
  },
  sectionTitle: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 14,
    color: "rgba(18, 22, 22, 1)",
    flex: 1,
  },
  chevronIconContainer: {
    width: 7,
    height: 4,
  },
  chevronIcon: {
    width: 7,
    height: 4,
  },
  chevronIconRotated: {
    transform: [{ rotate: "180deg" }],
  },

  // Task containers - matches frame-2-76, frame-3-99, frame-5-129
  tasksContainer: {
    paddingHorizontal: 11,
    paddingVertical: 12,
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.03)",
    borderStyle: "solid",
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    minHeight: 24,
  },
  taskEmojiContainer: {
    width: 24,
    height: 24,
    marginRight: 7,
    position: "relative",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  taskCircleBackground: {
    width: 24,
    height: 24,
    borderRadius: 12,
    position: "absolute",
    left: 0,
    top: 0,
  },
  taskEmoji: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 12,
    color: "rgba(0, 0, 0, 1)",
    textAlign: "center",
  },
  taskTitle: {
    fontFamily: "MontserratAlternates_500Medium",
    fontSize: 12,
    color: "rgba(0, 0, 0, 1)",
    position: "absolute",
    left: 31,
    top: 4,
  },
  taskTitleCompleted: {
    textDecorationLine: "line-through",
    opacity: 0.5,
  },
  taskTime: {
    fontFamily: "MontserratAlternates_500Medium",
    fontSize: 11,
    color: "rgba(0, 0, 0, 0.8)",
    textAlign: "right",
    position: "absolute",
    top: 6,
    right: 30,
  },
  checkboxContainer: {
    width: 20,
    height: 20,
    position: "absolute",
    top: 2,
    right: 0,
  },
  checkboxImage: {
    width: 20,
    height: 20,
  },
});

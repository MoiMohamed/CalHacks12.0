import { useState, useEffect } from "react";
import { Task, TaskSection } from "../types/api";
import { apiClient } from "../services/api_client";

// Custom hook for backend integration
export function useScheduleData() {
  const [taskSections, setTaskSections] = useState<TaskSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from backend
  const fetchScheduleData = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with actual API call when backend is ready
      // const response = await apiClient.get('/schedule');
      // setTaskSections(response.data);

      // Mock data for now - matches the exact design
      const mockData: TaskSection[] = [
        {
          id: "high-priority",
          emoji: "🔥",
          title: "HIGH PRIORITY",
          count: 3,
          backgroundColor: "#fceced",
          isExpanded: true,
          tasks: [
            {
              id: "hp-1",
              emoji: "💰",
              title: "Pay my bills",
              completed: false,
              backgroundColor: "#F5D0F9",
            },
            {
              id: "hp-2",
              emoji: "💻",
              title: "Complete my CS110 assignment",
              completed: false,
              backgroundColor: "#FDEDE0",
            },
            {
              id: "hp-3",
              emoji: "✍️",
              title: "Write my B111 thesis",
              completed: false,
              backgroundColor: "#EBE9FC",
            },
          ],
        },
        {
          id: "routine",
          emoji: "🌳",
          title: "ROUTINE",
          count: 4,
          backgroundColor: "#f3fdd3",
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
            },
            {
              id: "rt-2",
              emoji: "💪",
              title: "Gym",
              completed: false,
              timeStart: "2 PM",
              timeEnd: "3 PM",
              backgroundColor: "#F9D0D1",
            },
            {
              id: "rt-3",
              emoji: "🍗",
              title: "Lunch",
              completed: false,
              timeStart: "3 PM",
              timeEnd: "3:30 PM",
              backgroundColor: "#D3FDF2",
            },
            {
              id: "rt-4",
              emoji: "📘",
              title: "Reading",
              completed: false,
              timeStart: "9 PM",
              timeEnd: "9:45 PM",
              backgroundColor: "#D3E4FD",
            },
          ],
        },
        {
          id: "others",
          emoji: "🤌",
          title: "OTHERS",
          count: 2,
          backgroundColor: "#d3eefd",
          isExpanded: true,
          tasks: [
            {
              id: "ot-1",
              emoji: "🐕‍🦺",
              title: "Walk the dog",
              completed: false,
              backgroundColor: "#FDE0D3",
            },
            {
              id: "ot-2",
              emoji: "📺",
              title: "Watch the new episode of AOT",
              completed: false,
              backgroundColor: "#DED0F9",
            },
          ],
        },
      ];

      setTaskSections(mockData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch schedule data"
      );
    } finally {
      setLoading(false);
    }
  };

  // Update task completion
  const updateTaskCompletion = async (
    sectionId: string,
    taskId: string,
    completed: boolean
  ) => {
    try {
      // TODO: Replace with actual API call when backend is ready
      // await apiClient.patch(`/tasks/${taskId}`, { completed });

      // For now, just update local state
      setTaskSections((sections) =>
        sections.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                tasks: section.tasks.map((task) =>
                  task.id === taskId ? { ...task, completed } : task
                ),
              }
            : section
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
    }
  };

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    setTaskSections((sections) =>
      sections.map((section) =>
        section.id === sectionId
          ? { ...section, isExpanded: !section.isExpanded }
          : section
      )
    );
  };

  // Toggle task completion
  const toggleTask = (sectionId: string, taskId: string) => {
    const section = taskSections.find((s) => s.id === sectionId);
    const task = section?.tasks.find((t) => t.id === taskId);
    if (task) {
      updateTaskCompletion(sectionId, taskId, !task.completed);
    }
  };

  useEffect(() => {
    fetchScheduleData();
  }, []);

  return {
    taskSections,
    loading,
    error,
    toggleSection,
    toggleTask,
    refetch: fetchScheduleData,
  };
}

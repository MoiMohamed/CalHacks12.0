import { useEffect, useMemo, useState } from "react";
import { useUsers } from "./useUsers";
import {
  useHighPriorityMissions,
  useOverdueMissions,
  useUpdateMission,
} from "./useMissions";
import { useDayRoutines } from "./useRoutines";

// Frontend view-model types for the Schedule UI
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  // Optional presentation fields used by the UI
  emoji?: string;
  timeStart?: string;
  timeEnd?: string;
  backgroundColor?: string;
  circleImage?: string;
  checkboxImage?: string;
}

export interface TaskSection {
  id: string;
  emoji: string;
  title: string;
  count: number;
  backgroundColor: string;
  isExpanded: boolean;
  tasks: Task[];
}

// Custom hook for backend integration
export function useScheduleData() {
  const [taskSections, setTaskSections] = useState<TaskSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine current user (first user as default for now)
  const {
    data: users,
    isLoading: usersLoading,
    error: usersError,
  } = useUsers();
  const currentUserId = useMemo(() => users?.[0]?.id ?? "", [users]);

  // Day of week for routines
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const today = new Date();
  const todayName = dayNames[today.getDay()];

  // Queries
  const {
    data: highPriority,
    isLoading: hpLoading,
    error: hpError,
  } = useHighPriorityMissions(currentUserId);
  const {
    data: overdue,
    isLoading: odLoading,
    error: odError,
  } = useOverdueMissions(currentUserId);
  const {
    data: routines,
    isLoading: rtLoading,
    error: rtError,
  } = useDayRoutines(currentUserId, todayName);

  const { mutateAsync: updateMission } = useUpdateMission();

  // Build sections when data changes
  useEffect(() => {
    setLoading(usersLoading || hpLoading || odLoading || rtLoading);

    const errMsg =
      (usersError as Error | undefined)?.message ||
      (hpError as Error | undefined)?.message ||
      (odError as Error | undefined)?.message ||
      (rtError as Error | undefined)?.message ||
      null;
    setError(errMsg);

    if (!currentUserId || usersLoading || hpLoading || odLoading || rtLoading) {
      return;
    }

    const highPrioritySection: TaskSection = {
      id: "high-priority",
      emoji: "🔥",
      title: "HIGH PRIORITY",
      backgroundColor: "#FCECED",
      isExpanded: true,
      count: highPriority?.length ?? 0,
      tasks:
        highPriority?.map((m) => ({
          id: m.id,
          title: m.title,
          completed: m.is_complete,
          emoji: "🔥",
          backgroundColor: "#F5D0F9",
        })) ?? [],
    };

    const routineSection: TaskSection = {
      id: "routine",
      emoji: "🌳",
      title: "ROUTINE",
      backgroundColor: "#F3FDD3",
      isExpanded: true,
      count: routines?.length ?? 0,
      tasks:
        routines?.map((r) => ({
          id: r.id,
          title: r.title,
          completed: false,
          emoji: "🧘",
          backgroundColor: "#F3FDD3",
        })) ?? [],
    };

    const othersSection: TaskSection = {
      id: "others",
      emoji: "🤌",
      title: "OTHERS",
      backgroundColor: "#D3EEFD",
      isExpanded: true,
      count: overdue?.length ?? 0,
      tasks:
        overdue?.map((m) => ({
          id: m.id,
          title: m.title,
          completed: m.is_complete,
          emoji: "📝",
          backgroundColor: "#DED0F9",
        })) ?? [],
    };

    setTaskSections([highPrioritySection, routineSection, othersSection]);
  }, [
    currentUserId,
    usersLoading,
    usersError,
    highPriority,
    hpLoading,
    hpError,
    overdue,
    odLoading,
    odError,
    routines,
    rtLoading,
    rtError,
  ]);

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

  // Toggle task completion (persists via missions API)
  const toggleTask = async (sectionId: string, taskId: string) => {
    const section = taskSections.find((s) => s.id === sectionId);
    const task = section?.tasks.find((t) => t.id === taskId);
    if (!task) return;
    const next = !task.completed;
    // optimistic update
    setTaskSections((sections) =>
      sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              tasks: s.tasks.map((t) =>
                t.id === taskId ? { ...t, completed: next } : t
              ),
            }
          : s
      )
    );
    try {
      await updateMission({ id: taskId, data: { is_complete: next } });
    } catch (e) {
      // revert on error
      setTaskSections((sections) =>
        sections.map((s) =>
          s.id === sectionId
            ? {
                ...s,
                tasks: s.tasks.map((t) =>
                  t.id === taskId ? { ...t, completed: !next } : t
                ),
              }
            : s
        )
      );
      setError((e as Error)?.message || "Failed to update task");
    }
  };

  const refetch = () => {
    // Consumers can rely on React Query cache invalidations via mutations
    // Here we simply rebuild sections from latest hook data
    setTaskSections((prev) => [...prev]);
  };

  return { taskSections, loading, error, toggleSection, toggleTask, refetch };
}

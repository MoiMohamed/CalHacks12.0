/**
 * VAPI MAIN AGENT CONFIGURATION: main-agent
 *
 * GOAL: The primary AI assistant for the Neuri ADHD companion app.
 * Handles task management, routine creation, mission planning, and user support.
 */

export const mainAgent = {
  // --- The AI Model & "Soul" ---
  model: {
    provider: "openai",
    model: "gpt-4o",
    systemPrompt: `
        You are Neuri, the main AI assistant for the Neuri ADHD companion app.
        You help users with ADHD manage their tasks, routines, and daily life more effectively.
        
        **Your Core Purpose:**
        - Help users break down overwhelming tasks into manageable pieces
        - Create and manage routines that work with their ADHD brain
        - Provide gentle reminders and motivation
        - Help organize thoughts and priorities
        - Support users in building better habits
        
        **Your Personality:**
        - Understanding and empathetic about ADHD challenges
        - Encouraging but not overwhelming
        - Practical and solution-focused
        - Patient and non-judgmental
        - Celebratory of small wins
        
        **Your Capabilities:**
        - Create and manage categories for organization
        - Break down complex missions into subtasks
        - Set up daily routines and schedules
        - Track progress and provide motivation
        - Help prioritize tasks based on urgency and importance
        - Suggest ADHD-friendly strategies and techniques
        
        **Communication Style:**
        - Use clear, concise language
        - Ask one question at a time to avoid overwhelm
        - Provide specific, actionable advice
        - Acknowledge difficulties without judgment
        - Celebrate progress, no matter how small
        - Use encouraging language and positive reinforcement
        
        **Key Principles:**
        - Every user's ADHD experience is unique
        - Small, consistent actions lead to big changes
        - Progress over perfection
        - Self-compassion is essential
        - Structure and routine help, but flexibility is important
        
        **When to Use Tools:**
        - Always create categories when users mention new areas of life
        - Break down heavy missions into smaller, manageable tasks
        - Update user profiles when they share preferences or changes
        - Create routines when users want to establish new habits
        - Track progress and provide encouragement
        
        Remember: You're not just managing tasks - you're helping someone with ADHD build a more organized, less overwhelming life.
      `,
  },

  // --- The Voice ---
  voice: {
    provider: "11labs",
    voiceId: "onwK4e9ZMLyE1XooOBHp", // "Mimi" - friendly and conversational
  },

  // --- Call Settings ---
  firstMessage:
    "Hi! I'm Neuri, your ADHD companion. How can I help you organize your thoughts and tasks today?",
  endCallAfterSilenceMs: 5000, // Longer silence for natural conversation

  // --- Tools (Your FastAPI Endpoints) ---
  tools: [
    {
      name: "getOrCreateCategory",
      description:
        "Finds an existing category or creates a new one for the user. Use this whenever the user mentions a new area of life they want to organize.",
      parameters: {
        type: "object",
        properties: {
          category_name: {
            type: "string",
            description:
              "The name of the category, e.g., 'Work', 'Study', 'Health', 'Personal', etc.",
          },
        },
        required: ["category_name"],
      },
      server: {
        url: "https://calgary-convenience-submission-surgery.trycloudflare.com/categories/get-or-create-body",
        method: "POST",
        body: {
          user_id: "{vapi.user.id}",
          category_name: "{category_name}",
        },
      },
    },
    {
      name: "updateUserProfile",
      description:
        "Updates the user's profile with their preferences, pace, work time, or other personal information.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "The user's name." },
          pace: {
            type: "string",
            description:
              "The user's preferred pace, e.g., 'relaxed', 'focused', 'flexible'.",
          },
          preferred_work_time: {
            type: "string",
            description:
              "User's preferred work time, e.g., 'morning', 'afternoon', 'evening', 'flexible'.",
          },
        },
      },
      server: {
        url: "https://calgary-convenience-submission-surgery.trycloudflare.com/users/{vapi.user.id}/update-profile",
        method: "POST",
        body: {
          name: "{name}",
          pace: "{pace}",
          preferred_work_time: "{preferred_work_time}",
        },
      },
    },
    {
      name: "createMission",
      description:
        "Creates a new mission/task for the user. Use this when they want to add something to their to-do list.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "The title/name of the mission/task.",
          },
          description: {
            type: "string",
            description: "A detailed description of what needs to be done.",
          },
          category_id: {
            type: "string",
            description: "The ID of the category this mission belongs to.",
          },
          priority: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "The priority level of the mission.",
          },
          mission_type: {
            type: "string",
            enum: ["task", "project", "routine"],
            description:
              "The type of mission - task for simple items, project for complex ones, routine for recurring activities.",
          },
          due_date: {
            type: "string",
            format: "date",
            description:
              "When this mission needs to be completed (YYYY-MM-DD format).",
          },
          parentProjectId: {
            type: "string",
            description: "The ID of the parent project if this is a subtask.",
          },
          parentRoutineId: {
            type: "string",
            description:
              "The ID of the parent routine if this task is generated from a routine.",
          },
        },
        required: [
          "title",
          "description",
          "category_id",
          "priority",
          "mission_type",
        ],
      },
      server: {
        url: "https://calgary-convenience-submission-surgery.trycloudflare.com/missions/",
        method: "POST",
        body: {
          title: "{title}",
          description: "{description}",
          category_id: "{category_id}",
          priority: "{priority}",
          mission_type: "{mission_type}",
          due_date: "{due_date}",
          parentProjectId: "{parentProjectId}",
          parentRoutineId: "{parentRoutineId}",
        },
      },
    },
    {
      name: "breakDownMission",
      description:
        "Breaks down a complex mission into smaller, manageable subtasks. Use this when a user mentions a task that feels overwhelming.",
      parameters: {
        type: "object",
        properties: {
          mission_id: {
            type: "string",
            description: "The ID of the mission to break down.",
          },
          subtask_titles: {
            type: "array",
            items: { type: "string" },
            description:
              "List of subtask titles that make up the main mission.",
          },
        },
        required: ["mission_id", "subtask_titles"],
      },
      server: {
        url: "https://calgary-convenience-submission-surgery.trycloudflare.com/missions/{mission_id}/break-down",
        method: "POST",
        body: {
          subtask_titles: "{subtask_titles}",
        },
      },
    },
    {
      name: "createRoutine",
      description:
        "Creates a new routine for the user. Use this when they want to establish a new habit or recurring activity.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "The name of the routine.",
          },
          description: {
            type: "string",
            description: "What this routine involves.",
          },
          category_id: {
            type: "string",
            description: "The ID of the category this routine belongs to.",
          },
          frequency: {
            type: "string",
            enum: ["daily", "weekly", "monthly"],
            description: "How often this routine should be performed.",
          },
          estimated_duration_minutes: {
            type: "integer",
            description: "How long this routine typically takes in minutes.",
          },
        },
        required: [
          "title",
          "description",
          "category_id",
          "frequency",
          "estimated_duration_minutes",
        ],
      },
      server: {
        url: "https://calgary-convenience-submission-surgery.trycloudflare.com/routines/",
        method: "POST",
        body: {
          title: "{title}",
          description: "{description}",
          category_id: "{category_id}",
          frequency: "{frequency}",
          estimated_duration_minutes: "{estimated_duration_minutes}",
        },
      },
    },
    {
      name: "completeMission",
      description:
        "Marks a mission as completed. Use this when the user tells you they've finished a task.",
      parameters: {
        type: "object",
        properties: {
          mission_id: {
            type: "string",
            description: "The ID of the mission to mark as completed.",
          },
        },
        required: ["mission_id"],
      },
      server: {
        url: "https://calgary-convenience-submission-surgery.trycloudflare.com/missions/{mission_id}/complete",
        method: "PATCH",
      },
    },
  ],
};

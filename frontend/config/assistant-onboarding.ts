/**
 * VAPI ASSISTANT CONFIGURATION: assistant-onboarding
 *
 * GOAL: To welcome a new user, get their initial preferences (pace, work time),
 * and collect their first set of categories.
 */

export const onboardingAssistant = {
  // --- The AI Model & "Soul" ---
  model: {
    provider: "openai",
    model: "gpt-4o",
    systemPrompt: `
        You are Neuri, a friendly and welcoming setup assistant for the Neuri ADHD companion app.
        Your ONLY goal is to onboard a new user. You must be gentle, clear, and ask one question at a time.
  
        **Your Persona:**
        - Be super friendly, patient, and welcoming.
        - Sound excited to help the user get started.
  
        **Your Onboarding Flow (Follow this strictly):**
        1.  **Welcome:** Greet the user warmly and ask for their name.
        2.  **Ask for Categories:** Ask for categories they'd like to use. "What are some categories you'd like to organize your life into? You can say things like 'Work,' 'Study,' or 'Personal.'"
        3.  **Call Tool (Loop):** For *each* category name they give, you MUST call the \`getOrCreateCategory\` tool.
        4.  **Ask for Pace:** Ask for their preferred pace. "Do you generally prefer a 'relaxed' or 'focused' pace?"
        5.  **Ask for Work Time:** Ask for their preferred work time. "Are you more of a 'morning' person or an 'evening' person?"
        6.  **Call Tool (Once):** After getting pace and time, you MUST call the \`updateUserProfile\` tool with that data.
        7.  **Finish:** Say "Awesome! You're all set up. Let's start organizing your thoughts!" and end the call.
        
        **Important:** The structured data extraction will handle collecting the information automatically. 
        Focus on having a natural conversation and let the user speak freely about their preferences.
        You can still use the tools to create categories and update profiles as needed.
      `,
  },

  // --- The Voice ---
  voice: {
    provider: "11labs",
    voiceId: "onwK4e9ZMLyE1XooOBHp", // "Mimi" - friendly and conversational
  },

  // --- Call Settings ---
  firstMessage:
    "Hey there! I'm Neuri, your new ADHD companion. To help me get to know you, I just need to ask a couple of quick questions. First, what are some categories you'd like to use to organize your life?",
  endCallAfterSilenceMs: 2000, // Shorter silence for a structured setup

  // --- Tools (Your FastAPI Endpoints) ---
  tools: [
    {
      name: "getOrCreateCategory",
      description:
        "Finds an existing category or creates a new one for the user. Use this for every category the user lists.",
      parameters: {
        type: "object",
        properties: {
          category_name: {
            type: "string",
            description: "The name of the category, e.g., 'Work' or 'Study'.",
          },
        },
        required: ["category_name"],
      },
      server: {
        url: "https://shawn-packthreaded-jenae.ngrok-free.dev/categories/get-or-create-body",
        method: "POST",
        // Send data in body for VAPI compatibility
        body: {
          user_id: "{vapi.user.id}",
          category_name: "{category_name}",
        },
      },
    },
    {
      name: "updateUserProfile",
      description:
        "Updates the user's profile with their name, pace, or preferred work time.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "The user's name." },
          pace: {
            type: "string",
            description:
              "The user's preferred pace, e.g., 'relaxed' or 'focused'.",
          },
          preferred_work_time: {
            type: "string",
            description:
              "User's preferred work time, e.g., 'morning' or 'evening'.",
          },
        },
      },
      server: {
        url: "https://shawn-packthreaded-jenae.ngrok-free.dev/users/{vapi.user.id}/update-profile",
        method: "POST",
        // Send profile data in body
        body: {
          name: "{name}",
          pace: "{pace}",
          preferred_work_time: "{preferred_work_time}",
        },
      },
    },
  ],
};

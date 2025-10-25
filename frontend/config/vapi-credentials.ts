// frontend/config/vapi-credentials.ts
// Secure VAPI credentials configuration using environment variables

export const VAPI_CREDENTIALS = {
  // Your VAPI Public Key (starts with "pk_")
  PUBLIC_KEY:
    process.env.EXPO_PUBLIC_VAPI_PUBLIC_KEY ||
    process.env.VAPI_PUBLIC_KEY ||
    "",

  // Your VAPI Assistant IDs
  ONBOARDING_ASSISTANT_ID:
    process.env.EXPO_PUBLIC_VAPI_ONBOARDING_ASSISTANT_ID ||
    process.env.VAPI_ONBOARDING_ASSISTANT_ID ||
    "",

  MAIN_ASSISTANT_ID:
    process.env.EXPO_PUBLIC_VAPI_MAIN_ASSISTANT_ID ||
    process.env.VAPI_MAIN_ASSISTANT_ID ||
    "",

  // Legacy support for single assistant ID
  ASSISTANT_ID:
    process.env.EXPO_PUBLIC_VAPI_ASSISTANT_ID ||
    process.env.VAPI_ASSISTANT_ID ||
    "",
};

// Validation - credentials must come from environment variables
if (!VAPI_CREDENTIALS.PUBLIC_KEY) {
  throw new Error(
    "VAPI_PUBLIC_KEY is required. Please set EXPO_PUBLIC_VAPI_PUBLIC_KEY in your .env.local file"
  );
}

if (!VAPI_CREDENTIALS.MAIN_ASSISTANT_ID && !VAPI_CREDENTIALS.ASSISTANT_ID) {
  throw new Error(
    "VAPI_MAIN_ASSISTANT_ID is required. Please set EXPO_PUBLIC_VAPI_MAIN_ASSISTANT_ID in your .env.local file"
  );
}

// Instructions:
// 1. Copy env.example to .env.local
// 2. Fill in your actual VAPI credentials from https://dashboard.vapi.ai
// 3. For Expo, use EXPO_PUBLIC_ prefix for client-side variables
// 4. Make sure your assistant is configured with the tools from assistant-onboarding.ts

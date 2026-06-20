/**
 * aiService.js
 * All AI feature API calls go through here.
 */

import axiosClient from "../api/axiosClient";

// Summary
export const generateSummary = async (content, tone = "concise") => {
  const response = await axiosClient.post("/ai/summary", { content, tone });
  return response.data;
};

// Quiz
export const generateQuiz = async (
  content,
  difficulty = "medium",
  numberOfQuestions = 5
) => {
  const response = await axiosClient.post("/ai/quiz", {
    content,
    difficulty,
    numberOfQuestions,
  });

  return response.data;
};

// Health check
export const checkAIHealth = async () => {
  const response = await axiosClient.get("/ai/health");
  return response.data;
};


export const generateFlashcards = async (content) => {
  const response = await axiosClient.post("/ai/flashcards", { content });
  return response.data;
};

export const explainTopic = async (topic, level = "beginner") => {
  const response = await axiosClient.post("/ai/explain", { topic, level });
  return response.data;
};


export const generateStudyPlan = async (topic, daysAvailable, hoursPerDay) => {
  const response = await axiosClient.post("/ai/study-plan", {
    topic,
    daysAvailable,
    hoursPerDay,
  });
  return response.data;
};

export const sendChatMessage = async (message) => {
  const response = await axiosClient.post("/ai/chat", { message });
  return response.data;
};
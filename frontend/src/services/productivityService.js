import axiosClient from "../api/axiosClient";

export const startPomodoro = (data) => {
  return axiosClient.post("/pomodoro/start", data);
};

export const completePomodoro = (id, data) => {
  return axiosClient.post(`/pomodoro/${id}/complete`, data);
};

export const getPomodoroHistory = () => {
  return axiosClient.get("/pomodoro/history");
};

export const startStudySession = (data) => {
  return axiosClient.post("/study-sessions/start", data);
};

export const endStudySession = (id, data) => {
  return axiosClient.post(`/study-sessions/${id}/end`, data);
};

export const getActiveStudySession = () => {
  return axiosClient.get("/study-sessions/active");
};

export const getStudySessionHistory = () => {
  return axiosClient.get("/study-sessions/history");
};
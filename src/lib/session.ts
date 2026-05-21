import type { SessionUser } from "./types";

const SESSION_KEY = "bharat-smart-learn.session";
const isSessionUser = (value: unknown): value is SessionUser => Boolean(value && typeof value === "object" && "id" in value && "fullName" in value && "email" in value && "preferredCategories" in value);

export const defaultSessionUser: SessionUser = {
  id: "demo-user",
  fullName: "Aarav Sharma",
  email: "aarav@bharatsmart.learn",
  preferredCategories: ["Technology", "Languages"],
};

export const getSessionUser = (): SessionUser => {
  if (typeof window === "undefined") {
    return defaultSessionUser;
  }

  const rawSession = window.localStorage.getItem(SESSION_KEY);
  if (!rawSession) {
    return defaultSessionUser;
  }

  try {
    const parsed = JSON.parse(rawSession) as Partial<SessionUser>;
    if (!isSessionUser(parsed)) {
      return defaultSessionUser;
    }

    return parsed;
  } catch {
    return defaultSessionUser;
  }
};

export const hasSessionUser = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  return Boolean(window.localStorage.getItem(SESSION_KEY));
};

export const setSessionUser = (user: SessionUser) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
};

export const clearSessionUser = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(SESSION_KEY);
};

export const setLastPurchasedCourseId = (courseId: string) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem("bharat-smart-learn.last-purchase", courseId);
};

export const getLastPurchasedCourseId = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem("bharat-smart-learn.last-purchase");
};
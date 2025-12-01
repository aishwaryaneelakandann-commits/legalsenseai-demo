// src/UserContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const UserContext = createContext(null);

const STORAGE_KEY = "legalsense_user_profile";

export function UserProvider({ children }) {
  const { i18n } = useTranslation();
  const [displayName, setDisplayName] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("en");

  // Load from localStorage once
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.displayName) setDisplayName(parsed.displayName);
        if (parsed.preferredLanguage) {
          setPreferredLanguage(parsed.preferredLanguage);
          i18n.changeLanguage(parsed.preferredLanguage);
        }
      }
    } catch {
      // ignore
    }
  }, [i18n]);

  const saveProfile = (nextName, nextLang) => {
    const safeName = nextName?.trim() || "";
    const safeLang = nextLang || "en";

    setDisplayName(safeName);
    setPreferredLanguage(safeLang);

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          displayName: safeName,
          preferredLanguage: safeLang,
        })
      );
    } catch {
      // ignore
    }

    i18n.changeLanguage(safeLang);
  };

  return (
    <UserContext.Provider
      value={{
        displayName,
        preferredLanguage,
        saveProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return ctx;
}
export default UserContext;
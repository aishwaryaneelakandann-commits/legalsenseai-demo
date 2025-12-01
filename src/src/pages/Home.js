import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUser } from "../UserContext";

function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { displayName, preferredLanguage, saveProfile } = useUser();

  const [nameInput, setNameInput] = useState(displayName || "");
  const [langInput, setLangInput] = useState(preferredLanguage || "en");
  const [showProfilePopup, setShowProfilePopup] = useState(
    !displayName || displayName.trim().length === 0
  );

  const handleAvatarClick = () => {
    navigate("/chatbot");
  };

  const handleProfileSave = (e) => {
    e?.preventDefault();
    saveProfile(nameInput, langInput);
    setShowProfilePopup(false);
  };

  const greetingName =
    displayName && displayName.trim().length > 0
      ? displayName.trim()
      : t("generic_name", { defaultValue: "there" });

  const greetingText = t("home_greeting_with_name", {
    name: greetingName,
    defaultValue: `Hi ${greetingName}, how can I help you today?`,
  });

  const languageOptions = [
    { label: t("english") || "English", code: "en" },
    { label: t("tamil") || "Tamil", code: "ta" },
    { label: t("telugu") || "Telugu", code: "te" },
    { label: t("kannada") || "Kannada", code: "kn" },
    { label: t("hindi") || "Hindi", code: "hi" },
  ];

  // Shared card style so all four look same
  const commonCardStyle = {
    minHeight: "130px",
    alignItems: "flex-start",
    padding: "18px 18px",
    background:
      "linear-gradient(135deg, rgba(16,185,129,0.22), rgba(15,23,42,0.95))",
    borderRadius: "22px",
    border: "1px solid rgba(16,185,129,0.35)",
    transition: "transform 200ms ease, box-shadow 200ms ease",
  };

  return (
    <>
      <div
        className="section-container"
        style={{
          maxWidth: "720px",
          textAlign: "center",
          background:
            "radial-gradient(circle at top, rgba(16,185,129,0.22), transparent 55%), var(--color-surface)",
          borderRadius: "24px",
          padding: "40px 24px 32px",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div style={{ height: "8px" }} />

        {/* Assistant avatar (opens chatbot) */}
        <button
          onClick={handleAvatarClick}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "999px",
            padding: "6px",
          }}
          aria-label={t("open_chatbot") || "Open legal assistant chatbot"}
        >
          <div
            style={{
              width: "150px",
              height: "150px",
              borderRadius: "999px",
              background:
                "radial-gradient(circle at 30% 0%, #22c55e, #047857 45%, #022c22 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              boxShadow:
                "0 18px 45px rgba(0,0,0,0.8), 0 0 0 1px rgba(16,185,129,0.35)",
            }}
          >
            <div
              style={{
                width: "86px",
                height: "86px",
                borderRadius: "999px",
                background:
                  "radial-gradient(circle at 30% 0%, #ecfdf5, #bbf7d0 55%, #22c55e 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#022c22",
                fontSize: "3rem",
                fontWeight: 600,
                boxShadow:
                  "0 10px 28px rgba(0,0,0,0.7), inset 0 -2px 4px rgba(0,0,0,0.25)",
              }}
            >
              🤖
            </div>
          </div>
        </button>

        {/* Label under avatar so users know it is chat */}
        <div
          style={{
            marginTop: "10px",
            fontSize: "13px",
            color: "var(--color-gray-400)",
          }}
        >
          {t("tap_to_chat") || "Click anytime to chat with your legal assistant"}
        </div>

        {/* Greeting with dynamic name */}
        <h1
          style={{
            marginTop: "24px",
            marginBottom: "10px",
            fontSize: "28px",
            fontWeight: 600,
            color: "#f9fafb",
          }}
        >
          {greetingText}
        </h1>
        <p
          style={{
            marginBottom: "8px",
            fontSize: "14px",
            color: "var(--color-text-secondary)",
          }}
        >
          {t("home_tagline") ||
            "Upload a document, use your camera, speak your situation, or explore accessibility modes."}
        </p>

        {/* Small link to reopen popup */}
        <button
          type="button"
          onClick={() => setShowProfilePopup(true)}
          style={{
            marginBottom: "22px",
            border: "none",
            background: "transparent",
            color: "var(--color-primary)",
            fontSize: "12px",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          {t("edit_name_language") || "Set / change name & language"}
        </button>

        {/* Four action tiles – all use commonCardStyle */}
        <div
          className="grid grid-2"
          style={{
            gap: "18px",
            marginBottom: "10px",
          }}
        >
          {/* Upload card */}
          <Link to="/upload" style={{ textDecoration: "none" }}>
            <div className="feature-card" tabIndex={0} style={commonCardStyle}>
              <span
                style={{
                  fontSize: "10px",
                  padding: "2px 8px",
                  borderRadius: "999px",
                  backgroundColor: "rgba(16,185,129,0.18)",
                  color: "#6ee7b7",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {t("best_for_pdfs") || "Best for PDFs"}
              </span>
              <span
                className="feature-card-icon"
                style={{ marginBottom: "8px", fontSize: "22px" }}
              >
                📄
              </span>
              <h3
                className="feature-card-title"
                style={{ marginBottom: "4px", fontSize: "15px" }}
              >
                {t("upload_document") || "Upload Document"}
              </h3>
              <p
                className="feature-card-desc"
                style={{ fontSize: "12px", opacity: 0.85 }}
              >
                {t("upload_document_desc") ||
                  "Choose a PDF or image notice to analyze."}
              </p>
            </div>
          </Link>

          {/* Camera card */}
          <Link to="/camera" style={{ textDecoration: "none" }}>
            <div className="feature-card" tabIndex={0} style={commonCardStyle}>
              <span
                style={{
                  fontSize: "10px",
                  padding: "2px 8px",
                  borderRadius: "999px",
                  backgroundColor: "rgba(59,130,246,0.16)",
                  color: "#93c5fd",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {t("use_camera") || "Use your camera"}
              </span>
              <span
                className="feature-card-icon"
                style={{ marginBottom: "8px", fontSize: "22px" }}
              >
                📷
              </span>
              <h3
                className="feature-card-title"
                style={{ marginBottom: "4px", fontSize: "15px" }}
              >
                {t("use_camera") || "Use Camera"}
              </h3>
              <p
                className="feature-card-desc"
                style={{ fontSize: "12px", opacity: 0.85 }}
              >
                {t("use_camera_desc") ||
                  "Scan a paper notice directly from your phone or webcam."}
              </p>
            </div>
          </Link>

          {/* Voice card */}
          <Link to="/voice" style={{ textDecoration: "none" }}>
            <div className="feature-card" tabIndex={0} style={commonCardStyle}>
              <span
                style={{
                  fontSize: "10px",
                  padding: "2px 8px",
                  borderRadius: "999px",
                  backgroundColor: "rgba(244,114,182,0.18)",
                  color: "#f9a8d4",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {t("hands_free") || "Hands‑free"}
              </span>
              <span
                className="feature-card-icon"
                style={{ marginBottom: "8px", fontSize: "22px" }}
              >
                🎤
              </span>
              <h3
                className="feature-card-title"
                style={{ marginBottom: "4px", fontSize: "15px" }}
              >
                {t("voice_input") || "Voice Input"}
              </h3>
              <p
                className="feature-card-desc"
                style={{ fontSize: "12px", opacity: 0.85 }}
              >
                {t("voice_input_desc") ||
                  "Just explain your situation out loud to get help."}
              </p>
            </div>
          </Link>

          {/* Accessibility card */}
          <Link to="/accessibility" style={{ textDecoration: "none" }}>
            <div className="feature-card" tabIndex={0} style={commonCardStyle}>
              <span
                style={{
                  fontSize: "10px",
                  padding: "2px 8px",
                  borderRadius: "999px",
                  backgroundColor: "rgba(16,185,129,0.16)",
                  color: "#6ee7b7",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {t("accessible") || "Accessible"}
              </span>
              <span
                className="feature-card-icon"
                style={{ marginBottom: "8px", fontSize: "22px" }}
              >
                ♿
              </span>
              <h3
                className="feature-card-title"
                style={{ marginBottom: "4px", fontSize: "15px" }}
              >
                {t("accessibility_modes") || "Accessibility Modes"}
              </h3>
              <p
                className="feature-card-desc"
                style={{ fontSize: "12px", opacity: 0.85 }}
              >
                {t("accessibility_modes_desc") ||
                  "Switch to visual, audio, or sign-friendly views."}
              </p>
            </div>
          </Link>
        </div>
        {/* bottom available_features pill is removed */}
      </div>

      {/* Popup overlay */}
      {showProfilePopup && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
          aria-modal="true"
          role="dialog"
        >
          <div
            style={{
              background: "var(--color-surface)",
              borderRadius: "18px",
              padding: "18px 18px 14px",
              width: "100%",
              maxWidth: "360px",
              boxShadow: "var(--shadow-lg)",
              border: "1px solid rgba(148,163,184,0.45)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "6px",
              }}
            >
              <h2
                style={{
                  fontSize: "16px",
                  textAlign: "left",
                }}
              >
                {t("profile_popup_title") || "Personalise your assistant"}
              </h2>
              <button
                type="button"
                onClick={() => setShowProfilePopup(false)}
                aria-label={t("close") || "Close"}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "var(--color-gray-400)",
                  fontSize: "18px",
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            <p
              style={{
                fontSize: "12px",
                color: "var(--color-text-secondary)",
                marginBottom: "10px",
                textAlign: "left",
              }}
            >
              {t("profile_prompt") ||
                "Optional: tell me what to call you and choose your language."}
            </p>

            <form onSubmit={handleProfileSave}>
              <div style={{ marginBottom: "10px", textAlign: "left" }}>
                <label
                  htmlFor="nickname"
                  style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: 500,
                    marginBottom: "4px",
                    color: "var(--color-gray-400)",
                  }}
                >
                  {t("your_name_optional") || "Your name (optional)"}
                </label>
                <input
                  id="nickname"
                  type="text"
                  className="form-control"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder={t("name_placeholder") || "e.g. Aishwarya"}
                  style={{
                    backgroundColor: "rgba(15,23,42,0.9)",
                    borderColor: "rgba(148,163,184,0.5)",
                    fontSize: "13px",
                  }}
                />
              </div>

              <div style={{ marginBottom: "14px", textAlign: "left" }}>
                <label
                  htmlFor="preferredLanguage"
                  style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: 500,
                    marginBottom: "4px",
                    color: "var(--color-gray-400)",
                  }}
                >
                  {t("preferred_language") || "Preferred language"}
                </label>
                <select
                  id="preferredLanguage"
                  className="form-control"
                  value={langInput}
                  onChange={(e) => setLangInput(e.target.value)}
                  style={{
                    backgroundColor: "rgba(15,23,42,0.9)",
                    borderColor: "rgba(148,163,184,0.5)",
                    fontSize: "13px",
                  }}
                >
                  {languageOptions.map((lng) => (
                    <option key={lng.code} value={lng.code}>
                      {lng.label}
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                }}
              >
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={() => setShowProfilePopup(false)}
                >
                  {t("cancel") || "Cancel"}
                </button>
                <button type="submit" className="btn btn--primary btn--sm">
                  {t("save_profile") || "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Home;

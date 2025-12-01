import React from "react";
import { useTranslation } from "react-i18next";

function AccessibilityModes({ mode, setMode, results }) {
  const { t } = useTranslation();

  return (
    <section className="accessibility-section">
      <div className="accessibility-header">{t("accessibility_modes") || "Accessibility Modes"}</div>
      <div className="mode-row" style={{ marginTop: "2em" }}>
        <button
          className={mode === "audio" ? "accessible-btn selected" : "accessible-btn"}
          onClick={() => setMode("audio")}
        >
          {t("blind_audio") || "Blind — Audio"}
        </button>
        <button
          className={mode === "subtitle" ? "accessible-btn selected" : "accessible-btn"}
          onClick={() => setMode("subtitle")}
        >
          {t("deaf_subtitle") || "Deaf — Subtitles"}
        </button>
        <button
          className={mode === "sign" ? "accessible-btn selected" : "accessible-btn"}
          onClick={() => setMode("sign")}
        >
          {t("deaf_sign_avatar") || "Deaf-Illiterate — Sign Avatar"}
        </button>
      </div>
      <div style={{ marginTop: "2em" }}>
        {mode === "audio" && results?.audioUrl && (
          <div>
            <audio controls src={results.audioUrl} />
          </div>
        )}
        {mode === "subtitle" && results?.subtitleSRT && (
          <pre>{results.subtitleSRT}</pre>
        )}
        {mode === "sign" && (
          <div className="sign-avatar">
            {results?.signAvatarUrl ? (
              <img src={results.signAvatarUrl} alt={t("sign_avatar") || "Sign avatar"} />
            ) : (
              <div style={{ color: "#ffd600" }}>
                {t("sign_avatar_placeholder") || "Sign avatar placeholder"}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default AccessibilityModes;

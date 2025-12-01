// src/pages/Results.js
import React, { useContext, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ResultsContext } from "../ResultsContext";

function Results() {
  const { t } = useTranslation();
  const { results } = useContext(ResultsContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("raw");
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [transError, setTransError] = useState("");
  const [ttsLoading, setTTSLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [simplifiedText, setSimplifiedText] = useState("");
  const [simplifyLoading, setSimplifyLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [clarifierQs, setClarifierQs] = useState([]);
  const [clarifierAns, setClarifierAns] = useState({});
  const [clarifierLoading, setClarifierLoading] = useState(false);
  const [storyboard, setStoryboard] = useState(null);
  const [storyboardLoading, setStoryboardLoading] = useState(false);
  const [storyboardVideoUrl, setStoryboardVideoUrl] = useState(null);
  const [storyboardVideoLoading, setStoryboardVideoLoading] =
    useState(false);
  const [showPanels, setShowPanels] = useState(false);

  const audioRef = useRef(null);

  const languageOptions = [
    { label: t("english"), code: "en" },
    { label: t("tamil"), code: "ta" },
    { label: t("telugu"), code: "te" },
    { label: t("kannada"), code: "kn" },
    { label: t("hindi"), code: "hi" },
  ];

  const shortSummary =
    results.raw_text && results.raw_text.length > 0
      ? results.raw_text.slice(0, 220) +
        (results.raw_text.length > 220 ? "…" : "")
      : t("no_data");

  // ---------- API handlers ----------

  const handleStoryboard = async () => {
    setStoryboardLoading(true);
    setStoryboard(null);
    try {
      const resp = await fetch("http://localhost:8000/api/storyboard", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ text: results.raw_text }),
      });
      const data = await resp.json();
      if (data.storyboard && data.storyboard.scenes) {
        setStoryboard(data);
      }
    } catch (e) {
      console.error("Storyboard failed:", e);
    }
    setStoryboardLoading(false);
  };

  const handleStoryboardVideo = async () => {
    setStoryboardVideoLoading(true);
    setStoryboardVideoUrl(null);
    try {
      const resp = await fetch(
        "http://localhost:8000/api/storyboard-video",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ text: results.raw_text }),
        }
      );
      if (resp.ok) {
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        setStoryboardVideoUrl(url);
      } else {
        console.error("Video generation failed:", resp.status);
      }
    } catch (e) {
      console.error("Storyboard video error:", e);
    }
    setStoryboardVideoLoading(false);
  };

  const handleTranslate = async () => {
    setLoading(true);
    setTransError("");
    setTranslatedText("");
    try {
      const resp = await fetch("http://localhost:8001/translate", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          text: results.raw_text,
          target_language: targetLanguage,
        }),
      });
      const data = await resp.json();
      if (data.text) setTranslatedText(data.text);
      else setTransError(t("translation_error"));
    } catch {
      setTransError(t("translation_error"));
    }
    setLoading(false);
  };

  const handleSimplify = async () => {
    setSimplifyLoading(true);
    setSimplifiedText("");
    try {
      const resp = await fetch("http://localhost:8000/api/simplify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ text: results.raw_text }),
      });
      const data = await resp.json();
      if (data.text) setSimplifiedText(data.text);
      else setSimplifiedText(t("simplification_error"));
    } catch {
      setSimplifiedText(t("simplification_error"));
    }
    setSimplifyLoading(false);
  };

  const handleInsights = async () => {
    setInsightsLoading(true);
    setInsights(null);
    try {
      const resp = await fetch(
        "http://localhost:8000/api/legal-insights",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ text: results.raw_text }),
        }
      );
      const data = await resp.json();
      if (
        data.deadlines ||
        data.penalties ||
        data.obligations ||
        data.important_points
      ) {
        setInsights(data);
      }
    } catch (e) {
      console.error("Error fetching insights:", e);
    }
    setInsightsLoading(false);
  };

  const handleClarifier = async () => {
    setClarifierLoading(true);
    setClarifierQs([]);
    setClarifierAns({});
    try {
      const resp = await fetch("http://localhost:8000/api/clarify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ text: results.raw_text }),
      });
      const data = await resp.json();
      if (data.questions && data.questions.length) {
        setClarifierQs(data.questions);
      }
    } catch (e) {
      console.error("Error fetching clarifier:", e);
    }
    setClarifierLoading(false);
  };

  const speakText = async (text, lang) => {
    setTTSLoading(true);
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        setIsPlaying(false);
      }
      const resp = await fetch("http://localhost:8000/api/tts", {
        method: "POST",
        body: new URLSearchParams({ text, lang }),
      });
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const audio = new window.Audio(url);
      audio.onended = () => setIsPlaying(false);
      audio.play();
      setIsPlaying(true);
      audioRef.current = audio;
    } catch {
      alert(t("tts_error") || "Audio playback failed.");
    }
    setTTSLoading(false);
  };

  const pauseAudio = () => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Navigate to chatbot with one big prompt
  const goToChatWithAdvice = () => {
    const entries = Object.values(clarifierAns);
    const qaLines = entries.length
      ? entries
          .map(
            (e, i) =>
              `Q${i + 1}: ${e.question}\nA${i + 1}: ${
                e.answer === "yes" ? "Yes" : "No"
              }`
          )
          .join("\n\n")
      : null;

    const baseNotice = results.raw_text || "";

    const firstMessage = qaLines
      ? `Here is a legal notice and my answers to some clarifier questions.\n\nNotice:\n${baseNotice}\n\nMy answers:\n${qaLines}\n\nPlease give me clear, step-by-step advice based on this.`
      : `Here is a legal notice. Please explain my situation in simple terms and tell me what I can do next.\n\nNotice:\n${baseNotice}`;

    navigate("/chatbot", {
      state: {
        from: "results",
        initial_message: firstMessage,
      },
    });
  };

  // ---------- right-side tab content ----------

  const renderRightTab = () => {
    if (activeTab === "raw") {
      return (
        <>
          <div className="result-section-title">{t("raw_text")}</div>
          <div
            className="result-text"
            style={{ minHeight: 220, maxHeight: 420, overflowY: "auto" }}
          >
            {results.raw_text || t("no_data")}
          </div>
        </>
      );
    }

    if (activeTab === "simplified") {
      return (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
            }}
          >
            <div className="result-section-title">
              {t("simplified") || "Simplified version"}
            </div>
            <button
              className="btn btn--outline btn--sm"
              onClick={handleSimplify}
              disabled={simplifyLoading}
            >
              {simplifyLoading ? t("processing") : t("generate")}
            </button>
          </div>
          {simplifiedText && (
            <div className="result-text" style={{ marginTop: 12 }}>
              {simplifiedText}
            </div>
          )}
        </>
      );
    }

    if (activeTab === "translate") {
      return (
        <>
          <div className="result-section-title">
            {t("translate_to_language")}
          </div>
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "flex-end",
              flexWrap: "wrap",
              marginBottom: 12,
            }}
          >
            <div style={{ flex: 1, minWidth: 160 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 4,
                  fontWeight: 600,
                }}
              >
                {t("select_language")}
              </label>
              <select
                className="form-control"
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
              >
                {languageOptions.map((lng) => (
                  <option key={lng.code} value={lng.code}>
                    {lng.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="btn btn--primary btn--sm"
              onClick={handleTranslate}
              disabled={loading}
            >
              {loading ? t("processing") : t("translate")}
            </button>
          </div>
          {translatedText && (
            <div className="result-text">
              {translatedText}
              {!isPlaying ? (
                <button
                  className="btn btn--outline btn--sm"
                  onClick={() => speakText(translatedText, targetLanguage)}
                  disabled={ttsLoading}
                  style={{ marginTop: 10 }}
                >
                  {t("listen")}
                </button>
              ) : (
                <button
                  className="btn btn--outline btn--sm"
                  onClick={pauseAudio}
                  style={{ marginTop: 10 }}
                >
                  {t("pause")}
                </button>
              )}
            </div>
          )}
          {transError && (
            <p style={{ marginTop: 8, color: "var(--color-error)" }}>
              {transError}
            </p>
          )}
        </>
      );
    }

    if (activeTab === "clarifier") {
      const clarifierItems =
        clarifierQs && clarifierQs.length ? clarifierQs : [];

      const normalizedQuestions = clarifierItems
        .flatMap((q) =>
          typeof q === "string"
            ? q
                .split(/[.\n]/)
                .map((s) => s.trim())
                .filter(Boolean)
                .filter(
                  (s) =>
                    !s.toLowerCase().startsWith("write 5 short") &&
                    !s.toLowerCase().startsWith("use very simple")
                )
                .map((s) => (s.endsWith("?") ? s : s + "?"))
            : []
        )
        .slice(0, 5);

      return (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
            }}
          >
            <div className="result-section-title">{t("clarifier")}</div>
            <button
              className="btn btn--outline btn--sm"
              onClick={handleClarifier}
              disabled={clarifierLoading}
            >
              {clarifierLoading ? t("processing") : t("generate")}
            </button>
          </div>

          {normalizedQuestions.length > 0 && (
            <div style={{ marginTop: 16 }}>
              {normalizedQuestions.map((q, idx) => (
                <div
                  key={idx}
                  style={{
                    marginBottom: 12,
                    padding: 12,
                    borderRadius: 10,
                    background: "var(--color-secondary)",
                    borderLeft: "3px solid var(--color-primary)",
                  }}
                >
                  <p style={{ marginBottom: 8, fontWeight: 600 }}>{q}</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="btn btn--primary btn--sm"
                      onClick={() =>
                        setClarifierAns((prev) => ({
                          ...prev,
                          [idx]: { question: q, answer: "yes" },
                        }))
                      }
                    >
                      {t("yes")}
                    </button>
                    <button
                      className="btn btn--secondary btn--sm"
                      onClick={() =>
                        setClarifierAns((prev) => ({
                          ...prev,
                          [idx]: { question: q, answer: "no" },
                        }))
                      }
                    >
                      {t("no")}
                    </button>
                  </div>
                </div>
              ))}
              <button
                className="btn btn--primary"
                onClick={goToChatWithAdvice}
                style={{ marginTop: 8 }}
              >
                {t("get_advice")}
              </button>
            </div>
          )}
        </>
      );
    }

    // storyboard
    return (
      <>
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: 10,
          }}
        >
          <div className="result-section-title">Anime storyboard</div>
          <button
            className="btn btn--primary btn--sm"
            onClick={handleStoryboardVideo}
            disabled={storyboardVideoLoading}
          >
            {storyboardVideoLoading ? "Rendering video..." : "Visual video"}
          </button>
          <button
            className="btn btn--outline btn--sm"
            onClick={() => setShowPanels(!showPanels)}
          >
            {showPanels ? "Hide images" : "Show images"}
          </button>
        </div>

        {storyboard?.storyboard?.scenes && (
          <div style={{ marginTop: 8, maxHeight: 360, overflowY: "auto" }}>
            {storyboard.storyboard.scenes.map((scene, i) => (
              <div
                key={i}
                style={{
                  padding: 10,
                  borderRadius: 10,
                  background: "var(--color-secondary)",
                  borderLeft: "3px solid var(--color-primary)",
                  marginBottom: 10,
                }}
              >
                <strong>
                  Scene {i + 1}: {scene.scene_title}
                </strong>
                <p style={{ marginTop: 4 }}>{scene.visual}</p>
                <p style={{ marginTop: 4, fontStyle: "italic" }}>
                  "{scene.narration}"
                </p>
              </div>
            ))}
          </div>
        )}

        {showPanels && (
          <div
            style={{
              marginTop: 12,
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            {[1, 2, 3, 4].map((i) => (
              <img
                key={i}
                src={`http://localhost:8000/static/anime_scene${i}.png`}
                alt={`Scene ${i}`}
                style={{
                  width: "48%",
                  borderRadius: 8,
                  border: "1px solid #222",
                  objectFit: "cover",
                }}
              />
            ))}
          </div>
        )}

        {storyboardVideoUrl && (
          <div style={{ marginTop: 16 }}>
            <video
              src={storyboardVideoUrl}
              controls
              style={{
                width: "100%",
                borderRadius: 12,
                border: "2px solid var(--color-primary)",
              }}
            />
          </div>
        )}
      </>
    );
  };

  // ---------- main render ----------

  return (
    <div className="section-container">
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <h2 style={{ marginBottom: 4 }}>{t("results")}</h2>
        <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>
          A quick view of your notice with tools to simplify, translate, and
          plan next steps.
        </p>
      </div>

      {/* Summary ribbon */}
      <div
        style={{
          marginBottom: 20,
          padding: 14,
          borderRadius: 14,
          background:
            "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(37,99,235,0.10))",
          border: "1px solid rgba(16,185,129,0.45)",
          boxShadow: "0 0 0 1px rgba(15,23,42,0.6)",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "2px 10px",
            borderRadius: 999,
            background: "rgba(15,23,42,0.8)",
            border: "1px solid rgba(148,163,184,0.6)",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 6,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--color-primary)",
              marginRight: 6,
            }}
          />
          {t("summary")}
        </div>
        <p style={{ margin: 0, fontSize: 13 }}>{shortSummary}</p>
      </div>

      {/* Two-column layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 240px) minmax(0, 1fr)",
          gap: 20,
        }}
      >
        {/* Left: vertical pill tabs */}
        <div>
          {[
            { id: "raw", icon: "", label: t("raw_text") },
            { id: "simplified", icon: "", label: t("simplified") },
            { id: "translate", icon: "", label: t("translate") },
            { id: "insights", icon: "", label: t("key_points") },
            { id: "clarifier", icon: "", label: t("clarifier") },
            { id: "storyboard", icon: "", label: t("storyboard") },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${
                activeTab === tab.id ? "active" : ""
              }`.trim()}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === "insights" && !insights) handleInsights();
              }}
              style={{
                width: "100%",
                justifyContent: "flex-start",
                borderRadius: 999,
                padding: "8px 14px",
                marginBottom: 6,
                fontSize: 13,
                gap: 8,
              }}
            >
              {tab.icon && (
                <span style={{ fontSize: 14, marginRight: 4 }}>
                  {tab.icon}
                </span>
              )}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Right: glass card */}
        <div
          style={{
            padding: 18,
            borderRadius: 18,
            background:
              "radial-gradient(circle at top left, rgba(56,189,248,0.16), transparent 55%), rgba(15,23,42,0.95)",
            border: "1px solid rgba(148,163,184,0.55)",
            boxShadow:
              "0 18px 45px rgba(0,0,0,0.8), 0 0 0 1px rgba(15,23,42,0.85)",
          }}
        >
          {activeTab === "insights" && insights && (
            <>
              <div className="result-section-title">{t("key_points")}</div>

              {insights.important_points && (
                <>
                  <h4 style={{ marginTop: 10 }}>
                    {t("important_points_label")}
                  </h4>
                  <ul className="result-list">
                    {insights.important_points.map((ip, i) => (
                      <li key={i} className="result-list-item">
                        {ip}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {(insights.deadlines || insights.penalties) && (
                <>
                  <h4 style={{ marginTop: 10 }}>
                    {t("deadlines_and_penalties") ||
                      "Deadlines and Penalties"}
                  </h4>
                  <ul className="result-list">
                    {[...(insights.deadlines || []),
                      ...(insights.penalties || [])]
                      .filter(
                        (v, i, arr) => arr.indexOf(v) === i // unique only
                      )
                      .map((item, i) => (
                        <li key={i} className="result-list-item">
                          {item}
                        </li>
                      ))}
                  </ul>
                </>
              )}
            </>
          )}

          {activeTab !== "insights" && renderRightTab()}
        </div>
      </div>

      {/* Bottom buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "var(--space-2xl)",
        }}
      >
        <Link to="/upload">
          <button
            className="btn btn--primary"
            style={{ minWidth: 190, marginRight: 16 }}
          >
            {t("upload_another")}
          </button>
        </Link>
        <Link to="/">
          <button className="btn btn--secondary" style={{ minWidth: 150 }}>
            {t("back_to_home")}
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Results;

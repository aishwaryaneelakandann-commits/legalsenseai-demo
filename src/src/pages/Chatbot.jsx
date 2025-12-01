import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

function Chatbot() {
  const { i18n } = useTranslation();
  const location = useLocation();

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [translatedAnswer, setTranslatedAnswer] = useState("");
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingAsk, setLoadingAsk] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef(null);

  // Handle PDF file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0] || null;
    setSelectedFile(file);
    setUploadStatus("");
    setUploadProgress(0);
    setAnswer("");
    setTranslatedAnswer("");
  };

  // Upload + index PDF
  const handleUpload = async () => {
    if (!selectedFile || loadingUpload) return;

    setLoadingUpload(true);
    setUploadProgress(20);
    setUploadStatus("");

    try {
      const fd = new FormData();
      fd.append("file", selectedFile);

      const resp = await fetch("http://localhost:8000/api/rag/upload-pdf", {
        method: "POST",
        body: fd,
      });

      setUploadProgress(70);

      const data = await resp.json();

      if (data.error) {
        setUploadStatus(`${data.error}`);
      } else {
        setUploadProgress(100);
        setUploadStatus("Document uploaded and indexed.");
      }
    } catch (e) {
      setUploadStatus("Upload failed. Try again.");
    }

    setLoadingUpload(false);
    setTimeout(() => setUploadProgress(0), 800);
  };

  // Ask a question
  const handleAsk = async () => {
    if (!question.trim() || loadingAsk) return;

    setLoadingAsk(true);
    setAnswer("");
    setTranslatedAnswer("");

    try {
      const body = new URLSearchParams({ question: question.trim() });

      const resp = await fetch("http://localhost:8000/api/rag/ask", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });

      const data = await resp.json();
      console.log("RAG ask response:", data);

      if (data.error) {
        setAnswer(`${data.error}`);
      } else {
        setAnswer(data.answer || "No answer returned.");
      }
    } catch (e) {
      setAnswer("Error: please try again.");
    }

    setLoadingAsk(false);
  };

  // Translate the answer
  const handleTranslateAnswer = async () => {
    if (!answer || translating) return;

    setTranslating(true);

    try {
      const body = new URLSearchParams({
        text: answer,
        target_language: i18n.language || "en",
      });

      const resp = await fetch("http://localhost:8001/translate", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });

      const data = await resp.json();

      if (data && data.text) {
        setTranslatedAnswer(data.text);
      } else {
        setTranslatedAnswer("Translation failed.");
      }
    } catch (e) {
      setTranslatedAnswer("Translation failed.");
    }

    setTranslating(false);
  };

  // Voice Input
  const startVoiceInput = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = i18n.language || "en-US";

    recognition.onresult = (event) => {
      setQuestion(event.results[0][0].transcript || "");
    };

    recognition.start();
  };

  // Clear everything
  const clearChat = () => {
    setQuestion("");
    setAnswer("");
    setSelectedFile(null);
    setUploadStatus("");
    setTranslatedAnswer("");
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 1) When we arrive from Results, just set the question text
  useEffect(() => {
    const initial = location.state?.initial_message;
    if (!initial) return;
    setQuestion(initial);
  }, [location.state]);

  // 2) After question is set (and we came from Results), auto-ask once
  useEffect(() => {
    if (!question.trim()) return;
    if (location.state?.from === "results") {
      handleAsk();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  return (
    <div
      className="section-container"
      style={{
        maxWidth: "850px",
        textAlign: "left",
        background:
          "radial-gradient(circle at top, rgba(16,185,129,0.15), transparent 55%), var(--color-surface)",
      }}
    >
      {/* Title */}
      <div style={{ marginBottom: "24px", textAlign: "center" }}>
        <h1 style={{ fontSize: "26px", marginBottom: "6px" }}>
          📘 Legal Document Chatbot
        </h1>
        <p style={{ color: "var(--color-text-secondary)" }}>
          Upload your legal notice and ask questions in simple language.
        </p>
      </div>

      {/* How to Use */}
      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          padding: "16px",
          marginBottom: "20px",
          borderRadius: "12px",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <b>How to use</b>
        <ol style={{ marginTop: "10px", lineHeight: 1.6 }}>
          <li>Upload the legal notice (PDF).</li>
          <li>Type your question or use voice input.</li>
          <li>Read the simple explanation.</li>
          <li>Translate the answer to your language if needed.</li>
        </ol>
      </div>

      {/* Upload Area */}
      <label className="upload-area" style={{ cursor: "pointer" }}>
        <span className="upload-icon">📄</span>
        <p className="upload-text">Drop your PDF here or click to choose</p>
        <p className="upload-help">PDF only · Max 10 MB</p>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </label>

      {selectedFile && (
        <div
          className="file-info"
          style={{
            marginTop: "10px",
            padding: "10px",
            background: "rgba(255,255,255,0.06)",
            borderRadius: "10px",
          }}
        >
          <div>📎 {selectedFile.name}</div>
        </div>
      )}

      <button
        type="button"
        className="btn btn--primary"
        style={{ marginTop: "12px" }}
        onClick={handleUpload}
        disabled={!selectedFile || loadingUpload}
      >
        {loadingUpload ? "Uploading..." : "Upload & index"}
      </button>

      {loadingUpload && (
        <div style={{ marginTop: "10px" }}>
          <div
            style={{
              height: "6px",
              borderRadius: "4px",
              background: "rgba(255,255,255,0.1)",
            }}
          >
            <div
              style={{
                height: "6px",
                width: `${uploadProgress}%`,
                background: "#22c55e",
                borderRadius: "4px",
                transition: "0.4s",
              }}
            />
          </div>
        </div>
      )}

      {uploadStatus && (
        <p style={{ marginTop: "8px", fontSize: "13px" }}>{uploadStatus}</p>
      )}

      {/* Question Input */}
      <div style={{ marginTop: "24px" }}>
        <textarea
          rows={3}
          className="form-control"
          placeholder="Ask your question here…"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={{ minHeight: "90px" }}
        />

        <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
          <button
            type="button"
            className="btn btn--primary btn--full-width"
            onClick={handleAsk}
            disabled={loadingAsk || !question.trim()}
          >
            {loadingAsk ? "Thinking..." : "Ask"}
          </button>

          <button
            type="button"
            className="btn btn--outline"
            onClick={startVoiceInput}
          >
            🎤 Voice
          </button>
        </div>
      </div>

      {/* Answer */}
      {answer && (
        <div
          style={{
            marginTop: "24px",
            padding: "16px",
            borderRadius: "14px",
            background: "rgba(15,23,42,0.9)",
            border: "1px solid rgba(148,163,184,0.4)",
          }}
        >
          <b style={{ fontSize: "14px" }}>Assistant answer</b>
          <p style={{ marginTop: "10px", lineHeight: 1.6 }}>{answer}</p>

          <button
            className="btn btn--outline btn--sm"
            style={{ marginTop: "10px" }}
            onClick={handleTranslateAnswer}
            disabled={translating}
          >
            {translating ? "Translating..." : "Translate"}
          </button>

          {translatedAnswer && (
            <div
              style={{
                marginTop: "12px",
                padding: "10px",
                background: "rgba(15,118,110,0.4)",
                borderRadius: "10px",
              }}
            >
              {translatedAnswer}
            </div>
          )}
        </div>
      )}

      {/* Clear Chat */}
      <button
        className="btn btn--outline"
        style={{ marginTop: "30px" }}
        onClick={clearChat}
      >
        Clear chat
      </button>
    </div>
  );
}

export default Chatbot;

import React, { useState, useContext, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ResultsContext } from "../ResultsContext";

function Voice() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setResults } = useContext(ResultsContext);

  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    setError("");
    setAudioBlob(null);
    setAudioURL(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new window.MediaRecorder(stream);

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      setRecording(true);
      mediaRecorder.start();
    } catch (err) {
      setError("Microphone not available or permission denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const processAudio = async () => {
    if (!audioBlob) {
      setError(t("no_audio"));
      return;
    }
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");
    try {
      const response = await fetch("http://localhost:8000/api/stt", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.text) {
        setResults({ raw_text: data.text });
        navigate("/results");
      } else {
        setError(data.error || t("error_processing"));
      }
    } catch {
      setError(t("error_processing"));
    }
    setLoading(false);
  };

  return (
    <section className="section-card" style={{ textAlign: "center" }}>
      <h2>{t("voice_input")}</h2>
      <p>{t("voice_instruction")}</p>
      <div style={{ margin: "2em 0" }}>
        {!recording ? (
          <button className="action-btn" onClick={startRecording} disabled={loading}>
            {t("start_recording")}
          </button>
        ) : (
          <button className="action-btn" onClick={stopRecording} disabled={loading}>
            {t("stop_recording")}
          </button>
        )}
      </div>
      {audioURL && (
        <div>
          <audio src={audioURL} controls style={{ margin: "1em 0" }} />
          <button className="accessible-btn" onClick={processAudio} disabled={loading}>
            {loading ? t("processing") : t("process_voice")}
          </button>
        </div>
      )}
      {error && <div style={{ color: "#e84242", margin: "1em" }}>{error}</div>}
      <Link to="/">
        <button className="action-btn" style={{ marginTop: "1em" }}>{t("back")}</button>
      </Link>
    </section>
  );
}

export default Voice;

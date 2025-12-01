import React, { useRef, useContext, useState } from "react";
import Webcam from "react-webcam";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ResultsContext } from "../ResultsContext";
import { Link } from "react-router-dom";

function Camera() {
  const webcamRef = useRef(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setResults } = useContext(ResultsContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
 
  //capture imahe and send to backendS
  const captureAndProcess = async () => {
    setError("");
    setLoading(true);
    const imageSrc = webcamRef.current.getScreenshot();
    const response = await fetch(imageSrc);
    const blob = await response.blob();

    const formData = new FormData();
    formData.append("image", blob, "captured.jpg");

    try {
      const res = await fetch("http://localhost:8000/api/ocr", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.text) {
        setResults({ raw_text: data.text });
        navigate("/results");
      } else {
        setError(data.error || t("error_processing"));
      }
    } catch (e) {
      setError(t("error_processing"));
    }
    setLoading(false);
  };

  return (
    <section className="section-card" style={{ textAlign: "center" }}>
      <h2>{t("camera_capture")}</h2>
      <p>{t("camera_instruction")}</p>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        style={{
          borderRadius: "1.2em",
          width: "340px",
          margin: "1.2em auto"
        }}
      />
      {error && <div style={{ color: "#e84242", margin: "1em" }}>{error}</div>}
      <button
        className="action-btn"
        onClick={captureAndProcess}
        disabled={loading}
        style={{ marginTop: "1.2em", minWidth: 180 }}
      >
        {loading ? t("processing") : t("process_camera")}
      </button>
      <Link to="/">
        <button className="action-btn" style={{ marginTop: "1em" }}>{t("back")}</button>
      </Link>
    </section>
  );
}
export default Camera;

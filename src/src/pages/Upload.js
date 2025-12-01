// src/pages/Upload.js
import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ResultsContext } from "../ResultsContext";

function Upload() {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setResults } = useContext(ResultsContext);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
      setError("");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setFileName(e.dataTransfer.files[0].name);
      setError("");
    }
  };

  const handleProcess = async () => {
    if (!file) {
      setError(t("choose_file"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("lang", "eng");

      const response = await fetch("http://localhost:8000/api/ocr-file", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok && data.text) {
        setResults({ raw_text: data.text });
        navigate("/results");
      } else {
        setError(data.error || t("error_processing"));
        setLoading(false);
      }
    } catch (e) {
      setError(t("error_processing"));
      setLoading(false);
    }
  };

  return (
    <div className="section-container">
      <h2 style={{ textAlign: "center" }}>{t("upload_document")}</h2>

      <div style={{ marginTop: "var(--space-xl)" }}>
        {/* Upload box */}
        <div
          className="upload-area"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => document.getElementById("file-upload").click()}
        >
          <span className="upload-icon">📤</span>
          <p className="upload-text">
            {t("drop_here") || "Drop your document here or click to browse"}
          </p>
          <p className="upload-help">
            {t("supported_formats") ||
              "Supported formats: PDF, PNG, JPG (max 20 MB)"}
          </p>
          <input
            id="file-upload"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>

        {/* Selected file info */}
        {fileName && (
          <div className="file-info">
            <span>✓</span>
            <div>
              <p style={{ margin: 0, fontWeight: 600 }}>{fileName}</p>
              <p style={{ margin: 0, fontSize: "0.875rem", opacity: 0.9 }}>
                {file && `${(file.size / 1024).toFixed(2)} KB`}
              </p>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div
            className="alert alert-danger"
            style={{ marginTop: "var(--space-lg)" }}
          >
            <span className="alert-icon">⚠️</span>
            <p className="alert-message">{error}</p>
          </div>
        )}

        {/* Action buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "var(--space-2xl)",
          }}
        >
          <button
            className="btn btn--primary"
            onClick={handleProcess}
            disabled={loading}
            style={{ minWidth: "190px" }}
          >
            {loading ? t("processing") : t("process_document")}
          </button>

          <Link to="/" style={{ marginLeft: "16px" }}>
            <button
              className="btn btn--secondary"
              type="button"
              style={{ minWidth: "130px" }}
            >
              ← {t("back")}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Upload;

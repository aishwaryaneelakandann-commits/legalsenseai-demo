import React from "react";
import { useTranslation } from "react-i18next";
import { LANGUAGE_OPTIONS } from "./i18n";

function Header() {
  const { i18n, t } = useTranslation();

  const handleLangChange = (e) => {
    const lng = e.target.value;
    i18n.changeLanguage(lng);
  };

  return (
    <header className="app-header">
      <div className="app-header-brand">
        <a href="/" className="app-header-logo">
          LegalSenseAI
        </a>
        <span className="text-muted">
          {t("legal_document_analysis") || "Legal Document Analysis"}
        </span>
      </div>

      <div className="app-header-nav">
        <div className="lang-select-wrapper">
          <select
            className="form-control lang-select"
            value={i18n.language || "en"}
            onChange={handleLangChange}
            aria-label={t("choose_lang") || "Choose language"}
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.code} value={opt.code}>
                {t(opt.label)}
              </option>
            ))}
          </select>
          <span className="lang-select-arrow">▾</span>
        </div>
      </div>
    </header>
  );
}

export default Header;

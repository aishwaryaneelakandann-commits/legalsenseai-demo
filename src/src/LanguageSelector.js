import React from "react";

const languages = [
  { code: "en", label: "English" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "kn", label: "Kannada" },
  { code: "hi", label: "Hindi" },
];

function LanguageSelector({ language, setLanguage }) {
  return (
    <div style={{ position: 'absolute', top: 18, right: 18 }}>
      <select value={language} onChange={e => setLanguage(e.target.value)}>
        {languages.map(lang => (
          <option key={lang.code} value={lang.code}>{lang.label}</option>
        ))}
      </select>
    </div>
  );
}

export default LanguageSelector;

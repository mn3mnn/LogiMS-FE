import React from "react";
import { useTranslation } from "react-i18next";

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  };

  return (
    <div style={{ display: "flex", gap: 10, padding: 10 }}>
      <button onClick={() => changeLanguage("en")}>English</button>
      <button onClick={() => changeLanguage("de")}>Deutsch</button>
      <button onClick={() => changeLanguage("ar")}>العربية</button>
    </div>
  );
};

export default LanguageSwitcher;

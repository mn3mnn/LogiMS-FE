import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dropdown } from "../ui/dropdown/Dropdown";

export default function LanguageDropdown() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center gap-2 text-gray-500 transition-all duration-200 bg-white border border-gray-200 rounded-lg dropdown-toggle hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300 h-11 px-3 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white dark:hover:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ffb433] focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        onClick={toggleDropdown}
        title={`${t('userDropdown.menu.language')}: ${currentLanguage.name}`}
        aria-label={`${t('userDropdown.menu.language')}: ${currentLanguage.name}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg
          className="w-5 h-5 text-gray-600 dark:text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
          />
        </svg>
        <span className="hidden sm:inline-block text-sm font-medium text-gray-700 dark:text-gray-300">
          {currentLanguage.code.toUpperCase()}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
      >
        <div className="py-1">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm text-left rounded-lg transition-all duration-150 ${
                currentLanguage.code === language.code
                  ? "bg-[#fff6ed] text-[#cc8c29] font-medium dark:bg-[#99641f]/30 dark:text-[#feb273]"
                  : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
              }`}
              role="menuitem"
              aria-label={`Switch to ${language.name}`}
            >
              <span className="text-lg leading-none flex-shrink-0" role="img" aria-hidden="true">{language.flag}</span>
              <span className="flex-1">{language.name}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{language.code.toUpperCase()}</span>
              {currentLanguage.code === language.code && (
                <svg
                  className="w-4 h-4 flex-shrink-0 fill-current text-[#ffb433] dark:text-[#feb273]"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M16.7071 5.29289C17.0976 5.68342 17.0976 6.31658 16.7071 6.70711L8.70711 14.7071C8.31658 15.0976 7.68342 15.0976 7.29289 14.7071L3.29289 10.7071C2.90237 10.3166 2.90237 9.68342 3.29289 9.29289C3.68342 8.90237 4.31658 8.90237 4.70711 9.29289L8 12.5858L15.2929 5.29289C15.6834 4.90237 16.3166 4.90237 16.7071 5.29289Z"
                    fill="currentColor"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      </Dropdown>
    </div>
  );
}


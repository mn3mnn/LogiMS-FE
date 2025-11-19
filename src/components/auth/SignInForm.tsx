import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import config from "../../config/env";

export default function SignInForm() {
  const { t, i18n } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError(t("error"));
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${config.API_BASE_URL}/auth-token/`, {
        username: email,
        password,
      });

      const token = response.data.token;
      if (token) {
        login(token);
        navigate("/");
      } else {
        setError(t("error"));
      }
    } catch (err: any) {
      console.error(err);
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsLanguageDropdownOpen(false);
  };

  const toggleLanguageDropdown = () => {
    setIsLanguageDropdownOpen(!isLanguageDropdownOpen);
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              {t("title")}
            </h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <Label>
                  {t("email")} <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder={t("email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label>
                  {t("password")} <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={t("password")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox checked={isChecked} onChange={setIsChecked} />
                  <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                    {t("keepLoggedIn") || ""}
                  </span>
                </div>
                <Link
                  to="/reset-password"
                  className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  {t("forgotPassword") || ""}
                </Link>
              </div>

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              <div>
                <Button
                  className="w-full"
                  size="sm"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? t("login") + "..." : t("login")}
                </Button>
              </div>

              {/* Language Switcher Section */}
              <div className="pt-4 mt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <button
                    type="button"
                    onClick={toggleLanguageDropdown}
                    className="flex items-center justify-between w-full px-4 py-3 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800/50 dark:bg-gray-800"
                  >
                    <div className="flex items-center gap-3">
                      <svg
                        className="fill-gray-500 dark:fill-gray-400"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM4 12c0-1.846.634-3.542 1.688-4.897l2.423 2.423A4.98 4.98 0 007 12h2a3 3 0 013 3v1.931A8.002 8.002 0 014 12zm14.312 4.897l-2.423-2.423A4.98 4.98 0 0117 12h-2a3 3 0 00-3-3V7.069A8.002 8.002 0 0120 12c0 1.846-.634 3.542-1.688 4.897zM12 20a7.96 7.96 0 01-4.931-1.707L9.536 15.75A1 1 0 0110.5 15h3a1 1 0 011 1v2.536A7.96 7.96 0 0112 20z"
                          fill="currentColor"
                        />
                      </svg>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {currentLanguage.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{currentLanguage.flag}</span>
                      <svg
                        className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
                          isLanguageDropdownOpen ? "rotate-180" : ""
                        }`}
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M4 6L8 10L12 6"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </button>

                  {/* Language Dropdown */}
                  {isLanguageDropdownOpen && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700 z-10">
                      <div className="py-1">
                        {languages.map((language) => (
                          <button
                            key={language.code}
                            type="button"
                            onClick={() => changeLanguage(language.code)}
                            className={`flex items-center gap-3 w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-white/5 ${
                              currentLanguage.code === language.code
                                ? "bg-[#fff6ed] text-[#ffb433] dark:bg-[#99641f]/20 dark:text-[#feb273]"
                                : "text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            <span className="text-base">{language.flag}</span>
                            <span>{language.name}</span>
                            {currentLanguage.code === language.code && (
                              <svg
                                className="w-4 h-4 ml-auto fill-current text-[#ffb433] dark:text-[#feb273]"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
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
                    </div>
                  )}
                </div>
                <p className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
                  Choose your preferred language
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
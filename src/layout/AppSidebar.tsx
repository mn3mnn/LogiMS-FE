import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { 
  HiOutlineHome, 
  HiOutlineUsers, 
  HiOutlineCloudUpload, 
  HiOutlineCurrencyDollar,
  HiOutlineMap
} from "react-icons/hi";

import {
  ChevronDownIcon,
  HorizontaLDots,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";

type NavItem = {
  nameKey: string;
  icon: React.ReactNode;
  path?: string;
  pro?: boolean;
  new?: boolean;
  children?: { nameKey: string; path: string }[];
};

const AppSidebar: React.FC = () => {
  const { t } = useTranslation();
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const navItems: NavItem[] = [
    {
      icon: <HiOutlineHome className="w-5 h-5" />,
      nameKey: "sidebar.dashboard",
      path: "/",
    },
    {
      nameKey: "sidebar.drivers",
      icon: <HiOutlineUsers className="w-5 h-5" />,
      path: "/basic-tables",
    },
    {
      nameKey: "sidebar.fileUploads",
      icon: <HiOutlineCloudUpload className="w-5 h-5" />,
      path: "/uploads",
    },
    {
      nameKey: "sidebar.payroll",
      icon: <HiOutlineCurrencyDollar className="w-5 h-5" />,
      path: "/payroll/records",
    },
    {
      nameKey: "sidebar.trips",
      icon: <HiOutlineMap className="w-5 h-5" />,
      path: "/trips/records",
    },
  ];

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.nameKey}>
          {nav.children ? (
            <>
              <button
                onClick={() => handleSubmenuToggle(index, menuType)}
                className={`menu-item group ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-active"
                    : "menu-item-inactive"
                } w-full text-left`}
              >
                <span className={`menu-item-icon-size ${"menu-item-icon-inactive"}`}>
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text flex items-center gap-2">
                    {t(nav.nameKey)}
                    <ChevronDownIcon
                      className={`ml-auto transition-transform ${
                        openSubmenu?.type === menuType && openSubmenu?.index === index
                          ? "rotate-180"
                          : "rotate-0"
                      }`}
                    />
                  </span>
                )}
              </button>

              <div
                ref={(el) => {
                  const key = `${menuType}-${index}`;
                  subMenuRefs.current[key] = el;
                }}
                className="overflow-hidden transition-[height] duration-300"
                style={{
                  height:
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? subMenuHeight[`${menuType}-${index}`] || 'auto'
                      : 0,
                }}
              >
                <ul className="mt-2 ml-12 flex flex-col gap-2">
                  {nav.children.map((child) => (
                    <li key={child.nameKey}>
                      <Link
                        to={child.path}
                        className={`menu-item group ${
                          isActive(child.path)
                            ? "menu-item-active"
                            : "menu-item-inactive"
                        }`}
                      >
                        <span className="menu-item-text">{t(child.nameKey)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <Link
              to={nav.path as string}
              className={`menu-item group ${
                isActive(nav.path as string) ? "menu-item-active" : "menu-item-inactive"
              }`}
            >
              <span
                className={`menu-item-icon-size ${
                  isActive(nav.path as string)
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text flex items-center gap-2">
                  {t(nav.nameKey)}
                  {nav.new && (
                    <span
                      className={`ml-auto ${
                        isActive(nav.path as string)
                          ? "menu-dropdown-badge-active"
                          : "menu-dropdown-badge-inactive"
                      } menu-dropdown-badge`}
                    >
                      new
                    </span>
                  )}
                  {nav.pro && (
                    <span
                      className={`ml-auto ${
                        isActive(nav.path as string)
                          ? "menu-dropdown-badge-active"
                          : "menu-dropdown-badge-inactive"
                      } menu-dropdown-badge`}
                    >
                      pro
                    </span>
                  )}
                </span>
              )}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/kresh-logo.png"
                alt="Kresh GmbH MS"
                width={150}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/kresh-logo.png"
                alt="Kresh GmbH MS"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/kresh-logo-icon.png"
              alt="Kresh GmbH MS"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  t("sidebar.menu")
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
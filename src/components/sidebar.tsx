import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Car,
  Users,
  LogOut,
  Menu,
  X,
  User,
  FileText,
  Smartphone,
  Globe2Icon,
} from "lucide-react";
import { useSelector } from "react-redux";
import { GB, PT, FR, ES } from "country-flag-icons/react/3x2";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Sidebar({ onLogout }: { onLogout: () => void }) {
  const { t, i18n } = useTranslation();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const userRole = useSelector((state: any) => state.auth.user?.role);

  console.log(userRole);

  const navItems = [
    ...(userRole === "superadmin"
      ? [
          {
            href: "/dashboard/super",
            icon: Home,
            label: t("sidebar.superAdmin"),
          },
        ]
      : []),
    {
      href: "/dashboard/clients",
      label: t("sidebar.clients"),
      icon: Users,
      adminOnly: true,
    },
    { href: "/dashboard", icon: Home, label: t("sidebar.dashboard") },
    { href: "/dashboard/vehicles", icon: Car, label: t("sidebar.vehicles") },
    { href: "/dashboard/drivers", icon: Users, label: t("sidebar.drivers") },
    // {
    //   href: "/dashboard/devices",
    //   icon: Smartphone,
    //   label: t("sidebar.devices"),
    // },
    {
      href: "/dashboard/licenses",
      icon: FileText,
      label: t(
        userRole === "superadmin"
          ? "sidebar.clientLicenses"
          : "sidebar.buyLicenses"
      ),
    },
    {
      href: "/dashboard/onboard",
      icon: FileText,
      label: t("sidebar.onboard"),
    },
    { href: "/dashboard/account", icon: User, label: t("sidebar.myAccount") },
  ].filter((link) => !link.adminOnly || userRole === "superadmin");

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const sidebar = document.getElementById("sidebar");
      if (
        isMobileMenuOpen &&
        sidebar &&
        !sidebar.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isMobileMenuOpen]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const getCurrentLanguageFlag = () => {
    const currentLang = i18n.language;

    switch (currentLang) {
      case "en":
        return <GB className="h-5 w-5" />;
      case "es":
        return <ES className="h-5 w-5" />;
      case "pt-PT":
        return <PT className="h-5 w-5" />;
      case "fr":
        return <FR className="h-5 w-5" />;
      default:
        return <GB className="h-5 w-5" />;
    }
  };

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-yellow-600 text-white hover:bg-yellow-700 transition-colors duration-200"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label={
          isMobileMenuOpen ? t("sidebar.closeMenu") : t("sidebar.openMenu")
        }
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <div
        id="sidebar"
        className={`fixed inset-y-0 left-0 transform ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 transition duration-300 ease-in-out z-50 md:z-0`}
      >
        <div className="flex h-full w-64 flex-col bg-gray-900 text-white shadow-lg">
          <div className="flex flex-row gap-4 items-center justify-center h-auto py-4 border-b">
            <div>
              <Image
                src="/logo.jpeg"
                alt={t("login.logoAlt")}
                width={100}
                height={100}
                className="rounded-full border-2 border-white"
                quality={100}
                unoptimized
              />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold">GO UP</span>
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto pt-5">
            <div className="px-6 py-2 flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {t("sidebar.menu")}
              </span>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center px-2 py-1 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-200">
                    {getCurrentLanguageFlag()}
                    <span className="ml-2 text-xs">{t("language.select")}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-gray-800 text-white border-gray-700">
                  <DropdownMenuItem onClick={() => changeLanguage("en")} className="flex items-center gap-2 hover:bg-gray-700">
                    <GB className="h-4 w-5" /> {t("language.english")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changeLanguage("es")} className="flex items-center gap-2 hover:bg-gray-700">
                    <ES className="h-4 w-5" /> {t("language.spanish")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changeLanguage("pt-PT")} className="flex items-center gap-2 hover:bg-gray-700">
                    <PT className="h-4 w-5" /> {t("language.portuguesePT")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changeLanguage("fr")} className="flex items-center gap-2 hover:bg-gray-700">
                    <FR className="h-4 w-5" /> {t("language.french")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <ul className="mt-4 space-y-1">
              {navItems.map((item) => (
                <li key={item.href} className="px-3">
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-lg transition-colors duration-200 ${
                      pathname === item.href
                        ? "bg-yellow-600 text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onLogout();
              }}
              className="flex items-center w-full px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-200"
            >
              <LogOut className="mr-3 h-5 w-5" />
              <span className="font-medium">{t("sidebar.logout")}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
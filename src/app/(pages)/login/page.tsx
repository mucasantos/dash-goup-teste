"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, User, Globe2Icon } from "lucide-react";
import { useLoginMutation } from "@/lib/redux/services/authApi";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/lib/redux/authSlice";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ApiError } from "@/utils/errorHandler";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RegistrationModal } from "@/components/modals/RegistrationModal";
import { ResetPasswordModal } from "@/components/modals/ResetPasswordModal";
import { ForgotPasswordModal } from "@/components/modals/ForgotPasswordModal";
import { GB, ES, PT, FR } from "country-flag-icons/react/3x2";

interface LoginFormInputs {
  username: string;
  password: string;
}

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<LoginFormInputs>();
  const [apiError, setApiError] = useState<string | JSX.Element | null>(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const parseErrorMessage = (html: string) => {
    if (html.includes("verification_action=resend_verification")) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const link = doc.querySelector("a")?.href;
      const textContent = stripHtmlTags(html);
      return { isVerification: true, link, message: textContent };
    }
    return { isVerification: false, message: stripHtmlTags(html) };
  };

  const stripHtmlTags = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      setApiError(null);
      const result = await login({
        ...data,
        language: i18n.language,
      }).unwrap();

      dispatch(
        setCredentials({
          user: result.user,
          token: result.token,
          token_goup: result.token_goup,
          goup_nicename: result.goup_nicename,
          goup_display_name: result.goup_display_name,
        })
      );
      toast.success(t("login.successMessage"), { duration: 3000 });
      if (result.user.role === "superadmin") {
        router.push("/dashboard/super");
      } else {
        router.push("/dashboard");
      }
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.data && typeof apiError.data === "object") {
        if ("haveToCreate" in apiError.data && apiError.data.haveToCreate) {
          setShowRegistrationModal(true);
        } else if (
          "code" in apiError.data &&
          apiError.data.code === "[jwt_auth] incorrect_password"
        ) {
          setApiError(t("login.incorrectPassword"));
        } else {
          const errorMessage =
            typeof apiError.data.message === "string"
              ? apiError.data.message
              : t("login.unexpectedError");

          const parsedError = parseErrorMessage(errorMessage);

          if (parsedError.isVerification) {
            setApiError(
              <div className="flex flex-col items-center gap-4">
                <span>{parsedError.message}</span>
                <Button
                  variant="outline"
                  onClick={() => window.open(parsedError.link, "_blank")}
                  className="mt-2"
                >
                  {t("login.resendVerification")}
                </Button>
              </div>
            );
          } else {
            setApiError(parsedError.message);
          }
        }
      } else {
        setApiError(t("login.unexpectedError"));
      }
    }
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const getCurrentLanguageFlag = () => {
    const currentLang = i18n.language;

    switch (currentLang) {
      case "en":
        return <GB className="h-5 w-6" />;
      case "es":
        return <ES className="h-5 w-6" />;
      case "pt-PT":
        return <PT className="h-5 w-6" />;
      case "fr":
        return <FR className="h-5 w-6" />;
      default:
        return <GB className="h-5 w-6" />;
    }
  };

  const handleRegistrationSuccess = () => {
    setShowRegistrationModal(false);
    onSubmit(getValues());
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between mb-4">
            <Image
              src="/logo.jpeg"
              alt={t("login.logoAlt")}
              width={100}
              height={100}
              className="rounded-full border-2 border-white"
              quality={100}
              unoptimized
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2 px-3">
                  {getCurrentLanguageFlag()}
                  <span className="text-sm">{t("language.select")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => changeLanguage("en")} className="flex items-center gap-2">
                  <GB className="h-4 w-6" /> {t("language.english")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage("es")} className="flex items-center gap-2">
                  <ES className="h-4 w-6" /> {t("language.spanish")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage("pt-PT")} className="flex items-center gap-2">
                  <PT className="h-4 w-6" /> {t("language.portuguesePT")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage("fr")} className="flex items-center gap-2">
                  <FR className="h-4 w-6" /> {t("language.french")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {t("login.title")}
          </CardTitle>
          <CardDescription className="text-center">
            {t("login.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {apiError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">{t("login.usernameLabel")}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="username"
                    placeholder={t("login.usernamePlaceholder")}
                    type="text"
                    {...register("username", {
                      required: t("login.usernameRequired"),
                    })}
                    className="pl-10"
                  />
                </div>
                {errors.username && (
                  <p className="text-red-500 text-sm">
                    {errors.username.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t("login.passwordLabel")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    {...register("password", {
                      required: t("login.passwordRequired"),
                    })}
                    className="pl-10"
                  />
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>
            <Button type="submit" className="w-full mt-6" disabled={isLoading}>
              {isLoading ? t("login.loggingIn") : t("login.loginButton")}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowForgotPasswordModal(true)}
              className="text-blue-500 hover:underline"
            >
              {t("login.forgotPassword")}
            </button>
          </div>
        </CardContent>
      </Card>
      <RegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        email={getValues("username")}
        password={getValues("password")}
        onSuccess={handleRegistrationSuccess}
      />
      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
        onSuccess={(email) => {
          setRecoveryEmail(email);
          setShowForgotPasswordModal(false);
          setShowResetPasswordModal(true);
        }}
      />
      <ResetPasswordModal
        isOpen={showResetPasswordModal}
        onClose={() => setShowResetPasswordModal(false)}
        email={recoveryEmail}
        onSuccess={() => {
          setShowResetPasswordModal(false);
          toast.success(t("login.resetSuccess"));
        }}
      />
    </div>
  );
}

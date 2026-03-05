"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { useResetPasswordMutation } from "@/lib/redux/services/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onSuccess: () => void;
}

interface ResetPasswordFormInputs {
  code: string;
  password: string;
}

export function ResetPasswordModal({
  isOpen,
  onClose,
  email,
  onSuccess,
}: ResetPasswordModalProps) {
  const { t } = useTranslation();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [apiError, setApiError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormInputs>();

  const onSubmit = async (data: ResetPasswordFormInputs) => {
    try {
      setApiError(null);
      await resetPassword({
        email,
        code: data.code,
        password: data.password,
      }).unwrap();
      onSuccess();
    } catch (error) {
      console.error("Reset password error:", error);
      setApiError(t("login.unexpectedError"));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("login.resetPasswordTitle")}</DialogTitle>
          <DialogDescription>
            {t("login.resetPasswordDescription")}
          </DialogDescription>
        </DialogHeader>
        
        {apiError && (
          <Alert variant="destructive">
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">{t("login.codeLabel")}</Label>
            <Input
              id="code"
              type="text"
              placeholder={t("login.codePlaceholder")}
              {...register("code", {
                required: t("login.codeRequired"),
              })}
            />
            {errors.code && (
              <p className="text-red-500 text-sm">{errors.code.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">{t("login.newPasswordLabel")}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t("login.newPasswordPlaceholder")}
              {...register("password", {
                required: t("login.newPasswordRequired"),
              })}
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              {t("account.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t("account.saving") : t("login.resetButton")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
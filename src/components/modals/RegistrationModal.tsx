"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from 'lucide-react';
import { useRegisterMutation } from "@/lib/redux/services/authApi";
import MaskedInput from "@/components/MaskedInput";
import { RequiredFieldIndicator } from "@/components/RequiredFieldIndicator";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from 'lucide-react';
import { countryCodes } from "@/data/countries";
import { cn } from "@/utils/cn";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  password: string;
  onSuccess: () => void;
}

interface RegistrationFormInputs {
  nome_razao_social: string;
  nif_nipc: string;
  endereco: string;
  cidade: string;
  pais: string;
  contacto: string;
  whatsapp: string;
}

export function RegistrationModal({
  isOpen,
  onClose,
  email,
  password,
  onSuccess,
}: RegistrationModalProps) {
  const { t, i18n } = useTranslation();
  const [register, { isLoading }] = useRegisterMutation();
  const [apiError, setApiError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegistrationFormInputs>({
    defaultValues: {
      nome_razao_social: "",
      nif_nipc: "",
      endereco: "",
      cidade: "",
      pais: "",
      contacto: "",
      whatsapp: "",
    },
  });

  const onSubmit = async (data: RegistrationFormInputs) => {
    try {
      setApiError(null);
      const submitData = {
        ...data,
        email,
        password,
        language: i18n.language,
        ativa: false,
      };
      await register(submitData).unwrap();
      onSuccess();
    } catch (error: any) {
      setApiError(error.data?.message || t("registration.unexpectedError"));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t("registration.modalTitle")}</DialogTitle>
          <DialogDescription>
            {t("registration.modalDescription")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome_razao_social">
                {t("registration.companyName")}
                <RequiredFieldIndicator />
              </Label>
              <Controller
                name="nome_razao_social"
                control={control}
                rules={{ required: t("registration.required") }}
                render={({ field }) => <Input {...field} />}
              />
              {errors.nome_razao_social && (
                <p className="text-red-500 text-sm">
                  {errors.nome_razao_social.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nif_nipc">
                {t("registration.taxId")}
                <RequiredFieldIndicator />
              </Label>
              <Controller
                name="nif_nipc"
                control={control}
                rules={{ required: t("registration.required") }}
                render={({ field }) => {
                  const selectedCountry = watch("pais");
                  const getNifMask = (country: string) => {
                    switch (country) {
                      case "PT":
                        return "999999999";
                      case "ES":
                        return "*********"; // Spain NIF can be mixed
                      case "FR":
                        return "**************"; // SIRET is 14 digits
                      default:
                        return "***************"; // Generic longer mask
                    }
                  };
                  return (
                    <MaskedInput
                      mask={getNifMask(selectedCountry)}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  );
                }}
              />
              {errors.nif_nipc && (
                <p className="text-red-500 text-sm">
                  {errors.nif_nipc.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco">
              {t("registration.address")}
              <RequiredFieldIndicator />
            </Label>
            <Controller
              name="endereco"
              control={control}
              rules={{ required: t("registration.required") }}
              render={({ field }) => <Input {...field} />}
            />
            {errors.endereco && (
              <p className="text-red-500 text-sm">{errors.endereco.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cidade">
                {t("registration.city")}
                <RequiredFieldIndicator />
              </Label>
              <Controller
                name="cidade"
                control={control}
                rules={{ required: t("registration.required") }}
                render={({ field }) => <Input {...field} />}
              />
              {errors.cidade && (
                <p className="text-red-500 text-sm">{errors.cidade.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pais">
                {t("registration.country")}
                <RequiredFieldIndicator />
              </Label>
              <Controller
                name="pais"
                control={control}
                rules={{ required: t("registration.required") }}
                render={({ field }) => (
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                      >
                        {field.value
                          ? t(`countries.${field.value}`)
                          : t("registration.selectCountry")}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput
                          placeholder={t("registration.searchCountry")}
                        />
                        <CommandList>
                          <CommandEmpty>
                            {t("registration.noCountryFound")}
                          </CommandEmpty>
                          <CommandGroup>
                            {countryCodes.map((code) => (
                              <CommandItem
                                key={code}
                                onSelect={() => {
                                  field.onChange(code);
                                  setOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    code === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {t(`countries.${code}`)}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.pais && (
                <p className="text-red-500 text-sm">{errors.pais.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contacto">
                {t("registration.contact")}
                <RequiredFieldIndicator />
              </Label>
              <Controller
                name="contacto"
                control={control}
                rules={{ required: t("registration.required") }}
                render={({ field }) => <Input {...field} type="tel" />}
              />
              {errors.contacto && (
                <p className="text-red-500 text-sm">{errors.contacto.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">
                {t("registration.whatsapp")}
              </Label>
              <Controller
                name="whatsapp"
                control={control}
                render={({ field }) => <Input {...field} type="tel" />}
              />
              {errors.whatsapp && (
                <p className="text-red-500 text-sm">{errors.whatsapp.message}</p>
              )}
            </div>
          </div>

          {apiError && (
            <Alert variant="destructive">
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("registration.registering")}
                </>
              ) : (
                t("registration.register")
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

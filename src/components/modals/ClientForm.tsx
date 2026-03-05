"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";
import type { Client } from "@/types/client";
import { RequiredFieldIndicator } from "@/components/RequiredFieldIndicator";
import { countryToCode, codeToCountry } from "@/data/countries";
import { cn } from "@/utils/cn";
import { useCreateClientMutation, useUpdateClientMutation } from "@/lib/redux/services/empresaApi";
import { toast } from "react-hot-toast";
import { handleApiError } from "@/utils/errorHandler";

interface ClientFormProps {
  data?: Client;
  onSave: () => Promise<void>;
  onCancel: () => void;
}

export function ClientForm({ data, onSave, onCancel }: ClientFormProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [createClient] = useCreateClientMutation();
  const [updateClient] = useUpdateClientMutation();
  const countries = Object.entries(countryToCode);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Partial<Client>>({
    defaultValues: {
      nome_razao_social: "",
      nif_nipc: "",
      endereco: "",
      cidade: "",
      pais: "",
      contacto: "",
      whatsapp: "",
      email: "",
      status: true,
      password: "",
    },
  });

  useEffect(() => {
    if (data) {
      const countryCode = data.pais
        ? countryToCode[data.pais] || data.pais
        : "";
      reset({
        ...data,
        pais: countryCode,
        password: "",
      });
    }
  }, [data, reset]);

  const onSubmit = async (formData: Partial<Client>) => {
    try {
      if (data?.id) {
        await updateClient({ id: data.id, ...formData }).unwrap();
        toast.success(t("clients.updateSuccess"));
      } else {
        await createClient(formData).unwrap();
        toast.success(t("clients.createSuccess"));
      }
      await onSave();
    } catch (error) {
      handleApiError(error);
    }
  };

  return (
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
            render={({ field }) => <Input {...field} />}
          />
          {errors.nif_nipc && (
            <p className="text-red-500 text-sm">{errors.nif_nipc.message}</p>
          )}
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
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput
                      placeholder={t("registration.searchCountry")}
                    />
                    <CommandList>
                      <CommandEmpty>
                        {t("registration.noCountryFound")}
                      </CommandEmpty>
                      <CommandGroup>
                        {Object.keys(
                          t("countries", { returnObjects: true })
                        ).map((code) => (
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

        <div className="space-y-2">
          <Label htmlFor="contacto">
            {t("registration.contact")}
            <RequiredFieldIndicator />
          </Label>
          <Controller
            name="contacto"
            control={control}
            rules={{ required: t("registration.required") }}
            render={({ field }) => <Input {...field} />}
          />
          {errors.contacto && (
            <p className="text-red-500 text-sm">{errors.contacto.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp">{t("registration.whatsapp")}</Label>
          <Controller
            name="whatsapp"
            control={control}
            render={({ field }) => <Input {...field} />}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            {t("clients.email")}
            <RequiredFieldIndicator />
          </Label>
          <Controller
            name="email"
            control={control}
            rules={{
              required: t("registration.required"),
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: t("clients.invalidEmail"),
              },
            }}
            render={({ field }) => <Input {...field} type="email" />}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">
            {t("clients.password")}
            {!data?.id && <RequiredFieldIndicator />}
          </Label>
          <Controller
            name="password"
            control={control}
            rules={{ 
              required: data?.id ? false : t("registration.required"),
              minLength: {
                value: 6,
                message: t("clients.passwordTooShort")
              } 
            }}
            render={({ field }) => (
              <Input 
                {...field}
                type="password" 
                placeholder={data?.id ? t("clients.passwordHint") : ""}
                value={field.value || ""}
              />
            )}
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password?.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>{t("clients.status")}</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <span>
                  {field.value ? t("clients.active") : t("clients.inactive")}
                </span>
              </div>
            )}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button type="submit">{t("common.save")}</Button>
      </div>
    </form>
  );
}

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Vehicle } from "@/types/vehicle";
import {
  useGetViaturaByIdQuery,
  useAddViaturaMutation,
  useUpdateViaturaMutation,
  useGetClientsQuery,
} from "@/lib/redux/services/empresaApi";
import { handleApiError } from "@/utils/errorHandler";
import { RequiredFieldIndicator } from "../RequiredFieldIndicator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSelector } from "react-redux";

interface VehicleFormProps {
  id?: number | null;
  onSave: () => void;
}

export function VehicleForm({ id, onSave }: VehicleFormProps) {
  const { t } = useTranslation();
  const userRole = useSelector((state: any) => state.auth.user?.role);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  
  const { data: clientsResponse } = useGetClientsQuery(undefined, {
    skip: userRole !== "superadmin",
  });

  const clients = clientsResponse?.clientes?.filter(client => client.status) || [];

  const { data: vehicleData, isLoading: isLoadingVehicle } =
    useGetViaturaByIdQuery(id ?? 0, { skip: !id });
  const [addViatura, { isLoading: isAdding }] = useAddViaturaMutation();
  const [updateViatura, { isLoading: isUpdating }] = useUpdateViaturaMutation();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const { control, handleSubmit, reset, watch } = useForm<
    Omit<Vehicle, "id" | "id_empresa"> & { foto: FileList | null }
  >({
    defaultValues: {
      marca: "",
      modelo: "",
      motorizacao: "",
      anoFabricacao: undefined,
      kmInicial: undefined,
      tipoCombustivel: "",
      dataVencimentoIUC: "",
      capacidadeViatura: "",
      placa: "",
      foto: null,
    },
  });

  useEffect(() => {
    if (vehicleData) {
      reset({
        marca: vehicleData.marca || "",
        modelo: vehicleData.modelo || "",
        motorizacao: vehicleData.motorizacao || "",
        anoFabricacao: vehicleData.anoFabricacao,
        kmInicial: vehicleData.kmInicial,
        tipoCombustivel: vehicleData.tipoCombustivel || "",
        dataVencimentoIUC: vehicleData.dataVencimentoIUC || "",
        capacidadeViatura: vehicleData.capacidadeViatura || "",
        placa: vehicleData.placa || "",
        foto: null,
      });

      setPhotoPreview(
        typeof vehicleData.foto === "string" ? vehicleData.foto : null
      );
    }
  }, [vehicleData, reset]);

  useEffect(() => {
    if (vehicleData?.id_empresa && clients.length > 0) {
      const companyExists = clients.some(client => client.id === vehicleData.id_empresa);
      if (companyExists) {
        setSelectedCompanyId(vehicleData.id_empresa.toString());
      }
    }
  }, [vehicleData?.id_empresa, clients]);

  const watchPhoto = watch("foto");

  useEffect(() => {
    if (watchPhoto && watchPhoto.length > 0) {
      const file = watchPhoto[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [watchPhoto]);

  const onSubmit = async (
    data: Omit<Vehicle, "id" | "id_empresa"> & { foto: FileList | null }
  ) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === "foto" && value instanceof FileList && value.length > 0) {
          formData.append(key, value[0]);
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      if (userRole === "superadmin" && selectedCompanyId) {
        formData.append("id_empresa", selectedCompanyId);
      }

      if (id) {
        await updateViatura({ id, data: formData }).unwrap();
      } else {
        await addViatura(formData).unwrap();
      }
      onSave();
    } catch (error) {
      handleApiError(error);
    }
  };

  if (isLoadingVehicle) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {userRole === "superadmin" && (
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="id_empresa">
              {t("drivers.company")}
              <RequiredFieldIndicator />
            </Label>
            <Select onValueChange={setSelectedCompanyId} value={selectedCompanyId}>
              <SelectTrigger>
                <SelectValue placeholder={t("drivers.selectCompany")} />
              </SelectTrigger>
              <SelectContent>
                {clients?.map((client) => (
                  <SelectItem key={client.id} value={String(client.id)}>
                    {client.nome_razao_social}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="foto">{t("vehicles.vehiclePhoto")}</Label>
          <div className="flex items-center space-x-4">
            <Avatar className="w-24 h-24">
              <AvatarImage
                src={photoPreview || ""}
                alt={t("vehicles.vehiclePhotoAlt")}
              />
              <AvatarFallback>
                {vehicleData?.marca?.charAt(0) || "V"}
              </AvatarFallback>
            </Avatar>
            <Controller
              name="foto"
              control={control}
              render={({ field: { onChange, ref } }) => (
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files) {
                      onChange(files);
                    } else {
                      onChange(null);
                    }
                  }}
                  ref={ref}
                />
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="marca">
              {t("vehicles.brand")}
              <RequiredFieldIndicator />
            </Label>
            <Controller
              name="marca"
              control={control}
              rules={{ required: t("vehicles.brandRequired") }}
              render={({ field }) => <Input {...field} />}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="modelo">
              {t("vehicles.model")}
              <RequiredFieldIndicator />
            </Label>
            <Controller
              name="modelo"
              control={control}
              rules={{ required: t("vehicles.modelRequired") }}
              render={({ field }) => <Input {...field} />}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="motorizacao">
              {t("vehicles.engine")}
              <RequiredFieldIndicator />
            </Label>
            <Controller
              name="motorizacao"
              control={control}
              rules={{ required: t("vehicles.engineRequired") }}
              render={({ field }) => <Input {...field} />}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="anoFabricacao">
              {t("vehicles.yearOfManufacture")}
              <RequiredFieldIndicator />
            </Label>
            <Controller
              name="anoFabricacao"
              control={control}
              rules={{
                required: t("vehicles.yearRequired"),
                min: { value: 1900, message: t("vehicles.invalidYear") },
                max: {
                  value: new Date().getFullYear(),
                  message: t("vehicles.invalidYear"),
                },
              }}
              render={({
                field: { onChange, value, ...rest },
                fieldState: { error },
              }) => (
                <div>
                  <Input
                    {...rest}
                    value={value === undefined ? "" : value}
                    onChange={(e) => {
                      const newValue =
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value);
                      onChange(newValue);
                    }}
                    type="number"
                    min="1900"
                    max={new Date().getFullYear().toString()}
                  />
                  {error && (
                    <p className="text-red-500 text-sm mt-1">{error.message}</p>
                  )}
                </div>
              )}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="kmInicial">
              {t("vehicles.initialKm")}
              <RequiredFieldIndicator />
            </Label>
            <Controller
              name="kmInicial"
              control={control}
              rules={{
                required: t("vehicles.initialKmRequired"),
                min: { value: 0, message: t("vehicles.invalidKm") },
              }}
              render={({
                field: { onChange, value, ...rest },
                fieldState: { error },
              }) => (
                <div>
                  <Input
                    {...rest}
                    value={value === undefined ? "" : value}
                    onChange={(e) => {
                      const newValue =
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value);
                      onChange(newValue);
                    }}
                    type="number"
                    min="0"
                  />
                  {error && (
                    <p className="text-red-500 text-sm mt-1">{error.message}</p>
                  )}
                </div>
              )}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tipoCombustivel">
              {t("vehicles.fuelType")}
              <RequiredFieldIndicator />
            </Label>
            <Controller
              name="tipoCombustivel"
              control={control}
              rules={{ required: t("vehicles.fuelTypeRequired") }}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value || vehicleData?.tipoCombustivel || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("vehicles.selectFuelType")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gasoline">
                      {t("vehicles.gasoline")}
                    </SelectItem>
                    <SelectItem value="diesel">
                      {t("vehicles.diesel")}
                    </SelectItem>
                    <SelectItem value="gasOil">
                      {t("vehicles.gasOil")}
                    </SelectItem>
                    <SelectItem value="lpgGasoline">
                      {t("vehicles.lpgGasoline")}
                    </SelectItem>
                    <SelectItem value="electric">
                      {t("vehicles.electric")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="dataVencimentoIUC">
              {t("vehicles.iucExpiryDate")}
            </Label>
            <Controller
              name="dataVencimentoIUC"
              control={control}
              render={({ field: { onChange, value, ...rest } }) => (
                <Input
                  {...rest}
                  type="date"
                  value={value ? value.split("T")[0] : ""}
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    if (!isNaN(date.getTime())) {
                      onChange(date.toISOString().split("T")[0]);
                    } else {
                      onChange("");
                    }
                  }}
                  min={new Date().toISOString().split("T")[0]}
                  max="9999-12-31"
                />
              )}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="capacidadeViatura">
              {t("vehicles.vehicleCapacity")}
              <RequiredFieldIndicator />
            </Label>
            <Controller
              name="capacidadeViatura"
              control={control}
              rules={{ required: t("vehicles.vehicleCapacityRequired") }}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value || vehicleData?.capacidadeViatura || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("vehicles.selectCapacity")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5 Lugares">
                      {t("vehicles.fiveSeats")}
                    </SelectItem>
                    <SelectItem value="7 Lugares">
                      {t("vehicles.sevenSeats")}
                    </SelectItem>
                    <SelectItem value="9 Lugares">
                      {t("vehicles.nineSeats")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="placa">
            {t("vehicles.licensePlate")}
            <RequiredFieldIndicator />
          </Label>
          <Controller
            name="placa"
            control={control}
            rules={{ required: t("vehicles.licensePlateRequired") }}
            render={({ field }) => (
              <Input {...field} maxLength={6} minLength={6} />
            )}
          />
        </div>
      </div>
      <Button
        type="submit"
        className="w-full mt-4"
        disabled={isAdding || isUpdating}
      >
        {id ? t("vehicles.saveChanges") : t("vehicles.addVehicle")}
      </Button>
    </form>
  );
}

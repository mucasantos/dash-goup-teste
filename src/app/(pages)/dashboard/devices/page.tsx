"use client";

import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { PageLayout } from "@/components/pageLayout";
import { DataTable } from "@/components/data-table";
import { toast } from "react-hot-toast";
import { handleApiError } from "@/utils/errorHandler";
import { formatDate } from "@/utils/dateFormatters";
import {
  useGetDevicesQuery,
  useUpdateDeviceMutation,
} from "@/lib/redux/services/empresaApi";
import { useSelector } from "react-redux";
import { useState } from "react";
import {
  useGetClientsQuery,
} from "@/lib/redux/services/empresaApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeviceTableData {
  id: number;
  identificacao: string;
  status: boolean;
  motoristaNome: string | null;
  motoristaEmail: string | null;
  createdAt: string;
  ultimaViatura: {
    placa: string;
    nome_motorista: string;
    data_ultimo_uso: string;
  } | null;
  ultimoMotorista: string | null;
  nome_empresa: string | null;
}

export default function DevicesPage() {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("all");
  const userRole = useSelector((state: any) => state.auth.user?.role);

  const { data: clientsResponse } = useGetClientsQuery(undefined, {
    skip: userRole !== "superadmin",
  });

  const clients = clientsResponse?.clientes?.filter(client => client.status) || [];

  const { data, isLoading } = useGetDevicesQuery(
    selectedCompanyId !== "all" 
      ? { id_empresa: parseInt(selectedCompanyId), page: currentPage } 
      : { page: currentPage }
  );
  const [updateDevice] = useUpdateDeviceMutation();

  const handleToggleActive = async (device: DeviceTableData) => {
    try {
      await updateDevice({
        id: device.id,
        status: !device.status,
      }).unwrap();
      toast.success(
        t("devices.toggleSuccess", {
          status: device.status
            ? t("devices.deactivated")
            : t("devices.activated"),
        })
      );
    } catch (error) {
      handleApiError(error);
    }
  };

  const deviceTableData: DeviceTableData[] =
    data?.dispositivos.map((d) => ({
      id: d.id,
      identificacao: d.identificacao,
      status: d.status,
      motoristaNome: d.motorista?.user.name ?? null,
      motoristaEmail: d.motorista?.user.email ?? null,
      createdAt: d.createdAt,
      ultimaViatura: d.ultimoUso
        ? {
            placa: d.ultimoUso.placa,
            nome_motorista: d.ultimoUso.nome_motorista,
            data_ultimo_uso: d.ultimoUso.data_ultimo_uso,
          }
        : null,
      ultimoMotorista: d.ultimoUso?.nome_motorista ?? null,
      nome_empresa: d.nome_empresa,
    })) ?? [];

  const columns = [
    ...(userRole === "superadmin"
      ? [
          {
            key: "nome_empresa",
            label: t("drivers.companyName"),
            render: (item: DeviceTableData) => <span>{item.nome_empresa}</span>,
          },
        ]
      : []),
    { key: "identificacao", label: t("devices.identification") },
    {
      key: "status",
      label: t("devices.status"),
      format: (value: boolean) =>
        value ? t("devices.active") : t("devices.inactive"),
    },
    {
      key: "createdAt",
      label: t("devices.creationDate"),
      format: (value: string) => formatDate(String(value)),
    },
    {
      key: "ultimaViatura",
      label: t("devices.lastVehicle"),
      format: (value: { placa: string; data_ultimo_uso: string } | null) =>
        value && typeof value === "object" && "placa" in value
          ? `${value.placa} (${formatDate(value.data_ultimo_uso)})`
          : t("devices.noVehicleUsage"),
    },
    {
      key: "ultimoMotorista",
      label: t("devices.lastDriver"),
      format: (value: string | null) =>
        value ? String(value) : t("devices.noDriverUsage"),
    },

  ];

  return (
    <PageLayout title={t("devices.pageTitle")}>
      {userRole === "superadmin" && (
        <div className="mb-4">
          <Label htmlFor="company-select">{t("drivers.company")}</Label>
          <Select onValueChange={setSelectedCompanyId} value={selectedCompanyId}>
            <SelectTrigger>
              <SelectValue placeholder={t("drivers.selectCompany")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              {clients?.map((client) => (
                <SelectItem key={client.id} value={String(client.id)}>
                  {client.nome_razao_social}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <Card className="bg-white dark:bg-gray-800">
        <DataTable
          data={deviceTableData}
          columns={columns}
          onToggleActive={handleToggleActive}
          loading={isLoading}
          pagination={
            data && data.totalPages > 1
              ? {
                  currentPage: currentPage,
                  totalPages: data.totalPages,
                  onPageChange: (page) => setCurrentPage(page),
                }
              : undefined
          }
        />
      </Card>
    </PageLayout>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, ArrowLeft, ArrowRight, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/pageLayout";
import { DataTable } from "@/components/data-table";
import {
  useGetOnboardControlQuery,
  useGetMotoristasQuery,
  useGetViaturasQuery,
} from "@/lib/redux/services/empresaApi";
import { OnboardForm } from "@/components/modals/OnboardForm";
import { formatDate, formatDateTime } from "@/utils/dateFormatters";
import { useSelector } from "react-redux";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetClientsQuery } from "@/lib/redux/services/empresaApi";
import { formatCurrency } from "@/utils/formatters";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

export default function OnboardPage() {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("all");
  const [selectedDriverId, setSelectedDriverId] = useState<string>("all");
  const [selectedVehiclePlate, setSelectedVehiclePlate] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const userRole = useSelector((state: any) => state.auth.user?.role);

  const { data: clientsResponse } = useGetClientsQuery(undefined, {});

  const clients =
    clientsResponse?.clientes?.filter((client) => client.status) || [];

  const { data: motoristasData } = useGetMotoristasQuery(
    selectedCompanyId !== "all"
      ? { id_empresa: parseInt(selectedCompanyId) }
      : {},
    { skip: false }
  );

  const { data: viaturasData } = useGetViaturasQuery(
    selectedCompanyId !== "all"
      ? { id_empresa: parseInt(selectedCompanyId) }
      : {},
    { skip: false }
  );

  const allDrivers = motoristasData?.usuarios || [];
  const allVehicles = viaturasData?.viaturas || [];

  const queryParams: any = { page: currentPage };

  if (selectedCompanyId !== "all") {
    queryParams.idEmpresa = parseInt(selectedCompanyId);
  }

  if (selectedDriverId !== "all") {
    queryParams.idMotorista = parseInt(selectedDriverId);
  }

  if (selectedVehiclePlate !== "all") {
    queryParams.placa = selectedVehiclePlate;
  }

  if (selectedDate) {
    queryParams.data = selectedDate;
  }

  console.log("Params enviados:", queryParams);
  console.log("Motoristas disponíveis:", allDrivers);
  console.log("Veículos disponíveis:", allVehicles);

  const {
    data: onboardData,
    isLoading,
    refetch: refetchOnboard,
  } = useGetOnboardControlQuery(queryParams);

  const columns = [
    {
      key: "motorista",
      label: t("onboard.driver"),
      render: (item: any) => (
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage
              src={item.motorista?.photo}
              alt={item.motorista?.name}
              className="object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "";
              }}
            />
            <AvatarFallback className="bg-muted">
              {item.motorista?.name
                ? item.motorista.name.charAt(0).toUpperCase()
                : ""}
            </AvatarFallback>
          </Avatar>
          <span>{item.motorista?.name}</span>
        </div>
      ),
    },
    {
      key: "placa",
      label: t("onboard.licensePlate"),
    },
    {
      key: "dt_horario_inicio",
      label: t("onboard.startTime"),
      format: (value: string) => formatDateTime(value),
    },
    {
      key: "km_inicio",
      label: t("onboard.startKm"),
    },
    {
      key: "dt_horario_pausa",
      label: t("onboard.pauseTime"),
      format: (value: string | null) => (value ? formatDateTime(value) : "-"),
    },
    {
      key: "dt_horario_retorno_pausa",
      label: t("onboard.returnFromPauseTime"),
      format: (value: string | null) => (value ? formatDateTime(value) : "-"),
    },
    {
      key: "motivo_pausa",
      label: t("onboard.pauseReason"),
      format: (value: string | null) => value || "-",
    },
    {
      key: "dt_horario_final",
      label: t("onboard.endTime"),
      format: (value: string | null) => (value ? formatDateTime(value) : "-"),
    },
    {
      key: "km_final",
      label: t("onboard.endKm"),
      format: (value: number | null) => value ?? "-",
    },
    {
      key: "gastosGanhosUber",
      label: t("onboard.uberEarnings"),
      format: (value: any | null) =>
        value ? formatCurrency(parseFloat(value.valor_uber)) : "-",
    },
    {
      key: "gastosGanhosBolt",
      label: t("onboard.boltEarnings"),
      format: (value: any | null) =>
        value ? formatCurrency(parseFloat(value.valor_bolt)) : "-",
    },
    {
      key: "avaria",
      label: t("onboard.breakdown"),
      format: (value: string | null) => value || "-",
    },
  ];

  const handleRowClick = (item: any) => {
    setSelectedId(item.id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedId(null);
  };

  const handleSave = async () => {
    await refetchOnboard();
    handleCloseDialog();
  };

  const handleClearFilters = () => {
    setSelectedDriverId("all");
    setSelectedVehiclePlate("all");
    setSelectedDate("");
    setCurrentPage(1);
  };

  return (
    <PageLayout title={t("onboard.pageTitle")}>
      {userRole === "superadmin" && (
        <div className="mb-4">
          <Label htmlFor="company-select">{t("drivers.company")}</Label>
          <Select
            onValueChange={setSelectedCompanyId}
            value={selectedCompanyId}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("drivers.selectCompany")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id.toString()}>
                  {client.nome_razao_social}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <Label htmlFor="driver-select">{t("licenses.driver")}</Label>
          <Select onValueChange={setSelectedDriverId} value={selectedDriverId}>
            <SelectTrigger>
              <SelectValue placeholder={t("onboard.selectDriver")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              {allDrivers.map((driver) => (
                <SelectItem key={driver.id} value={driver.id.toString()}>
                  {driver.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="vehicle-select">{t("onboard.licensePlate")}</Label>
          <Select
            onValueChange={setSelectedVehiclePlate}
            value={selectedVehiclePlate}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("onboard.selectLicensePlate")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              {allVehicles.map((vehicle) => (
                <SelectItem key={vehicle.id} value={vehicle.placa}>
                  {vehicle.placa} - {vehicle.marca} {vehicle.modelo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="date-filter">{t("onboard.date")}</Label>
          <Input
            id="date-filter"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-between mb-4">
        <Button variant="outline" onClick={handleClearFilters}>
          <Filter className="mr-2 h-4 w-4" />
          {t("common.clearFilters")}
        </Button>

        <Button onClick={() => setOpenDialog(true)}           className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t("onboard.addOnboard")}
        </Button>
      </div>

      <Card className="bg-white dark:bg-gray-800">
        <DataTable
          data={onboardData?.controleUbers || []}
          columns={columns}
          onRowClick={handleRowClick}
          loading={isLoading}
          pagination={
            onboardData && onboardData.totalPages > 1
              ? {
                  currentPage: currentPage,
                  totalPages: onboardData.totalPages,
                  onPageChange: (page) => setCurrentPage(page),
                }
              : undefined
          }
        />
      </Card>

      <Dialog open={openDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogTitle>
            {selectedId ? t("onboard.editOnboard") : t("onboard.addNewOnboard")}
          </DialogTitle>
          <OnboardForm
            id={selectedId ?? undefined}
            onSave={handleSave}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}

"use client";

import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/pageLayout";
import { DataTable, type Column } from "@/components/data-table";
import {
  useGetViaturasQuery,
  useDeleteViaturaMutation,
  useDeleteAvariaMutation,
} from "@/lib/redux/services/empresaApi";
import type { Vehicle } from "@/types/vehicle";
import { ConfirmModal } from "@/components/confirm-modal";
import { VehicleForm } from "@/components/modals/VehicleForm";
import { formatDate } from "@/utils/dateFormatters";
import { toast } from "react-hot-toast";
import { handleApiError } from "@/utils/errorHandler";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSelector } from "react-redux";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetClientsQuery } from "@/lib/redux/services/empresaApi";

interface Avaria {
  id: number;
  data: string;
  avaria: string;
}

interface VehicleWithAvarias extends Vehicle {
  avarias?: Avaria[];
  nome_empresa?: string;
  uso?: {
    em_uso: boolean;
    motorista_atual?: {
      id: number;
      nome: string;
      telefone: string;
      email: string;
      foto?: string;
      data_ultimo_uso?: string | null;
    } | null;
  };
}

export default function VehiclesPage() {
  const { t } = useTranslation();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("all");
  const [deletingItem, setDeletingItem] = useState<VehicleWithAvarias | null>(null);
  const [selectedVehicle, setSelectedVehicle] =
    useState<VehicleWithAvarias | null>(null);
  const [deletingAvaria, setDeletingAvaria] = useState<Avaria | null>(null);
  const userRole = useSelector((state: any) => state.auth.user?.role);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: clientsResponse } = useGetClientsQuery(undefined, {
    skip: userRole !== "superadmin",
  });

  const clients = clientsResponse?.clientes?.filter(client => client.status) || [];

  const {
    data: viaturasData,
    isLoading,
    refetch: refetchViaturas,
    error: viaturasError,
  } = useGetViaturasQuery(
    selectedCompanyId !== "all" 
      ? { id_empresa: parseInt(selectedCompanyId), page: currentPage } 
      : { page: currentPage }
  );

  const [deleteViatura] = useDeleteViaturaMutation();
  const [deleteAvaria] = useDeleteAvariaMutation();

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleEdit = (item: VehicleWithAvarias) => {
    setEditingId(item.id);
    setOpenDialog(true);
  };

  const handleDelete = (item: VehicleWithAvarias) => {
    setDeletingItem(item);
  };

  const confirmDelete = useCallback(async () => {
    if (deletingItem) {
      try {
        await deleteViatura(deletingItem.id).unwrap();
        toast.success(t("vehicles.deleteSuccess"));
        await refetchViaturas();
      } catch (error) {
        handleApiError(error);
      } finally {
        setDeletingItem(null);
      }
    }
  }, [deletingItem, deleteViatura, refetchViaturas, t]);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setEditingId(null);
  }, []);

  const handleSave = useCallback(async () => {
    await refetchViaturas();
    handleCloseDialog();
  }, [refetchViaturas, handleCloseDialog]);

  const handleAvariaClick = (item: VehicleWithAvarias) => {
    if (item.avarias && item.avarias.length > 0) {
      setSelectedVehicle(item);
    }
  };

  const handleDeleteAvaria = (avaria: Avaria) => {
    setDeletingAvaria(avaria);
  };

  const confirmDeleteAvaria = useCallback(async () => {
    if (deletingAvaria && selectedVehicle) {
      try {
        await deleteAvaria(deletingAvaria.id).unwrap();
        toast.success(t("vehicles.deleteDamageSuccess"));
        await refetchViaturas();
        setSelectedVehicle((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            avarias: prev.avarias?.filter((a) => a.id !== deletingAvaria.id),
          };
        });
      } catch (error) {
        handleApiError(error);
      } finally {
        setDeletingAvaria(null);
      }
    }
  }, [deletingAvaria, deleteAvaria, refetchViaturas, selectedVehicle, t]);

  const columns: Column<VehicleWithAvarias>[] = [
    ...(userRole === "superadmin"
      ? [
          {
            key: "nome_empresa",
            label: t("drivers.companyName"),
            render: (item: VehicleWithAvarias) => (
              <span>{item.nome_empresa}</span>
            ),
          },
        ]
      : []),
    {
      key: "foto",
      label: t("vehicles.photo"),
      render: (item: VehicleWithAvarias) => (
        <div
          className="relative cursor-pointer"
          onClick={() => handleAvariaClick(item)}
        >
          <Avatar className="w-16 h-16 rounded-none">
            <AvatarImage
              src={typeof item.foto === "string" ? item.foto : undefined}
              alt={`${item.marca} ${item.modelo}`}
              className="rounded-none object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "";
              }}
            />
            <AvatarFallback className="bg-muted rounded-none">
              {item.marca?.charAt(0)?.toUpperCase() || "V"}
            </AvatarFallback>
          </Avatar>
          {item.avarias && item.avarias.length > 0 && (
            <div className="absolute bottom-0 right-0 bg-red-500 text-white text-xs px-1 py-0.5 rounded-tl">
              {t("vehicles.hasDamage")}
            </div>
          )}
        </div>
      ),
    },
    { key: "marca", label: t("vehicles.brand") },
    { key: "modelo", label: t("vehicles.model") },
    { key: "placa", label: t("vehicles.licensePlate") },
    { key: "tipoCombustivel", label: t("vehicles.fuelType") },
    {
      key: "lastRecordedKm",
      label: t("vehicles.currentKm"),
      render: (item: VehicleWithAvarias) => (
        <span>
          {item.lastRecordedKm !== undefined && item.lastRecordedKm !== null
            ? `${item.lastRecordedKm.toLocaleString()} km`
            : t("vehicles.notAvailable")}
        </span>
      ),
    },
    {
      key: "dataVencimentoIUC",
      label: t("vehicles.iucExpiryDate"),
      format: (value) => (typeof value === "string" ? formatDate(value) : ""),
    },
    {
      key: "uso",
      label: t("drivers.currentDriver"),
      render: (item: VehicleWithAvarias) => (
        <div className="flex items-center space-x-2">
          {item.uso?.em_uso && item.uso.motorista_atual ? (
            <>
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src={item.uso.motorista_atual.foto}
                  alt={item.uso.motorista_atual.nome}
                  className="object-cover"
                />
                <AvatarFallback className="bg-red-100 text-red-800 text-xs">
                  {item.uso.motorista_atual.nome.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-red-700">
                  {item.uso.motorista_atual.nome}
                </span>
                <span className="text-xs text-red-600">
                  {t("drivers.inUse")}
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center">
                <span className="text-green-600 text-xs">—</span>
              </div>
              <span className="text-sm text-green-600">
                {t("drivers.available")}
              </span>
            </div>
          )}
        </div>
      ),
    },
  ];

  const renderContent = () => {
    if (viaturasError) {
      if ("status" in viaturasError && viaturasError.status === 404) {
        return (
          <div className="text-center py-4">{t("vehicles.noVehicles")}</div>
        );
      }
      return <div>{t("vehicles.loadError")}</div>;
    }

    return (
      <DataTable
        data={viaturasData?.viaturas || []}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={isLoading}
        pagination={
          viaturasData && viaturasData.totalPages > 1
            ? {
                currentPage: currentPage,
                totalPages: viaturasData.totalPages,
                onPageChange: (page) => setCurrentPage(page),
              }
            : undefined
        }
      />
    );
  };

  return (
    <PageLayout title={t("vehicles.pageTitle")}>
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
      <div className="flex justify-end mb-4">
        <Button
          onClick={handleOpenDialog}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t("vehicles.addVehicle")}
        </Button>
      </div>
      <Card className="bg-white dark:bg-gray-800">
        {renderContent()}
      </Card>
      <Dialog open={openDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="bg-white dark:bg-gray-800 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogTitle>
            {editingId
              ? t("vehicles.editVehicle")
              : t("vehicles.addNewVehicle")}
          </DialogTitle>
          <VehicleForm id={editingId} onSave={handleSave} />
        </DialogContent>
      </Dialog>
      <ConfirmModal
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={confirmDelete}
        title={t("vehicles.confirmDelete")}
        message={t("vehicles.deleteMessage")}
      />
      <Dialog
        open={!!selectedVehicle}
        onOpenChange={() => setSelectedVehicle(null)}
      >
        <DialogContent className="bg-white dark:bg-gray-800 max-w-md">
          <DialogTitle>{t("vehicles.damageInformation")}</DialogTitle>
          {selectedVehicle && selectedVehicle.avarias && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">{`${selectedVehicle.marca} ${selectedVehicle.modelo} - ${selectedVehicle.placa}`}</h3>
              <ul className="list-none pl-0">
                {selectedVehicle.avarias.map((avaria) => (
                  <li
                    key={avaria.id}
                    className="mb-2 flex items-center justify-between"
                  >
                    <span className="flex-grow">
                      <span className="font-medium">
                        {formatDate(avaria.data)}:
                      </span>{" "}
                      {avaria.avaria}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAvaria(avaria)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <ConfirmModal
        isOpen={!!deletingAvaria}
        onClose={() => setDeletingAvaria(null)}
        onConfirm={confirmDeleteAvaria}
        title={t("vehicles.confirmDeleteDamage")}
        message={t("vehicles.deleteDamageMessage")}
      />
    </PageLayout>
  );
}

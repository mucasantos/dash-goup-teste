"use client";

import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, ArrowLeft, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/pageLayout";
import { DataTable, Column } from "@/components/data-table";
import {
  useGetMotoristasQuery,
  useDeleteMotoristaMutation,
} from "@/lib/redux/services/empresaApi";
import { ConfirmModal } from "@/components/confirm-modal";
import { DriverForm } from "@/components/modals/DriverForm";
import { formatDate } from "@/utils/dateFormatters";
import { toast } from "react-hot-toast";
import { handleApiError } from "@/utils/errorHandler";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSelector } from "react-redux";
import {
  useGetClientsQuery,
  useGetMotoristasQuery as empresaApiGetMotoristasQuery,
} from "@/lib/redux/services/empresaApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface DriverTableData {
  id: number;
  motoristaId: number;
  name: string;
  email: string;
  status: string;
  lastUpdate: string;
  foto: string | File | null;
  nome_empresa?: string;
  vehicles?: string[]; 
}

export default function DriversPage() {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("all");
  const [deletingItem, setDeletingItem] = useState<DriverTableData | null>(null);
  const userRole = useSelector((state: any) => state.auth.user?.role);

  const { data: clientsResponse } = useGetClientsQuery(undefined, {
    skip: userRole !== "superadmin",
  });

  const clients = clientsResponse?.clientes?.filter(client => client.status) || [];

  const {
    data: motoristasData,
    isLoading,
    refetch: refetchMotoristas,
    error: motoristasError,
  } = useGetMotoristasQuery(
    selectedCompanyId !== "all" ? { id_empresa: parseInt(selectedCompanyId), page: currentPage } : { page: currentPage }
  );

  const [deleteMotorista] = useDeleteMotoristaMutation();

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleEdit = (item: DriverTableData) => {
    setEditingId(item.motoristaId);
    setOpenDialog(true);
  };

  const handleDelete = (item: DriverTableData) => {
    setDeletingItem(item);
  };

  const confirmDelete = useCallback(async () => {
    if (deletingItem) {
      try {
        await deleteMotorista(deletingItem.motoristaId).unwrap();
        toast.success(t("drivers.deleteSuccess"));
        await refetchMotoristas();
      } catch (error) {
        handleApiError(error);
      } finally {
        setDeletingItem(null);
      }
    }
  }, [deletingItem, deleteMotorista, refetchMotoristas, t]);

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
  };

  const handleSave = useCallback(async () => {
    await refetchMotoristas();
    handleCloseDialog();
  }, [refetchMotoristas]);

  const driverTableData: DriverTableData[] = React.useMemo(() => {
    return (
      motoristasData?.usuarios?.map((u) => ({
        id: u.id,
        motoristaId: u.motorista?.id ?? 0,
        name: u.name,
        email: u.email,
        status:
          u.motorista?.status === "Ativo"
            ? t("drivers.active")
            : t("drivers.inactive"),
        lastUpdate: u.updatedAt,
        foto: u?.foto ?? null,
        nome_empresa: u.nome_empresa,
        vehicles: u.motorista?.viaturas?.map(v => v.placa) || [],
      })) ?? []
    );
  }, [motoristasData, t]);

  const columns: Column<DriverTableData>[] = [
    ...(userRole === "superadmin"
      ? [
          {
            key: "nome_empresa",
            label: t("drivers.companyName"),
            render: (item: DriverTableData) => <span>{item.nome_empresa}</span>,
          },
        ]
      : []),
    {
      key: "name",
      label: t("drivers.name"),
      render: (item: DriverTableData) => (
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage
              src={typeof item.foto === "string" ? item.foto : undefined}
              alt={item.name}
              className="object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "";
              }}
            />
            <AvatarFallback className="bg-muted">
              {item.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span>{item.name}</span>
        </div>
      ),
    },
    { key: "email", label: t("drivers.email") },
    { key: "status", label: t("drivers.status") },
    {
      key: "vehicles",
      label: t("drivers.vehicles"),
      render: (item: DriverTableData) => (
        <div className="flex flex-wrap gap-1">
          {item.vehicles && item.vehicles.length > 0 ? (
            item.vehicles.map((placa, index) => (
              <span
                key={index}
                className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
              >
                {placa}
              </span>
            ))
          ) : (
            <span className="text-gray-500 text-sm">{t("drivers.noVehicle")}</span>
          )}
        </div>
      ),
    },
    {
      key: "lastUpdate",
      label: t("drivers.lastUpdate"),
      format: (value) => (typeof value === "string" ? formatDate(value) : ""),
    },

  ];

  const renderContent = () => {
    if (motoristasError) {
      if ("status" in motoristasError && motoristasError.status === 404) {
        return <div className="text-center py-4">{t("drivers.noDrivers")}</div>;
      }
      return <div>{t("drivers.loadError")}</div>;
    }

    return (
      <>
        <DataTable
          data={driverTableData}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={isLoading}
          pagination={
            motoristasData && motoristasData.totalPages > 1
              ? {
                  currentPage: currentPage,
                  totalPages: motoristasData.totalPages,
                  onPageChange: (page) => setCurrentPage(page),
                }
              : undefined
          }
        />
      </>
    );
  };

  return (
    <PageLayout title={t("drivers.pageTitle")}>
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
          {t("drivers.addDriver")}
        </Button>
      </div>
      <Card className="bg-white dark:bg-gray-800">
        {renderContent()}
      </Card>
      <Dialog open={openDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="bg-white dark:bg-gray-800 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogTitle>
            {editingId ? t("drivers.editDriver") : t("drivers.addNewDriver")}
          </DialogTitle>
          <DriverForm id={editingId} onSave={handleSave} />
        </DialogContent>
      </Dialog>
      <ConfirmModal
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={confirmDelete}
        title={t("drivers.confirmDelete")}
        message={t("drivers.deleteMessage")}
      />
    </PageLayout>
  );
}

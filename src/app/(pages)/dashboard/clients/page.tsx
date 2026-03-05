"use client";

import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, ArrowLeft, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/pageLayout";
import { DataTable } from "@/components/data-table";
import {
  useGetClientsQuery,
  useDeleteClientMutation,
} from "@/lib/redux/services/empresaApi";
import { ConfirmModal } from "@/components/confirm-modal";
import { ClientForm } from "@/components/modals/ClientForm";
import { formatDate } from "@/utils/dateFormatters";
import { toast } from "react-hot-toast";
import { handleApiError } from "@/utils/errorHandler";
import type { Client } from "@/types/client";

export default function ClientsPage() {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);

  const {
    data: clientsData,
    isLoading,
    refetch: refetchClients,
    error: clientsError,
  } = useGetClientsQuery({ page: currentPage });

  const [deleteClient] = useDeleteClientMutation();

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setOpenDialog(true);
  };

  const handleDelete = (client: Client) => {
    setDeletingClient(client);
  };

  const confirmDelete = useCallback(async () => {
    if (deletingClient) {
      try {
        await deleteClient(deletingClient.id.toString()).unwrap();
        toast.success(t("clients.deleteSuccess"));
        await refetchClients();
      } catch (error) {
        handleApiError(error);
      } finally {
        setDeletingClient(null);
      }
    }
  }, [deletingClient, deleteClient, refetchClients, t]);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setEditingClient(null);
  }, []);

  const handleSave = useCallback(async () => {
    await refetchClients();
    handleCloseDialog();
  }, [refetchClients, handleCloseDialog]);

  const columns = [
    { key: "nome_razao_social", label: t("clients.companyName") },
    { key: "email", label: t("clients.email") },
    { key: "contacto", label: t("clients.contact") },
    { key: "cidade", label: t("clients.city") },
    {
      key: "status",
      label: t("clients.status"),
      render: (client: Client) => (
        <span
          className={`px-2 py-1 rounded-full text-sm ${
            client.status
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {client.status ? t("clients.active") : t("clients.inactive")}
        </span>
      ),
    },
    {
      key: "updatedAt",
      label: t("clients.lastUpdate"),
      format: (value: string) => formatDate(value),
    },
  ];

  return (
    <PageLayout title={t("clients.pageTitle")}>
      <div className="flex justify-end mb-4">
        <Button
          onClick={handleOpenDialog}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t("clients.addClient")}
        </Button>
      </div>

      <Card className="bg-white dark:bg-gray-800">
        <DataTable
          data={clientsData?.clientes || []}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={isLoading}
          pagination={
            clientsData && clientsData.totalPages > 1
              ? {
                  currentPage: currentPage,
                  totalPages: clientsData.totalPages,
                  onPageChange: (page) => setCurrentPage(page),
                }
              : undefined
          }
        />
      </Card>

      <Dialog open={openDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogTitle>
            {editingClient
              ? t("clients.editClient")
              : t("clients.addNewClient")}
          </DialogTitle>
          <ClientForm
            data={editingClient ?? undefined}
            onSave={handleSave}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>

      <ConfirmModal
        isOpen={!!deletingClient}
        onClose={() => setDeletingClient(null)}
        onConfirm={confirmDelete}
        title={t("clients.confirmDelete")}
        message={t("clients.deleteMessage")}
      />
    </PageLayout>
  );
}

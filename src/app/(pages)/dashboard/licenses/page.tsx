"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, UserPlus, ArrowLeft, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/pageLayout";
import { DataTable } from "@/components/data-table";
import { toast } from "react-hot-toast";
import { handleApiError } from "@/utils/errorHandler";
import { formatDate } from "@/utils/dateFormatters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useLicensesQuery,
  usePurchaseLicenseMutation,
  useRemoveLicenseMutation,
  useAttributeLicenseMutation,
  useGetMotoristasWithoutLicenseQuery,
  useGetClientsQuery,
} from "@/lib/redux/services/empresaApi";
import { PurchaseLicenseForm } from "@/components/modals/PurchaseLicenseForm";
import { useSelector } from "react-redux";
import { Label } from "@/components/ui/label";
import { BuyLicenseModal } from "@/components/modals/BuyLicenseModal";

interface LicenseTableData {
  order_id: number;
  licence_id: string;
  date_created: string;
  date_completed: string;
  status: string;
  name: string | null;
  post_title: string;
  post_excerpt: string;
  motorista_id: number | null;
  motorista_name: string | null;
  nome_empresa: string | null;
  days_remaining?: number;
  isTrial: boolean;
}

interface Usuario {
  motorista_id: number;
  user_id: number;
  name: string;
  email: string;
}

interface UsuariosResponse {
  motoristas: Usuario[];
  currentPage: number;
  totalPages: number;
  totalMotoristas: number;
}

interface AttributeLicenseModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (motorista_id: string) => void;
  usuarios: Usuario[];
}

function AttributeLicenseModal({
  open,
  onClose,
  onConfirm,
  usuarios,
}: AttributeLicenseModalProps) {
  const { t } = useTranslation();
  const [selectedMotorista, setSelectedMotorista] = useState<string>("");

  const handleSubmit = () => {
    if (selectedMotorista) {
      onConfirm(selectedMotorista);
      setSelectedMotorista("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-gray-800 max-w-md">
        <DialogTitle>{t("licenses.attributeTitle")}</DialogTitle>
        <div className="space-y-4">
          <Select
            value={selectedMotorista}
            onValueChange={setSelectedMotorista}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("licenses.selectDriver")} />
            </SelectTrigger>
            <SelectContent>
              {usuarios?.map((usuario) => (
                <SelectItem
                  key={`motorista-${usuario.motorista_id}`}
                  value={String(usuario.motorista_id)}
                  className="flex items-center space-x-2"
                >
                  <div className="flex items-center gap-2">
                    <span>{usuario.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSubmit} disabled={!selectedMotorista}>
              {t("licenses.attribute")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function LicensesPage() {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [attributeModalOpen, setAttributeModalOpen] = useState(false);
  const [selectedLicenseId, setSelectedLicenseId] = useState<number | null>(
    null
  );
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("all");
  const userRole = useSelector((state: any) => state.auth.user?.role);
  const [buyLicensesOpen, setBuyLicensesOpen] = useState(false);

  const { data: clientsResponse } = useGetClientsQuery(undefined, {
    skip: userRole !== "superadmin",
  });

  const clients =
    clientsResponse?.clientes?.filter((client) => client.status) || [];

  const {
    data: licensesData,
    isLoading,
    refetch,
  } = useLicensesQuery(
    selectedCompanyId !== "all"
      ? { page: currentPage, id_empresa: parseInt(selectedCompanyId) }
      : { page: currentPage }
  );
  const [purchaseLicense] = usePurchaseLicenseMutation();
  const [removeLicense] = useRemoveLicenseMutation();
  const [attributeLicense] = useAttributeLicenseMutation();
  const { data: motoristasData } = useGetMotoristasWithoutLicenseQuery();

  const handlePurchase = async (quantity: number) => {
    try {
      await purchaseLicense({ quantityLicenca: quantity }).unwrap();
      toast.success(t("licenses.purchaseSuccess"));
      setOpenDialog(false);
      refetch();
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleRemoveLicense = async (
    motorista_id: number,
    order_id: number,
    license_id: number
  ) => {
    try {
      const result = await removeLicense({
        motorista_id,
        order_id,
        license_id,
      }).unwrap();
      if ("message" in result && "code" in result.message) {
        if (result.message.code === "jwt_auth_invalid_token") {
          window.location.href = "/login";
          return;
        }
        throw result;
      }
      toast.success(t("licenses.removeSuccess"));
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleAttributeClick = (order_id: number) => {
    setSelectedLicenseId(order_id);
    setAttributeModalOpen(true);
  };

  const handleAttributeLicense = async (motorista_id: string) => {
    try {
      if (!selectedLicenseId) return;

      let license_id = "";

      if (licensesData && licensesData.licencas) {
        const selectedLicense = licensesData.licencas.find(
          (l) => l.order_id === selectedLicenseId
        );
        if (selectedLicense && selectedLicense.license_id) {
          license_id = selectedLicense.license_id;
        }
      }

      const params = {
        motorista_id,
        order_id: String(selectedLicenseId),
        license_id,
      };

      await attributeLicense(params).unwrap();
      toast.success(t("licenses.attributeSuccess"));
      setAttributeModalOpen(false);
      setSelectedLicenseId(null);
      refetch();
    } catch (error) {
      console.error("Erro ao atribuir licença:", error);
      handleApiError(error);
    }
  };

  const canRemoveLicense = (
    dateCreated: string,
    motorista_id: number | null
  ) => {
    if (!motorista_id) return false;
    if (userRole === "superadmin") return true;

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const creationDate = new Date(dateCreated);

    return creationDate <= oneMonthAgo;
  };

  const licensesWithId = (licensesData?.licencas || []).map((license) => ({
    ...license,
    id: license.order_id,
  }));

  const columns = [
    ...(userRole === "superadmin"
      ? [
          {
            key: "nome_razao_social",
            label: t("drivers.companyName"),
          },
        ]
      : []),
    {
      key: "post_title",
      label: t("licenses.licenseName"),
      format: (value: string, item: any) => {
        if (item.isTrial) {
          return (
            <div className="flex items-center gap-2">
              {value}
              <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                {t("licenses.trial")}
              </span>
            </div>
          );
        }
        return value;
      },
    },
    {
      key: "date_created",
      label: t("licenses.purchaseDate"),
      format: (value: string) => formatDate(value),
    },
    {
      key: "date_completed",
      label: t("licenses.activationDate"),
      format: (value: string) => formatDate(value),
    },
    {
      key: "post_excerpt",
      label: t("licenses.periodicity"),
    },
    {
      key: "motorista_name",
      label: t("licenses.client"),
      format: (value: string | null) => value || "-",
    },
    {
      key: "days_remaining",
      label: t("licenses.daysRemaining"),
      format: (value: number | undefined, item: any) => {
        if (value === undefined) return "-";
        return (
          <div className="flex items-center gap-2">
            <span>
              {value <= 0
                ? t("licenses.expired")
                : `${value} ${t("licenses.daysRemaining")}`}
            </span>
            <Button variant="destructive" size="sm" className="ml-2">
              {t("common.cancel")}
            </Button>
          </div>
        );
      },
    },
    {
      key: "status",
      label: t("licenses.status"),
      format: (value: string) => value,
    },
    {
      key: "actions",
      label: t("common.actions"),
      render: (item: LicenseTableData) => {
        const actions = [];

        if (!item.motorista_id) {
          actions.push(
            <Button
              key={`attribute-${item.order_id}`}
              variant="secondary"
              size="sm"
              onClick={() => handleAttributeClick(item.order_id)}
              className="mr-2"
            >
              <UserPlus className="h-4 w-4 mr-1" />
              {t("licenses.attribute")}
            </Button>
          );
        }

        const canRemove = canRemoveLicense(
          item.date_created,
          item.motorista_id
        );
        const daysRemainingForUnlock =
          30 - (item.days_remaining ? 30 - item.days_remaining : 0);

        if (item.motorista_id) {
          actions.push(
            <Button
              key={`remove-${item.order_id}`}
              variant="destructive"
              size="sm"
              disabled={!canRemove}
              onClick={() =>
                handleRemoveLicense(
                  item.motorista_id!,
                  item.order_id,
                  item.licence_id!
                )
              }
              title={
                !canRemove
                  ? `${t(
                      "licenses.availableAfter"
                    )} ${daysRemainingForUnlock} ${t("licenses.days")}`
                  : ""
              }
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {t("licenses.remove")}
            </Button>
          );
        }

        return actions.length > 0 ? (
          <div className="flex">{actions}</div>
        ) : null;
      },
    },
  ];

  const handleBuyLicensesClick = () => {
    if (userRole === "superadmin") {
      setBuyLicensesOpen(true);
    } else {
      window.open("https://goupsolutions.pt/#planos", "_blank");
    }
  };

  const handleLicensePurchaseSuccess = () => {
    refetch();
  };

  return (
    <PageLayout
      title={t(
        userRole === "superadmin"
          ? "sidebar.clientLicenses"
          : "sidebar.buyLicenses"
      )}
    >
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
          onClick={handleBuyLicensesClick}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t(
            userRole === "superadmin"
              ? "sidebar.clientLicenses"
              : "sidebar.buyLicenses"
          )}
        </Button>
      </div>

      <Card className="bg-white dark:bg-gray-800">
        <DataTable
          data={licensesWithId}
          columns={columns}
          loading={isLoading}
          pagination={
            licensesData && licensesData.totalPages > 1
              ? {
                  currentPage: licensesData.currentPage,
                  totalPages: licensesData.totalPages,
                  onPageChange: (page) => setCurrentPage(page),
                }
              : undefined
          }
        />
      </Card>

      <BuyLicenseModal
        open={buyLicensesOpen}
        onOpenChange={setBuyLicensesOpen}
        onSuccess={handleLicensePurchaseSuccess}
      />

      <AttributeLicenseModal
        open={attributeModalOpen}
        onClose={() => {
          setAttributeModalOpen(false);
          setSelectedLicenseId(null);
        }}
        onConfirm={handleAttributeLicense}
        usuarios={motoristasData?.motoristas || []}
      />
    </PageLayout>
  );
}

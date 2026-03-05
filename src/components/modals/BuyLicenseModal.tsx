import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetClientsQuery,
  useBuyLicensesMutation,
} from "@/lib/redux/services/empresaApi";
import { toast } from "react-hot-toast";
import { handleApiError } from "@/utils/errorHandler";
import { RequiredFieldIndicator } from "@/components/RequiredFieldIndicator";

interface BuyLicenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function BuyLicenseModal({
  open,
  onOpenChange,
  onSuccess,
}: BuyLicenseModalProps) {
  const { t } = useTranslation();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [licenseType, setLicenseType] = useState<string>("");
  const [periodicity, setPeriodicity] = useState<string>("");
  
  const { data: clientsResponse, isLoading: isLoadingClients } = useGetClientsQuery();
  const clients = clientsResponse?.clientes?.filter(client => client.status) || [];
  
  const [buyLicenses, { isLoading: isBuying }] = useBuyLicensesMutation();

  useEffect(() => {
    if (!open) {
      setSelectedCompanyId("");
      setLicenseType("");
      setPeriodicity("");
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!selectedCompanyId) {
      toast.error(t("licenses.companyRequired"));
      return;
    }
    
    if (!licenseType) {
      toast.error(t("licenses.licenseTypeRequired"));
      return;
    }
    
    if (!periodicity) {
      toast.error(t("licenses.periodicityRequired"));
      return;
    }

    try {
      await buyLicenses({
        id_empresa: parseInt(selectedCompanyId),
        license_type: licenseType,
        periodicity: periodicity
      }).unwrap();
      
      toast.success(t("licenses.purchaseSuccess"));
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("licenses.buyLicensesForClient")}</DialogTitle>
        </DialogHeader>
        
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
          
          <div className="space-y-2">
            <Label htmlFor="license_type">
              {t("licenses.licenseType")}
              <RequiredFieldIndicator />
            </Label>
            <Select onValueChange={setLicenseType} value={licenseType}>
              <SelectTrigger>
                <SelectValue placeholder={t("licenses.selectLicenseType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="silver">{t("licenses.silver")}</SelectItem>
                <SelectItem value="gold">{t("licenses.goldLicense")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="periodicity">
              {t("licenses.periodicity")}
              <RequiredFieldIndicator />
            </Label>
            <Select onValueChange={setPeriodicity} value={periodicity}>
              <SelectTrigger>
                <SelectValue placeholder={t("licenses.selectPeriodicity")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">{t("licenses.monthly")}</SelectItem>
                <SelectItem value="semiannual">{t("licenses.semiannual")}</SelectItem>
                <SelectItem value="annual">{t("licenses.annual")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isBuying || isLoadingClients}
          >
            {t("licenses.confirmPurchase")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
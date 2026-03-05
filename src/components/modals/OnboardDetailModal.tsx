"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { useGetOnboardControlByIdQuery } from "@/lib/redux/services/empresaApi";
import { formatDate } from "@/utils/dateFormatters";
import { formatCurrency } from "@/utils/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const formatHours = (hours: string | null) => {
  if (!hours) return "0.00";
  
  if (hours.includes(".")) {
    return parseFloat(hours).toFixed(2);
  }
  
  if (hours.includes(":")) {
    const [h, m] = hours.split(":");
    return (parseInt(h) + parseInt(m) / 60).toFixed(2);
  }
  
  return "0.00";
};

interface OnboardDetailModalProps {
  open: boolean;
  onClose: () => void;
  onboardId: number | null;
}

export function OnboardDetailModal({ open, onClose, onboardId }: OnboardDetailModalProps) {
  const { t } = useTranslation();
  const { data, isLoading } = useGetOnboardControlByIdQuery(onboardId || 0, {
    skip: !onboardId,
  });

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogTitle>{t("onboard.details")}</DialogTitle>
        
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : data ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold">{t("onboard.general")}</h4>
                <p>{t("onboard.plate")}: {data.placa}</p>
                <p>{t("onboard.startTime")}: {formatDate(data.dt_horario_inicio)}</p>
                <p>{t("onboard.endTime")}: {data.dt_horario_final ? formatDate(data.dt_horario_final) : "-"}</p>
                <p>{t("onboard.startKm")}: {data.km_inicio.toLocaleString()}</p>
                <p>{t("onboard.endKm")}: {data.km_final?.toLocaleString() || "-"}</p>
              </div>

              {data.dt_horario_pausa && (
                <div>
                  <h4 className="font-semibold">{t("onboard.pause")}</h4>
                  <p>{t("onboard.pauseStart")}: {formatDate(data.dt_horario_pausa)}</p>
                  <p>{t("onboard.pauseEnd")}: {data.dt_horario_retorno_pausa ? formatDate(data.dt_horario_retorno_pausa) : "-"}</p>
                  <p>{t("onboard.pauseReason")}: {data.motivo_pausa || "-"}</p>
                </div>
              )}
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              {data.gastosGanhosUber && (
                <div>
                  <h4 className="font-semibold">Uber</h4>
                  <p>{t("onboard.earnings")}: {formatCurrency(parseFloat(data.gastosGanhosUber.valor_uber || "0"))}</p>
                  <p>{t("onboard.tips")}: {formatCurrency(parseFloat(data.gastosGanhosUber.vl_gorjeta_uber || "0"))}</p>
                  <p>{t("onboard.toll")}: {formatCurrency(parseFloat(data.gastosGanhosUber.vl_portagem_uber || "0"))}</p>
                  <p>{t("onboard.hours")}: {formatHours(data.gastosGanhosUber.qtd_horas_uber)}</p>
                  <p>{t("onboard.trips")}: {data.gastosGanhosUber.qtd_viagens_uber || "0"}</p>
                </div>
              )}

              {data.gastosGanhosBolt && (
                <div>
                  <h4 className="font-semibold">Bolt</h4>
                  <p>{t("onboard.earnings")}: {formatCurrency(parseFloat(data.gastosGanhosBolt.valor_bolt || "0"))}</p>
                  <p>{t("onboard.tips")}: {formatCurrency(parseFloat(data.gastosGanhosBolt.vl_gorjeta_bolt || "0"))}</p>
                  <p>{t("onboard.hours")}: {formatHours(data.gastosGanhosBolt.qtd_horas_bolt)}</p>
                  <p>{t("onboard.trips")}: {data.gastosGanhosBolt.qtd_viagens_bolt || "0"}</p>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
} 
"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RequiredFieldIndicator } from "@/components/RequiredFieldIndicator";
import {
  useGetOnboardByIdQuery,
  useUpdateOnboardMutation,
  useCreateOnboardMutation,
  useGetClientsQuery,
  useGetMotoristasQuery,
  useGetViaturasQuery,
} from "@/lib/redux/services/empresaApi";
import { toast } from "react-hot-toast";
import { handleApiError } from "@/utils/errorHandler";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSelector } from "react-redux";
import { formatCurrencyInput, parseCurrencyInput } from "@/utils/formatters";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface Abastecimento {
  id?: number;
  km_abastecimento: number;
  valor_abastecimento: string;
  qtd_litros_abastecido: string;
  data_abastecimento: string;
  tipo_combustivel: string;
}

interface OnboardFormProps {
  id?: number;
  onSave: () => void;
  onCancel: () => void;
}

interface OnboardFormData {
  placa: string;
  dt_horario_inicio: string;
  km_inicio: number;
  dt_horario_pausa: string | null;
  dt_horario_retorno_pausa: string | null;
  motivo_pausa: string | null;
  km_final: number | null;
  dt_horario_final: string | null;
  avaria: string | null;
  reasonChange: string;
  idMotorista: string | null;
  gastosGanhosUber?: {
    valor_uber: string;
    vl_gorjeta_uber: string;
    vl_portagem_uber: string;
    qtd_horas_uber: string;
    qtd_viagens_uber: number;
  } | null;
  gastosGanhosBolt?: {
    valor_bolt: string;
    vl_gorjeta_bolt: string;
    qtd_horas_bolt: string;
    qtd_viagens_bolt: number;
  } | null;
  abastecimentos?: Abastecimento[];
}

const PAUSE_REASONS = [
  "Almoço/Janta",
  "Compromisso Particular",
  "Manutenção",
  "Outros",
];

const MAX_YEAR = new Date().getFullYear() + 1;

const decimalToTime = (decimal: string | null) => {
  if (!decimal) return "";
  const hours = Math.floor(parseFloat(decimal));
  const minutes = Math.round((parseFloat(decimal) - hours) * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

const timeToDecimal = (time: string | null) => {
  if (!time) return "0.00";
  const [hours, minutes] = time.split(':').map(Number);
  return ((hours + minutes / 60)).toFixed(2);
};

export function OnboardForm({ id, onSave, onCancel }: OnboardFormProps) {
  const { t } = useTranslation();
  const [updateOnboard] = useUpdateOnboardMutation();
  const [createOnboard] = useCreateOnboardMutation();
  const userRole = useSelector((state: any) => state.auth.user?.role);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");

  const { data: clientsResponse } = useGetClientsQuery(undefined, {
    skip: userRole !== "superadmin",
  });

  const { data: motoristasResponse, isLoading: isLoadingMotoristas } = useGetMotoristasQuery(
    { id_empresa: selectedCompanyId ? parseInt(selectedCompanyId) : undefined },
    { skip: userRole === "superadmin" && !selectedCompanyId }
  );

  const { data: viaturas, isLoading: isLoadingViaturas } = useGetViaturasQuery(
    { id_empresa: selectedCompanyId ? parseInt(selectedCompanyId) : undefined },
    {
      skip: userRole === "superadmin" && !selectedCompanyId,
    }
  );

  const clients = clientsResponse?.clientes?.filter(client => client.status) || [];

  const { data: onboardData, isLoading: isLoadingOnboard } =
    useGetOnboardByIdQuery(id ?? 0, { 
      skip: !id,
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true
    });

  const controleData = onboardData?.controleUber;

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OnboardFormData>({
    defaultValues: {
      placa: "",
      dt_horario_inicio: "",
      km_inicio: 0,
      dt_horario_pausa: null,
      dt_horario_retorno_pausa: null,
      motivo_pausa: null,
      km_final: null,
      dt_horario_final: null,
      avaria: null,
      gastosGanhosUber: null,
      gastosGanhosBolt: null,
      reasonChange: "",
      idMotorista: null,
      abastecimentos: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "abastecimentos",
  });

  useEffect(() => {
    if (controleData) {
      console.log("Dados do controle carregados:", controleData);
      console.log("Placa do controle:", controleData.placa);
      let motoristaId = null;
      if (controleData.motorista) {
        const motoristaEncontrado = motoristasResponse?.usuarios?.find(
          usuario => usuario.id === controleData.motorista.id
        );
        if (motoristaEncontrado) {
          motoristaId = String(motoristaEncontrado.motorista.id);
        } else {
          motoristaId = String(controleData.motorista.id);
        }
      }

      reset({
        placa: controleData.placa || "",
        dt_horario_inicio: controleData.dt_horario_inicio
          ? new Date(controleData.dt_horario_inicio).toISOString().slice(0, 16)
          : "",
        km_inicio: controleData.km_inicio ? parseFloat(controleData.km_inicio.toString()) : 0,
        dt_horario_pausa: controleData.dt_horario_pausa
          ? new Date(controleData.dt_horario_pausa).toISOString().slice(0, 16)
          : null,
        dt_horario_retorno_pausa: controleData.dt_horario_retorno_pausa
          ? new Date(controleData.dt_horario_retorno_pausa)
              .toISOString()
              .slice(0, 16)
          : null,
        motivo_pausa: controleData.motivo_pausa || null,
        km_final: controleData.km_final ? parseFloat(controleData.km_final.toString()) : null,
        dt_horario_final: controleData.dt_horario_final
          ? new Date(controleData.dt_horario_final).toISOString().slice(0, 16)
          : null,
        avaria: controleData.avaria || null,
        idMotorista: motoristaId,
        gastosGanhosUber: controleData.gastosGanhosUber || null,
        gastosGanhosBolt: controleData.gastosGanhosBolt || null,
        abastecimentos: controleData.abastecimentos
          ? controleData.abastecimentos.map((abastecimento: any) => ({
              id: abastecimento.id,
              km_abastecimento: abastecimento.km_abastecimento,
              valor_abastecimento: abastecimento.valor_abastecimento,
              qtd_litros_abastecido: abastecimento.qtd_litros_abastecido,
              data_abastecimento: abastecimento.data_abastecimento
                ? new Date(abastecimento.data_abastecimento)
                    .toISOString()
                    .slice(0, 16)
                : "",
              tipo_combustivel: abastecimento.tipo_combustivel
            }))
          : [],
        reasonChange: ""
      });
      
      if (controleData.id_empresa) {
        setSelectedCompanyId(controleData.id_empresa.toString());
      }
    }
  }, [controleData, reset, motoristasResponse?.usuarios]);

  useEffect(() => {
    if (controleData && viaturas && viaturas.viaturas) {
      console.log("Tentando selecionar viatura com placa:", controleData.placa);
      
      const viaturaEncontrada = viaturas.viaturas.find(
        viatura => viatura.placa === controleData.placa
      );
      
      if (viaturaEncontrada) {
        console.log("Viatura encontrada:", viaturaEncontrada);
        setValue('placa', controleData.placa);
      } else {
        console.warn(`Viatura com placa ${controleData.placa} não encontrada na lista. Placas disponíveis:`, 
          viaturas.viaturas.map(v => v.placa).join(', '));
        
        setValue('placa', controleData.placa);
      }
    }
  }, [controleData, viaturas, setValue]);

  useEffect(() => {
    if (controleData && controleData.placa) {
      console.log("Definindo placa inicial:", controleData.placa);
      setValue('placa', controleData.placa);
    }
  }, [controleData, setValue]);

  const onSubmit = async (data: OnboardFormData) => {
    try {
      const formattedData = {
        id_empresa: userRole === "superadmin" ? parseInt(selectedCompanyId) : undefined,
        controleUberData: {
          id_empresa: userRole === "superadmin" ? parseInt(selectedCompanyId) : undefined,
          id_user: controleData?.id_user || 0,
          id_device: controleData?.id_device || "",
          idMotorista: data.idMotorista ? parseInt(data.idMotorista) : undefined,
          placa: data.placa,
          dt_horario_inicio: data.dt_horario_inicio,
          km_inicio: data.km_inicio,
          dt_horario_pausa: data.dt_horario_pausa,
          dt_horario_retorno_pausa: data.dt_horario_retorno_pausa,
          km_final: data.km_final,
          dt_horario_final: data.dt_horario_final,
          avaria: data.avaria,
          motivo_pausa: data.motivo_pausa,
        },
        gastosGanhosUber: data.gastosGanhosUber,
        gastosGanhosBolt: data.gastosGanhosBolt,
        abastecimentos: data.abastecimentos,
        motivo_alteracao: data.reasonChange,
      };

      if (userRole === "superadmin" && selectedCompanyId) {
        formattedData.controleUberData.id_empresa = parseInt(selectedCompanyId);
      }

      if (id) {
        await updateOnboard({ id, ...formattedData }).unwrap();
        toast.success(t("onboard.updateSuccess"));
      } else {
        await createOnboard(formattedData).unwrap();
        toast.success(t("onboard.createSuccess"));
      }
      onSave();
    } catch (error) {
      handleApiError(error);
    }
  };

  if (isLoadingOnboard) {
    return <Skeleton className="h-[400px]" />;
  }

  const hasPause = watch("dt_horario_pausa");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {isLoadingOnboard ? (
        <Skeleton className="h-[400px]" />
      ) : (
        <>
          {userRole === "superadmin" && (
            <div className="space-y-2">
              <Label htmlFor="id_empresa">{t("drivers.company")}</Label>
              <Select
                onValueChange={setSelectedCompanyId}
                value={selectedCompanyId}
              >
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
          )}

          <div className="space-y-2">
            <Label htmlFor="idMotorista">{t("onboard.driver", "Motorista")}</Label>
            {isLoadingMotoristas ? (
              <Skeleton className="h-10 w-full" />
            ) : (userRole === "superadmin" && !selectedCompanyId) ? (
              <div className="text-sm text-gray-500">
                {t("onboard.selectCompanyFirst", "Selecione uma empresa primeiro")}
              </div>
            ) : (
              <Controller
                name="idMotorista"
                control={control}
                render={({ field }) => (
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value || ""}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("onboard.selectDriver", "Selecione um motorista")} />
                    </SelectTrigger>
                    <SelectContent>
                      {id && controleData?.motorista && !motoristasResponse?.usuarios?.some(
                        u => u.id === controleData.motorista.id
                      ) && (
                        <SelectItem 
                          key={`current-${controleData.motorista.id}`} 
                          value={String(controleData.motorista.id)}
                          className="flex items-center gap-2"
                        >
                          <div className="flex items-center gap-2">
                            {controleData.motorista.photo && (
                              <img 
                                src={controleData.motorista.photo} 
                                alt={controleData.motorista.name} 
                                className="w-6 h-6 rounded-full" 
                              />
                            )}
                            <span>{controleData.motorista.name}</span>
                            <span className="text-xs text-gray-500">
                              (Motorista atual)
                            </span>
                          </div>
                        </SelectItem>
                      )}
                      {motoristasResponse?.usuarios?.map((usuario) => (
                        <SelectItem 
                          key={usuario.motorista.id} 
                          value={String(usuario.motorista.id)}
                          className="flex items-center gap-2"
                        >
                          <div className="flex items-center gap-2">
                            {usuario.foto && (
                              <img 
                                src={usuario.foto} 
                                alt={usuario.name} 
                                className="w-6 h-6 rounded-full" 
                              />
                            )}
                            <span>{usuario.name}</span>
                            {controleData?.motorista && usuario.id === controleData.motorista.id && (
                              <span className="text-xs text-gray-500">
                                (Motorista atual)
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              ({usuario.motorista.appUser})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="placa">
              {t("onboard.vehicle")}
              <RequiredFieldIndicator />
            </Label>
            {isLoadingViaturas ? (
              <Skeleton className="h-10 w-full" />
            ) : (userRole === "superadmin" && !selectedCompanyId) ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t("drivers.attention")}</AlertTitle>
                <AlertDescription>
                  {t("drivers.selectCompanyFirst")}
                </AlertDescription>
              </Alert>
            ) : viaturas && viaturas.viaturas.length === 0 ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t("drivers.attention")}</AlertTitle>
                <AlertDescription>
                  {t("drivers.noVehiclesAvailable")}
                </AlertDescription>
              </Alert>
            ) : (
              <Controller
                name="placa"
                control={control}
                rules={{ required: t("onboard.fieldRequired") }}
                render={({ field }) => (
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value || ""}
                    disabled={isLoadingViaturas}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("onboard.selectVehicle")} />
                    </SelectTrigger>
                    <SelectContent>
                      {controleData && 
                       controleData.placa && 
                       !viaturas?.viaturas.some(v => v.placa === controleData.placa) && (
                        <SelectItem 
                          key="current-vehicle" 
                          value={controleData.placa}
                        >
                          <div className="flex items-center gap-2">
                            <span>{controleData.placa}</span>
                            <span className="text-xs text-amber-500">
                              ({t("onboard.currentVehicleNotAvailable")})
                            </span>
                          </div>
                        </SelectItem>
                      )}
                      
                      {viaturas?.viaturas.map((viatura) => (
                        <SelectItem 
                          key={`vehicle-${viatura.id}`} 
                          value={viatura.placa}
                          className={`flex items-center gap-2 ${viatura.avarias && viatura.avarias.length > 0 ? 'text-red-500' : ''}`}
                        >
                          <div className="flex items-center gap-2">
                            {viatura.foto && (
                              <img 
                                src={viatura.foto} 
                                alt={viatura.modelo} 
                                className="w-6 h-6 rounded-full" 
                              />
                            )}
                            <span>{viatura.placa} - {viatura.modelo}</span>
                            {viatura.avarias && viatura.avarias.length > 0 && (
                              <span className="text-xs text-red-500">
                                ({t("dashboard.damageReported")})
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="km_inicio">{t("onboard.startKm")}</Label>
              <Controller
                name="km_inicio"
                control={control}
                render={({ field }) => (
                  <Input {...field} type="number" min="0" />
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dt_horario_inicio">
                {t("onboard.startTime")}
              </Label>
              <Controller
                name="dt_horario_inicio"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="datetime-local"
                    max={`${MAX_YEAR}-12-31T23:59`}
                  />
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dt_horario_final">{t("onboard.endTime")}</Label>
              <Controller
                name="dt_horario_final"
                control={control}
                render={({ field: { value, onChange, ...field } }) => (
                  <Input
                    {...field}
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value || null)}
                    type="datetime-local"
                    max={`${MAX_YEAR}-12-31T23:59`}
                  />
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dt_horario_pausa">{t("onboard.pauseTime")}</Label>
              <Controller
                name="dt_horario_pausa"
                control={control}
                render={({ field: { value, onChange, ...field } }) => (
                  <Input
                    {...field}
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value || null)}
                    type="datetime-local"
                    max={`${MAX_YEAR}-12-31T23:59`}
                  />
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dt_horario_retorno_pausa">
                {t("onboard.returnFromPauseTime")}
              </Label>
              <Controller
                name="dt_horario_retorno_pausa"
                control={control}
                render={({ field: { value, onChange, ...field } }) => (
                  <Input
                    {...field}
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value || null)}
                    type="datetime-local"
                    max={`${MAX_YEAR}-12-31T23:59`}
                  />
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="motivo_pausa">{t("onboard.pauseReason")}</Label>
              <Controller
                name="motivo_pausa"
                control={control}
                render={({ field: { value, onChange, ...field } }) => (
                  <Input
                    {...field}
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value || null)}
                    placeholder={t("onboard.pauseReasonPlaceholder")}
                  />
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="km_final">{t("onboard.endKm")}</Label>
              <Controller
                name="km_final"
                control={control}
                render={({ field: { value, onChange, ...field } }) => (
                  <Input
                    {...field}
                    value={value || ""}
                    onChange={(e) =>
                      onChange(e.target.value ? Number(e.target.value) : null)
                    }
                    type="number"
                    min="0"
                  />
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avaria">{t("onboard.breakdown")}</Label>
              <Controller
                name="avaria"
                control={control}
                render={({ field: { value, onChange, ...field } }) => (
                  <Input
                    {...field}
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value || null)}
                  />
                )}
              />
            </div>
          </div>

          <div className="border p-4 rounded-md">
            <h3 className="font-medium mb-4">{t("onboard.uberEarnings")}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gastosGanhosUber.valor_uber">
                  {t("onboard.uberValue")}
                </Label>
                <Controller
                  name="gastosGanhosUber.valor_uber"
                  control={control}
                  render={({ field: { onChange, value, ...restField } }) => (
                    <Input
                      {...restField}
                      type="text"
                      value={formatCurrencyInput(value || "")}
                      onChange={(e) => {
                        const formattedValue = formatCurrencyInput(e.target.value);
                        e.target.value = formattedValue;
                        onChange(parseCurrencyInput(formattedValue));
                      }}
                      placeholder="€ 0,00"
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gastosGanhosUber.vl_gorjeta_uber">
                  {t("onboard.uberTips")}
                </Label>
                <Controller
                  name="gastosGanhosUber.vl_gorjeta_uber"
                  control={control}
                  render={({ field: { onChange, value, ...restField } }) => (
                    <Input
                      {...restField}
                      type="text"
                      value={formatCurrencyInput(value || "")}
                      onChange={(e) => {
                        const formattedValue = formatCurrencyInput(e.target.value);
                        e.target.value = formattedValue;
                        onChange(parseCurrencyInput(formattedValue));
                      }}
                      placeholder="€ 0,00"
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gastosGanhosUber.vl_portagem_uber">
                  {t("onboard.uberToll")}
                </Label>
                <Controller
                  name="gastosGanhosUber.vl_portagem_uber"
                  control={control}
                  render={({ field: { onChange, value, ...restField } }) => (
                    <Input
                      {...restField}
                      type="text"
                      value={formatCurrencyInput(value || "")}
                      onChange={(e) => {
                        const formattedValue = formatCurrencyInput(e.target.value);
                        e.target.value = formattedValue;
                        onChange(parseCurrencyInput(formattedValue));
                      }}
                      placeholder="€ 0,00"
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gastosGanhosUber.qtd_horas_uber">
                  {t("onboard.uberHours")}
                </Label>
                <Controller
                  name="gastosGanhosUber.qtd_horas_uber"
                  control={control}
                  render={({ field: { value, onChange, ...field } }) => (
                    <Input
                      {...field}
                      type="time"
                      value={decimalToTime(value)}
                      onChange={(e) => onChange(timeToDecimal(e.target.value))}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gastosGanhosUber.qtd_viagens_uber">
                  {t("onboard.uberTrips")}
                </Label>
                <Controller
                  name="gastosGanhosUber.qtd_viagens_uber"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} type="number" min="0" />
                  )}
                />
              </div>
            </div>
          </div>

          <div className="border p-4 rounded-md">
            <h3 className="font-medium mb-4">{t("onboard.boltEarnings")}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gastosGanhosBolt.valor_bolt">
                  {t("onboard.boltValue")}
                </Label>
                <Controller
                  name="gastosGanhosBolt.valor_bolt"
                  control={control}
                  render={({ field: { onChange, value, ...restField } }) => (
                    <Input
                      {...restField}
                      type="text"
                      value={formatCurrencyInput(value || "")}
                      onChange={(e) => {
                        const formattedValue = formatCurrencyInput(e.target.value);
                        e.target.value = formattedValue;
                        onChange(parseCurrencyInput(formattedValue));
                      }}
                      placeholder="€ 0,00"
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gastosGanhosBolt.vl_gorjeta_bolt">
                  {t("onboard.boltTips")}
                </Label>
                <Controller
                  name="gastosGanhosBolt.vl_gorjeta_bolt"
                  control={control}
                  render={({ field: { onChange, value, ...restField } }) => (
                    <Input
                      {...restField}
                      type="text"
                      value={formatCurrencyInput(value || "")}
                      onChange={(e) => {
                        const formattedValue = formatCurrencyInput(e.target.value);
                        e.target.value = formattedValue;
                        onChange(parseCurrencyInput(formattedValue));
                      }}
                      placeholder="€ 0,00"
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gastosGanhosBolt.qtd_horas_bolt">
                  {t("onboard.boltHours")}
                </Label>
                <Controller
                  name="gastosGanhosBolt.qtd_horas_bolt"
                  control={control}
                  render={({ field: { value, onChange, ...field } }) => (
                    <Input
                      {...field}
                      type="time"
                      value={decimalToTime(value)}
                      onChange={(e) => onChange(timeToDecimal(e.target.value))}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gastosGanhosBolt.qtd_viagens_bolt">
                  {t("onboard.boltTrips")}
                </Label>
                <Controller
                  name="gastosGanhosBolt.qtd_viagens_bolt"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} type="number" min="0" />
                  )}
                />
              </div>
            </div>
          </div>

          <div className="border p-4 rounded-md">
            <h3 className="font-medium mb-4">{t("onboard.fuelings")}</h3>
            {fields.map((item, index) => (
              <div key={item.id} className="mb-4 border p-2 rounded-md">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`abastecimentos.${index}.km_abastecimento`}>
                      {t("onboard.fuelingKm")}
                    </Label>
                    <Controller
                      control={control}
                      name={`abastecimentos.${index}.km_abastecimento`}
                      render={({ field }) => (
                        <Input {...field} type="number" min="0" />
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor={`abastecimentos.${index}.valor_abastecimento`}
                    >
                      {t("onboard.fuelingValue")}
                    </Label>
                    <Controller
                      control={control}
                      name={`abastecimentos.${index}.valor_abastecimento`}
                      render={({ field: { onChange, value, ...restField } }) => (
                        <Input
                          {...restField}
                          type="text"
                          value={formatCurrencyInput(value || "")}
                          onChange={(e) => {
                            const formattedValue = formatCurrencyInput(e.target.value);
                            e.target.value = formattedValue;
                            onChange(parseCurrencyInput(formattedValue));
                          }}
                          placeholder="€ 0,00"
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor={`abastecimentos.${index}.qtd_litros_abastecido`}
                    >
                      {t("onboard.fueledLiters")}
                    </Label>
                    <Controller
                      control={control}
                      name={`abastecimentos.${index}.qtd_litros_abastecido`}
                      render={({ field }) => (
                        <Input {...field} type="number" step="0.01" min="0" />
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor={`abastecimentos.${index}.data_abastecimento`}
                    >
                      {t("onboard.fuelingDate")}
                    </Label>
                    <Controller
                      control={control}
                      name={`abastecimentos.${index}.data_abastecimento`}
                      render={({ field }) => (
                        <Input {...field} type="datetime-local" />
                      )}
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <Label htmlFor={`abastecimentos.${index}.tipo_combustivel`}>
                    {t("onboard.fuelType")}
                  </Label>
                  <Controller
                    control={control}
                    name={`abastecimentos.${index}.tipo_combustivel`}
                    render={({ field }) => <Input {...field} />}
                  />
                </div>
                <div className="flex justify-end mt-2">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => remove(index)}
                  >
                    {t("onboard.removeFueling", "Remover Abastecimento")}
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                append({
                  km_abastecimento: 0,
                  valor_abastecimento: "",
                  qtd_litros_abastecido: "",
                  data_abastecimento: "",
                  tipo_combustivel: "",
                })
              }
            >
              {t("common.addFueling")}
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reasonChange">
              {t("onboard.reasonChange")}
              <RequiredFieldIndicator />
            </Label>
            <Controller
              name="reasonChange"
              control={control}
              rules={{ required: t("onboard.fieldRequired") }}
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value || null)}
                  placeholder={t("onboard.reasonChangePlaceholder")}
                />
              )}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              {t("common.cancel")}
            </Button>
            <Button type="submit">{t("common.save")}</Button>
          </div>
        </>
      )}
    </form>
  );
}

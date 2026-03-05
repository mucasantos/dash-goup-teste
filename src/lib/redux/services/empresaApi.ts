import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/redux/apiConfig";
import { Vehicle, VehicleResponse } from "@/types/vehicle";
import { Driver, DriversResponse } from "@/types/driver";
import { User } from "./authApi";
import Cookies from "js-cookie";
import { SuperAdminOverviewData } from "@/types/superAdminOverview";
import { Client, ClientsResponse } from "@/types/client";

export interface Motorista {
  id: number;
  name: string;
}

export interface Viatura {
  id: number;
  plate: string;
}

interface DashboardData {
  hasDamage: boolean;
  licenses: {
    data: Array<{
      id: number;
      type: string;
      isActive: boolean;
      expirationDate: string;
      assignedTo: number | null;
    }>;
    totalLicenses: number;
    activeLicenses: number;
  };
  drivers: {
    data: Array<{
      id: number;
      name: string;
      status: string;
      licenseId: number;
      totalHoursOnline: number;
      totalRevenue: number;
    }>;
    totalDrivers: number;
    onlineDrivers: number;
  };
  vehicles: {
    data: Array<{
      id: string;
      licensePlate: string;
      status: string;
      totalKm: number;
      totalHoursOnline: number;
    }>;
    totalVehicles: number;
    activeVehicles: number;
  };
  journeyEntries: {
    data: Array<{
      id: number;
      userId: number;
      vehicleId: string;
      startTime: string;
      endTime: string | null;
      startKm: number;
      endKm: number;
      distanceTravelled: number;
      pause: {
        start: string | null;
        end: string | null;
        reason: string | null;
      };
      issues: string | null;
    }>;
    totalJourneys: number;
  };
  refuelings: {
    data: Array<{
      id: number;
      controlId: number;
      refuelKm: number;
      fuelAmount: number;
      totalCost: number;
      fuelType: string;
      refuelDate: string;
    }>;
    totalRefuelings: number;
    totalFuelLiters: number;
    totalFuelCost: number;
  };
  revenues: {
    data: Array<{
      id: number;
      controlId: number;
      platform: string;
      revenue: number;
      tip: number;
      hoursWorked: number;
      trips: number;
      toll?: number;
    }>;
    totalRevenue: number;
    totalTips: number;
    totalTrips: number;
  };
}

export interface EmpresaResponse {
  id: number;
  nome_razao_social: string;
  nif_nipc: string;
  whatsapp: string;
  endereco: string;
  cidade: string;
  pais: string;
  contacto: string;
  email: string;
  status: boolean;
  createdAt: string;
  
  updatedAt: string;
  usuarios: {
    id: number;
    name: string;
    email: string;
    role: string;
    id_empresa: number;
    first_time: boolean;
    createdAt: string;
    updatedAt: string;
    motorista: {
      id: number;
      user: {
        id: number;
        name: string;
      };
      id_user: number;
      id_empresa: number;
      phoneNumber: string;
      ultimaViatura: any;

      motorista: {
        name: string;
      };
      birthDate: string;
      address: string;
      nationality: string;
      cartaoCidadao: string;
      validadeCartaoCidadao: string;
      arquivoCartaoCidadao: string | null;
      registroCriminal: string;
      validadeRegistroCriminal: string;
      arquivoRegistroCriminal: string | null;
      licencaIMT: string;
      validadeLicencaIMT: string;
      arquivoLicencaIMT: string | null;
      cartaConducao: string;
      validadeCartaConducao: string;
      arquivoCartaConducao: string | null;
      foto: string | null;
      bankName: string;
      ibanNumber: string;
      mbwayNumber: string;
      workShift: string;
      status: string;
      appUser: string;
    };
  }[];
}

export interface UpdateEmpresaRequest {
  nome_razao_social: string;
  endereco: string;
  cidade: string;
  pais: string;
  contacto: string;
  email: string;
  password: string;
  nif_nipc: string;
}

export interface UpdateEmpresaResponse {
  message: string;
  empresa: EmpresaResponse;
  usuario: User;
}

interface GastosUber {
  id: number;
  id_controle: number;
  valor_uber: string;
  vl_gorjeta_uber: string;
  vl_portagem_uber: string;
  qtd_horas_uber: string;
  qtd_viagens_uber: number;
}

interface GastosBolt {
  id: number;
  id_controle: number;
  valor_bolt: string;
  vl_gorjeta_bolt: string;
  qtd_horas_bolt: string;
  qtd_viagens_bolt: number;
}

interface ControleUber {
  id: number;
  id_user: number;
  id_device: string;
  placa: string;
  dt_horario_inicio: string;
  km_inicio: number;
  dt_horario_pausa: string | null;
  dt_horario_retorno_pausa: string | null;
  motivo_pausa: string | null;
  km_final: number;
  dt_horario_final: string | null;
  avaria: string | null;
  gastosGanhosUber: GastosUber | null;
  gastosGanhosBolt: GastosBolt | null;
}

interface OnboardResponse {
  controleUbers: Array<{
    id: number;
    id_empresa: number;
    id_motorista: number;
    motorista: {
      id: number;
      name: string;
      photo: string | null;
    };
    placa: string;
    dt_horario_inicio: string;
    km_inicio: number;
    dt_horario_pausa: string | null;
    dt_horario_retorno_pausa: string | null;
    motivo_pausa: string | null;
    dt_horario_final: string | null;
    km_final: number | null;
    avaria: string | null;
    motivo_alteracao: string | null;
    gastosGanhosUber: {
      valor_uber: string;
      gorjetas_uber: string;
      portagem_uber: string;
      horas_uber: string;
      viagens_uber: string;
    } | null;
    gastosGanhosBolt: {
      valor_bolt: string;
      gorjetas_bolt: string;
      horas_bolt: string;
      viagens_bolt: string;
    } | null;
    abastecimento: {
      km_abastecimento: number;
      valor_abastecimento: number;
      litros_abastecimento: number;
      data_abastecimento: string;
      tipo_combustivel: string;
    } | null;
    createdAt: string;
    updatedAt: string;
  }>;
  currentPage: number;
  totalPages: number;
  totalControleUbers: number;
}

interface OnboardFormData {
  id?: number;
  id_empresa?: number;
  id_motorista?: number;
  id_viatura?: number;
  data?: string;
  hora_inicio?: string;
  km_inicio?: number;
  hora_pausa?: string;
  hora_retorno_pausa?: string;
  motivo_pausa?: string;
  hora_fim?: string;
  km_fim?: number;
  avaria?: boolean;
  motivo_alteracao?: string;
  ganhos_uber?: number;
  valor_uber?: number;
  gorjetas_uber?: number;
  portagem_uber?: number;
  horas_uber?: number;
  viagens_uber?: number;
  ganhos_bolt?: number;
  valor_bolt?: number;
  gorjetas_bolt?: number;
  horas_bolt?: number;
  abastecimento?: boolean;
  km_abastecimento?: number;
  categoria_profissional?: string;
  data_inicio_prestacao?: string;
  valor_abastecimento?: number;
  litros_abastecimento?: number;
  data_abastecimento?: string;
  tipo_combustivel?: string;
}

interface BuyLicensesInput {
  id_empresa: number;
  license_type: string;
  periodicity: string;
}

export const empresaApi = createApi({
  reducerPath: "empresaApi",
  baseQuery,
  endpoints: (builder) => ({
    getMotoristas: builder.query<{
      usuarios: any[];
      currentPage: number;
      totalPages: number;
      totalUsuarios: number;
    }, Partial<{ id_empresa: number; page: number }>>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.id_empresa) queryParams.append('id_empresa', params.id_empresa.toString());
        if (params.page) queryParams.append('page', params.page.toString());
        return `/empresa/motoristas?${queryParams.toString()}`;
      },
      keepUnusedDataFor: 0,
    }),
    getMotoristaById: builder.query<Driver, number>({
      query: (id) => `/empresa/motorista/${id}`,
      keepUnusedDataFor: 0,
    }),
    addMotorista: builder.mutation<Driver, { data: FormData | string; contentType?: string }>({
      query: ({ data, contentType }) => ({
        url: "/empresa/motorista",
        method: "POST",
        body: data,
        headers: contentType ? { 'Content-Type': contentType } : {},
      }),
    }),
    attributeLicense: builder.mutation<
      { message: string | { code: string } },
      { 
        empresa_id: string; 
        motorista_id: string; 
        order_id: string;
        license_id: string 
      }
    >({
      query: (body) => ({
        url: "/empresa/attribute_license",
        method: "POST",
        body,
      }),
    }),

    updateMotorista: builder.mutation<Driver, { id: number; data: FormData | string; contentType?: string }>({
      query: ({ id, data, contentType }) => ({
        url: `/empresa/motorista/${id}`,
        method: "PUT",
        body: data,
        headers: contentType ? { 'Content-Type': contentType } : {},
      }),
    }),
    deleteMotorista: builder.mutation<void, number>({
      query: (id) => ({
        url: `/empresa/motorista/${id}`,
        method: "DELETE",
      }),
    }),

    getViaturas: builder.query<
      VehicleResponse & { totalPages: number },
      { id_empresa?: number; page?: number } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.id_empresa) {
          queryParams.append('id', String(params.id_empresa));
        }
        if (params?.page) {
          queryParams.append('page', String(params.page));
        }
        return `/empresa/viaturas?${queryParams.toString()}`;
      },
      keepUnusedDataFor: 0,
    }),
    getViaturaById: builder.query<Vehicle, number>({
      query: (id) => `/empresa/viatura/${id}`,
      keepUnusedDataFor: 0,
    }),
    addViatura: builder.mutation<Vehicle, FormData>({
      query: (data) => ({
        url: "/empresa/viatura",
        method: "POST",
        body: data,
      }),
    }),
    updateViatura: builder.mutation<Vehicle, { id: number; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/empresa/viatura/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    deleteViatura: builder.mutation<void, number>({
      query: (id) => ({
        url: `/empresa/viatura/${id}`,
        method: "DELETE",
      }),
    }),

    getLicenses: builder.query<
      {
        licencas: Array<{
          order_id: number;
          date_created: string;
          date_completed: string;
          status: string;
          post_title: string;
          post_excerpt: string;
          cliente_wp: string;
          email_wp: string;
          empresa_id: number;
          empresa_local: string;
        }>;
        pagination: {
          currentPage: number;
          totalPages: number;
          totalLicencas: number;
        }
      },
      { page?: number; id_empresa?: number }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.page) {
          queryParams.append('page', String(params.page));
        }
        if (params?.id_empresa) {
          queryParams.append('id_empresa', String(params.id_empresa));
        }
        return `/empresa/list_licencas?${queryParams.toString()}`;
      },
      keepUnusedDataFor: 0,
    }),
    purchaseLicense: builder.mutation<
      {
        message: string;
        licencasEmpresa: {
          id: number;
          codigo: string;
          quantidade: number;
          ativo: boolean;
          id_empresa: number;
          createdAt: string;
          updatedAt: string;
        };
      },
      { quantityLicenca: number }
    >({
      query: (data) => ({
        url: "/empresa/licenca",
        method: "PATCH",
        body: data,
      }),
    }),
    updateEmpresa: builder.mutation<
      UpdateEmpresaResponse,
      UpdateEmpresaRequest
    >({
      query: (data) => ({
        url: "/empresa/update-empresa",
        method: "PUT",
        body: data,
      }),
    }),
    getDevices: builder.query<
      { dispositivos: any[]; totalPages: number },
      { id_empresa?: number; page?: number } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.id_empresa) {
          queryParams.append('id', String(params.id_empresa));
        }
        if (params?.page) {
          queryParams.append('page', String(params.page));
        }
        return `/empresa/listar-dispositivos?${queryParams.toString()}`;
      },
      keepUnusedDataFor: 0,
    }),
    updateDevice: builder.mutation<
      {
        message: string;
        dispositivo: {
          id: number;
          id_empresa: number;
          id_motorista: number;
          identificacao: string;
          status: boolean;
          createdAt: string;
          updatedAt: string;
        };
      },
      {
        id: number;
        status: boolean;
      }
    >({
      query: (data) => ({
        url: "/empresa/atualizar-dispositivo",
        method: "PUT",
        body: data,
      }),
    }),
    getAvailableLicenses: builder.query<
      {
        licencas: Array<{
          order_id: number;
          licence_id: string;
          date_created: string;
          date_completed: string;
          status: string;
          motorista_id: number | null;
          motorista_name: string | null;
          post_title: string;
          post_excerpt: string;
        }>;
        currentPage: number;
        totalPages: number;
        totalItems: number;
      },
      { id_empresa: number }
    >({
      query: (params) => `/empresa/list_open_license?id_empresa=${params.id_empresa}`,
      keepUnusedDataFor: 0,
    }),
    getDashboardData: builder.query<
      DashboardData,
      { startDate: string; endDate: string }
    >({
      query: ({ startDate, endDate }) =>
        `/empresa/dashboard-data?startDate=${startDate}&endDate=${endDate}`,
    }),
    getSuperAdminOverview: builder.query<SuperAdminOverviewData[], void>({
      query: () => "/admin/overview",
    }),
    deleteAvaria: builder.mutation<void, number>({
      query: (id) => ({
        url: `/empresa/avaria/${id}`,
        method: "DELETE",
      }),
    }),
    getClients: builder.query<
      ClientsResponse & { totalPages: number },
      { page?: number } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.page) {
          queryParams.append('page', String(params.page));
        }
        return `/admin/clientes?${queryParams.toString()}`;
      },
      keepUnusedDataFor: 0,
    }),
    getClientById: builder.query<Client, number>({
      query: (id) => `/admin/cliente/${id}`,
      keepUnusedDataFor: 0,
    }),
    createClient: builder.mutation<Client, Partial<Client>>({
      query: (data) => ({
        url: "/admin/cliente",
        method: "POST",
        body: data,
      }),
    }),
    updateClient: builder.mutation<Client, { id: string | number } & Partial<Client>>({
      query: ({ id, ...data }) => ({
        url: `/admin/cliente/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    deleteClient: builder.mutation<void, string | number>({
      query: (id) => ({
        url: `/admin/cliente/${id}`,
        method: "DELETE",
      }),
    }),
    removeLicense: builder.mutation<
      { message: string },
      { motorista_id: number; order_id: number, license_id: number }
    >({
      query: (data) => ({
        url: "/empresa/remove_license",
        method: "DELETE",
        body: data,
      }),
    }),
    getOnboardControl: builder.query<OnboardResponse, {
      page?: number;
      idEmpresa?: number;
      idMotorista?: number;
      placa?: string;
      data?: string;
    }>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.idEmpresa) queryParams.append('idEmpresa', params.idEmpresa.toString());
        if (params.idMotorista) queryParams.append('idMotorista', params.idMotorista.toString());
        if (params.placa) queryParams.append('placa', params.placa);
        if (params.data) queryParams.append('data', params.data);
        
        return `/empresa/onboard_control?${queryParams.toString()}`;
      },
      keepUnusedDataFor: 0,
    }),
    getOnboardControlById: builder.query<ControleUber, number>({
      query: (id) => `/empresa/onboard_control/${id}`,
    }),
    updateOnboardControl: builder.mutation<OnboardResponse, OnboardFormData>({
      query: (data) => ({
        url: `/empresa/onboard_control/${data.id}`,
        method: 'PUT',
        body: data,
      }),
    }),
    getOnboardById: builder.query<any, number>({
      query: (id) => `/empresa/onboard_control/${id}`,
    }),
    updateOnboard: builder.mutation<OnboardResponse, { id: number } & Partial<OnboardFormData>>({
      query: ({ id, ...data }) => ({
        url: `/empresa/onboard_control/${id}`,
        method: 'PUT',
        body: data,
      }),
    }),
    createOnboard: builder.mutation<OnboardResponse, Partial<OnboardFormData>>({
      query: (data) => ({
        url: '/empresa/onboard_control',
        method: 'POST',
        body: data,
      }),
    }),
    getMotoristasWithoutLicense: builder.query<{
      motoristas: Array<{
        id: number;
        name: string;
        email: string;
        photo: string | null;
        motorista: {
          id: number;
          id_user: number;
          id_empresa: number;
          appUser: string;
          status: string;
          isOnline: boolean;
        };
        nome_empresa: string;
      }>;
    }, void>({
      query: () => `/empresa/motoristas-sem-licenca`,
      keepUnusedDataFor: 0,
    }),
    buyLicenses: builder.mutation<any, BuyLicensesInput>({
      query: (data) => ({
        url: "/admin/licencas/comprar",
        method: "POST",
        body: data,
      }),
    }),
    getEmpresaDados: builder.query<EmpresaResponse, void>({
      query: () => "/empresa/dados",
      keepUnusedDataFor: 0,
    }),
    updateEmpresaDados: builder.mutation<
      UpdateEmpresaResponse,
      UpdateEmpresaRequest
    >({
      query: (data) => ({
        url: "/empresa/dados",
        method: "PUT",
        body: data,
      }),
    }),
  }),
});

export const {
  useGetDashboardDataQuery: useDashboardDataQuery,
  useDeleteAvariaMutation,
  useGetMotoristasQuery,
  useGetMotoristaByIdQuery,
  useAddMotoristaMutation,
  useUpdateMotoristaMutation,
  useDeleteMotoristaMutation,
  useGetViaturasQuery,
  useGetViaturaByIdQuery,
  useAddViaturaMutation,
  useUpdateViaturaMutation,
  useDeleteViaturaMutation,
  useGetLicensesQuery: useLicensesQuery,
  usePurchaseLicenseMutation,
  useUpdateEmpresaMutation,
  useGetDevicesQuery,
  useUpdateDeviceMutation,
  useGetAvailableLicensesQuery,
  useAttributeLicenseMutation,
  useGetSuperAdminOverviewQuery,
  useGetClientsQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useGetClientByIdQuery,
  useDeleteClientMutation,
  useRemoveLicenseMutation,
  useGetOnboardControlQuery,
  useGetOnboardControlByIdQuery,
  useUpdateOnboardControlMutation,
  useGetOnboardByIdQuery,
  useUpdateOnboardMutation,
  useCreateOnboardMutation,
  useGetMotoristasWithoutLicenseQuery,
  useBuyLicensesMutation,
  useGetEmpresaDadosQuery,
  useUpdateEmpresaDadosMutation,
} = empresaApi;

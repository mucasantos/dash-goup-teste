import {
  type BaseQueryFn,
  type FetchArgs,
  fetchBaseQuery,
  type FetchBaseQueryError,
  type FetchBaseQueryMeta,
  RootState,
} from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";
import { logout } from "./authSlice";

export const BASE_URL = typeof window !== "undefined" ? "/api/proxy" : "https://sea-lion-app-cyclv.ondigitalocean.app";
export const AUTH_BASE_URL = typeof window !== "undefined" ? "/api/wp-proxy" : "https://goupsolutions.pt/wp-json/jwt-auth/v1";

const createBaseQuery = (baseUrl: string) =>
  fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { endpoint }) => {
      if (
        endpoint === "getLicenses" ||
        endpoint === "getAvailableLicenses" ||
        endpoint === "attributeLicense" || 
        endpoint === "removeLicense"
      ) {
        const token_goup = Cookies.get("token_goup");
        if (token_goup) {
          headers.set("authorization", `Bearer ${token_goup}`);
        }
      } else {
        const token = Cookies.get("token");
        if (token) {
          headers.set("authorization", `Bearer ${token}`);
        }
      }
      return headers;
    },
  });

export const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  Record<string, unknown>,
  FetchBaseQueryMeta
> = async (args, api, extraOptions) => {
  const state = api.getState() as any;
  const userRole = state.auth.user?.role;

  let endpoint = typeof args === "string" ? args : args.url;

  const adminRoutes = [
    "/empresa/update-empresa",
    "/empresa/viaturas",
    "/empresa/dispositivos",
    "/empresa/motorista",
    "/empresa/motoristas",
    "/empresa/viatura",
    "/empresa/listar-dispositivos",
    "/empresa/atualizar-dispositivo",
    "/empresa/viatura/motorista",
    "/empresa/onboard_control",
    "/empresa/motoristas-sem-licenca",
    "/empresa/list_licencas"
  ];

  if (userRole === "superadmin") {
    const urlWithoutParams = endpoint.split("?")[0];

    if (adminRoutes.some(route => urlWithoutParams.startsWith(route))) {
      endpoint = endpoint.replace("/empresa", "/admin");
    }
    else if (
      urlWithoutParams.match(/^\/empresa\/motorista\/\d+$/) ||
      urlWithoutParams.match(/^\/empresa\/viatura\/\d+$/)
    ) {
      endpoint = endpoint.replace("/empresa", "/admin");
    }
  }


  const modifiedArgs =
    typeof args === "string" ? endpoint : { ...args, url: endpoint };

  const rawBaseQuery = createBaseQuery(BASE_URL);
  const result = await rawBaseQuery(modifiedArgs, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const errorData = result.error.data as { message?: string };
    if (errorData?.message === "Não autorizado") {
      api.dispatch(logout());
      api.dispatch({ type: "auth/redirectToLogin" });
    }
  }
  return result;
};

export const authBaseQuery = createBaseQuery(AUTH_BASE_URL);

import { createApi } from "@reduxjs/toolkit/query/react"
import { baseQuery, authBaseQuery } from "@/lib/redux/apiConfig"
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query"
import Cookies from "js-cookie"

export interface LoginRequest {
  username: string
  password: string
  language: string
}

export interface RegistrationRequest {
  nome_razao_social: string
  nif_nipc: string
  endereco: string
  cidade: string
  pais: string
  contacto: string
  email: string
  password: string
  language: string
  ativa: boolean
}

export interface User {
  id: number
  name: string
  photo: string | null
  email: string
  role: string | null
  id_empresa: number | null
  first_time: boolean
  createdAt: string
  updatedAt: string
  empresa: {
    whatsapp: string | null
    nif_nipc: string | null
    endereco: string | null
    cidade: string | null
    pais: string | null
    contacto: string | null
    status: boolean
    createdAt: string
    updatedAt: string
  } | null
}

export interface LoginResponse {
  token: string
  user: User
  token_goup: string
  goup_nicename: string
  goup_display_name: string
}

export interface LoginErrorResponse {
  message: string
  haveToCreate: boolean
}

interface WordPressLoginResponse {
  token: string
  user_email: string
  user_nicename: string
  user_display_name: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  email: string
  password: string
  code: string
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery,
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      queryFn: async (args, api, extraOptions) => {
        const wpResult = await authBaseQuery(
          {
            url: "/token",
            method: "POST",
            body: { username: args.username, password: args.password },
          },
          api,
          extraOptions,
        )

        if (wpResult.error) {
          return { error: wpResult.error as FetchBaseQueryError }
        }

        const wpData = wpResult.data as WordPressLoginResponse

        const backendResult = await baseQuery(
          {
            url: "/empresa/login",
            method: "POST",
            body: {
              email: wpData.user_email,
              password: args.password,
              language: args.language,
            },
          },
          api,
          extraOptions,
        )

        if (backendResult.error) {
          const errorData = backendResult.error.data as LoginErrorResponse
          if (errorData.haveToCreate) {
            return {
              error: {
                status: "CUSTOM_ERROR",
                data: { ...errorData },
                error: "Registration required",
              } as FetchBaseQueryError,
            }
          }
          return { error: backendResult.error as FetchBaseQueryError }
        }

        const backendData = backendResult.data as {
          token: string
          user: User
        }

        const combinedData: LoginResponse = {
          ...backendData,
          token_goup: wpData.token,
          goup_nicename: wpData.user_nicename,
          goup_display_name: wpData.user_display_name,
        }

        return { data: combinedData }
      },
    }),
    register: builder.mutation<User, RegistrationRequest>({
      query: (body) => ({
        url: "/empresa/registro",
        method: "POST",
        body,
      }),
    }),
    forgotPassword: builder.mutation<{ message: string }, ForgotPasswordRequest>({
      query: (body) => ({
        url: "/empresa/forgot-password",
        method: "POST",
        body,
      }),
    }),
    resetPassword: builder.mutation<{ message: string }, ResetPasswordRequest>({
      query: (body) => ({
        url: "/empresa/reset-password",
        method: "POST",
        body,
      }),
    }),
  }),
})

export const { 
  useLoginMutation, 
  useRegisterMutation, 
  useForgotPasswordMutation, 
  useResetPasswordMutation 
} = authApi


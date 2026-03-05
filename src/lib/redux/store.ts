import { configureStore } from '@reduxjs/toolkit'
import { authApi } from '@/lib/redux/services/authApi'
import { empresaApi } from '@/lib/redux/services/empresaApi'
import authReducer, { rehydrateAuth } from './authSlice'

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [empresaApi.reducerPath]: empresaApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, empresaApi.middleware),
})

store.dispatch(rehydrateAuth()); 

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch


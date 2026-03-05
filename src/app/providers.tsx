"use client";

import { Provider } from "react-redux";
import { store } from "@/lib/redux/store";
import { AuthProvider } from "@/components/AuthProvider";
import { RouterProvider } from "@/lib/contexts/RouterContext";
import { AuthRedirect } from "@/components/AuthRedirect";
import i18n from './i18n';;
import { I18nextProvider } from 'react-i18next';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>

      <AuthRedirect />
      <RouterProvider>
        <AuthProvider>{children}</AuthProvider>
      </RouterProvider>
      </I18nextProvider>

    </Provider>
  );
}

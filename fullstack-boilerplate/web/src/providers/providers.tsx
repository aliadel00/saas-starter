"use client";

import type { ReactNode } from "react";
import { ApolloProvider } from "./apollo-provider";
import { AuthProvider } from "./auth-provider";
import { ThemeProvider } from "./theme-provider";
import { ToastProvider } from "@/components/toast-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ApolloProvider>
        <AuthProvider>
          {children}
          <ToastProvider />
        </AuthProvider>
      </ApolloProvider>
    </ThemeProvider>
  );
}

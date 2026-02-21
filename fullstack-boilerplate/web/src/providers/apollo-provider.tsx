"use client";

import { useMemo, type ReactNode } from "react";
import { ApolloProvider as ApolloClientProvider } from "@apollo/client";
import { createApolloClient } from "@/lib/apollo-client";

export function ApolloProvider({ children }: { children: ReactNode }) {
  const client = useMemo(() => createApolloClient(), []);

  return (
    <ApolloClientProvider client={client}>{children}</ApolloClientProvider>
  );
}

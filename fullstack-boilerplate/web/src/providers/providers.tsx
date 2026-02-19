'use client';

import type { ReactNode } from 'react';
import { ApolloProvider } from './apollo-provider';
import { AuthProvider } from './auth-provider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ApolloProvider>
      <AuthProvider>{children}</AuthProvider>
    </ApolloProvider>
  );
}

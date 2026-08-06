import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MedicationNotificationSync } from '@/features/medication-notifications';
import { CareGlanceSync } from '@/features/care-glance-notification';
import { AuthProvider } from '@/providers/AuthProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, staleTime: 5_000 },
        },
      }),
  );

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={client}>
        <AuthProvider>
          <MedicationNotificationSync />
          <CareGlanceSync />
          {children}
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

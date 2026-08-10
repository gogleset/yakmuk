import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MedicationNotificationSync } from '@/features/medication-notifications';
import { CareGlanceSync } from '@/features/care-glance-notification';
import { AuthProvider } from '@/providers/AuthProvider';
import { ExceptionFeedbackProvider } from '@/providers/ExceptionFeedbackProvider';
import { MotionProvider } from '@/providers/MotionProvider';

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
          <MotionProvider>
            <ExceptionFeedbackProvider>
              <MedicationNotificationSync />
              <CareGlanceSync />
              {children}
            </ExceptionFeedbackProvider>
          </MotionProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

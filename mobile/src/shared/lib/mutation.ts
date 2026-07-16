import { Alert } from 'react-native';

/** mutation onError 공통 Alert */
export function showMutationError(title: string, error: unknown): void {
  Alert.alert(title, error instanceof Error ? error.message : String(error));
}

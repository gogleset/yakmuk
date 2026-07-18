import { Alert } from 'react-native';
import { formatUserFacingError } from '@/shared/lib/errors';

/** mutation onError 공통 Alert */
export function showMutationError(title: string, error: unknown): void {
  Alert.alert(title, formatUserFacingError(error));
}

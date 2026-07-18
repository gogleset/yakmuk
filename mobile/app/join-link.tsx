import { Redirect, useLocalSearchParams } from 'expo-router';
import { joinRoute, ROUTES } from '@/shared/config/routes';

/** deep link {scheme}://join?code=XXXXXX */
export default function JoinDeepLink() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  if (code) {
    return <Redirect href={joinRoute(String(code))} />;
  }
  return <Redirect href={ROUTES.join} />;
}

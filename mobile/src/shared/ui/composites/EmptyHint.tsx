import { Muted } from '@/shared/ui/primitives/Typography';

type Props = {
  message: string;
  className?: string;
};

export function EmptyHint({ message, className }: Props) {
  return <Muted className={className}>{message}</Muted>;
}

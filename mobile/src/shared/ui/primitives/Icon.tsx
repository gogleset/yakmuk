import type { ComponentType } from 'react';
import {
  Activity,
  CalendarDays,
  Check,
  CheckCircle2,
  Circle,
  Heart,
  Home,
  LogOut,
  Pill,
  Plus,
  QrCode,
  Radio,
  Settings,
  Shield,
  UserPlus,
  Users,
  X,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react-native';
import { cssInterop } from 'nativewind';

function withClassName(Icon: LucideIcon) {
  return cssInterop(Icon, {
    className: {
      target: 'style',
      nativeStyleToProp: {
        color: true,
        opacity: true,
      },
    },
  });
}

export const Icons = {
  Activity: withClassName(Activity),
  Calendar: withClassName(CalendarDays),
  Check: withClassName(Check),
  CheckCircle: withClassName(CheckCircle2),
  Circle: withClassName(Circle),
  Heart: withClassName(Heart),
  Home: withClassName(Home),
  LogOut: withClassName(LogOut),
  Pill: withClassName(Pill),
  Plus: withClassName(Plus),
  QrCode: withClassName(QrCode),
  Radio: withClassName(Radio),
  Settings: withClassName(Settings),
  Shield: withClassName(Shield),
  UserPlus: withClassName(UserPlus),
  Users: withClassName(Users),
  X: withClassName(X),
} as const;

export type IconComponent = ComponentType<LucideProps & { className?: string }>;

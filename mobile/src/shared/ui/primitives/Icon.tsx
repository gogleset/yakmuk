import type { ComponentType } from 'react';
import {
  Activity,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  FileText,
  Heart,
  Home,
  Info,
  LogOut,
  Mail,
  Megaphone,
  Pill,
  Plus,
  QrCode,
  Radio,
  Settings,
  Share2,
  Shield,
  UserPlus,
  Users,
  UserX,
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
  ChevronLeft: withClassName(ChevronLeft),
  ChevronRight: withClassName(ChevronRight),
  Circle: withClassName(Circle),
  FileText: withClassName(FileText),
  Heart: withClassName(Heart),
  Home: withClassName(Home),
  Info: withClassName(Info),
  LogOut: withClassName(LogOut),
  Mail: withClassName(Mail),
  Megaphone: withClassName(Megaphone),
  Pill: withClassName(Pill),
  Plus: withClassName(Plus),
  QrCode: withClassName(QrCode),
  Radio: withClassName(Radio),
  Settings: withClassName(Settings),
  Share: withClassName(Share2),
  Shield: withClassName(Shield),
  UserPlus: withClassName(UserPlus),
  Users: withClassName(Users),
  UserX: withClassName(UserX),
  X: withClassName(X),
} as const;

export type IconComponent = ComponentType<LucideProps & { className?: string }>;

import type { ComponentType } from 'react';
import {
  Activity,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  Cylinder,
  FileText,
  Heart,
  Home,
  Info,
  Layers,
  LogOut,
  Mail,
  Megaphone,
  Milk,
  Moon,
  Package,
  Pill,
  Plus,
  QrCode,
  Radio,
  Settings,
  Share2,
  Shield,
  Sun,
  TriangleAlert,
  UserPlus,
  Users,
  UserX,
  X,
  EllipsisVertical,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import type { MedFormIconId } from '@/shared/constants/medDoseUnits';

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
  Bell: withClassName(Bell),
  Calendar: withClassName(CalendarDays),
  Check: withClassName(Check),
  CheckCircle: withClassName(CheckCircle2),
  ChevronDown: withClassName(ChevronDown),
  ChevronLeft: withClassName(ChevronLeft),
  ChevronRight: withClassName(ChevronRight),
  ChevronUp: withClassName(ChevronUp),
  Circle: withClassName(Circle),
  Cylinder: withClassName(Cylinder),
  EllipsisVertical: withClassName(EllipsisVertical),
  FileText: withClassName(FileText),
  Heart: withClassName(Heart),
  Home: withClassName(Home),
  Info: withClassName(Info),
  Layers: withClassName(Layers),
  LogOut: withClassName(LogOut),
  Mail: withClassName(Mail),
  Megaphone: withClassName(Megaphone),
  /** 물약·방울 — 물통 */
  Milk: withClassName(Milk),
  Moon: withClassName(Moon),
  Package: withClassName(Package),
  Pill: withClassName(Pill),
  Plus: withClassName(Plus),
  QrCode: withClassName(QrCode),
  Radio: withClassName(Radio),
  Settings: withClassName(Settings),
  Share: withClassName(Share2),
  Shield: withClassName(Shield),
  Sun: withClassName(Sun),
  TriangleAlert: withClassName(TriangleAlert),
  UserPlus: withClassName(UserPlus),
  Users: withClassName(Users),
  UserX: withClassName(UserX),
  X: withClassName(X),
} as const;

export type IconComponent = ComponentType<LucideProps & { className?: string }>;

/** dose_unit 형태 → Lucide 아이콘 */
export const MED_FORM_ICONS: Record<MedFormIconId, IconComponent> = {
  tablet: Icons.Pill,
  capsule: Icons.Cylinder,
  powder: Icons.Package,
  liquid: Icons.Milk,
  film: Icons.Layers,
};

import {
  BookType,
  Gavel,
  LayoutDashboard,
  LayoutList,
  type LucideIcon,
  Settings,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
  forbiddenRoles?: string[]; 
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Menu",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard/main",
        icon: LayoutDashboard,
      },
      {
        title: "Pengeluaran",
        url: "/dashboard/spendings-report",
        icon: BookType,
      }
    ],
  },
  {
    id: 2,
    label: "General",
    items: [
      {
        title: "Akun",
        url: "/dashboard/account",
        icon: Settings
      },
      {
        title: "Karyawan",
        url: "/dashboard/employee",
        icon: Settings
      },
      {
        title: "Departemen",
        url: "/dashboard/department",
        icon: Settings
      },
      {
        title: "Pengeluaran",
        url: "/dashboard/spending",
        icon: Settings
      }
    ],
  },
];

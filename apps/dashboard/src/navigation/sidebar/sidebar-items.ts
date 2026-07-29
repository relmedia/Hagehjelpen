import {
  Bot,
  CalendarCheck,
  CalendarDays,
  FileText,
  Inbox,
  LayoutDashboard,
  MapPin,
  MessagesSquare,
  Newspaper,
  Settings,
  Star,
  Tags,
  Wrench,
  type LucideIcon,
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
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Oversikt",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: 2,
    label: "Kunder",
    items: [
      {
        title: "Henvendelser",
        url: "/dashboard/henvendelser",
        icon: Inbox,
        subItems: [
          {
            title: "Åpne",
            url: "/dashboard/henvendelser",
          },
          {
            title: "Arkiv",
            url: "/dashboard/henvendelser/arkiv",
          },
        ],
      },
      {
        title: "Befaringer",
        url: "/dashboard/befaringer",
        icon: CalendarCheck,
        subItems: [
          {
            title: "Kommende",
            url: "/dashboard/befaringer",
          },
          {
            title: "Tidligere",
            url: "/dashboard/befaringer/historikk",
          },
        ],
      },
      {
        title: "Ledige dager",
        url: "/dashboard/ledige-dager",
        icon: CalendarDays,
        subItems: [
          {
            title: "Kommende",
            url: "/dashboard/ledige-dager",
          },
          {
            title: "Tidligere",
            url: "/dashboard/ledige-dager/historikk",
          },
        ],
      },
    ],
  },
  {
    id: 3,
    label: "Innhold",
    items: [
      {
        title: "Tjenester",
        url: "/dashboard/tjenester",
        icon: Wrench,
      },
      {
        title: "Robotklippere",
        url: "/dashboard/klippere",
        icon: Bot,
      },
      {
        title: "Priser",
        url: "/dashboard/priser",
        icon: Tags,
      },
      {
        title: "Dekningsområde",
        url: "/dashboard/dekning",
        icon: MapPin,
      },
      {
        title: "Kundeomtaler",
        url: "/dashboard/omtaler",
        icon: Star,
      },
      {
        title: "Spørsmål og svar",
        url: "/dashboard/sporsmal",
        icon: MessagesSquare,
      },
      {
        title: "Artikler",
        url: "/dashboard/artikler",
        icon: Newspaper,
      },
      {
        title: "Sider",
        url: "/dashboard/sider",
        icon: FileText,
      },
    ],
  },
  {
    id: 4,
    label: "System",
    items: [
      {
        title: "Innstillinger",
        url: "/dashboard/innstillinger",
        icon: Settings,
        subItems: [
          {
            title: "Nettside",
            url: "/dashboard/innstillinger",
          },
          {
            title: "E-post",
            url: "/dashboard/innstillinger/e-post",
          },
        ],
      },
    ],
  },
];

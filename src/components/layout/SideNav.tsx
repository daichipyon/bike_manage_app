"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  UserGroupIcon,
  TicketIcon,
  ExclamationTriangleIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";

const navItems = [
  {
    name: "ダッシュボード",
    href: "/dashboard",
    icon: HomeIcon,
  },
  {
    name: "居住者管理",
    href: "/residents",
    icon: UserGroupIcon,
  },
  {
    name: "駐輪枠割り当て",
    href: "/assign",
    icon: TicketIcon,
  },
  {
    name: "不正利用記録",
    href: "/violations",
    icon: ExclamationTriangleIcon,
  },
  {
    name: "入金管理",
    href: "/payments",
    icon: CreditCardIcon,
  },
];

export default function SideNav() {
  const pathname = usePathname();

  return (
    <nav className="w-64 shrink-0 border-r bg-white p-4 hidden md:block">
      <div className="space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 ${
                  isActive ? "text-blue-600" : "text-gray-400"
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import {
  Building,
  CreditCard,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  Home,
} from "lucide-react";
import Link from "next/link";
import styles from "./AdminLayout.module.css";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: <Home size={20} />,
  },
  {
    name: "Room Management",
    href: "/admin/rooms",
    icon: <Building size={20} />,
  },
  {
    name: "Tenant Management",
    href: "/admin/tenants",
    icon: <Users size={20} />,
  },
  {
    name: "Payment History",
    href: "/admin/payments",
    icon: <CreditCard size={20} />,
  },
  {
    name: "Reports",
    href: "/admin/reports",
    icon: <BarChart3 size={20} />,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: <Settings size={20} />,
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user || user.role !== "admin") {
    router.push("/unauthorized");
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}
      >
        <div className={styles.sidebarHeader}>
          <div className={styles.brand}>
            <Building className={styles.brandIcon} />
            <span className={styles.brandName}>RoomRent Admin</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className={styles.closeButton}
          >
            <X size={20} />
          </button>
        </div>

        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`${styles.navLink} ${
                pathname === item.href ? styles.navLinkActive : ""
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className={styles.userDetails}>
              <span className={styles.userName}>{user.name}</span>
              <span className={styles.userRole}>Administrator</span>
            </div>
          </div>
          <button onClick={handleLogout} className={styles.logoutButton}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={styles.main}>
        {/* Top Header */}
        <header className={styles.header}>
          <button
            onClick={() => setSidebarOpen(true)}
            className={styles.menuButton}
          >
            <Menu size={24} />
          </button>

          <div className={styles.headerContent}>
            <h1 className={styles.pageTitle}>
              {menuItems.find((item) => item.href === pathname)?.name ||
                "Admin Dashboard"}
            </h1>
            <div className={styles.headerActions}>
              <span className={styles.welcomeText}>
                Welcome back, {user.name}!
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className={styles.content}>{children}</main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import {
  Home,
  Users,
  CreditCard,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
  Building,
  Bell,
  FileText,
  Settings,
  Shield,
  Calendar,
  Download,
  Eye,
} from "lucide-react";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarContainer}>
        {/* Logo */}
        <div className={styles.navbarLogo}>
          <Link href="/" className={styles.logoLink}>
            <Home className={styles.logoIcon} />
            <span className={styles.logoText}>RoomRent</span>
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className={styles.navbarMenu}>
          {/* Public Navigation - Always Visible */}
          <Link href="/rooms" className={styles.navLink}>
            <Building size={18} />
            Browse Rooms
          </Link>

          {user ? (
            <>
              {user.role === "admin" ? (
                <>
                  {/* Admin Navigation */}
                  <Link href="/admin" className={styles.navLink}>
                    <BarChart3 size={18} />
                    Dashboard
                  </Link>
                  <Link href="/admin/rooms" className={styles.navLink}>
                    <Building size={18} />
                    Manage Rooms
                  </Link>
                  <Link href="/admin/tenants" className={styles.navLink}>
                    <Users size={18} />
                    Tenants
                  </Link>
                  <Link href="/admin/payments" className={styles.navLink}>
                    <CreditCard size={18} />
                    Payments
                  </Link>
                  <Link href="/admin/reports" className={styles.navLink}>
                    <FileText size={18} />
                    Reports
                  </Link>
                </>
              ) : (
                <>
                  {/* Tenant Navigation */}
                  <Link href="/dashboard" className={styles.navLink}>
                    <Home size={18} />
                    Dashboard
                  </Link>
                  <Link href="/my-room" className={styles.navLink}>
                    <Building size={18} />
                    My Room
                  </Link>
                  <Link href="/payment-history" className={styles.navLink}>
                    <CreditCard size={18} />
                    My Payments
                  </Link>
                </>
              )}

              {/* User Dropdown */}
              <div className={styles.userDropdown}>
                <button className={styles.userBtn}>
                  <div className={styles.userAvatar}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className={styles.userName}>{user.name}</span>
                </button>
                <div className={styles.dropdownMenu}>
                  <Link href="/profile" className={styles.dropdownItem}>
                    <User size={16} />
                    Profile
                  </Link>
                  {user.role === "admin" && (
                    <Link
                      href="/admin/settings"
                      className={styles.dropdownItem}
                    >
                      <Settings size={16} />
                      Admin Settings
                    </Link>
                  )}
                  <Link href="/settings" className={styles.dropdownItem}>
                    <Settings size={16} />
                    Settings
                  </Link>
                  <div className={styles.dropdownDivider}></div>
                  <button
                    onClick={handleLogout}
                    className={`${styles.dropdownItem} ${styles.logoutBtn}`}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.authButtons}>
              <Link href="/features" className={styles.navLink}>
                Features
              </Link>
              <Link href="/pricing" className={styles.navLink}>
                Pricing
              </Link>
              <Link href="/login" className={styles.btnLogin}>
                Login
              </Link>
              <Link href="/register" className={styles.btnRegister}>
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className={styles.mobileMenuBtn}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className={styles.mobileMenu}>
            {/* Public Navigation - Always Visible */}
            <Link
              href="/rooms"
              className={styles.mobileNavLink}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Building size={18} />
              Browse Rooms
            </Link>

            {user ? (
              <>
                {user.role === "admin" ? (
                  <>
                    {/* Admin Mobile Navigation */}
                    <Link
                      href="/admin"
                      className={styles.mobileNavLink}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <BarChart3 size={18} />
                      Dashboard
                    </Link>
                    <Link
                      href="/admin/rooms"
                      className={styles.mobileNavLink}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Building size={18} />
                      Manage Rooms
                    </Link>
                    <Link
                      href="/admin/tenants"
                      className={styles.mobileNavLink}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Users size={18} />
                      Tenants
                    </Link>
                    <Link
                      href="/admin/payments"
                      className={styles.mobileNavLink}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <CreditCard size={18} />
                      Payments
                    </Link>
                    <Link
                      href="/admin/reports"
                      className={styles.mobileNavLink}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <FileText size={18} />
                      Reports
                    </Link>
                  </>
                ) : (
                  <>
                    {/* Tenant Mobile Navigation */}
                    <Link
                      href="/dashboard"
                      className={styles.mobileNavLink}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Home size={18} />
                      Dashboard
                    </Link>
                    <Link
                      href="/my-room"
                      className={styles.mobileNavLink}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Building size={18} />
                      My Room
                    </Link>
                    <Link
                      href="/payment-history"
                      className={styles.mobileNavLink}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <CreditCard size={18} />
                      My Payments
                    </Link>
                  </>
                )}

                <div className={styles.mobileUserInfo}>
                  <div className={styles.userAvatar}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className={styles.userName}>{user.name}</span>
                    <span className={styles.userRole}>{user.role}</span>
                  </div>
                </div>

                <div className={styles.mobileUserLinks}>
                  <Link
                    href="/profile"
                    className={styles.mobileNavLink}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User size={18} />
                    Profile
                  </Link>
                  {user.role === "admin" && (
                    <Link
                      href="/admin/settings"
                      className={styles.mobileNavLink}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Settings size={18} />
                      Admin Settings
                    </Link>
                  )}
                  <Link
                    href="/settings"
                    className={styles.mobileNavLink}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Settings size={18} />
                    Settings
                  </Link>
                </div>

                <button
                  onClick={handleLogout}
                  className={styles.mobileLogoutBtn}
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/features"
                  className={styles.mobileNavLink}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="/pricing"
                  className={styles.mobileNavLink}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <div className={styles.mobileAuthButtons}>
                  <Link
                    href="/login"
                    className={styles.mobileLoginBtn}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className={styles.mobileRegisterBtn}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  Building,
  Users,
  CreditCard,
  IndianRupee,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import styles from "./AdminDashboard.module.css";

interface DashboardStats {
  totalRooms: number;
  availableRooms: number;
  totalTenants: number;
  monthlyRevenue: number;
  pendingPayments: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRooms: 0,
    availableRooms: 0,
    totalTenants: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch rooms
      const roomsResponse = await fetch(`${API_BASE_URL}/rooms`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const rooms = await roomsResponse.json();

      // Fetch payments for current month
      const paymentsResponse = await fetch(`${API_BASE_URL}/payments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const payments = await paymentsResponse.json();

      const currentMonth = new Date().toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
      const monthlyRevenue = payments
        .filter((payment: any) => payment.month === currentMonth)
        .reduce((sum: number, payment: any) => sum + payment.amount, 0);

      const totalRooms = rooms.length;
      const availableRooms = rooms.filter(
        (room: any) => room.isAvailable
      ).length;
      const totalTenants = rooms.filter(
        (room: any) => !room.isAvailable
      ).length;

      setStats({
        totalRooms,
        availableRooms,
        totalTenants,
        monthlyRevenue,
        pendingPayments:
          totalTenants -
          payments.filter((p: any) => p.month === currentMonth).length,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Building size={24} />
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>{stats.totalRooms}</h3>
            <p className={styles.statLabel}>Total Rooms</p>
          </div>
          <Link href="/admin/rooms" className={styles.statLink}>
            View All
          </Link>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Building size={24} />
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>{stats.availableRooms}</h3>
            <p className={styles.statLabel}>Available Rooms</p>
          </div>
          <span className={`${styles.status} ${styles.available}`}>
            Available
          </span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Users size={24} />
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>{stats.totalTenants}</h3>
            <p className={styles.statLabel}>Active Tenants</p>
          </div>
          <Link href="/admin/tenants" className={styles.statLink}>
            Manage
          </Link>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <IndianRupee size={24} />
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>₹{stats.monthlyRevenue}</h3>
            <p className={styles.statLabel}>Monthly Revenue</p>
          </div>
          <span className={styles.revenueTrend}>
            <TrendingUp size={16} />
            Current Month
          </span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <AlertCircle size={24} />
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>{stats.pendingPayments}</h3>
            <p className={styles.statLabel}>Pending Payments</p>
          </div>
          <Link href="/admin/payments" className={styles.statLink}>
            View
          </Link>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <CreditCard size={24} />
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>
              {stats.totalTenants - stats.pendingPayments}/{stats.totalTenants}
            </h3>
            <p className={styles.statLabel}>Payment Completion</p>
          </div>
          <div className={styles.completionRate}>
            {Math.round(
              ((stats.totalTenants - stats.pendingPayments) /
                stats.totalTenants) *
                100
            )}
            %
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.actionsGrid}>
          <Link href="/admin/rooms" className={styles.actionCard}>
            <Building size={32} />
            <span>Manage Rooms</span>
            <p>Add, edit, or remove rooms</p>
          </Link>

          <Link href="/admin/tenants" className={styles.actionCard}>
            <Users size={32} />
            <span>Manage Tenants</span>
            <p>Assign tenants to rooms</p>
          </Link>

          <Link href="/admin/payments" className={styles.actionCard}>
            <CreditCard size={32} />
            <span>Record Payment</span>
            <p>Record cash payments</p>
          </Link>

          <Link href="/admin/reports" className={styles.actionCard}>
            <TrendingUp size={32} />
            <span>View Reports</span>
            <p>Financial reports & analytics</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

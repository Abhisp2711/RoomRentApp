"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  Building,
  CreditCard,
  Calendar,
  IndianRupee,
  Bell,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Clock,
  XCircle,
  Receipt,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast"; // Add this import
import styles from "./UserDashboard.module.css";

interface Payment {
  _id: string;
  amount: number;
  month: string;
  monthDisplay: string;
  paymentMethod: "online" | "cash";
  status: "pending" | "paid" | "failed" | "cancelled";
  paidOn?: string;
  createdAt: string;
  transactionId: string;
  receiptNumber?: string;
  roomId?: {
    _id: string;
    roomNumber: string;
  };
}

interface Room {
  _id: string;
  roomNumber: string;
  monthlyRent: number;
  isAvailable: boolean;
  tenant?: {
    userId: string;
    userName: string;
    userEmail: string;
  };
  building?: string;
  floor?: string;
  lastPayment?: string;
  lastPaymentMonth?: string;
}

interface DashboardStats {
  totalPaid: number;
  pendingAmount: number;
  paidCount: number;
  pendingCount: number;
  nextDueDate: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function UserDashboard() {
  const { user, token, logout } = useAuth(); // Get token from useAuth
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalPaid: 0,
    pendingAmount: 0,
    paidCount: 0,
    pendingCount: 0,
    nextDueDate: new Date().toISOString(),
  });

  useEffect(() => {
    if (user && token) {
      fetchUserData();
    }
  }, [user, token]);

  const fetchUserData = async () => {
    try {
      if (!token) {
        toast.error("Please login again");
        logout();
        router.push("/login");
        return;
      }

      // Fetch user's room using the specific endpoint
      const roomsResponse = await fetch(`${API_BASE_URL}/rooms/my-room`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (roomsResponse.ok) {
        const roomData = await roomsResponse.json();
        setRoom(roomData);
      }

      // Fetch user's payment history
      await fetchPaymentHistory();

      // Fetch payment statistics
      await fetchPaymentStatistics();
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/payments/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPayments(data.payments || []);
        }
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  };

  const fetchPaymentStatistics = async () => {
    try {
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/payments/statistics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const statsData = data.statistics;
          setStats({
            totalPaid: statsData.currentMonth?.total || 0,
            pendingAmount: room?.monthlyRent || 0,
            paidCount: statsData.currentMonth?.count || 0,
            pendingCount: payments.filter((p) => p.status === "pending").length,
            nextDueDate: getNextDueDate(),
          });
        }
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUserData();
  };

  const getNextDueDate = () => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return nextMonth.toISOString().slice(0, 7);
  };

  const getCurrentMonthPayment = () => {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    return payments.find((payment) => payment.month === currentMonth);
  };

  const currentMonthPayment = getCurrentMonthPayment();
  const nextPaymentDue = room ? room.monthlyRent : 0;

  const pendingPayments = payments.filter((p) => p.status === "pending");
  const recentPayments = payments.slice(0, 3);

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle size={16} />;
      case "pending":
        return <Clock size={16} />;
      case "failed":
        return <XCircle size={16} />;
      case "cancelled":
        return <XCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "#10b981";
      case "pending":
        return "#f59e0b";
      case "failed":
        return "#ef4444";
      case "cancelled":
        return "#6b7280";
      default:
        return "#f59e0b";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  };

  const getMonthName = (monthString: string) => {
    if (!monthString) return "Unknown";
    const [year, month] = monthString.split("-");
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString(
      "en-IN",
      { month: "long", year: "numeric" }
    );
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header with Refresh */}
      <div className={styles.header}>
        <div className={styles.welcomeSection}>
          <h1 className={styles.welcomeTitle}>Welcome back, {user?.name}!</h1>
          <p className={styles.welcomeSubtitle}>
            Here's your rental overview and quick actions
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className={styles.refreshButton}
          disabled={refreshing}
        >
          <RefreshCw size={20} className={refreshing ? styles.spinning : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.roomStat}`}>
          <div className={styles.statIcon}>
            <Building size={24} />
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>
              {room ? `Room ${room.roomNumber}` : "No Room"}
            </h3>
            <p className={styles.statLabel}>Your Room</p>
            {room?.building && (
              <p className={styles.statSubtext}>{room.building}</p>
            )}
          </div>
          {room && (
            <Link href="/my-room" className={styles.statLink}>
              View Details
            </Link>
          )}
        </div>

        <div className={`${styles.statCard} ${styles.paymentStat}`}>
          <div className={styles.statIcon}>
            <IndianRupee size={24} />
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>₹{nextPaymentDue}</h3>
            <p className={styles.statLabel}>Next Payment Due</p>
            <p className={styles.statSubtext}>
              For {getMonthName(getNextDueDate())}
            </p>
          </div>
          {room && (
            <Link href="/pay-rent" className={styles.statLink}>
              Pay Now
            </Link>
          )}
        </div>

        <div className={`${styles.statCard} ${styles.statusStat}`}>
          <div className={styles.statIcon}>
            {currentMonthPayment ? (
              <CheckCircle size={24} color="#10b981" />
            ) : (
              <AlertCircle size={24} color="#f59e0b" />
            )}
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>
              {currentMonthPayment ? "Paid" : "Pending"}
            </h3>
            <p className={styles.statLabel}>Current Month</p>
            <p className={styles.statSubtext}>
              {getMonthName(new Date().toISOString().slice(0, 7))}
            </p>
          </div>
          <div
            className={`${styles.statusBadge} ${
              currentMonthPayment ? styles.paid : styles.pending
            }`}
          >
            {currentMonthPayment ? "Paid" : "Due"}
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.historyStat}`}>
          <div className={styles.statIcon}>
            <CreditCard size={24} />
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>
              ₹{stats.totalPaid.toLocaleString()}
            </h3>
            <p className={styles.statLabel}>Total Paid</p>
            <p className={styles.statSubtext}>{payments.length} payments</p>
          </div>
          <Link href="/payment-history" className={styles.statLink}>
            View All
          </Link>
        </div>
      </div>

      {/* Pending Payments Alert */}
      {pendingPayments.length > 0 && (
        <div className={styles.alert}>
          <AlertCircle size={20} />
          <div className={styles.alertContent}>
            <strong>
              You have {pendingPayments.length} pending payment
              {pendingPayments.length > 1 ? "s" : ""}
            </strong>
            <p>Complete your pending payments to avoid any issues</p>
          </div>
          <Link
            href="/payment-history?status=pending"
            className={styles.alertButton}
          >
            View Pending
          </Link>
        </div>
      )}

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Room Information */}
        {room ? (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Your Room</h2>
              <Link href="/my-room" className={styles.viewAllLink}>
                View Details <ArrowRight size={16} />
              </Link>
            </div>
            <div className={styles.roomInfo}>
              <div className={styles.roomDetails}>
                <div className={styles.roomDetail}>
                  <Building size={20} />
                  <div>
                    <strong>Room {room.roomNumber}</strong>
                    <p>Monthly Rent: ₹{room.monthlyRent}</p>
                  </div>
                </div>
                {room.building && (
                  <div className={styles.roomMeta}>
                    <span className={styles.metaItem}>
                      <Building size={14} />
                      {room.building}
                    </span>
                    {room.floor && (
                      <span className={styles.metaItem}>
                        Floor {room.floor}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className={styles.roomStatus}>
                <CheckCircle size={16} />
                <span>Active</span>
              </div>
            </div>
            {room.lastPayment && (
              <div className={styles.lastPayment}>
                <p>
                  Last payment: {formatDate(room.lastPayment)} for{" "}
                  {getMonthName(room.lastPaymentMonth || "")}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.section}>
            <div className={styles.noRoom}>
              <Building size={48} />
              <h3>No Room Assigned</h3>
              <p>You haven't been assigned to a room yet.</p>
              <Link href="/rooms" className={styles.browseButton}>
                Browse Available Rooms
              </Link>
            </div>
          </div>
        )}

        {/* Recent Payments */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Payments</h2>
            <Link href="/payment-history" className={styles.viewAllLink}>
              View All <ArrowRight size={16} />
            </Link>
          </div>

          {payments.length > 0 ? (
            <div className={styles.paymentsList}>
              {recentPayments.map((payment) => (
                <div key={payment._id} className={styles.paymentItem}>
                  <div className={styles.paymentInfo}>
                    <div
                      className={styles.paymentStatusIndicator}
                      style={{
                        backgroundColor: getPaymentStatusColor(payment.status),
                      }}
                    />
                    <div>
                      <strong>{payment.monthDisplay || payment.month}</strong>
                      <p>
                        {payment.status === "paid" && payment.paidOn
                          ? `Paid on ${formatDate(payment.paidOn)}`
                          : `Created on ${formatDate(payment.createdAt)}`}
                      </p>
                    </div>
                  </div>
                  <div className={styles.paymentDetails}>
                    <div className={styles.paymentAmount}>
                      <IndianRupee size={16} />
                      <span>₹{payment.amount}</span>
                    </div>
                    <div className={styles.paymentMethod}>
                      {payment.paymentMethod === "online" ? "Online" : "Cash"}
                    </div>
                    <div className={styles.paymentStatus}>
                      {getPaymentStatusIcon(payment.status)}
                      <span>
                        {payment.status.charAt(0).toUpperCase() +
                          payment.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noPayments}>
              <CreditCard size={32} />
              <p>No payments found</p>
              {room && (
                <Link href="/pay-rent" className={styles.payNowButton}>
                  Make Your First Payment
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
          <div className={styles.actionsGrid}>
            {room && (
              <Link href="/pay-rent" className={styles.actionCard}>
                <div className={styles.actionIcon}>
                  <CreditCard size={24} />
                </div>
                <div className={styles.actionContent}>
                  <span className={styles.actionTitle}>Pay Rent</span>
                  <p className={styles.actionDescription}>
                    Make payment for current month
                  </p>
                </div>
                <ArrowRight size={20} className={styles.actionArrow} />
              </Link>
            )}

            <Link href="/payment-history" className={styles.actionCard}>
              <div className={styles.actionIcon}>
                <Calendar size={24} />
              </div>
              <div className={styles.actionContent}>
                <span className={styles.actionTitle}>Payment History</span>
                <p className={styles.actionDescription}>
                  View all your past payments
                </p>
              </div>
              <ArrowRight size={20} className={styles.actionArrow} />
            </Link>

            <Link href="/profile" className={styles.actionCard}>
              <div className={styles.actionIcon}>
                <Bell size={24} />
              </div>
              <div className={styles.actionContent}>
                <span className={styles.actionTitle}>Profile & Settings</span>
                <p className={styles.actionDescription}>
                  Update your information
                </p>
              </div>
              <ArrowRight size={20} className={styles.actionArrow} />
            </Link>

            {room && (
              <Link href="/my-room" className={styles.actionCard}>
                <div className={styles.actionIcon}>
                  <Building size={24} />
                </div>
                <div className={styles.actionContent}>
                  <span className={styles.actionTitle}>Room Details</span>
                  <p className={styles.actionDescription}>
                    View your room information
                  </p>
                </div>
                <ArrowRight size={20} className={styles.actionArrow} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

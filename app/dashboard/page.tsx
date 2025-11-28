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
} from "lucide-react";
import Link from "next/link";
import styles from "./UserDashboard.module.css";

interface Payment {
  _id: string;
  amount: number;
  month: string;
  paymentMethod: string;
  status: string;
  paidOn: string;
}

interface Room {
  _id: string;
  roomNumber: string;
  monthlyRent: number;
  isAvailable: boolean;
  tenant: any;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function UserDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch user's room
      const roomsResponse = await fetch(`${API_BASE_URL}/rooms`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const rooms = await roomsResponse.json();

      // Find room assigned to current user
      const userRoom = rooms.find(
        (r: Room) => r.tenant && r.tenant.email === user?.email
      );
      setRoom(userRoom);

      // Fetch user's payments
      const paymentsResponse = await fetch(
        `${API_BASE_URL}/payments/my-payments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        setPayments(paymentsData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentMonthPayment = () => {
    const currentMonth = new Date().toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
    return payments.find((payment) => payment.month === currentMonth);
  };

  const currentMonthPayment = getCurrentMonthPayment();
  const nextPaymentDue = room ? room.monthlyRent : 0;

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
      {/* Welcome Section */}
      <div className={styles.welcomeSection}>
        <h1 className={styles.welcomeTitle}>Welcome back, {user?.name}!</h1>
        <p className={styles.welcomeSubtitle}>
          Here's your rental overview and quick actions
        </p>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Building size={24} />
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>
              {room ? `Room ${room.roomNumber}` : "No Room"}
            </h3>
            <p className={styles.statLabel}>Your Room</p>
          </div>
          {room && (
            <Link href="/my-room" className={styles.statLink}>
              View Details
            </Link>
          )}
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <IndianRupee size={24} />
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>₹{nextPaymentDue}</h3>
            <p className={styles.statLabel}>Next Payment Due</p>
          </div>
          {room && (
            <Link href="/pay-rent" className={styles.statLink}>
              Pay Now
            </Link>
          )}
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <CheckCircle size={24} />
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>
              {currentMonthPayment ? "Paid" : "Pending"}
            </h3>
            <p className={styles.statLabel}>Current Month</p>
          </div>
          <div
            className={`${styles.status} ${
              currentMonthPayment ? styles.paid : styles.pending
            }`}
          >
            {currentMonthPayment ? "Paid" : "Due"}
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <CreditCard size={24} />
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statNumber}>{payments.length}</h3>
            <p className={styles.statLabel}>Total Payments</p>
          </div>
          <Link href="/payment-history" className={styles.statLink}>
            View All
          </Link>
        </div>
      </div>

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
              <div className={styles.roomDetail}>
                <Building size={20} />
                <div>
                  <strong>Room {room.roomNumber}</strong>
                  <p>Monthly Rent: ₹{room.monthlyRent}</p>
                </div>
              </div>
              <div className={styles.roomStatus}>
                <CheckCircle size={16} />
                <span>Active</span>
              </div>
            </div>
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
              {payments.slice(0, 5).map((payment) => (
                <div key={payment._id} className={styles.paymentItem}>
                  <div className={styles.paymentInfo}>
                    <CreditCard size={16} />
                    <div>
                      <strong>{payment.month}</strong>
                      <p>
                        Paid on {new Date(payment.paidOn).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className={styles.paymentAmount}>
                    <IndianRupee size={16} />
                    <span>₹{payment.amount}</span>
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
                <CreditCard size={24} />
                <span>Pay Rent</span>
                <p>Make payment for current month</p>
              </Link>
            )}

            <Link href="/payment-history" className={styles.actionCard}>
              <Calendar size={24} />
              <span>Payment History</span>
              <p>View all your past payments</p>
            </Link>

            <Link href="/profile" className={styles.actionCard}>
              <Bell size={24} />
              <span>Profile & Settings</span>
              <p>Update your information</p>
            </Link>

            {room && (
              <Link href="/my-room" className={styles.actionCard}>
                <Building size={24} />
                <span>Room Details</span>
                <p>View your room information</p>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

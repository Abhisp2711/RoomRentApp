"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  IndianRupee,
  Calendar,
  CreditCard,
  Download,
  CheckCircle,
  Clock,
} from "lucide-react";
import styles from "./PaymentHistory.module.css";

interface Payment {
  _id: string;
  amount: number;
  month: string;
  paymentMethod: "razorpay" | "cash";
  status: "completed" | "pending" | "failed";
  paidOn: string;
  transactionId?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PaymentHistoryPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPaymentHistory();
    }
  }, [user]);

  const fetchPaymentHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/payments/my-payments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const paymentsData = await response.json();
        setPayments(paymentsData);
      }
    } catch (error) {
      console.error("Error fetching payment history:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ["Month", "Amount", "Payment Method", "Status", "Date"];
    const csvData = payments.map((payment) => [
      payment.month,
      payment.amount,
      payment.paymentMethod === "razorpay" ? "Online" : "Cash",
      payment.status,
      new Date(payment.paidOn).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `my-payments-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const totalPaid = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, payment) => sum + payment.amount, 0);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading payment history...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Payment History</h1>
          <p className={styles.subtitle}>
            Track all your rent payments and transactions
          </p>
        </div>
        {payments.length > 0 && (
          <button onClick={exportToCSV} className={styles.exportButton}>
            <Download size={20} />
            Export CSV
          </button>
        )}
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <div className={styles.statValue}>{payments.length}</div>
          <div className={styles.statLabel}>Total Payments</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>₹{totalPaid}</div>
          <div className={styles.statLabel}>Total Paid</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>
            {payments.filter((p) => p.status === "completed").length}
          </div>
          <div className={styles.statLabel}>Completed</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>
            {payments.filter((p) => p.status === "pending").length}
          </div>
          <div className={styles.statLabel}>Pending</div>
        </div>
      </div>

      {/* Payments List */}
      <div className={styles.paymentsSection}>
        {payments.length === 0 ? (
          <div className={styles.empty}>
            <CreditCard size={48} />
            <h3>No payments found</h3>
            <p>You haven't made any payments yet.</p>
          </div>
        ) : (
          <div className={styles.paymentsList}>
            {payments.map((payment) => (
              <div key={payment._id} className={styles.paymentCard}>
                <div className={styles.paymentHeader}>
                  <div className={styles.paymentInfo}>
                    <Calendar size={20} />
                    <div>
                      <h3 className={styles.paymentMonth}>{payment.month}</h3>
                      <p className={styles.paymentDate}>
                        Paid on {new Date(payment.paidOn).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className={styles.paymentAmount}>
                    <IndianRupee size={20} />
                    <span>₹{payment.amount}</span>
                  </div>
                </div>

                <div className={styles.paymentDetails}>
                  <div className={styles.detail}>
                    <span>Payment Method:</span>
                    <span className={styles.method}>
                      {payment.paymentMethod === "razorpay" ? "Online" : "Cash"}
                    </span>
                  </div>
                  <div className={styles.detail}>
                    <span>Status:</span>
                    <span
                      className={`${styles.status} ${
                        payment.status === "completed"
                          ? styles.completed
                          : payment.status === "pending"
                          ? styles.pending
                          : styles.failed
                      }`}
                    >
                      {payment.status === "completed" ? (
                        <CheckCircle size={14} />
                      ) : (
                        <Clock size={14} />
                      )}
                      {payment.status.charAt(0).toUpperCase() +
                        payment.status.slice(1)}
                    </span>
                  </div>
                  {payment.transactionId && (
                    <div className={styles.detail}>
                      <span>Transaction ID:</span>
                      <span className={styles.transactionId}>
                        {payment.transactionId}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

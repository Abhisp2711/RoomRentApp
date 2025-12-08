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
  XCircle,
  Building,
  User,
  Filter,
  Search,
  Receipt,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import styles from "./PaymentHistory.module.css";

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
    building?: string;
  };
  confirmedBy?: {
    _id: string;
    name: string;
  };
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PaymentHistoryPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMethod, setFilterMethod] = useState("all");

  useEffect(() => {
    if (user) {
      fetchPaymentHistory();
    }
  }, [user]);

  const fetchPaymentHistory = async () => {
    try {
      const token = localStorage.getItem("token");
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
      } else {
        toast.error("Failed to fetch payment history");
      }
    } catch (error) {
      console.error("Error fetching payment history:", error);
      toast.error("Error loading payment history");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPaymentHistory();
  };

  const exportToCSV = () => {
    const headers = [
      "Date",
      "Transaction ID",
      "Room",
      "Month",
      "Amount",
      "Payment Method",
      "Status",
      "Paid On",
      "Receipt Number",
      "Payment Gateway",
    ];

    const csvData = payments.map((payment) => [
      new Date(payment.createdAt).toLocaleDateString(),
      payment.transactionId,
      payment.roomId?.roomNumber || "N/A",
      payment.monthDisplay || payment.month,
      payment.amount,
      payment.paymentMethod === "online" ? "Online" : "Cash",
      payment.status.charAt(0).toUpperCase() + payment.status.slice(1),
      payment.paidOn ? new Date(payment.paidOn).toLocaleDateString() : "N/A",
      payment.receiptNumber || "N/A",
      payment.paymentMethod === "online" ? "Razorpay" : "N/A",
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `payment-history-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast.success("Payment history exported to CSV!");
  };

  const getReceipt = async (paymentId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/payments/receipt/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // In a real app, you would generate a PDF or show receipt
          // For now, show receipt data in a modal
          toast.success("Receipt generated!");
          console.log("Receipt data:", data.receipt);

          // You can implement a receipt modal or PDF download here
          // For example:
          // openReceiptModal(data.receipt);
        }
      }
    } catch (error) {
      console.error("Error fetching receipt:", error);
      toast.error("Failed to generate receipt");
    }
  };

  const checkPaymentStatus = async (paymentId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/payments/status?paymentId=${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update the payment in the list
          setPayments((prev) =>
            prev.map((payment) =>
              payment._id === paymentId
                ? { ...payment, ...data.payment }
                : payment
            )
          );
          toast.success("Payment status updated!");
        }
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
      toast.error("Failed to check payment status");
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch =
      payment.monthDisplay?.toLowerCase().includes(searchLower) ||
      payment.transactionId?.toLowerCase().includes(searchLower) ||
      payment.roomId?.roomNumber?.toLowerCase().includes(searchLower) ||
      (payment.receiptNumber?.toLowerCase() || "").includes(searchLower);

    const matchesStatus =
      filterStatus === "all" || payment.status === filterStatus;

    const matchesMethod =
      filterMethod === "all" || payment.paymentMethod === filterMethod;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  const getStats = () => {
    const totalPaid = payments
      .filter((p) => p.status === "paid")
      .reduce((sum, payment) => sum + payment.amount, 0);

    const pendingAmount = payments
      .filter((p) => p.status === "pending")
      .reduce((sum, payment) => sum + payment.amount, 0);

    const onlineCount = payments.filter(
      (p) => p.paymentMethod === "online"
    ).length;

    const cashCount = payments.filter((p) => p.paymentMethod === "cash").length;

    const pendingCount = payments.filter((p) => p.status === "pending").length;

    return {
      totalPaid,
      pendingAmount,
      onlineCount,
      cashCount,
      pendingCount,
      totalCount: payments.length,
    };
  };

  const stats = getStats();

  const getStatusIcon = (status: string) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return styles.statusPaid;
      case "pending":
        return styles.statusPending;
      case "failed":
        return styles.statusFailed;
      case "cancelled":
        return styles.statusCancelled;
      default:
        return styles.statusPending;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "online":
        return <CreditCard size={16} />;
      case "cash":
        return <CreditCard size={16} />;
      default:
        return <CreditCard size={16} />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

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
        <div className={styles.headerActions}>
          <button
            onClick={handleRefresh}
            className={styles.refreshButton}
            disabled={refreshing}
          >
            <RefreshCw
              size={20}
              className={refreshing ? styles.spinning : ""}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
          {payments.length > 0 && (
            <button onClick={exportToCSV} className={styles.exportButton}>
              <Download size={20} />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={`${styles.stat} ${styles.statTotal}`}>
          <div className={styles.statValue}>
            ₹{stats.totalPaid.toLocaleString()}
          </div>
          <div className={styles.statLabel}>Total Paid</div>
        </div>
        <div className={`${styles.stat} ${styles.statPending}`}>
          <div className={styles.statValue}>
            ₹{stats.pendingAmount.toLocaleString()}
          </div>
          <div className={styles.statLabel}>Pending</div>
        </div>
        <div className={`${styles.stat} ${styles.statOnline}`}>
          <div className={styles.statValue}>{stats.onlineCount}</div>
          <div className={styles.statLabel}>Online Payments</div>
        </div>
        <div className={`${styles.stat} ${styles.statCash}`}>
          <div className={styles.statValue}>{stats.cashCount}</div>
          <div className={styles.statLabel}>Cash Payments</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>{stats.totalCount}</div>
          <div className={styles.statLabel}>Total Payments</div>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by month, transaction ID, or room..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filters}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Methods</option>
            <option value="online">Online</option>
            <option value="cash">Cash</option>
          </select>
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
        ) : filteredPayments.length === 0 ? (
          <div className={styles.empty}>
            <Search size={48} />
            <h3>No payments match your search</h3>
            <p>Try adjusting your filters or search term</p>
          </div>
        ) : (
          <div className={styles.paymentsList}>
            {filteredPayments.map((payment) => (
              <div key={payment._id} className={styles.paymentCard}>
                <div className={styles.paymentHeader}>
                  <div className={styles.paymentInfo}>
                    <Calendar size={20} />
                    <div>
                      <h3 className={styles.paymentMonth}>
                        {payment.monthDisplay || payment.month}
                      </h3>
                      <p className={styles.paymentDate}>
                        {payment.status === "paid" && payment.paidOn
                          ? `Paid on ${formatDate(payment.paidOn)}`
                          : `Created on ${formatDate(payment.createdAt)}`}
                      </p>
                    </div>
                  </div>
                  <div className={styles.paymentAmount}>
                    <IndianRupee size={20} />
                    <span>₹{payment.amount.toLocaleString()}</span>
                  </div>
                </div>

                <div className={styles.paymentDetails}>
                  <div className={styles.detailRow}>
                    <div className={styles.detail}>
                      <span>Payment Method:</span>
                      <span
                        className={`${styles.method} ${
                          payment.paymentMethod === "online"
                            ? styles.methodOnline
                            : styles.methodCash
                        }`}
                      >
                        {getMethodIcon(payment.paymentMethod)}
                        {payment.paymentMethod === "online" ? "Online" : "Cash"}
                      </span>
                    </div>
                    <div className={styles.detail}>
                      <span>Status:</span>
                      <span
                        className={`${styles.status} ${getStatusColor(
                          payment.status
                        )}`}
                      >
                        {getStatusIcon(payment.status)}
                        {payment.status.charAt(0).toUpperCase() +
                          payment.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className={styles.detailRow}>
                    <div className={styles.detail}>
                      <span>Room:</span>
                      <span className={styles.room}>
                        <Building size={14} />
                        Room {payment.roomId?.roomNumber || "N/A"}
                      </span>
                    </div>
                    <div className={styles.detail}>
                      <span>Transaction ID:</span>
                      <span className={styles.transactionId}>
                        {payment.transactionId}
                      </span>
                    </div>
                  </div>

                  {payment.receiptNumber && (
                    <div className={styles.detailRow}>
                      <div className={styles.detail}>
                        <span>Receipt Number:</span>
                        <span className={styles.receiptNumber}>
                          {payment.receiptNumber}
                        </span>
                      </div>
                    </div>
                  )}

                  {payment.paymentMethod === "cash" && payment.confirmedBy && (
                    <div className={styles.detailRow}>
                      <div className={styles.detail}>
                        <span>Confirmed By:</span>
                        <span className={styles.confirmedBy}>
                          <User size={14} />
                          {payment.confirmedBy.name}
                        </span>
                      </div>
                    </div>
                  )}

                  {payment.paymentMethod === "online" &&
                    payment.razorpayOrderId && (
                      <div className={styles.detailRow}>
                        <div className={styles.detail}>
                          <span>Razorpay Order:</span>
                          <span className={styles.gatewayInfo}>
                            {payment.razorpayOrderId}
                          </span>
                        </div>
                      </div>
                    )}
                </div>

                <div className={styles.paymentActions}>
                  {payment.status === "paid" && payment.receiptNumber && (
                    <button
                      onClick={() => getReceipt(payment._id)}
                      className={styles.receiptButton}
                    >
                      <Receipt size={16} />
                      Download Receipt
                    </button>
                  )}

                  {payment.status === "pending" && (
                    <button
                      onClick={() => checkPaymentStatus(payment._id)}
                      className={styles.checkButton}
                    >
                      <RefreshCw size={16} />
                      Check Status
                    </button>
                  )}

                  {payment.paymentMethod === "online" &&
                    payment.status === "paid" && (
                      <a
                        href={`https://dashboard.razorpay.com/app/payments/${payment.razorpayPaymentId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.externalButton}
                      >
                        <ExternalLink size={16} />
                        View on Razorpay
                      </a>
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

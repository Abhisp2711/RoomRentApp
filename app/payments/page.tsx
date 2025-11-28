"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Search,
  Filter,
  Download,
  Plus,
  IndianRupee,
  Calendar,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import styles from "./Payments.module.css";

interface Payment {
  _id: string;
  roomId: string;
  tenantName: string;
  month: string;
  amount: number;
  paymentMethod: "razorpay" | "cash";
  paidOn: string;
  razorpayPaymentId?: string;
}

export default function PaymentsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCashModal, setShowCashModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Cash payment form state
  const [cashForm, setCashForm] = useState({
    roomId: "",
    amount: "",
    month: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchPayments();
    }
  }, [user, authLoading, router]);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/payments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch payments");

      const data = await response.json();
      setPayments(data);
    } catch (error) {
      toast.error("Error fetching payments");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCashPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.role !== "admin") {
      toast.error("Only admins can record cash payments");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/payments/cash", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...cashForm,
          amount: parseInt(cashForm.amount),
        }),
      });

      if (!response.ok) throw new Error("Failed to record cash payment");

      const data = await response.json();
      setPayments((prev) => [data.payment, ...prev]);
      setShowCashModal(false);
      setCashForm({ roomId: "", amount: "", month: "" });
      toast.success("Cash payment recorded successfully!");
    } catch (error) {
      toast.error("Error recording cash payment");
      console.error(error);
    }
  };

  const handleExportCSV = () => {
    // Simple CSV export implementation
    const headers = [
      "Room ID",
      "Tenant Name",
      "Month",
      "Amount",
      "Payment Method",
      "Paid On",
    ];
    const csvData = payments.map((payment) => [
      payment.roomId,
      payment.tenantName,
      payment.month,
      payment.amount,
      payment.paymentMethod,
      new Date(payment.paidOn).toLocaleDateString(),
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Payments exported successfully!");
  };

  const filteredPayments = payments.filter(
    (payment) =>
      payment.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.roomId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.month.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <CreditCard className={styles.headerIcon} />
          <div>
            <h1 className={styles.title}>Payment Management</h1>
            <p className={styles.subtitle}>Track and manage rent payments</p>
          </div>
        </div>

        <div className={styles.headerActions}>
          {user?.role === "admin" && (
            <button
              onClick={() => setShowCashModal(true)}
              className={styles.cashButton}
            >
              <Plus size={20} />
              Record Cash
            </button>
          )}
          <button onClick={handleExportCSV} className={styles.exportButton}>
            <Download size={20} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <button className={styles.filterButton}>
          <Filter size={20} />
          Filter
        </button>
      </div>

      {/* Payments Table */}
      {loading ? (
        <div className={styles.loading}>Loading payments...</div>
      ) : (
        <div className={styles.paymentsTable}>
          <div className={styles.tableHeader}>
            <div className={styles.tableRow}>
              <div className={styles.tableCell}>Tenant</div>
              <div className={styles.tableCell}>Room</div>
              <div className={styles.tableCell}>Month</div>
              <div className={styles.tableCell}>Amount</div>
              <div className={styles.tableCell}>Method</div>
              <div className={styles.tableCell}>Paid On</div>
              <div className={styles.tableCell}>Status</div>
            </div>
          </div>

          <div className={styles.tableBody}>
            {filteredPayments.map((payment) => (
              <div key={payment._id} className={styles.tableRow}>
                <div className={styles.tableCell}>
                  <div className={styles.tenant}>
                    <User size={14} />
                    <span>{payment.tenantName}</span>
                  </div>
                </div>
                <div className={styles.tableCell}>{payment.roomId}</div>
                <div className={styles.tableCell}>
                  <div className={styles.month}>
                    <Calendar size={14} />
                    <span>{payment.month}</span>
                  </div>
                </div>
                <div className={styles.tableCell}>
                  <div className={styles.amount}>
                    <IndianRupee size={14} />
                    <span>{payment.amount}</span>
                  </div>
                </div>
                <div className={styles.tableCell}>
                  <div
                    className={`${styles.paymentMethod} ${
                      payment.paymentMethod === "razorpay"
                        ? styles.online
                        : styles.cash
                    }`}
                  >
                    {payment.paymentMethod === "razorpay" ? "Online" : "Cash"}
                  </div>
                </div>
                <div className={styles.tableCell}>
                  {new Date(payment.paidOn).toLocaleDateString()}
                </div>
                <div className={styles.tableCell}>
                  <div className={styles.status}>
                    <div className={styles.statusDot}></div>
                    Completed
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredPayments.length === 0 && (
        <div className={styles.emptyState}>
          <CreditCard className={styles.emptyIcon} />
          <h3>No payments found</h3>
          <p>No payments match your search criteria.</p>
        </div>
      )}

      {/* Record Cash Payment Modal */}
      {showCashModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>Record Cash Payment</h2>
            <form onSubmit={handleCashPayment} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Room ID</label>
                <input
                  type="text"
                  value={cashForm.roomId}
                  onChange={(e) =>
                    setCashForm((prev) => ({ ...prev, roomId: e.target.value }))
                  }
                  className={styles.input}
                  placeholder="Enter room ID"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Amount (₹)</label>
                <input
                  type="number"
                  value={cashForm.amount}
                  onChange={(e) =>
                    setCashForm((prev) => ({ ...prev, amount: e.target.value }))
                  }
                  className={styles.input}
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Month</label>
                <input
                  type="text"
                  value={cashForm.month}
                  onChange={(e) =>
                    setCashForm((prev) => ({ ...prev, month: e.target.value }))
                  }
                  className={styles.input}
                  placeholder="e.g., November 2025"
                  required
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setShowCashModal(false)}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton}>
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

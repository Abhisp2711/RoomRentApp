"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  IndianRupee,
  Download,
  Plus,
  Calendar,
  User,
  Building,
  CreditCard,
} from "lucide-react";
import toast from "react-hot-toast";
import styles from "./AdminPayments.module.css";

interface Payment {
  _id: string;
  roomId: string;
  tenantName: string;
  month: string;
  amount: number;
  paymentMethod: "razorpay" | "cash";
  paidOn: string;
  roomNumber?: string;
}

interface Room {
  _id: string;
  roomNumber: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCashModal, setShowCashModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMethod, setFilterMethod] = useState("all");

  const [cashPaymentForm, setCashPaymentForm] = useState({
    roomId: "",
    amount: "",
    month: new Date().toISOString().slice(0, 7),
  });

  useEffect(() => {
    fetchPayments();
    fetchRooms();
  }, []);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/payments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch payments");

      const data = await response.json();

      // Validate and transform payment data
      const validatedPayments = data.map((payment: any) => ({
        _id: payment._id || payment.id || "",
        roomId: payment.roomId || "",
        tenantName: payment.tenantName || "Unknown Tenant",
        month: payment.month || "Unknown Month",
        amount: payment.amount || 0,
        paymentMethod: payment.paymentMethod || "cash",
        paidOn: payment.paidOn || payment.createdAt || new Date().toISOString(),
        roomNumber: payment.roomNumber || "",
      }));

      setPayments(validatedPayments);
    } catch (error) {
      toast.error("Error fetching payments");
      console.error("Payment fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/rooms`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch rooms");

      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const handleCashPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/payments/cash`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomId: cashPaymentForm.roomId,
          amount: Number(cashPaymentForm.amount),
          month: cashPaymentForm.month,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to record cash payment");
      }

      const data = await response.json();

      // Add the new payment to the list with proper validation
      const newPayment: Payment = {
        _id: data.payment?._id || `temp-${Date.now()}`,
        roomId: data.payment?.roomId || cashPaymentForm.roomId,
        tenantName: data.payment?.tenantName || "New Tenant",
        month: data.payment?.month || cashPaymentForm.month,
        amount: data.payment?.amount || Number(cashPaymentForm.amount),
        paymentMethod: "cash",
        paidOn: data.payment?.paidOn || new Date().toISOString(),
        roomNumber:
          rooms.find((room) => room._id === cashPaymentForm.roomId)
            ?.roomNumber || "",
      };

      setPayments((prev) => [newPayment, ...prev]);
      setShowCashModal(false);
      setCashPaymentForm({
        roomId: "",
        amount: "",
        month: new Date().toISOString().slice(0, 7),
      });

      toast.success("Cash payment recorded successfully!");
    } catch (error: any) {
      toast.error(error.message || "Error recording cash payment");
      console.error("Cash payment error:", error);
    }
  };

  const exportToCSV = () => {
    const headers = ["Date", "Room", "Tenant", "Month", "Amount", "Method"];
    const csvData = payments.map((payment) => [
      new Date(payment.paidOn).toLocaleDateString(),
      payment.roomNumber || "N/A",
      payment.tenantName,
      payment.month,
      payment.amount,
      payment.paymentMethod === "razorpay" ? "Online" : "Cash",
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `payments-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast.success("CSV exported successfully!");
  };

  // Safe filtering with proper null checks
  const filteredPayments = payments.filter((payment) => {
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch =
      (payment.tenantName?.toLowerCase() || "").includes(searchLower) ||
      (payment.roomNumber?.toLowerCase() || "").includes(searchLower) ||
      (payment.month?.toLowerCase() || "").includes(searchLower);

    const matchesFilter =
      filterMethod === "all" || payment.paymentMethod === filterMethod;

    return matchesSearch && matchesFilter;
  });

  const totalRevenue = payments.reduce(
    (sum, payment) => sum + (payment.amount || 0),
    0
  );
  const onlinePayments = payments.filter(
    (p) => p.paymentMethod === "razorpay"
  ).length;
  const cashPayments = payments.filter(
    (p) => p.paymentMethod === "cash"
  ).length;

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading payments...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Payment History</h1>
          <p className={styles.subtitle}>Manage and track all rent payments</p>
        </div>
        <div className={styles.headerActions}>
          <button
            onClick={exportToCSV}
            className={styles.exportButton}
            disabled={payments.length === 0}
          >
            <Download size={20} />
            Export CSV
          </button>
          <button
            onClick={() => setShowCashModal(true)}
            className={styles.primaryButton}
          >
            <Plus size={20} />
            Record Cash Payment
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <div className={styles.statValue}>
            ₹{totalRevenue.toLocaleString()}
          </div>
          <div className={styles.statLabel}>Total Revenue</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>{payments.length}</div>
          <div className={styles.statLabel}>Total Payments</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>{onlinePayments}</div>
          <div className={styles.statLabel}>Online Payments</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>{cashPayments}</div>
          <div className={styles.statLabel}>Cash Payments</div>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by tenant, room, or month..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <select
          value={filterMethod}
          onChange={(e) => setFilterMethod(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">All Methods</option>
          <option value="razorpay">Online Payments</option>
          <option value="cash">Cash Payments</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className={styles.tableContainer}>
        {payments.length === 0 ? (
          <div className={styles.empty}>
            <CreditCard size={48} />
            <h3>No payments recorded yet</h3>
            <p>Start by recording a cash payment or wait for online payments</p>
            <button
              onClick={() => setShowCashModal(true)}
              className={styles.primaryButton}
            >
              <Plus size={20} />
              Record First Payment
            </button>
          </div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Room</th>
                  <th>Tenant</th>
                  <th>Month</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment._id}>
                    <td>
                      <div className={styles.date}>
                        <Calendar size={14} />
                        {new Date(payment.paidOn).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div className={styles.room}>
                        <Building size={14} />
                        {payment.roomNumber || "N/A"}
                      </div>
                    </td>
                    <td>
                      <div className={styles.tenant}>
                        <User size={14} />
                        {payment.tenantName}
                      </div>
                    </td>
                    <td>{payment.month}</td>
                    <td>
                      <div className={styles.amount}>
                        <IndianRupee size={14} />
                        {payment.amount?.toLocaleString()}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`${styles.method} ${
                          payment.paymentMethod === "razorpay"
                            ? styles.online
                            : styles.cash
                        }`}
                      >
                        {payment.paymentMethod === "razorpay"
                          ? "Online"
                          : "Cash"}
                      </span>
                    </td>
                    <td>
                      <span className={styles.status}>Completed</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredPayments.length === 0 && searchTerm && (
              <div className={styles.empty}>
                <Search size={48} />
                <h3>No payments found</h3>
                <p>Try adjusting your search criteria</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Cash Payment Modal */}
      {showCashModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>Record Cash Payment</h2>

            <form onSubmit={handleCashPayment} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Select Room *</label>
                <select
                  value={cashPaymentForm.roomId}
                  onChange={(e) =>
                    setCashPaymentForm((prev) => ({
                      ...prev,
                      roomId: e.target.value,
                    }))
                  }
                  className={styles.select}
                  required
                >
                  <option value="">Choose a room</option>
                  {rooms.map((room) => (
                    <option key={room._id} value={room._id}>
                      Room {room.roomNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Amount (₹) *</label>
                <input
                  type="number"
                  value={cashPaymentForm.amount}
                  onChange={(e) =>
                    setCashPaymentForm((prev) => ({
                      ...prev,
                      amount: e.target.value,
                    }))
                  }
                  className={styles.input}
                  placeholder="Enter amount"
                  min="1"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>For Month *</label>
                <input
                  type="month"
                  value={cashPaymentForm.month}
                  onChange={(e) =>
                    setCashPaymentForm((prev) => ({
                      ...prev,
                      month: e.target.value,
                    }))
                  }
                  className={styles.input}
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
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={!cashPaymentForm.roomId || !cashPaymentForm.amount}
                >
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

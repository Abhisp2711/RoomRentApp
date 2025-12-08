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
  Banknote,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Eye,
} from "lucide-react";
import toast from "react-hot-toast";
import styles from "./AdminPayments.module.css";

interface Payment {
  _id: string;
  roomId: {
    _id: string;
    roomNumber: string;
    building?: string;
  };
  tenantId?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  tenantName: string;
  tenantEmail: string;
  month: string;
  monthDisplay: string;
  amount: number;
  paymentMethod: "online" | "cash";
  status: "pending" | "paid" | "failed" | "cancelled";
  paidOn?: string;
  createdAt: string;
  receiptNumber?: string;
  transactionId: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  confirmedBy?: {
    _id: string;
    name: string;
  };
}

interface Room {
  id: string;
  roomNumber: string;
  building?: string;
  tenant?: {
    userId: string;
    userName: string;
  };
}

interface CashConfirmationForm {
  paymentId: string;
  notes: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCashModal, setShowCashModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMethod, setFilterMethod] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const [cashPaymentForm, setCashPaymentForm] = useState({
    roomId: "",
    amount: "",
    month: new Date().toISOString().slice(0, 7),
    notes: "",
  });

  const [cashConfirmationForm, setCashConfirmationForm] =
    useState<CashConfirmationForm>({
      paymentId: "",
      notes: "",
    });

  useEffect(() => {
    fetchPayments();
    fetchRooms();
  }, [page]);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/payments/history?page=${page}&limit=20`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch payments");

      const data = await response.json();

      if (data.success) {
        setPayments(data.payments || []);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (error) {
      toast.error("Error fetching payments");
      console.error("Payment fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
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

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPayments();
  };

  const handleCashPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/payments/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomId: cashPaymentForm.roomId,
          amount: Number(cashPaymentForm.amount),
          month: cashPaymentForm.month,
          paymentMethod: "cash",
          notes: cashPaymentForm.notes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create cash payment");
      }

      const data = await response.json();

      if (data.success) {
        // Add the new payment to the list
        const newPayment: Payment = {
          _id: data.paymentId,
          roomId: {
            _id: cashPaymentForm.roomId,
            roomNumber:
              rooms.find((room) => room.id === cashPaymentForm.roomId)
                ?.roomNumber || "N/A",
          },
          tenantName: data.tenantName || "Unknown",
          tenantEmail: data.tenantEmail || "",
          month: data.month,
          monthDisplay: data.monthDisplay || cashPaymentForm.month,
          amount: data.amount,
          paymentMethod: "cash",
          status: "pending",
          createdAt: data.createdAt || new Date().toISOString(),
          transactionId: data.transactionId,
        };

        setPayments((prev) => [newPayment, ...prev]);
        setShowCashModal(false);
        setCashPaymentForm({
          roomId: "",
          amount: "",
          month: new Date().toISOString().slice(0, 7),
          notes: "",
        });

        toast.success(
          "Cash payment record created! Tenant can now pay in cash."
        );
      }
    } catch (error: any) {
      toast.error(error.message || "Error creating cash payment");
      console.error("Cash payment error:", error);
    }
  };

  const openConfirmModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setCashConfirmationForm({
      paymentId: payment._id,
      notes: "",
    });
    setShowConfirmModal(true);
  };

  const confirmCashPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/payments/confirm-cash`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cashConfirmationForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to confirm payment");
      }

      const data = await response.json();

      if (data.success) {
        // Update the payment in the list
        setPayments((prev) =>
          prev.map((payment) =>
            payment._id === cashConfirmationForm.paymentId
              ? {
                  ...payment,
                  status: "paid",
                  paidOn: data.payment?.paidOn,
                  receiptNumber: data.payment?.receiptNumber,
                  confirmedBy: {
                    _id: "",
                    name: data.payment?.confirmedBy || "Admin",
                  },
                }
              : payment
          )
        );

        setShowConfirmModal(false);
        setSelectedPayment(null);
        setCashConfirmationForm({ paymentId: "", notes: "" });

        toast.success("Cash payment confirmed successfully!");
      }
    } catch (error: any) {
      toast.error(error.message || "Error confirming cash payment");
      console.error("Confirm payment error:", error);
    }
  };

  const cancelPayment = async (paymentId: string) => {
    if (!confirm("Are you sure you want to cancel this payment?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/payments/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to cancel payment");
      }

      const data = await response.json();

      if (data.success) {
        // Update the payment status
        setPayments((prev) =>
          prev.map((payment) =>
            payment._id === paymentId
              ? { ...payment, status: "cancelled" }
              : payment
          )
        );

        toast.success("Payment cancelled successfully!");
      }
    } catch (error: any) {
      toast.error(error.message || "Error cancelling payment");
      console.error("Cancel payment error:", error);
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Date",
      "Transaction ID",
      "Room",
      "Tenant",
      "Month",
      "Amount",
      "Method",
      "Status",
      "Paid On",
      "Receipt Number",
    ];

    const csvData = payments.map((payment) => [
      new Date(payment.createdAt).toLocaleDateString(),
      payment.transactionId,
      payment.roomId?.roomNumber || "N/A",
      payment.tenantName,
      payment.monthDisplay || payment.month,
      payment.amount,
      payment.paymentMethod === "online" ? "Online" : "Cash",
      payment.status.charAt(0).toUpperCase() + payment.status.slice(1),
      payment.paidOn ? new Date(payment.paidOn).toLocaleDateString() : "N/A",
      payment.receiptNumber || "N/A",
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

  const filteredPayments = payments.filter((payment) => {
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch =
      payment.tenantName?.toLowerCase().includes(searchLower) ||
      payment.roomId?.roomNumber?.toLowerCase().includes(searchLower) ||
      payment.monthDisplay?.toLowerCase().includes(searchLower) ||
      payment.transactionId?.toLowerCase().includes(searchLower);

    const matchesMethod =
      filterMethod === "all" || payment.paymentMethod === filterMethod;

    const matchesStatus =
      filterStatus === "all" || payment.status === filterStatus;

    return matchesSearch && matchesMethod && matchesStatus;
  });

  const getPaymentStats = () => {
    const totalRevenue = payments
      .filter((p) => p.status === "paid")
      .reduce((sum, payment) => sum + payment.amount, 0);

    const pendingCash = payments.filter(
      (p) => p.paymentMethod === "cash" && p.status === "pending"
    ).length;

    const onlineCount = payments.filter(
      (p) => p.paymentMethod === "online"
    ).length;

    const cashCount = payments.filter((p) => p.paymentMethod === "cash").length;

    const pendingCount = payments.filter((p) => p.status === "pending").length;

    return {
      totalRevenue,
      pendingCash,
      onlineCount,
      cashCount,
      pendingCount,
      totalCount: payments.length,
    };
  };

  const stats = getPaymentStats();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle size={14} />;
      case "pending":
        return <Clock size={14} />;
      case "failed":
        return <XCircle size={14} />;
      case "cancelled":
        return <XCircle size={14} />;
      default:
        return <Clock size={14} />;
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
        return <CreditCard size={14} />;
      case "cash":
        return <Banknote size={14} />;
      default:
        return <CreditCard size={14} />;
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
        <p>Loading payments...</p>
      </div>
    );
  }

  console.log(cashPaymentForm);
  console.log(rooms);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Payment Management</h1>
          <p className={styles.subtitle}>Manage and track all rent payments</p>
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
            Create Cash Payment
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={`${styles.stat} ${styles.statRevenue}`}>
          <div className={styles.statValue}>
            ₹{stats.totalRevenue.toLocaleString()}
          </div>
          <div className={styles.statLabel}>Total Revenue</div>
        </div>
        <div className={`${styles.stat} ${styles.statTotal}`}>
          <div className={styles.statValue}>{stats.totalCount}</div>
          <div className={styles.statLabel}>Total Payments</div>
        </div>
        <div className={`${styles.stat} ${styles.statOnline}`}>
          <div className={styles.statValue}>{stats.onlineCount}</div>
          <div className={styles.statLabel}>Online</div>
        </div>
        <div className={`${styles.stat} ${styles.statCash}`}>
          <div className={styles.statValue}>{stats.cashCount}</div>
          <div className={styles.statLabel}>Cash</div>
        </div>
        <div className={`${styles.stat} ${styles.statPending}`}>
          <div className={styles.statValue}>{stats.pendingCash}</div>
          <div className={styles.statLabel}>Pending Cash</div>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by tenant, room, month, or transaction ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filters}>
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Methods</option>
            <option value="online">Online</option>
            <option value="cash">Cash</option>
          </select>

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
        </div>
      </div>

      {/* Payments Table */}
      <div className={styles.tableContainer}>
        {payments.length === 0 ? (
          <div className={styles.empty}>
            <CreditCard size={48} />
            <h3>No payments recorded yet</h3>
            <p>Start by creating a cash payment or wait for online payments</p>
            <button
              onClick={() => setShowCashModal(true)}
              className={styles.primaryButton}
            >
              <Plus size={20} />
              Create First Payment
            </button>
          </div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Transaction ID</th>
                  <th>Room</th>
                  <th>Tenant</th>
                  <th>Month</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment._id}>
                    <td>
                      <div className={styles.date}>
                        <Calendar size={14} />
                        {formatDate(payment.createdAt)}
                      </div>
                    </td>
                    <td>
                      <code className={styles.transactionId}>
                        {payment.transactionId}
                      </code>
                    </td>
                    <td>
                      <div className={styles.room}>
                        <Building size={14} />
                        Room {payment.roomId?.roomNumber || "N/A"}
                      </div>
                    </td>
                    <td>
                      <div className={styles.tenant}>
                        <User size={14} />
                        {payment.tenantName}
                      </div>
                    </td>
                    <td>{payment.monthDisplay || payment.month}</td>
                    <td>
                      <div className={styles.amount}>
                        <IndianRupee size={14} />
                        {payment.amount.toLocaleString()}
                      </div>
                    </td>
                    <td>
                      <div
                        className={`${styles.method} ${
                          payment.paymentMethod === "online"
                            ? styles.methodOnline
                            : styles.methodCash
                        }`}
                      >
                        {getMethodIcon(payment.paymentMethod)}
                        {payment.paymentMethod === "online" ? "Online" : "Cash"}
                      </div>
                    </td>
                    <td>
                      <div
                        className={`${styles.status} ${getStatusColor(
                          payment.status
                        )}`}
                      >
                        {getStatusIcon(payment.status)}
                        {payment.status.charAt(0).toUpperCase() +
                          payment.status.slice(1)}
                      </div>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        {payment.paymentMethod === "cash" &&
                          payment.status === "pending" && (
                            <button
                              onClick={() => openConfirmModal(payment)}
                              className={styles.confirmButton}
                              title="Confirm Cash Payment"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                        {payment.status === "pending" && (
                          <button
                            onClick={() => cancelPayment(payment._id)}
                            className={styles.cancelButton}
                            title="Cancel Payment"
                          >
                            <XCircle size={16} />
                          </button>
                        )}
                        <button
                          className={styles.viewButton}
                          title="View Details"
                          onClick={() => {
                            // Navigate to payment details or show modal
                            toast.success(
                              `Viewing payment ${payment.transactionId}`
                            );
                          }}
                        >
                          <Eye size={16} />
                        </button>
                      </div>
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={styles.pageButton}
                >
                  Previous
                </button>
                <span className={styles.pageInfo}>
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={styles.pageButton}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Cash Payment Modal */}
      {showCashModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Create Cash Payment Record</h2>
              <button
                onClick={() => setShowCashModal(false)}
                className={styles.closeButton}
              >
                &times;
              </button>
            </div>

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
                    <option key={room.id} value={room.id}>
                      Room {room.roomNumber}{" "}
                      {room.building ? `(${room.building})` : ""}
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

              <div className={styles.formGroup}>
                <label className={styles.label}>Notes (Optional)</label>
                <textarea
                  value={cashPaymentForm.notes}
                  onChange={(e) =>
                    setCashPaymentForm((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  className={styles.textarea}
                  placeholder="Add any notes about this payment..."
                  rows={3}
                />
              </div>

              <div className={styles.modalNote}>
                <p>
                  <strong>Note:</strong> This creates a payment record that the
                  tenant can see. They will need to pay the cash amount to you
                  in person. After receiving cash, use the "Confirm" button to
                  mark it as paid.
                </p>
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
                  Create Payment Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Cash Payment Modal */}
      {showConfirmModal && selectedPayment && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Confirm Cash Payment</h2>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedPayment(null);
                }}
                className={styles.closeButton}
              >
                &times;
              </button>
            </div>

            <div className={styles.paymentDetails}>
              <div className={styles.detailRow}>
                <span>Tenant:</span>
                <strong>{selectedPayment.tenantName}</strong>
              </div>
              <div className={styles.detailRow}>
                <span>Room:</span>
                <strong>Room {selectedPayment.roomId?.roomNumber}</strong>
              </div>
              <div className={styles.detailRow}>
                <span>Amount:</span>
                <strong>₹{selectedPayment.amount.toLocaleString()}</strong>
              </div>
              <div className={styles.detailRow}>
                <span>For Month:</span>
                <strong>
                  {selectedPayment.monthDisplay || selectedPayment.month}
                </strong>
              </div>
              <div className={styles.detailRow}>
                <span>Transaction ID:</span>
                <code>{selectedPayment.transactionId}</code>
              </div>
            </div>

            <form onSubmit={confirmCashPayment} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Confirmation Notes (Optional)
                </label>
                <textarea
                  value={cashConfirmationForm.notes}
                  onChange={(e) =>
                    setCashConfirmationForm((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  className={styles.textarea}
                  placeholder="Add confirmation notes..."
                  rows={3}
                />
              </div>

              <div className={styles.modalNote}>
                <p>
                  <strong>Important:</strong> Confirm only after you have
                  received the cash payment from the tenant. This will mark the
                  payment as paid and send a receipt email to the tenant.
                </p>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmModal(false);
                    setSelectedPayment(null);
                  }}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton}>
                  Confirm Payment Received
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

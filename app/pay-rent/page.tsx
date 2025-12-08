"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  IndianRupee,
  CreditCard,
  Calendar,
  Building,
  CheckCircle,
  Shield,
  ArrowLeft,
  Loader2,
  Banknote,
  Copy,
  Download,
  Check,
  AlertCircle,
  Lock,
  Zap,
  Receipt,
  Clock,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import styles from "./PayRent.module.css";

interface Room {
  id: string;
  roomNumber: string;
  monthlyRent: number;
  building?: string;
  floor?: string;
  tenant?: {
    userId: string;
    userName: string;
    userEmail: string;
  };
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

interface PaymentData {
  paymentId: string;
  transactionId: string;
  amount: number;
  month: string;
  monthDisplay: string;
  paymentMethod: string;
  status: string;
  orderId?: string;
  razorpayKey?: string;
  paidOn?: string;
  receiptNumber?: string;
  confirmedBy?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PayRentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<
    "method" | "confirm" | "payment" | "cash-instructions"
  >("method");
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const statusCheckInterval = useRef<NodeJS.Timeout | null>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const paymentMethods: PaymentMethod[] = [
    {
      id: "online",
      name: "Online Payment",
      description: "Pay with card, UPI, or netbanking",
      icon: <CreditCard size={24} />,
    },
    {
      id: "cash",
      name: "Cash Payment",
      description: "Pay in person to admin",
      icon: <Banknote size={24} />,
    },
  ];

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentMethod: "online",
    month: new Date().toISOString().slice(0, 7),
    agreeTerms: false,
    notes: "",
  });

  useEffect(() => {
    if (user) {
      fetchUserRoom();
    }
  }, [user]);

  useEffect(() => {
    // Cleanup interval on unmount
    return () => {
      if (statusCheckInterval.current) {
        clearInterval(statusCheckInterval.current);
      }
    };
  }, []);

  const fetchUserRoom = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/my-room`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const roomData = await response.json();
        setRoom(roomData);
        setPaymentForm((prev) => ({
          ...prev,
          amount: roomData.monthlyRent.toString(),
        }));
      } else {
        toast.error("No room assigned to your account");
        router.push("/rooms");
      }
    } catch (error) {
      console.error("Error fetching room:", error);
      toast.error("Error loading room information");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      errors.push("Please enter a valid amount");
    } else if (room && parseFloat(paymentForm.amount) < room.monthlyRent) {
      errors.push(
        `Amount cannot be less than monthly rent (₹${room.monthlyRent})`
      );
    }

    if (!paymentForm.month) {
      errors.push("Please select a month");
    }

    if (!paymentForm.agreeTerms) {
      errors.push("You must agree to the terms and conditions");
    }

    return errors;
  };

  const createPayment = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
      return;
    }

    setProcessing(true);

    try {
      const payload = {
        roomId: room?.id,
        amount: parseFloat(paymentForm.amount),
        month: paymentForm.month,
        paymentMethod: paymentForm.paymentMethod,
        notes: paymentForm.notes,
      };

      const response = await fetch(`${API_BASE_URL}/payments/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create payment");
      }

      const data = await response.json();
      setPaymentData(data);

      // Handle different payment methods
      if (paymentForm.paymentMethod === "online" && data.orderId) {
        // Launch Razorpay for online payment
        await launchRazorpay(data);
      } else if (paymentForm.paymentMethod === "cash") {
        // Show cash payment instructions
        setCurrentStep("cash-instructions");
        toast.success("Payment record created! Please pay in cash to admin.");

        // Start checking payment status every 30 seconds
        startStatusCheckInterval(data.paymentId);
      }
    } catch (error: any) {
      toast.error(error.message || "Error creating payment");
    } finally {
      setProcessing(false);
    }
  };
  console.log(paymentData);

  const startStatusCheckInterval = (paymentId: string) => {
    // Clear any existing interval
    if (statusCheckInterval.current) {
      clearInterval(statusCheckInterval.current);
    }

    // Check status immediately
    checkPaymentStatus(paymentId);

    // Then check every 30 seconds
    statusCheckInterval.current = setInterval(() => {
      checkPaymentStatus(paymentId);
    }, 30000);
  };

  const launchRazorpay = async (data: PaymentData) => {
    // Load Razorpay script if not already loaded
    if (typeof window.Razorpay === "undefined") {
      await loadRazorpayScript();
    }

    const options = {
      key: data.razorpayKey || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: data.amount * 100, // Convert to paise
      currency: "INR",
      name: "RoomRent Management",
      description: `Rent for Room ${room?.roomNumber} - ${getMonthName(
        paymentForm.month
      )}`,
      order_id: data.orderId,
      handler: async function (response: any) {
        await verifyPayment(response, data.paymentId);
      },
      prefill: {
        name: user?.name || "",
        email: user?.email || "",
        contact: user?.phone || "",
      },
      theme: {
        color: "#3B82F6",
      },
      modal: {
        ondismiss: function () {
          toast.error("Payment cancelled");
          setCurrentStep("method");
        },
      },
    };

    try {
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Error launching Razorpay:", error);
      toast.error("Failed to load payment gateway");
      setCurrentStep("method");
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      if (typeof window.Razorpay !== "undefined") {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error("Failed to load Razorpay"));
      document.body.appendChild(script);
    });
  };

  const verifyPayment = async (razorpayResponse: any, paymentId: string) => {
    setProcessing(true);

    try {
      const response = await fetch(`${API_BASE_URL}/payments/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          razorpay_order_id: razorpayResponse.razorpay_order_id,
          razorpay_payment_id: razorpayResponse.razorpay_payment_id,
          razorpay_signature: razorpayResponse.razorpay_signature,
          paymentId: paymentId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Payment successful!");
        setPaymentData(data.payment);
        setCurrentStep("confirm");

        // Clear any status check interval
        if (statusCheckInterval.current) {
          clearInterval(statusCheckInterval.current);
          statusCheckInterval.current = null;
        }
      } else {
        const error = await response.json();
        throw new Error(error.message || "Payment verification failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Payment verification failed");
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const checkPaymentStatus = async (paymentId?: string) => {
    const paymentIdToCheck = paymentId || paymentData?.paymentId;
    if (!paymentIdToCheck) return;

    setCheckingStatus(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/payments/status?paymentId=${paymentIdToCheck}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.payment.status === "paid") {
          toast.success("Payment completed successfully!");
          setPaymentData(data.payment);
          setCurrentStep("confirm");

          // Clear interval if payment is completed
          if (statusCheckInterval.current) {
            clearInterval(statusCheckInterval.current);
            statusCheckInterval.current = null;
          }
        } else if (data.payment.status === "cancelled") {
          toast.error("Payment was cancelled");
          setCurrentStep("method");
        }
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const cancelPayment = async () => {
    if (!paymentData?.paymentId) return;

    if (!confirm("Are you sure you want to cancel this payment?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/payments/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentId: paymentData.paymentId }),
      });

      if (response.ok) {
        toast.success("Payment cancelled");
        setPaymentData(null);
        setCurrentStep("method");

        // Clear interval if cancelling
        if (statusCheckInterval.current) {
          clearInterval(statusCheckInterval.current);
          statusCheckInterval.current = null;
        }
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel payment");
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      toast.success(`${label} copied to clipboard`);

      setTimeout(() => {
        setCopiedText(null);
      }, 2000);
    } catch (error) {
      toast.error("Failed to copy text");
    }
  };

  const getMonthName = (monthString: string) => {
    const [year, month] = monthString.split("-");
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString(
      "en-IN",
      { month: "long", year: "numeric" }
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const renderCashPaymentInstructions = () => {
    if (!paymentData) return null;

    return (
      <div className={styles.cashPaymentContainer}>
        <div className={styles.cashHeader}>
          <div className={`${styles.statusIcon} ${styles.pending}`}>
            <Clock size={40} />
          </div>
          <h3>Cash Payment Instructions</h3>
          <p className={styles.statusDescription}>
            Please make the payment in cash to the property
            manager/administrator.
          </p>
        </div>

        <div className={styles.instructions}>
          <div className={styles.instructionItem}>
            <div className={styles.instructionNumber}>1</div>
            <div className={styles.instructionText}>
              <strong>Visit the property office</strong> during working hours
            </div>
          </div>

          <div className={styles.instructionItem}>
            <div className={styles.instructionNumber}>2</div>
            <div className={styles.instructionText}>
              <strong>Provide this transaction ID</strong> to the admin:
            </div>
          </div>

          <div className={styles.transactionId}>
            <code>{paymentData.transactionId}</code>
            <button
              onClick={() =>
                copyToClipboard(paymentData.transactionId, "Transaction ID")
              }
              className={styles.copyButton}
            >
              {copiedText === "Transaction ID" ? (
                <Check size={16} />
              ) : (
                <Copy size={16} />
              )}
            </button>
          </div>

          <div className={styles.instructionItem}>
            <div className={styles.instructionNumber}>3</div>
            <div className={styles.instructionText}>
              <strong>Pay ₹{paymentData.amount.toLocaleString()}</strong> in
              cash
            </div>
          </div>

          <div className={styles.instructionItem}>
            <div className={styles.instructionNumber}>4</div>
            <div className={styles.instructionText}>
              <strong>Collect receipt</strong> from the admin
            </div>
          </div>

          <div className={styles.instructionItem}>
            <div className={styles.instructionNumber}>5</div>
            <div className={styles.instructionText}>
              <strong>Admin will confirm</strong> the payment in the system
            </div>
          </div>
        </div>

        <div className={styles.paymentDetailsCard}>
          <h4>Payment Details</h4>
          <div className={styles.detailRow}>
            <span>Amount:</span>
            <strong>{formatCurrency(paymentData.amount)}</strong>
          </div>
          <div className={styles.detailRow}>
            <span>For Month:</span>
            <strong>{paymentData.monthDisplay}</strong>
          </div>
          <div className={styles.detailRow}>
            <span>Room:</span>
            <strong>Room {room?.roomNumber}</strong>
          </div>
          <div className={styles.detailRow}>
            <span>Status:</span>
            <span className={styles.statusBadgePending}>
              Pending Confirmation
            </span>
          </div>
        </div>

        <div className={styles.noteBox}>
          <AlertTriangle size={18} />
          <p>
            <strong>Important:</strong> The payment status will be updated once
            the admin confirms the cash receipt. You will receive an email
            confirmation.
          </p>
        </div>

        <div className={styles.actionButtons}>
          <button
            onClick={() => checkPaymentStatus}
            className={styles.secondaryButton}
            disabled={checkingStatus}
          >
            {checkingStatus ? (
              <>
                <Loader2 size={16} className={styles.spinner} />
                Checking...
              </>
            ) : (
              <>
                <Check size={16} />
                Check Status
              </>
            )}
          </button>

          <button onClick={cancelPayment} className={styles.cancelButton}>
            Cancel Payment
          </button>

          <button
            onClick={() => router.push("/payment-history")}
            className={styles.backButton}
          >
            View Payment History
          </button>
        </div>
      </div>
    );
  };

  const renderConfirmation = () => {
    if (!paymentData) return null;

    return (
      <div className={styles.paymentStatus}>
        <div className={`${styles.statusIcon} ${styles.success}`}>
          <CheckCircle size={40} />
        </div>
        <h3 className={styles.statusMessage}>Payment Successful!</h3>
        <p className={styles.statusDescription}>
          Your payment of {formatCurrency(paymentData.amount)} for{" "}
          {paymentData.monthDisplay} has been{" "}
          {paymentData.paymentMethod === "cash" ? "confirmed" : "processed"}{" "}
          successfully.
        </p>

        {paymentData.paymentMethod === "cash" && paymentData.confirmedBy && (
          <div className={styles.noteBox}>
            <CheckCircle size={18} />
            <p>
              <strong>Confirmed by:</strong> {paymentData.confirmedBy}
            </p>
          </div>
        )}

        <div className={styles.paymentDetailsCard}>
          <h4>Payment Receipt</h4>
          <div className={styles.detailRow}>
            <span>Transaction ID:</span>
            <code>{paymentData.transactionId}</code>
          </div>
          <div className={styles.detailRow}>
            <span>Amount:</span>
            <strong>{formatCurrency(paymentData.amount)}</strong>
          </div>
          <div className={styles.detailRow}>
            <span>Payment Method:</span>
            <strong>
              {paymentForm.paymentMethod === "online"
                ? "Online Payment"
                : "Cash Payment"}
            </strong>
          </div>
          <div className={styles.detailRow}>
            <span>Payment Date:</span>
            <strong>
              {new Date(paymentData.paidOn || Date.now()).toLocaleDateString(
                "en-IN"
              )}
            </strong>
          </div>
          {paymentData.receiptNumber && (
            <div className={styles.detailRow}>
              <span>Receipt Number:</span>
              <strong>{paymentData.receiptNumber}</strong>
            </div>
          )}
        </div>

        <div className={styles.actionButtons}>
          <button
            onClick={() => {
              // Navigate to receipt page or download
              router.push(`/receipt/${paymentData.paymentId}`);
            }}
            className={styles.payButton}
          >
            <Receipt size={16} />
            View Receipt
          </button>
          <button
            onClick={() => router.push("/payment-history")}
            className={styles.secondaryButton}
          >
            View Payment History
          </button>
          <button
            onClick={() => {
              setPaymentData(null);
              setCurrentStep("method");
            }}
            className={styles.backButton}
          >
            Make Another Payment
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading payment information...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className={styles.noRoom}>
        <Building size={64} />
        <h2>No Room Assigned</h2>
        <p>You need to be assigned to a room to make payments.</p>
        <button
          onClick={() => router.push("/rooms")}
          className={styles.payButton}
          style={{ maxWidth: "200px" }}
        >
          Browse Available Rooms
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Pay Rent</h1>
        <p className={styles.subtitle}>
          Secure rent payment with online or cash options
        </p>
      </div>

      {/* Payment Steps */}
      <div className={styles.paymentSteps}>
        <div
          className={`${styles.step} ${
            currentStep === "method" ? styles.active : styles.completed
          }`}
        >
          <div className={styles.stepNumber}>1</div>
          <div className={styles.stepLabel}>Payment Details</div>
        </div>
        <div
          className={`${styles.step} ${
            ["cash-instructions", "payment"].includes(currentStep)
              ? styles.active
              : currentStep === "confirm"
              ? styles.completed
              : ""
          }`}
        >
          <div className={styles.stepNumber}>2</div>
          <div className={styles.stepLabel}>Complete Payment</div>
        </div>
        <div
          className={`${styles.step} ${
            currentStep === "confirm" ? styles.active : ""
          }`}
        >
          <div className={styles.stepNumber}>3</div>
          <div className={styles.stepLabel}>Confirmation</div>
        </div>
      </div>

      <div className={styles.paymentLayout}>
        {/* Main Payment Area */}
        <div className={styles.paymentForm}>
          {currentStep === "method" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createPayment();
              }}
            >
              {/* Room Summary */}
              <div className={styles.roomSummary}>
                <h2>
                  <Building size={24} />
                  Room {room.roomNumber}
                </h2>
                <div className={styles.roomMeta}>
                  <span className={styles.metaItem}>
                    <IndianRupee size={14} />
                    Monthly Rent: {formatCurrency(room.monthlyRent)}
                  </span>
                  {room.floor && (
                    <span className={styles.metaItem}>
                      <Building size={14} />
                      Floor: {room.floor}
                    </span>
                  )}
                  {room.building && (
                    <span className={styles.metaItem}>
                      <Building size={14} />
                      Building: {room.building}
                    </span>
                  )}
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className={styles.paymentSection}>
                <h3>Select Payment Method</h3>

                <div className={styles.paymentMethodsGrid}>
                  {paymentMethods.map((method) => (
                    <label key={method.id} className={styles.paymentMethodCard}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={paymentForm.paymentMethod === method.id}
                        onChange={(e) =>
                          setPaymentForm((prev) => ({
                            ...prev,
                            paymentMethod: e.target.value,
                          }))
                        }
                        className={styles.radio}
                      />
                      <div className={styles.methodCard}>
                        <div className={styles.methodIcon}>{method.icon}</div>
                        <div className={styles.methodInfo}>
                          <div className={styles.methodName}>{method.name}</div>
                          <div className={styles.methodDescription}>
                            {method.description}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Payment Details */}
              <div className={styles.paymentSection}>
                <h3>Payment Details</h3>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <IndianRupee size={18} />
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        amount: e.target.value,
                      }))
                    }
                    className={styles.input}
                    min={room.monthlyRent}
                    step="100"
                    required
                  />
                  <div className={styles.amountHelper}>
                    Minimum amount: {formatCurrency(room.monthlyRent)}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <Calendar size={18} />
                    For Month
                  </label>
                  <input
                    type="month"
                    value={paymentForm.month}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        month: e.target.value,
                      }))
                    }
                    className={styles.input}
                    required
                  />
                  <div className={styles.amountHelper}>
                    Selected: {getMonthName(paymentForm.month)}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <CreditCard size={18} />
                    Notes (Optional)
                  </label>
                  <textarea
                    value={paymentForm.notes}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    className={styles.input}
                    rows={3}
                    placeholder="Add any payment remarks..."
                    style={{ resize: "vertical" }}
                  />
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className={styles.terms}>
                <label className={styles.termsLabel}>
                  <input
                    type="checkbox"
                    checked={paymentForm.agreeTerms}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        agreeTerms: e.target.checked,
                      }))
                    }
                    className={styles.checkbox}
                  />
                  <span className={styles.checkmark}></span>
                  <span>
                    I agree to the terms and conditions and authorize this
                    payment. All transactions are secure and encrypted with
                    256-bit SSL.
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className={styles.actionButtons}>
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className={styles.backButton}
                >
                  <ArrowLeft size={16} />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing || !paymentForm.agreeTerms}
                  className={styles.payButton}
                >
                  {processing ? (
                    <>
                      <Loader2 size={16} className={styles.spinner} />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap size={16} />
                      Continue to Payment
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : currentStep === "cash-instructions" ? (
            renderCashPaymentInstructions()
          ) : (
            renderConfirmation()
          )}
        </div>

        {/* Order Summary */}
        <div className={styles.orderSummary}>
          <h3>Order Summary</h3>
          <div className={styles.summaryItems}>
            <div className={styles.summaryItem}>
              <span>Room Number:</span>
              <span>#{room.roomNumber}</span>
            </div>
            <div className={styles.summaryItem}>
              <span>Monthly Rent:</span>
              <span>{formatCurrency(room.monthlyRent)}</span>
            </div>
            <div className={styles.summaryItem}>
              <span>Selected Month:</span>
              <span>{getMonthName(paymentForm.month)}</span>
            </div>
            <div className={styles.summaryItem}>
              <span>Payment Method:</span>
              <span>
                {
                  paymentMethods.find((m) => m.id === paymentForm.paymentMethod)
                    ?.name
                }
              </span>
            </div>
            <div className={styles.summaryDivider}></div>
            <div className={styles.summaryTotal}>
              <span className={styles.totalLabel}>Total Amount</span>
              <span className={styles.totalAmount}>
                <IndianRupee size={20} />
                {parseFloat(
                  paymentForm.amount || room.monthlyRent.toString()
                ).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <div className={styles.securityNote}>
            <Shield size={16} />
            <span>Your payment is 100% secure and encrypted</span>
          </div>

          <div className={styles.features}>
            <div className={styles.feature}>
              <Lock size={16} />
              <span>SSL Secure Payment</span>
            </div>
            <div className={styles.feature}>
              <CheckCircle size={16} />
              <span>Instant confirmation</span>
            </div>
            <div className={styles.feature}>
              <CheckCircle size={16} />
              <span>Payment history tracking</span>
            </div>
            <div className={styles.feature}>
              <CheckCircle size={16} />
              <span>Email receipt</span>
            </div>
          </div>

          {/* Active Payment Info */}
          {paymentData && currentStep !== "confirm" && (
            <div className={styles.activePayment}>
              <h4>Current Payment</h4>
              <div className={styles.activePaymentDetails}>
                <div className={styles.activePaymentRow}>
                  <span>Transaction ID:</span>
                  <code>{paymentData.transactionId}</code>
                </div>
                <div className={styles.activePaymentRow}>
                  <span>Status:</span>
                  <span
                    className={`${styles.statusBadge} ${
                      paymentData.status === "paid"
                        ? styles.statusPaid
                        : paymentData.status === "pending"
                        ? styles.statusPending
                        : styles.statusFailed
                    }`}
                  >
                    {paymentData.status.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={() => checkPaymentStatus()}
                  className={styles.secondaryButton}
                  disabled={checkingStatus}
                  style={{ width: "100%", marginTop: "0.75rem" }}
                >
                  {checkingStatus ? (
                    <>
                      <Loader2 size={14} className={styles.spinner} />
                      Checking...
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      Refresh Status
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

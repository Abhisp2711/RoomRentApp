"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  IndianRupee,
  CreditCard,
  Calendar,
  Building,
  CheckCircle,
  Shield,
} from "lucide-react";
import toast from "react-hot-toast";
import styles from "./PayRent.module.css";

interface Room {
  _id: string;
  roomNumber: string;
  monthlyRent: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PayRentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentMethod: "online",
    month: new Date().toISOString().slice(0, 7),
    agreeTerms: false,
  });

  useEffect(() => {
    if (user) {
      fetchUserRoom();
    }
  }, [user]);

  const fetchUserRoom = async () => {
    try {
      const token = localStorage.getItem("token");
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

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !room) return;

    if (!paymentForm.agreeTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    setProcessing(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/payments/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomId: room._id,
          amount: paymentForm.amount || room.monthlyRent,
          paymentMethod: paymentForm.paymentMethod,
          month: paymentForm.month,
        }),
      });

      if (!response.ok) throw new Error("Failed to process payment");

      const data = await response.json();

      if (paymentForm.paymentMethod === "online" && data.order) {
        // Razorpay Integration
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.order.amount,
          currency: "INR",
          name: "RoomRent",
          description: `Rent for Room ${room.roomNumber} - ${paymentForm.month}`,
          order_id: data.order.id,
          handler: async function (response: any) {
            try {
              // Verify payment
              const verifyResponse = await fetch(
                `${API_BASE_URL}/payments/verify`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    orderId: data.order.id,
                    paymentId: response.razorpay_payment_id,
                    signature: response.razorpay_signature,
                  }),
                }
              );

              if (verifyResponse.ok) {
                toast.success("Payment successful!");
                router.push("/payment-history");
              } else {
                throw new Error("Payment verification failed");
              }
            } catch (error) {
              toast.error("Payment verification failed");
              console.error(error);
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
          },
          theme: {
            color: "#3B82F6",
          },
          modal: {
            ondismiss: function () {
              setProcessing(false);
              toast.error("Payment cancelled");
            },
          },
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      } else {
        // Cash payment or other methods
        toast.success("Payment recorded successfully!");
        router.push("/payment-history");
      }
    } catch (error) {
      toast.error("Error processing payment");
      console.error(error);
    } finally {
      setProcessing(false);
    }
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
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Pay Rent</h1>
        <p className={styles.subtitle}>Secure and easy rent payment</p>
      </div>

      <div className={styles.paymentLayout}>
        {/* Payment Form */}
        <div className={styles.paymentForm}>
          <form onSubmit={handlePayment}>
            {/* Room Summary */}
            <div className={styles.roomSummary}>
              <h2>
                <Building size={20} />
                Room {room.roomNumber}
              </h2>
              <p>Monthly Rent: ₹{room.monthlyRent}</p>
            </div>

            {/* Payment Details */}
            <div className={styles.paymentSection}>
              <h3>Payment Details</h3>

              <div className={styles.formGroup}>
                <label className={styles.label}>Amount (₹)</label>
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
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>For Month</label>
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
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Payment Method</label>
                <div className={styles.paymentMethods}>
                  <label className={styles.paymentMethod}>
                    <input
                      type="radio"
                      value="online"
                      checked={paymentForm.paymentMethod === "online"}
                      onChange={(e) =>
                        setPaymentForm((prev) => ({
                          ...prev,
                          paymentMethod: e.target.value,
                        }))
                      }
                      className={styles.radio}
                    />
                    <span className={styles.radioCheckmark}></span>
                    <CreditCard size={18} />
                    Online Payment (Razorpay)
                  </label>
                </div>
              </div>

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
                  <span className={styles.checkmark}></span>I agree to the terms
                  and conditions and rental agreement
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={processing || !paymentForm.agreeTerms}
              className={styles.payButton}
            >
              {processing ? (
                <>
                  <div className={styles.spinner}></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard size={18} />
                  Pay ₹{paymentForm.amount || room.monthlyRent}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className={styles.orderSummary}>
          <h3>Order Summary</h3>
          <div className={styles.summaryItems}>
            <div className={styles.summaryItem}>
              <span>Room:</span>
              <span>{room.roomNumber}</span>
            </div>
            <div className={styles.summaryItem}>
              <span>Monthly Rent:</span>
              <span>₹{room.monthlyRent}</span>
            </div>
            <div className={styles.summaryItem}>
              <span>Payment Method:</span>
              <span>Online (Razorpay)</span>
            </div>
            <div className={styles.summaryDivider}></div>
            <div className={styles.summaryTotal}>
              <span>Total Amount:</span>
              <span>₹{paymentForm.amount || room.monthlyRent}</span>
            </div>
          </div>

          <div className={styles.securityNote}>
            <Shield size={16} />
            <span>Your payment is secure and encrypted</span>
          </div>

          <div className={styles.features}>
            <div className={styles.feature}>
              <CheckCircle size={16} />
              <span>Instant confirmation</span>
            </div>
            <div className={styles.feature}>
              <CheckCircle size={16} />
              <span>Secure payment processing</span>
            </div>
            <div className={styles.feature}>
              <CheckCircle size={16} />
              <span>Payment history tracking</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

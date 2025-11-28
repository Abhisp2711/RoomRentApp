"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  IndianRupee,
  CreditCard,
  Calendar,
  Building,
  CheckCircle,
  ArrowLeft,
  Shield,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import styles from "./Payment.module.css";

interface Room {
  _id: string;
  roomNumber: string;
  monthlyRent: number;
  description?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
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
    if (params.roomId) {
      fetchRoom(params.roomId as string);
    }
  }, [params.roomId]);

  useEffect(() => {
    if (!user) {
      router.push(`/login?redirect=/payments/rent/${params.roomId}`);
    }
  }, [user, router, params.roomId]);

  const fetchRoom = async (roomId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`);
      if (!response.ok) throw new Error("Failed to fetch room");
      const data = await response.json();
      setRoom(data);
      setPaymentForm((prev) => ({
        ...prev,
        amount: data.monthlyRent.toString(),
      }));
    } catch (error) {
      toast.error("Error fetching room details");
      console.error("Error fetching room:", error);
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
                router.push("/payments/success");
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
        // Cash payment
        toast.success("Payment recorded successfully!");
        router.push("/payments/success");
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
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading payment details...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className={styles.errorContainer}>
        <h2>Room not found</h2>
        <p>Unable to process payment for this room.</p>
        <Link href="/rooms" className={styles.backButton}>
          <ArrowLeft size={16} />
          Back to Rooms
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href={`/rooms/${room._id}`} className={styles.backLink}>
          <ArrowLeft size={20} />
          Back to Room
        </Link>
        <h1 className={styles.title}>Complete Your Payment</h1>
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
              {room.description && (
                <p className={styles.roomDescription}>{room.description}</p>
              )}
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
                  <label className={styles.paymentMethod}>
                    <input
                      type="radio"
                      value="cash"
                      checked={paymentForm.paymentMethod === "cash"}
                      onChange={(e) =>
                        setPaymentForm((prev) => ({
                          ...prev,
                          paymentMethod: e.target.value,
                        }))
                      }
                      className={styles.radio}
                    />
                    <span className={styles.radioCheckmark}></span>
                    <IndianRupee size={18} />
                    Cash Payment
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
                  {paymentForm.paymentMethod === "online"
                    ? "Pay Now"
                    : "Confirm Payment"}
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
              <span>Room Rent:</span>
              <span>₹{room.monthlyRent}</span>
            </div>
            <div className={styles.summaryItem}>
              <span>Payment Method:</span>
              <span>
                {paymentForm.paymentMethod === "online" ? "Online" : "Cash"}
              </span>
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
        </div>
      </div>
    </div>
  );
}

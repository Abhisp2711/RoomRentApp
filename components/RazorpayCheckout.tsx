// components/RazorpayCheckout.tsx
"use client";

import { useEffect, useState } from "react";
import { loadRazorpayScript } from "@/utils/razorpay";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import type {
  RazorpayOptions,
  RazorpayResponse,
  RazorpayOrder,
  User,
  Room,
} from "@/types/razorpay";

interface RazorpayCheckoutProps {
  order: RazorpayOrder;
  razorpayKey: string;
  user: User;
  room: Room;
  month: string;
  onSuccess: (response: RazorpayResponse) => Promise<void>;
  onClose?: () => void;
  onError?: (error: any) => void;
}

const RazorpayCheckout = ({
  order,
  razorpayKey,
  user,
  room,
  month,
  onSuccess,
  onClose,
  onError,
}: RazorpayCheckoutProps) => {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    const initializeRazorpay = async () => {
      try {
        const loaded = await loadRazorpayScript();
        setScriptLoaded(loaded);

        if (!loaded) {
          throw new Error("Failed to load Razorpay SDK");
        }

        if (order?.id) {
          displayRazorpay();
        }
      } catch (error) {
        console.error("Razorpay initialization error:", error);
        toast.error("Failed to initialize payment gateway");
        if (onError) onError(error);
      }
    };

    initializeRazorpay();
  }, [order]);

  const displayRazorpay = () => {
    if (!scriptLoaded || !window.Razorpay) {
      toast.error("Payment gateway not loaded");
      return;
    }

    if (!order?.id) {
      toast.error("Invalid payment order");
      return;
    }

    const options: RazorpayOptions = {
      key: razorpayKey || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      amount: order.amount,
      currency: order.currency || "INR",
      name: "RoomRent Pro",
      description: `Rent for Room ${room.roomNumber} - ${month}`,
      order_id: order.id,
      handler: async (response: RazorpayResponse) => {
        setLoading(true);
        try {
          await onSuccess(response);
        } catch (error) {
          console.error("Payment handler error:", error);
          toast.error("Payment processing failed");
          if (onError) onError(error);
        } finally {
          setLoading(false);
        }
      },
      prefill: {
        name: user.name,
        email: user.email,
        contact: user.phone || "",
      },
      theme: {
        color: "#3B82F6",
      },
      modal: {
        ondismiss: () => {
          if (onClose) onClose();
          toast.error("Payment cancelled");
        },
        escape: false,
        backdropclose: false,
      },
      notes: {
        roomNumber: room.roomNumber,
        month: month,
        userId: user.id,
      },
      config: {
        display: {
          blocks: {
            banks: {
              name: "Pay using Net Banking",
              instruments: [
                {
                  method: "netbanking",
                  banks: ["HDFC", "ICICI", "SBI", "AXIS", "KOTAK"],
                },
              ],
            },
            upi: {
              name: "Pay using UPI",
              instruments: [
                {
                  method: "upi",
                  flows: ["collect", "intent", "qr"],
                },
              ],
            },
            wallet: {
              name: "Pay using Wallet",
              instruments: [
                {
                  method: "wallet",
                  wallets: ["paytm", "phonepe", "amazonpay"],
                },
              ],
            },
            card: {
              name: "Pay using Card",
              instruments: [
                {
                  method: "card",
                  networks: ["visa", "mastercard", "rupay", "amex"],
                },
              ],
            },
            emi: {
              name: "EMI Payment",
              instruments: [
                {
                  method: "emi",
                  banks: ["HDFC", "ICICI", "KOTAK", "AXIS"],
                },
              ],
            },
          },
          sequence: [
            "block.banks",
            "block.upi",
            "block.wallet",
            "block.card",
            "block.emi",
          ],
          preferences: {
            show_default_blocks: true,
          },
        },
      },
    };

    try {
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Razorpay initialization error:", error);
      toast.error("Failed to open payment gateway");
      if (onError) onError(error);
    }
  };

  // Show loading overlay
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-700 font-medium">Processing payment...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  return null;
};

export default RazorpayCheckout;

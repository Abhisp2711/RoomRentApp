// hooks/useRazorpay.ts
import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import type { RazorpayResponse } from "@/types/razorpay";

interface UseRazorpayProps {
  onSuccess: (response: RazorpayResponse) => Promise<void>;
  onError?: (error: any) => void;
  onClose?: () => void;
}

const useRazorpay = ({ onSuccess, onError, onClose }: UseRazorpayProps) => {
  const [loading, setLoading] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const loadRazorpayScript = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window.Razorpay !== "undefined") {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  }, []);

  const initializePayment = useCallback(
    async (
      orderId: string,
      amount: number,
      currency: string,
      razorpayKey: string,
      user: { name: string; email: string; phone?: string },
      description: string
    ) => {
      setLoading(true);

      try {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          throw new Error("Failed to load payment gateway");
        }

        if (!window.Razorpay) {
          throw new Error("Razorpay not available");
        }

        const options = {
          key: razorpayKey,
          amount: amount,
          currency: currency || "INR",
          name: "RoomRent Pro",
          description: description,
          order_id: orderId,
          handler: async (response: RazorpayResponse) => {
            setPaymentProcessing(true);
            try {
              await onSuccess(response);
            } catch (error) {
              console.error("Payment handler error:", error);
              toast.error("Payment processing failed");
              if (onError) onError(error);
            } finally {
              setPaymentProcessing(false);
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
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } catch (error) {
        console.error("Payment initialization error:", error);
        toast.error("Failed to initialize payment");
        if (onError) onError(error);
      } finally {
        setLoading(false);
      }
    },
    [loadRazorpayScript, onSuccess, onError, onClose]
  );

  return {
    loading,
    paymentProcessing,
    initializePayment,
  };
};

export default useRazorpay;

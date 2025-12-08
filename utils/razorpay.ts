// utils/razorpay.ts
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if already loaded
    if (typeof window.Razorpay !== "undefined") {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      console.error("Failed to load Razorpay script");
      resolve(false);
    };

    document.body.appendChild(script);
  });
};

export const formatAmount = (amount: number): number => {
  // Razorpay expects amount in paise (1 INR = 100 paise)
  return Math.round(amount * 100);
};

export const formatCurrency = (
  amount: number,
  currency: string = "INR"
): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

export const getMonthDisplay = (monthString: string): string => {
  const [year, month] = monthString.split("-").map(Number);
  const date = new Date(year, month - 1);
  return date.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
};

export const validatePaymentForm = (
  amount: string,
  minAmount: number,
  agreeTerms: boolean,
  paymentMethod: string
): string[] => {
  const errors: string[] = [];

  if (!amount || parseFloat(amount) <= 0) {
    errors.push("Please enter a valid amount");
  } else if (parseFloat(amount) < minAmount) {
    errors.push(`Amount cannot be less than ${formatCurrency(minAmount)}`);
  }

  if (!agreeTerms) {
    errors.push("You must agree to the terms and conditions");
  }

  if (!paymentMethod) {
    errors.push("Please select a payment method");
  }

  return errors;
};

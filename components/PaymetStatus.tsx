// components/PaymentStatus.tsx
"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  ExternalLink,
  Copy,
} from "lucide-react";
import toast from "react-hot-toast";

interface PaymentStatusProps {
  paymentId: string;
  transactionId: string;
  status: "pending" | "paid" | "failed" | "refunded";
  amount: number;
  month: string;
  paymentMethod: string;
  onRefresh: () => void;
  className?: string;
}

const PaymentStatus = ({
  paymentId,
  transactionId,
  status,
  amount,
  month,
  paymentMethod,
  onRefresh,
  className = "",
}: PaymentStatusProps) => {
  const [copied, setCopied] = useState(false);

  const statusConfig = {
    pending: {
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      label: "Pending",
      message: "Payment is being processed",
    },
    paid: {
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      label: "Paid",
      message: "Payment completed successfully",
    },
    failed: {
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      label: "Failed",
      message: "Payment failed. Please try again",
    },
    refunded: {
      icon: RefreshCw,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      label: "Refunded",
      message: "Payment has been refunded",
    },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div
      className={`border rounded-xl p-6 ${config.borderColor} ${config.bgColor} ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Icon className={`w-8 h-8 ${config.color}`} />
          <div>
            <h3 className="font-semibold text-lg text-gray-900">
              Payment Status
            </h3>
            <p className="text-sm text-gray-600">{config.message}</p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${config.color} ${config.bgColor}`}
        >
          {config.label}
        </span>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Amount:</span>
          <span className="font-semibold text-gray-900">
            {formatCurrency(amount)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Month:</span>
          <span className="font-semibold text-gray-900">{month}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Method:</span>
          <span className="font-semibold text-gray-900 capitalize">
            {paymentMethod}
          </span>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transaction ID
          </label>
          <div className="flex items-center">
            <code className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-mono">
              {transactionId}
            </code>
            <button
              onClick={() => copyToClipboard(transactionId)}
              className="ml-2 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              title="Copy to clipboard"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onRefresh}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Status</span>
          </button>

          {status === "paid" && (
            <button
              onClick={() => window.open(`/receipt/${paymentId}`, "_blank")}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View Receipt</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus;

"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  Download,
  Calendar,
  IndianRupee,
  Users,
  Building,
  TrendingUp,
  PieChart,
} from "lucide-react";
import toast from "react-hot-toast";
import styles from "./AdminReports.module.css";

interface ReportData {
  monthlyRevenue: { month: string; revenue: number }[];
  paymentMethods: { method: string; count: number; amount: number }[];
  roomOccupancy: { occupied: number; available: number };
  topRooms: { roomNumber: string; revenue: number }[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch payments for analysis
      const paymentsResponse = await fetch(`${API_BASE_URL}/payments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!paymentsResponse.ok) throw new Error("Failed to fetch payments");
      const payments = await paymentsResponse.json();

      // Fetch rooms for occupancy data
      const roomsResponse = await fetch(`${API_BASE_URL}/rooms`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!roomsResponse.ok) throw new Error("Failed to fetch rooms");
      const rooms = await roomsResponse.json();

      // Process data for reports
      const monthlyRevenue = processMonthlyRevenue(payments);
      const paymentMethods = processPaymentMethods(payments);
      const roomOccupancy = processRoomOccupancy(rooms);
      const topRooms = processTopRooms(payments, rooms);

      setReportData({
        monthlyRevenue,
        paymentMethods,
        roomOccupancy,
        topRooms,
      });
    } catch (error) {
      toast.error("Error generating reports");
      console.error("Reports error:", error);
    } finally {
      setLoading(false);
    }
  };

  const processMonthlyRevenue = (payments: any[]) => {
    const monthlyData: { [key: string]: number } = {};

    payments.forEach((payment) => {
      const month = payment.month;
      if (month) {
        monthlyData[month] = (monthlyData[month] || 0) + (payment.amount || 0);
      }
    });

    return Object.entries(monthlyData)
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Last 6 months
  };

  const processPaymentMethods = (payments: any[]) => {
    const methodData: { [key: string]: { count: number; amount: number } } = {};

    payments.forEach((payment) => {
      const method = payment.paymentMethod || "cash";
      if (!methodData[method]) {
        methodData[method] = { count: 0, amount: 0 };
      }
      methodData[method].count++;
      methodData[method].amount += payment.amount || 0;
    });

    return Object.entries(methodData).map(([method, data]) => ({
      method: method === "razorpay" ? "Online" : "Cash",
      count: data.count,
      amount: data.amount,
    }));
  };

  const processRoomOccupancy = (rooms: any[]) => {
    const occupied = rooms.filter((room) => !room.isAvailable).length;
    const available = rooms.filter((room) => room.isAvailable).length;

    return { occupied, available };
  };

  const processTopRooms = (payments: any[], rooms: any[]) => {
    const roomRevenue: { [key: string]: number } = {};

    payments.forEach((payment) => {
      const roomId = payment.roomId;
      if (roomId) {
        roomRevenue[roomId] =
          (roomRevenue[roomId] || 0) + (payment.amount || 0);
      }
    });

    return Object.entries(roomRevenue)
      .map(([roomId, revenue]) => {
        const room = rooms.find((r) => r._id === roomId);
        return {
          roomNumber: room?.roomNumber || "Unknown",
          revenue,
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5); // Top 5 rooms
  };

  const exportReport = (type: string) => {
    toast.success(`${type} report exported successfully!`);
    // In a real app, this would generate and download a PDF/CSV
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Generating reports...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Reports & Analytics</h1>
          <p className={styles.subtitle}>
            Comprehensive insights and analytics
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            onClick={() => exportReport("Financial")}
            className={styles.exportButton}
          >
            <Download size={20} />
            Export Report
          </button>
        </div>
      </div>

      {/* Date Range */}
      <div className={styles.dateRange}>
        <div className={styles.dateGroup}>
          <label className={styles.label}>From</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, start: e.target.value }))
            }
            className={styles.dateInput}
          />
        </div>
        <div className={styles.dateGroup}>
          <label className={styles.label}>To</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, end: e.target.value }))
            }
            className={styles.dateInput}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>
            <IndianRupee size={24} />
          </div>
          <div className={styles.summaryContent}>
            <h3 className={styles.summaryValue}>
              ₹
              {reportData?.monthlyRevenue
                .reduce((sum, item) => sum + item.revenue, 0)
                .toLocaleString() || 0}
            </h3>
            <p className={styles.summaryLabel}>Total Revenue</p>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>
            <Users size={24} />
          </div>
          <div className={styles.summaryContent}>
            <h3 className={styles.summaryValue}>
              {reportData?.roomOccupancy.occupied || 0}
            </h3>
            <p className={styles.summaryLabel}>Occupied Rooms</p>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>
            <Building size={24} />
          </div>
          <div className={styles.summaryContent}>
            <h3 className={styles.summaryValue}>
              {reportData?.roomOccupancy.available || 0}
            </h3>
            <p className={styles.summaryLabel}>Available Rooms</p>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>
            <TrendingUp size={24} />
          </div>
          <div className={styles.summaryContent}>
            <h3 className={styles.summaryValue}>
              {reportData?.paymentMethods.length || 0}
            </h3>
            <p className={styles.summaryLabel}>Payment Methods</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className={styles.chartsGrid}>
        {/* Revenue Chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Monthly Revenue</h3>
            <BarChart3 size={20} />
          </div>
          <div className={styles.chartContent}>
            {reportData?.monthlyRevenue.map((item, index) => (
              <div key={index} className={styles.revenueItem}>
                <span className={styles.month}>{item.month}</span>
                <div className={styles.revenueBar}>
                  <div
                    className={styles.barFill}
                    style={{
                      width: `${
                        (item.revenue /
                          Math.max(
                            ...reportData.monthlyRevenue.map((r) => r.revenue)
                          )) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <span className={styles.revenueAmount}>
                  ₹{item.revenue.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Payment Methods</h3>
            <PieChart size={20} />
          </div>
          <div className={styles.chartContent}>
            {reportData?.paymentMethods.map((item, index) => (
              <div key={index} className={styles.methodItem}>
                <div className={styles.methodInfo}>
                  <span className={styles.methodName}>{item.method}</span>
                  <span className={styles.methodCount}>
                    {item.count} payments
                  </span>
                </div>
                <span className={styles.methodAmount}>
                  ₹{item.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Room Occupancy */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Room Occupancy</h3>
            <Building size={20} />
          </div>
          <div className={styles.occupancyChart}>
            <div className={styles.occupancyItem}>
              <span className={styles.occupancyLabel}>Occupied</span>
              <div className={styles.occupancyBar}>
                <div
                  className={styles.occupancyFill}
                  style={{
                    width: `${
                      ((reportData?.roomOccupancy.occupied || 0) /
                        ((reportData?.roomOccupancy.occupied || 0) +
                          (reportData?.roomOccupancy.available || 0))) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
              <span className={styles.occupancyValue}>
                {reportData?.roomOccupancy.occupied || 0}
              </span>
            </div>
            <div className={styles.occupancyItem}>
              <span className={styles.occupancyLabel}>Available</span>
              <div className={styles.occupancyBar}>
                <div
                  className={styles.occupancyFillAvailable}
                  style={{
                    width: `${
                      ((reportData?.roomOccupancy.available || 0) /
                        ((reportData?.roomOccupancy.occupied || 0) +
                          (reportData?.roomOccupancy.available || 0))) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
              <span className={styles.occupancyValue}>
                {reportData?.roomOccupancy.available || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Top Rooms */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Top Performing Rooms</h3>
            <TrendingUp size={20} />
          </div>
          <div className={styles.chartContent}>
            {reportData?.topRooms.map((room, index) => (
              <div key={index} className={styles.roomItem}>
                <div className={styles.roomRank}>
                  <span>#{index + 1}</span>
                </div>
                <div className={styles.roomInfo}>
                  <span className={styles.roomName}>
                    Room {room.roomNumber}
                  </span>
                  <span className={styles.roomRevenue}>
                    ₹{room.revenue.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

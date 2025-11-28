"use client";

import { useState } from "react";
import {
  Save,
  Bell,
  Shield,
  Mail,
  Database,
  CreditCard,
  User,
  Building,
} from "lucide-react";
import toast from "react-hot-toast";
import styles from "./AdminSettings.module.css";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    // General Settings
    siteName: "RoomRent Manager",
    supportEmail: "support@roomrent.com",
    supportPhone: "+1 (555) 123-4567",

    // Payment Settings
    razorpayKey: "",
    razorpaySecret: "",
    enableOnlinePayments: true,

    // Notification Settings
    emailNotifications: true,
    rentReminders: true,
    reminderDays: 3,

    // Security Settings
    sessionTimeout: 60,
    requireStrongPasswords: true,
  });

  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSaving(false);
    toast.success("Settings saved successfully!");
  };

  const tabs = [
    { id: "general", label: "General", icon: <Building size={18} /> },
    { id: "payments", label: "Payments", icon: <CreditCard size={18} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={18} /> },
    { id: "security", label: "Security", icon: <Shield size={18} /> },
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Settings</h1>
          <p className={styles.subtitle}>
            Manage your RoomRent application settings
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={styles.saveButton}
        >
          {saving ? <div className={styles.spinner}></div> : <Save size={20} />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className={styles.settingsLayout}>
        {/* Sidebar */}
        <div className={styles.sidebar}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${styles.tabButton} ${
                activeTab === tab.id ? styles.tabButtonActive : ""
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* General Settings */}
          {activeTab === "general" && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>General Settings</h2>
              <div className={styles.settingsGrid}>
                <div className={styles.settingGroup}>
                  <label className={styles.label}>Site Name</label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        siteName: e.target.value,
                      }))
                    }
                    className={styles.input}
                  />
                </div>

                <div className={styles.settingGroup}>
                  <label className={styles.label}>Support Email</label>
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        supportEmail: e.target.value,
                      }))
                    }
                    className={styles.input}
                  />
                </div>

                <div className={styles.settingGroup}>
                  <label className={styles.label}>Support Phone</label>
                  <input
                    type="tel"
                    value={settings.supportPhone}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        supportPhone: e.target.value,
                      }))
                    }
                    className={styles.input}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payment Settings */}
          {activeTab === "payments" && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Payment Settings</h2>
              <div className={styles.settingsGrid}>
                <div className={styles.settingGroup}>
                  <label className={styles.label}>Razorpay Key ID</label>
                  <input
                    type="password"
                    value={settings.razorpayKey}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        razorpayKey: e.target.value,
                      }))
                    }
                    className={styles.input}
                    placeholder="rzp_test_..."
                  />
                </div>

                <div className={styles.settingGroup}>
                  <label className={styles.label}>Razorpay Secret</label>
                  <input
                    type="password"
                    value={settings.razorpaySecret}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        razorpaySecret: e.target.value,
                      }))
                    }
                    className={styles.input}
                    placeholder="Razorpay secret key"
                  />
                </div>

                <div className={styles.settingGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={settings.enableOnlinePayments}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          enableOnlinePayments: e.target.checked,
                        }))
                      }
                      className={styles.checkbox}
                    />
                    <span className={styles.checkmark}></span>
                    Enable Online Payments
                  </label>
                  <p className={styles.helpText}>
                    Allow tenants to pay rent online via Razorpay
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === "notifications" && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Notification Settings</h2>
              <div className={styles.settingsGrid}>
                <div className={styles.settingGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          emailNotifications: e.target.checked,
                        }))
                      }
                      className={styles.checkbox}
                    />
                    <span className={styles.checkmark}></span>
                    Email Notifications
                  </label>
                  <p className={styles.helpText}>
                    Send email notifications for important events
                  </p>
                </div>

                <div className={styles.settingGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={settings.rentReminders}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          rentReminders: e.target.checked,
                        }))
                      }
                      className={styles.checkbox}
                    />
                    <span className={styles.checkmark}></span>
                    Rent Reminders
                  </label>
                  <p className={styles.helpText}>
                    Automatically send rent reminder emails to tenants
                  </p>
                </div>

                <div className={styles.settingGroup}>
                  <label className={styles.label}>
                    Reminder Days Before Due
                  </label>
                  <input
                    type="number"
                    value={settings.reminderDays}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        reminderDays: parseInt(e.target.value) || 3,
                      }))
                    }
                    className={styles.input}
                    min="1"
                    max="7"
                  />
                  <p className={styles.helpText}>
                    Number of days before rent due date to send reminders
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === "security" && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Security Settings</h2>
              <div className={styles.settingsGrid}>
                <div className={styles.settingGroup}>
                  <label className={styles.label}>
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        sessionTimeout: parseInt(e.target.value) || 60,
                      }))
                    }
                    className={styles.input}
                    min="15"
                    max="480"
                  />
                  <p className={styles.helpText}>
                    Automatically log out users after inactivity
                  </p>
                </div>

                <div className={styles.settingGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={settings.requireStrongPasswords}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          requireStrongPasswords: e.target.checked,
                        }))
                      }
                      className={styles.checkbox}
                    />
                    <span className={styles.checkmark}></span>
                    Require Strong Passwords
                  </label>
                  <p className={styles.helpText}>
                    Enforce strong password requirements for all users
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

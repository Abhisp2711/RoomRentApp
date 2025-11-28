"use client";

import { useState } from "react";
import { Bell, Shield, Globe, Eye, Moon, Save, Mail, User } from "lucide-react";
import toast from "react-hot-toast";
import styles from "./Settings.module.css";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("notifications");
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    rentReminders: true,
    paymentAlerts: true,
    maintenanceUpdates: true,
    promotionalEmails: false,

    // Privacy Settings
    profileVisibility: "private",
    showEmail: false,
    showPhone: false,
    dataSharing: false,

    // Appearance Settings
    theme: "light",
    language: "en",
    fontSize: "medium",
  });

  const tabs = [
    { id: "notifications", label: "Notifications", icon: <Bell size={18} /> },
    { id: "privacy", label: "Privacy", icon: <Shield size={18} /> },
    { id: "appearance", label: "Appearance", icon: <Eye size={18} /> },
    { id: "general", label: "General", icon: <Globe size={18} /> },
  ];

  const handleSave = async () => {
    setSaving(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSaving(false);
    toast.success("Settings saved successfully!");
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Customize your application experience</p>
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
          {/* Notifications */}
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
                    Receive important updates via email
                  </p>
                </div>

                <div className={styles.settingGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={settings.pushNotifications}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          pushNotifications: e.target.checked,
                        }))
                      }
                      className={styles.checkbox}
                    />
                    <span className={styles.checkmark}></span>
                    Push Notifications
                  </label>
                  <p className={styles.helpText}>
                    Get real-time notifications in your browser
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
                    Rent Payment Reminders
                  </label>
                  <p className={styles.helpText}>
                    Remind me 3 days before rent is due
                  </p>
                </div>

                <div className={styles.settingGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={settings.paymentAlerts}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          paymentAlerts: e.target.checked,
                        }))
                      }
                      className={styles.checkbox}
                    />
                    <span className={styles.checkmark}></span>
                    Payment Alerts
                  </label>
                  <p className={styles.helpText}>
                    Notify me when payments are processed
                  </p>
                </div>

                <div className={styles.settingGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={settings.maintenanceUpdates}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          maintenanceUpdates: e.target.checked,
                        }))
                      }
                      className={styles.checkbox}
                    />
                    <span className={styles.checkmark}></span>
                    Maintenance Updates
                  </label>
                  <p className={styles.helpText}>
                    Updates about property maintenance
                  </p>
                </div>

                <div className={styles.settingGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={settings.promotionalEmails}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          promotionalEmails: e.target.checked,
                        }))
                      }
                      className={styles.checkbox}
                    />
                    <span className={styles.checkmark}></span>
                    Promotional Emails
                  </label>
                  <p className={styles.helpText}>
                    Receive offers and feature updates
                  </p>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className={styles.saveButton}
              >
                {saving ? (
                  <>
                    <div className={styles.spinner}></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Notification Settings
                  </>
                )}
              </button>
            </div>
          )}

          {/* Privacy */}
          {activeTab === "privacy" && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Privacy Settings</h2>
              <div className={styles.settingsGrid}>
                <div className={styles.settingGroup}>
                  <label className={styles.label}>Profile Visibility</label>
                  <select
                    value={settings.profileVisibility}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        profileVisibility: e.target.value,
                      }))
                    }
                    className={styles.select}
                  >
                    <option value="private">Private</option>
                    <option value="tenants">Visible to Tenants</option>
                    <option value="public">Public</option>
                  </select>
                  <p className={styles.helpText}>
                    Control who can see your profile information
                  </p>
                </div>

                <div className={styles.settingGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={settings.showEmail}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          showEmail: e.target.checked,
                        }))
                      }
                      className={styles.checkbox}
                    />
                    <span className={styles.checkmark}></span>
                    Show Email Address
                  </label>
                  <p className={styles.helpText}>
                    Allow other users to see your email address
                  </p>
                </div>

                <div className={styles.settingGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={settings.showPhone}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          showPhone: e.target.checked,
                        }))
                      }
                      className={styles.checkbox}
                    />
                    <span className={styles.checkmark}></span>
                    Show Phone Number
                  </label>
                  <p className={styles.helpText}>
                    Allow other users to see your phone number
                  </p>
                </div>

                <div className={styles.settingGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={settings.dataSharing}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          dataSharing: e.target.checked,
                        }))
                      }
                      className={styles.checkbox}
                    />
                    <span className={styles.checkmark}></span>
                    Data Sharing for Analytics
                  </label>
                  <p className={styles.helpText}>
                    Help us improve by sharing anonymous usage data
                  </p>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className={styles.saveButton}
              >
                {saving ? (
                  <>
                    <div className={styles.spinner}></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Shield size={16} />
                    Save Privacy Settings
                  </>
                )}
              </button>
            </div>
          )}

          {/* Appearance */}
          {activeTab === "appearance" && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Appearance Settings</h2>
              <div className={styles.settingsGrid}>
                <div className={styles.settingGroup}>
                  <label className={styles.label}>Theme</label>
                  <select
                    value={settings.theme}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        theme: e.target.value,
                      }))
                    }
                    className={styles.select}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto (System)</option>
                  </select>
                  <p className={styles.helpText}>
                    Choose your preferred color theme
                  </p>
                </div>

                <div className={styles.settingGroup}>
                  <label className={styles.label}>Language</label>
                  <select
                    value={settings.language}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        language: e.target.value,
                      }))
                    }
                    className={styles.select}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                  <p className={styles.helpText}>
                    Choose your preferred language
                  </p>
                </div>

                <div className={styles.settingGroup}>
                  <label className={styles.label}>Font Size</label>
                  <select
                    value={settings.fontSize}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        fontSize: e.target.value,
                      }))
                    }
                    className={styles.select}
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                  <p className={styles.helpText}>
                    Adjust the text size throughout the application
                  </p>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className={styles.saveButton}
              >
                {saving ? (
                  <>
                    <div className={styles.spinner}></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Eye size={16} />
                    Save Appearance Settings
                  </>
                )}
              </button>
            </div>
          )}

          {/* General */}
          {activeTab === "general" && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>General Settings</h2>
              <div className={styles.settingsGrid}>
                <div className={styles.settingGroup}>
                  <label className={styles.label}>Time Zone</label>
                  <select className={styles.select} defaultValue="auto">
                    <option value="auto">Auto-detect</option>
                    <option value="est">Eastern Time (ET)</option>
                    <option value="cst">Central Time (CT)</option>
                    <option value="pst">Pacific Time (PT)</option>
                    <option value="utc">UTC</option>
                  </select>
                  <p className={styles.helpText}>
                    Set your local time zone for accurate timestamps
                  </p>
                </div>

                <div className={styles.settingGroup}>
                  <label className={styles.label}>Date Format</label>
                  <select className={styles.select} defaultValue="mm/dd/yyyy">
                    <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                    <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                    <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                  </select>
                  <p className={styles.helpText}>
                    Choose your preferred date format
                  </p>
                </div>

                <div className={styles.settingGroup}>
                  <label className={styles.label}>Currency</label>
                  <select className={styles.select} defaultValue="inr">
                    <option value="inr">Indian Rupee (₹)</option>
                    <option value="usd">US Dollar ($)</option>
                    <option value="eur">Euro (€)</option>
                    <option value="gbp">British Pound (£)</option>
                  </select>
                  <p className={styles.helpText}>
                    Set your preferred currency for display
                  </p>
                </div>
              </div>

              <div className={styles.dangerZone}>
                <h3>Danger Zone</h3>
                <div className={styles.dangerActions}>
                  <button className={styles.dangerButton}>
                    Export My Data
                  </button>
                  <button className={styles.dangerButtonDelete}>
                    Delete Account
                  </button>
                </div>
                <p className={styles.dangerHelpText}>
                  These actions are irreversible. Please proceed with caution.
                </p>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className={styles.saveButton}
              >
                {saving ? (
                  <>
                    <div className={styles.spinner}></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Globe size={16} />
                    Save General Settings
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

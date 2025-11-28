"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { User, Mail, Phone, Calendar, Shield, Bell, Save } from "lucide-react";
import toast from "react-hot-toast";
import styles from "./Profile.module.css";

interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("personal");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setProfile({
          name: userData.name || user?.name || "",
          email: userData.email || user?.email || "",
          phone: userData.phone || "",
          dateOfBirth: userData.dateOfBirth || "",
          address: userData.address || "",
        });
      } else {
        // Fallback to auth context data
        setProfile({
          name: user?.name || "",
          email: user?.email || "",
          phone: "",
          dateOfBirth: "",
          address: "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Fallback to auth context data
      setProfile({
        name: user?.name || "",
        email: user?.email || "",
        phone: "",
        dateOfBirth: "",
        address: "",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        updateUser(updatedUser);
        toast.success("Profile updated successfully!");
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      toast.error("Error updating profile");
      console.error("Profile update error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/users/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (response.ok) {
        toast.success("Password changed successfully!");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to change password");
      }
    } catch (error: any) {
      toast.error(error.message || "Error changing password");
      console.error("Password change error:", error);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "personal", label: "Personal Info", icon: <User size={18} /> },
    { id: "security", label: "Security", icon: <Shield size={18} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={18} /> },
  ];

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Profile Settings</h1>
        <p className={styles.subtitle}>
          Manage your account information and preferences
        </p>
      </div>

      <div className={styles.profileLayout}>
        {/* Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.profileAvatar}>
            <div className={styles.avatar}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <h3 className={styles.userName}>{user?.name}</h3>
            <p className={styles.userEmail}>{user?.email}</p>
          </div>

          <nav className={styles.nav}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${styles.navButton} ${
                  activeTab === tab.id ? styles.navButtonActive : ""
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Personal Information */}
          {activeTab === "personal" && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Personal Information</h2>
              <form onSubmit={handleProfileUpdate} className={styles.form}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Full Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className={styles.input}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Email Address</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className={styles.input}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Phone Number</label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      className={styles.input}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Date of Birth</label>
                    <input
                      type="date"
                      value={profile.dateOfBirth}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          dateOfBirth: e.target.value,
                        }))
                      }
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Address</label>
                  <textarea
                    value={profile.address}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    className={styles.input}
                    rows={3}
                    placeholder="Enter your complete address"
                  />
                </div>

                <button
                  type="submit"
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
                      Save Changes
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Security */}
          {activeTab === "security" && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Security Settings</h2>
              <form onSubmit={handlePasswordChange} className={styles.form}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Current Password</label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                      className={styles.input}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>New Password</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      className={styles.input}
                      required
                      minLength={6}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      className={styles.input}
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className={styles.saveButton}
                >
                  {saving ? (
                    <>
                      <div className={styles.spinner}></div>
                      Changing Password...
                    </>
                  ) : (
                    <>
                      <Shield size={16} />
                      Change Password
                    </>
                  )}
                </button>
              </form>

              <div className={styles.securityTips}>
                <h3>Password Requirements</h3>
                <ul>
                  <li>At least 6 characters long</li>
                  <li>Include uppercase and lowercase letters</li>
                  <li>Include numbers and special characters</li>
                  <li>Not similar to your previous passwords</li>
                </ul>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === "notifications" && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Notification Preferences</h2>
              <div className={styles.settingsGrid}>
                <div className={styles.settingGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      defaultChecked
                    />
                    <span className={styles.checkmark}></span>
                    Rent payment reminders
                  </label>
                  <p className={styles.helpText}>
                    Receive reminders when rent payments are due
                  </p>
                </div>

                <div className={styles.settingGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      defaultChecked
                    />
                    <span className={styles.checkmark}></span>
                    Payment confirmations
                  </label>
                  <p className={styles.helpText}>
                    Get notified when payments are successfully processed
                  </p>
                </div>

                <div className={styles.settingGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      defaultChecked
                    />
                    <span className={styles.checkmark}></span>
                    Maintenance updates
                  </label>
                  <p className={styles.helpText}>
                    Receive updates about maintenance and repairs
                  </p>
                </div>

                <div className={styles.settingGroup}>
                  <label className={styles.checkboxLabel}>
                    <input type="checkbox" className={styles.checkbox} />
                    <span className={styles.checkmark}></span>
                    Promotional emails
                  </label>
                  <p className={styles.helpText}>
                    Get updates about new features and offers
                  </p>
                </div>
              </div>

              <button className={styles.saveButton}>
                <Save size={16} />
                Save Preferences
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

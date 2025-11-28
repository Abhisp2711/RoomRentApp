"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Lock, User, Shield } from "lucide-react";
import styles from "../Auth.module.css";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [step, setStep] = useState<"form" | "otp">("form");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState("");

  const { register, verifyOtp } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      await register(formData);
      setEmailSent(formData.email);
      setStep("otp");
      toast.success("OTP sent to your email!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter complete OTP");
      setLoading(false);
      return;
    }

    try {
      await verifyOtp(emailSent, otpString);
      toast.success("Registration successful!");
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setLoading(true);
    setError("");

    try {
      await register(formData);
      toast.success("OTP resent to your email!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        {/* Back Button */}
        <Link href="/" className={styles.backButton}>
          <ArrowLeft size={20} />
          Back to Home
        </Link>

        <div className={styles.authHeader}>
          <div className={styles.authIcon}>
            <Shield className={styles.icon} />
          </div>
          <h1 className={styles.authTitle}>
            {step === "form" ? "Create Account" : "Verify Email"}
          </h1>
          <p className={styles.authSubtitle}>
            {step === "form"
              ? "Sign up to start managing your rentals"
              : `Enter the OTP sent to ${emailSent}`}
          </p>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}

        {step === "form" ? (
          <form onSubmit={handleSubmit} className={styles.authForm}>
            <div className={styles.inputGroup}>
              <label htmlFor="name" className={styles.inputLabel}>
                <User size={18} />
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={styles.input}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.inputLabel}>
                <Mail size={18} />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={styles.input}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.inputLabel}>
                <Lock size={18} />
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={styles.input}
                placeholder="Create a password (min. 6 characters)"
                required
                minLength={6}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword" className={styles.inputLabel}>
                <Lock size={18} />
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={styles.input}
                placeholder="Confirm your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className={styles.authForm}>
            <div className={styles.otpContainer}>
              <p className={styles.otpInstructions}>
                Enter the 6-digit verification code sent to your email address
              </p>

              <div className={styles.otpInputs}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className={styles.otpInput}
                    placeholder="0"
                  />
                ))}
              </div>

              <div className={styles.otpActions}>
                <button
                  type="button"
                  onClick={resendOtp}
                  disabled={loading}
                  className={styles.resendButton}
                >
                  Resend OTP
                </button>
                <span className={styles.otpTimer}>2:00</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}

        <div className={styles.authFooter}>
          <p>
            Already have an account?{" "}
            <Link href="/login" className={styles.authLink}>
              Sign in
            </Link>
          </p>
        </div>

        <div className={styles.authFeatures}>
          <div className={styles.feature}>
            <Shield size={16} />
            <span>Secure JWT Authentication</span>
          </div>
          <div className={styles.feature}>
            <Mail size={16} />
            <span>Email Verification</span>
          </div>
          <div className={styles.feature}>
            <User size={16} />
            <span>Role-based Access</span>
          </div>
        </div>
      </div>
    </div>
  );
}

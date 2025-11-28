"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import {
  ArrowRight,
  Shield,
  CreditCard,
  Bell,
  Users,
  BarChart3,
  CheckCircle,
  Star,
  Home as HomeIcon,
  Building,
  Download,
  Mail,
  Calendar,
  FileText,
  Zap,
  Cloud,
  Database,
  Lock,
  Smartphone,
  Globe,
  TrendingUp,
  Clock,
  Heart,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
} from "lucide-react";
import styles from "./HomePage.module.css";

export default function HomePage() {
  const { user } = useAuth();
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  const features = [
    {
      icon: <Shield className={styles.featureIcon} />,
      title: "Secure Authentication",
      description:
        "JWT protected login with role-based access control for admins and tenants",
      color: "#10b981",
    },
    {
      icon: <HomeIcon className={styles.featureIcon} />,
      title: "Room Management",
      description:
        "Easily manage rooms, assign tenants, and track occupancy status",
      color: "#3b82f6",
    },
    {
      icon: <CreditCard className={styles.featureIcon} />,
      title: "Payment System",
      description:
        "Support for both online Razorpay payments and manual cash payments",
      color: "#8b5cf6",
    },
    {
      icon: <Bell className={styles.featureIcon} />,
      title: "Rent Reminders",
      description: "Automatic monthly rent reminder emails to tenants",
      color: "#f59e0b",
    },
    {
      icon: <BarChart3 className={styles.featureIcon} />,
      title: "Payment Tracking",
      description: "Complete payment history with CSV export functionality",
      color: "#ef4444",
    },
    {
      icon: <Users className={styles.featureIcon} />,
      title: "Tenant Management",
      description:
        "Manage tenant profiles with Aadhaar details and photo uploads",
      color: "#06b6d4",
    },
    {
      icon: <Download className={styles.featureIcon} />,
      title: "CSV Export",
      description: "Export all your payment data and reports in CSV format",
      color: "#84cc16",
    },
    {
      icon: <Cloud className={styles.featureIcon} />,
      title: "Cloud Storage",
      description:
        "Secure Cloudinary integration for document and photo storage",
      color: "#f97316",
    },
  ];

  const stats = [
    {
      number: "99.9%",
      label: "Uptime",
      icon: <Zap className={styles.statIcon} />,
    },
    {
      number: "500+",
      label: "Rooms Managed",
      icon: <Building className={styles.statIcon} />,
    },
    {
      number: "1M+",
      label: "Payments Processed",
      icon: <CreditCard className={styles.statIcon} />,
    },
    {
      number: "24/7",
      label: "Support",
      icon: <Clock className={styles.statIcon} />,
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Property Manager",
      company: "Urban Living Properties",
      content:
        "RoomRent has reduced our administrative work by 70%. The automatic reminders and payment tracking are game-changers!",
      avatar: "SJ",
    },
    {
      name: "Mike Chen",
      role: "Real Estate Investor",
      company: "Metro Holdings",
      content:
        "The Razorpay integration made rent collection so much easier. My tenants love the convenience of online payments.",
      avatar: "MC",
    },
    {
      name: "Emily Rodriguez",
      role: "Apartment Complex Owner",
      company: "Skyline Apartments",
      content:
        "From room management to payment reports, everything is streamlined. The CSV export feature saves me hours every month.",
      avatar: "ER",
    },
  ];

  const techStack = [
    { name: "Node.js", icon: <Database />, color: "#84cc16" },
    { name: "MongoDB", icon: <Database />, color: "#047857" },
    { name: "Razorpay", icon: <CreditCard />, color: "#2d3748" },
    { name: "Cloudinary", icon: <Cloud />, color: "#3448c5" },
    { name: "JWT Auth", icon: <Lock />, color: "#dc2626" },
    { name: "Next.js", icon: <Globe />, color: "#000000" },
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentFeature((prev) => (prev + 1) % features.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, features.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const nextFeature = () => {
    setCurrentFeature((prev) => (prev + 1) % features.length);
  };

  const prevFeature = () => {
    setCurrentFeature((prev) => (prev - 1 + features.length) % features.length);
  };

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  return (
    <div className={styles.homePage}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.backgroundAnimation}>
          <div className={styles.floatingShape}></div>
          <div className={styles.floatingShape}></div>
          <div className={styles.floatingShape}></div>
        </div>

        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <Star className={styles.starIcon} />
              <span>Trusted by 100+ Property Managers</span>
              <div className={styles.rating}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={12} fill="currentColor" />
                ))}
                <span>4.9/5</span>
              </div>
            </div>

            <h1 className={styles.heroTitle}>
              Smart Room Rent
              <span className={styles.gradientText}> Management</span>
              <br />
              <span className={styles.subtitle}>Made Simple</span>
            </h1>

            <p className={styles.heroDescription}>
              Streamline your rental property management with our complete
              solution. Handle rooms, payments, tenants, and reminders all in
              one platform. Built with modern technology for reliability and
              scale.
            </p>

            {!user ? (
              <div className={styles.heroButtons}>
                <Link href="/register" className={styles.primaryButton}>
                  Get Started Free
                  <ArrowRight className={styles.buttonIcon} />
                </Link>
                <Link href="/login" className={styles.secondaryButton}>
                  Sign In
                </Link>
                <div className={styles.demoButton}>
                  <Play size={16} />
                  Watch Demo
                </div>
              </div>
            ) : (
              <div className={styles.heroButtons}>
                <Link
                  href={user.role === "admin" ? "/dashboard" : "/my-room"}
                  className={styles.primaryButton}
                >
                  Go to Dashboard
                  <ArrowRight className={styles.buttonIcon} />
                </Link>
                <Link href="/features" className={styles.secondaryButton}>
                  Explore Features
                </Link>
              </div>
            )}

            {/* Stats */}
            <div className={styles.statsGrid}>
              {stats.map((stat, index) => (
                <div key={index} className={styles.statItem}>
                  <div className={styles.statIconWrapper}>{stat.icon}</div>
                  <div className={styles.statContent}>
                    <div className={styles.statNumber}>{stat.number}</div>
                    <div className={styles.statLabel}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Visual */}
          <div className={styles.heroVisual}>
            <div className={styles.featureShowcase}>
              <div className={styles.showcaseCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardDots}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <div className={styles.cardControls}>
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className={styles.controlButton}
                    >
                      {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                    <button
                      onClick={prevFeature}
                      className={styles.controlButton}
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      onClick={nextFeature}
                      className={styles.controlButton}
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
                <div className={styles.cardContent}>
                  <div
                    className={styles.featureDisplay}
                    style={
                      {
                        "--feature-color": features[currentFeature].color,
                      } as React.CSSProperties
                    }
                  >
                    <div className={styles.featureIconWrapper}>
                      {features[currentFeature].icon}
                    </div>
                    <h3>{features[currentFeature].title}</h3>
                    <p>{features[currentFeature].description}</p>
                    <div className={styles.featureProgress}>
                      {features.map((_, index) => (
                        <div
                          key={index}
                          className={`${styles.progressDot} ${
                            index === currentFeature ? styles.active : ""
                          }`}
                          onClick={() => setCurrentFeature(index)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className={styles.techSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Built with Modern Technology
            </h2>
            <p className={styles.sectionDescription}>
              Powered by the latest tech stack for performance and reliability
            </p>
          </div>
          <div className={styles.techGrid}>
            {techStack.map((tech, index) => (
              <div key={index} className={styles.techItem}>
                <div className={styles.techIcon} style={{ color: tech.color }}>
                  {tech.icon}
                </div>
                <span className={styles.techName}>{tech.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={sectionRef} className={styles.featuresSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Everything You Need</h2>
            <p className={styles.sectionDescription}>
              Complete room rent management system with all essential features
            </p>
          </div>

          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div
                key={index}
                className={`${styles.featureCard} ${
                  isVisible ? styles.animateIn : ""
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={styles.featureIconWrapper}
                  style={{
                    backgroundColor: `${feature.color}15`,
                    color: feature.color,
                  }}
                >
                  {feature.icon}
                </div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>
                  {feature.description}
                </p>
                <div className={styles.featureHover}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles.worksSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>How It Works</h2>
            <p className={styles.sectionDescription}>
              Simple steps to manage your rental properties efficiently
            </p>
          </div>

          <div className={styles.worksSteps}>
            <div className={styles.workStep}>
              <div className={styles.stepVisual}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepLine}></div>
              </div>
              <div className={styles.stepContent}>
                <Building className={styles.stepIcon} />
                <h3>Add Rooms & Tenants</h3>
                <p>
                  Create room entries and assign tenants with their details,
                  Aadhaar verification, and photo uploads
                </p>
              </div>
            </div>

            <div className={styles.workStep}>
              <div className={styles.stepVisual}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepLine}></div>
              </div>
              <div className={styles.stepContent}>
                <CreditCard className={styles.stepIcon} />
                <h3>Track Payments</h3>
                <p>
                  Monitor online Razorpay payments and manual cash payments with
                  complete transaction history
                </p>
              </div>
            </div>

            <div className={styles.workStep}>
              <div className={styles.stepVisual}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepLine}></div>
              </div>
              <div className={styles.stepContent}>
                <Bell className={styles.stepIcon} />
                <h3>Automate Reminders</h3>
                <p>
                  Automatic monthly rent reminder emails with customizable
                  templates and scheduling
                </p>
              </div>
            </div>

            <div className={styles.workStep}>
              <div className={styles.stepVisual}>
                <div className={styles.stepNumber}>4</div>
              </div>
              <div className={styles.stepContent}>
                <BarChart3 className={styles.stepIcon} />
                <h3>Generate Reports</h3>
                <p>
                  Export payment data, analytics, and insights with CSV download
                  functionality
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={styles.testimonialsSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Loved by Property Managers</h2>
            <p className={styles.sectionDescription}>
              See what our users have to say about RoomRent
            </p>
          </div>

          <div className={styles.testimonialsContainer}>
            <button onClick={prevTestimonial} className={styles.testimonialNav}>
              <ChevronLeft size={20} />
            </button>

            <div className={styles.testimonialContent}>
              <div className={styles.testimonialCard}>
                <div className={styles.testimonialAvatar}>
                  {testimonials[activeTestimonial].avatar}
                </div>
                <div className={styles.testimonialText}>
                  <p>"{testimonials[activeTestimonial].content}"</p>
                </div>
                <div className={styles.testimonialAuthor}>
                  <strong>{testimonials[activeTestimonial].name}</strong>
                  <span>{testimonials[activeTestimonial].role}</span>
                  <span className={styles.company}>
                    {testimonials[activeTestimonial].company}
                  </span>
                </div>
              </div>
            </div>

            <button onClick={nextTestimonial} className={styles.testimonialNav}>
              <ChevronRight size={20} />
            </button>
          </div>

          <div className={styles.testimonialDots}>
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`${styles.testimonialDot} ${
                  index === activeTestimonial ? styles.active : ""
                }`}
                onClick={() => setActiveTestimonial(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaBackground}>
          <div className={styles.ctaPattern}></div>
        </div>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>
              Ready to Simplify Your Rental Management?
            </h2>
            <p className={styles.ctaDescription}>
              Join hundreds of property managers who trust RoomRent for their
              business. Start your free trial today!
            </p>
            {!user && (
              <div className={styles.ctaButtons}>
                <Link href="/register" className={styles.ctaButton}>
                  Start Free Trial
                  <ArrowRight className={styles.buttonIcon} />
                </Link>
                <Link href="/contact" className={styles.ctaSecondary}>
                  Schedule Demo
                </Link>
              </div>
            )}
            {user && (
              <div className={styles.ctaButtons}>
                <Link href="/dashboard" className={styles.ctaButton}>
                  Go to Dashboard
                  <ArrowRight className={styles.buttonIcon} />
                </Link>
              </div>
            )}
            <div className={styles.ctaFeatures}>
              <div className={styles.ctaFeature}>
                <CheckCircle size={16} />
                <span>No credit card required</span>
              </div>
              <div className={styles.ctaFeature}>
                <CheckCircle size={16} />
                <span>14-day free trial</span>
              </div>
              <div className={styles.ctaFeature}>
                <CheckCircle size={16} />
                <span>Setup in 5 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

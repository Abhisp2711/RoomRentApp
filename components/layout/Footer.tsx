"use client";
import Link from "next/link";
import {
  Home,
  Mail,
  Phone,
  MapPin,
  Building,
  CreditCard,
  Bell,
  BarChart3,
  Shield,
  FileText,
  Users,
  Calendar,
  Download,
  ArrowUp,
  Facebook,
  Twitter,
  Linkedin,
  Github,
} from "lucide-react";
import styles from "./Footer.module.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        {/* Main Footer Content */}
        <div className={styles.footerContent}>
          {/* Brand Section */}
          <div className={styles.brandSection}>
            <div className={styles.brand}>
              <Home className={styles.brandIcon} />
              <span className={styles.brandName}>RoomRent Manager</span>
            </div>
            <p className={styles.brandDescription}>
              Complete room rental management solution for landlords and
              tenants. Streamline payments, track occupancy, manage properties,
              and automate rent reminders with our powerful platform.
            </p>

            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <Mail size={16} />
                <span>support@roomrent.com</span>
              </div>
              <div className={styles.contactItem}>
                <Phone size={16} />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className={styles.contactItem}>
                <MapPin size={16} />
                <span>123 Rental St, City, State 12345</span>
              </div>
            </div>

            {/* Social Links */}
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialLink} aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href="#" className={styles.socialLink} aria-label="Twitter">
                <Twitter size={18} />
              </a>
              <a href="#" className={styles.socialLink} aria-label="LinkedIn">
                <Linkedin size={18} />
              </a>
              <a href="#" className={styles.socialLink} aria-label="GitHub">
                <Github size={18} />
              </a>
            </div>
          </div>

          {/* Platform Features */}
          <div className={styles.linksSection}>
            <h3 className={styles.sectionTitle}>Platform Features</h3>
            <div className={styles.featuresGrid}>
              <div className={styles.featureItem}>
                <Building size={16} />
                <span>Room Management</span>
              </div>
              <div className={styles.featureItem}>
                <CreditCard size={16} />
                <span>Online & Cash Payments</span>
              </div>
              <div className={styles.featureItem}>
                <Users size={16} />
                <span>Tenant Management</span>
              </div>
              <div className={styles.featureItem}>
                <Bell size={16} />
                <span>Rent Reminders</span>
              </div>
              <div className={styles.featureItem}>
                <BarChart3 size={16} />
                <span>Payment Tracking</span>
              </div>
              <div className={styles.featureItem}>
                <Download size={16} />
                <span>CSV Export</span>
              </div>
              <div className={styles.featureItem}>
                <Shield size={16} />
                <span>Secure Authentication</span>
              </div>
              <div className={styles.featureItem}>
                <FileText size={16} />
                <span>Document Management</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.linksSection}>
            <h3 className={styles.sectionTitle}>Quick Links</h3>
            <div className={styles.linksGrid}>
              <div className={styles.linkColumn}>
                <Link href="/dashboard" className={styles.footerLink}>
                  Dashboard
                </Link>
                <Link href="/rooms" className={styles.footerLink}>
                  Rooms
                </Link>
                <Link href="/tenants" className={styles.footerLink}>
                  Tenants
                </Link>
                <Link href="/payments" className={styles.footerLink}>
                  Payments
                </Link>
              </div>
              <div className={styles.linkColumn}>
                <Link href="/reports" className={styles.footerLink}>
                  Reports
                </Link>
                <Link href="/profile" className={styles.footerLink}>
                  Profile
                </Link>
                <Link href="/settings" className={styles.footerLink}>
                  Settings
                </Link>
                <Link href="/support" className={styles.footerLink}>
                  Support
                </Link>
              </div>
            </div>
          </div>

          {/* Resources & Support */}
          <div className={styles.linksSection}>
            <h3 className={styles.sectionTitle}>Resources & Support</h3>
            <div className={styles.linksList}>
              <Link href="/documentation" className={styles.footerLink}>
                Documentation
              </Link>
              <Link href="/api-docs" className={styles.footerLink}>
                API Documentation
              </Link>
              <Link href="/help-center" className={styles.footerLink}>
                Help Center
              </Link>
              <Link href="/tutorials" className={styles.footerLink}>
                Video Tutorials
              </Link>
              <Link href="/blog" className={styles.footerLink}>
                Blog
              </Link>
              <Link href="/status" className={styles.footerLink}>
                System Status
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div className={styles.linksSection}>
            <h3 className={styles.sectionTitle}>Legal</h3>
            <div className={styles.linksList}>
              <Link href="/privacy" className={styles.footerLink}>
                Privacy Policy
              </Link>
              <Link href="/terms" className={styles.footerLink}>
                Terms of Service
              </Link>
              <Link href="/cookies" className={styles.footerLink}>
                Cookie Policy
              </Link>
              <Link href="/gdpr" className={styles.footerLink}>
                GDPR Compliance
              </Link>
              <Link href="/security" className={styles.footerLink}>
                Security
              </Link>
              <Link href="/compliance" className={styles.footerLink}>
                Compliance
              </Link>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className={styles.newsletterSection}>
          <div className={styles.newsletterContent}>
            <div className={styles.newsletterText}>
              <h3 className={styles.newsletterTitle}>Stay Updated</h3>
              <p className={styles.newsletterDescription}>
                Get the latest features and updates delivered to your inbox.
              </p>
            </div>
            <div className={styles.newsletterForm}>
              <input
                type="email"
                placeholder="Enter your email"
                className={styles.newsletterInput}
              />
              <button className={styles.newsletterButton}>Subscribe</button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          <div className={styles.bottomContent}>
            <div className={styles.copyright}>
              <span>
                © {currentYear} RoomRent Manager. All rights reserved.
              </span>
              <div className={styles.techStack}>
                Built with: Node.js • MongoDB • Razorpay • Cloudinary
              </div>
            </div>

            <div className={styles.bottomLinks}>
              <Link href="/sitemap" className={styles.bottomLink}>
                Sitemap
              </Link>
              <span className={styles.separator}>•</span>
              <Link href="/accessibility" className={styles.bottomLink}>
                Accessibility
              </Link>
              <span className={styles.separator}>•</span>
              <button
                onClick={scrollToTop}
                className={styles.backToTop}
                aria-label="Back to top"
              >
                <ArrowUp size={16} />
                Back to Top
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  IndianRupee,
  Building,
  Camera,
  CheckCircle,
  Users,
  Mail,
  Phone,
  ArrowLeft,
  Calendar,
  MapPin,
  Home,
  Star,
  Download,
  Share2,
  MessageCircle,
  Clock,
  Shield,
  BookOpen,
  FileText,
  Wifi,
  Droplets,
  Car,
  Tv,
  Wind,
  Bath,
  Bed,
  Grid,
  Maximize,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import styles from "./RoomDetails.module.css";

interface Room {
  _id: string;
  roomNumber: string;
  monthlyRent: number;
  isAvailable: boolean;
  status: string;
  tenant: {
    name: string;
    email: string;
    phone: string;
    joinedDate: string;
  };
  photos: string[];
  description?: string;
  amenities?: string[];
  building?: string;
  floor?: string;
  size?: string;
  deposit?: number;
  electricityBill?: number;
  waterBill?: number;
  maintenanceFee?: number;
  owner?: {
    name: string;
    phone: string;
    email: string;
    officeHours: string;
  };
  lastPayment?: string;
  nextPayment?: string;
  totalPayments?: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const ROOM_OWNER_PHONE = "9142953494";

export default function RoomDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (params.id) {
      fetchRoom(params.id as string);
    }
  }, [params.id]);

  const fetchRoom = async (roomId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`);
      if (!response.ok) throw new Error("Failed to fetch room");
      const data = await response.json();
      setRoom(data);
    } catch (error) {
      console.error("Error fetching room:", error);
      toast.error("Failed to load room details");
    } finally {
      setLoading(false);
    }
  };

  const handleCallOwner = () => {
    window.location.href = `tel:${ROOM_OWNER_PHONE}`;
  };

  const handleWhatsAppOwner = () => {
    const message = `Hi, I'm interested in Room ${room?.roomNumber} (₹${room?.monthlyRent}/month). Please share more details.`;
    window.open(
      `https://wa.me/${ROOM_OWNER_PHONE}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const handleShareRoom = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Room ${room?.roomNumber} - ₹${room?.monthlyRent}/month`,
          text: `Check out this room! ${room?.description}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleDownloadImage = async () => {
    if (!room?.photos) return;

    setDownloading(true);
    try {
      const response = await fetch(room.photos[0]);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `room-${room.roomNumber}-image.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Image downloaded!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download image");
    } finally {
      setDownloading(false);
    }
  };

  const handleFullscreen = () => {
    if (!galleryRef.current) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      galleryRef.current.requestFullscreen();
    }
  };

  const getAmenityIcon = (amenity: string) => {
    const amenityIcons: Record<string, React.ReactNode> = {
      WiFi: <Wifi size={16} />,
      AC: <Wind size={16} />,
      Heater: <Droplets size={16} />,
      Parking: <Car size={16} />,
      TV: <Tv size={16} />,
      "Attached Bathroom": <Bath size={16} />,
      Furnished: <Bed size={16} />,
      Laundry: <Grid size={16} />,
      Kitchen: <Home size={16} />,
      Security: <Shield size={16} />,
    };
    return amenityIcons[amenity] || <CheckCircle size={16} />;
  };

  const calculateTotalMonthlyCost = () => {
    if (!room) return 0;
    const baseRent = room.monthlyRent || 0;
    const electricity = room.electricityBill || 0;
    const water = room.waterBill || 0;
    const maintenance = room.maintenanceFee || 0;
    return baseRent + electricity + water + maintenance;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading room details...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className={styles.errorContainer}>
        <h2>Room not found</h2>
        <p>The room you're looking for doesn't exist.</p>
        <Link href="/rooms" className={styles.backLink}>
          <ArrowLeft size={16} />
          Back to Rooms
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <Link href="/rooms" className={styles.backLink}>
          <ArrowLeft size={20} />
          Back to Rooms
        </Link>
        <h1 className={styles.title}>Room {room.roomNumber}</h1>
        <div className={styles.statusContainer}>
          <div
            className={`${styles.status} ${
              room.isAvailable ? styles.available : styles.occupied
            } ${room.isAvailable ? styles.statusPulse : ""}`}
          >
            {room.isAvailable ? "Available" : "Occupied"}
          </div>
          <div className={styles.rent}>
            <IndianRupee size={24} />
            {formatCurrency(room.monthlyRent)}/month
          </div>
          <div className={styles.listingInfo}>
            <Star size={16} />
            <span>4.8 • 12 reviews</span>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        {/* Main Gallery */}
        <div className={styles.gallery} ref={galleryRef}>
          <div className={styles.mainImage}>
            {room.photos.length > 0 ? (
              <>
                <img
                  src={room.photos[0]}
                  alt={`Room ${room.roomNumber} - ${selectedImage + 1}`}
                />
                <div className={styles.galleryActions}>
                  <button
                    onClick={handleFullscreen}
                    className={styles.galleryButton}
                    title="Fullscreen"
                  >
                    <Maximize size={20} />
                  </button>
                  <button
                    onClick={handleDownloadImage}
                    disabled={downloading}
                    className={styles.galleryButton}
                    title="Download image"
                  >
                    {downloading ? (
                      <div
                        className={styles.loadingSpinner}
                        style={{ width: "20px", height: "20px" }}
                      />
                    ) : (
                      <Download size={20} />
                    )}
                  </button>
                  <button
                    onClick={handleShareRoom}
                    className={styles.galleryButton}
                    title="Share room"
                  >
                    <Share2 size={20} />
                  </button>
                </div>
              </>
            ) : (
              <div className={styles.imageFallback}>
                <Camera size={64} />
                <p>No images available</p>
              </div>
            )}
          </div>
          {room.photos.length > 1 && (
            <div className={styles.thumbnailContainer}>
              {room.photos.map((photo, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`${styles.thumbnail} ${
                    selectedImage === index ? styles.active : ""
                  }`}
                >
                  <img src={photo} alt={`Thumbnail ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className={styles.content}>
          {/* Room Details */}
          <section className={styles.section}>
            <h2>
              <Building size={24} />
              Room Details
            </h2>
            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <strong>Room Number</strong>
                <span>{room.roomNumber}</span>
              </div>
              <div className={styles.detailItem}>
                <strong>Building</strong>
                <span>{room.building || "Main Building"}</span>
              </div>
              <div className={styles.detailItem}>
                <strong>Floor</strong>
                <span>{room.floor || "Ground Floor"}</span>
              </div>
              <div className={styles.detailItem}>
                <strong>Size</strong>
                <span>{room.size || "Standard"}</span>
              </div>
              <div className={styles.detailItem}>
                <strong>Security Deposit</strong>
                <span>{formatCurrency(room.deposit || 0)}</span>
              </div>
              <div className={styles.detailItem}>
                <strong>Status</strong>
                <span
                  className={`${styles.statusBadge} ${
                    room.isAvailable ? styles.available : styles.occupied
                  }`}
                >
                  {room.isAvailable ? "Available" : "Occupied"}
                </span>
              </div>
            </div>

            {room.description && (
              <div className={styles.description}>
                <h3>About this room</h3>
                <p>{room.description}</p>
              </div>
            )}
          </section>

          {/* Amenities */}
          {room.amenities && room.amenities.length > 0 && (
            <section className={styles.section}>
              <h2>
                <CheckCircle size={24} />
                Amenities
              </h2>
              <div className={styles.amenitiesGrid}>
                {room.amenities.map((amenity, index) => (
                  <div key={index} className={styles.amenityItem}>
                    {getAmenityIcon(amenity)}
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Payment Information */}
          <section className={styles.section}>
            <h2>
              <IndianRupee size={24} />
              Payment Details
            </h2>
            <div className={styles.paymentInfo}>
              <div className={styles.paymentItem}>
                <span>Monthly Rent</span>
                <span>{formatCurrency(room.monthlyRent)}</span>
              </div>
              {room.electricityBill && (
                <div className={styles.paymentItem}>
                  <span>Electricity Bill</span>
                  <span>{formatCurrency(room.electricityBill)}</span>
                </div>
              )}
              {room.waterBill && (
                <div className={styles.paymentItem}>
                  <span>Water Bill</span>
                  <span>{formatCurrency(room.waterBill)}</span>
                </div>
              )}
              {room.maintenanceFee && (
                <div className={styles.paymentItem}>
                  <span>Maintenance Fee</span>
                  <span>{formatCurrency(room.maintenanceFee)}</span>
                </div>
              )}
              <div className={styles.paymentItem}>
                <span>Security Deposit</span>
                <span>{formatCurrency(room.deposit || 0)}</span>
              </div>
              <div className={styles.paymentItem}>
                <strong>Total Monthly Cost</strong>
                <strong style={{ color: "#059669", fontSize: "1.25rem" }}>
                  {formatCurrency(calculateTotalMonthlyCost())}
                </strong>
              </div>
            </div>
            <div className={styles.securityNote}>
              <Shield size={16} />
              All payments are secure and receipt will be provided
            </div>
          </section>

          {/* Tenant Information */}
          {!room.isAvailable && room.tenant && (
            <section className={styles.section}>
              <h2>
                <Users size={24} />
                Current Tenant
              </h2>
              <div className={styles.tenantInfo}>
                <div className={styles.tenantDetail}>
                  <Users size={20} />
                  <span>{room.tenant.name}</span>
                </div>
                <div className={styles.tenantDetail}>
                  <Mail size={20} />
                  <span>{room.tenant.email}</span>
                </div>
                <div className={styles.tenantDetail}>
                  <Phone size={20} />
                  <span>{room.tenant.phone}</span>
                </div>
                <div className={styles.tenantDetail}>
                  <Calendar size={20} />
                  <span>Joined: {formatDate(room.tenant.joinedDate)}</span>
                </div>
              </div>
            </section>
          )}

          {/* Action Section */}
          <section className={styles.actionSection}>
            {room.isAvailable ? (
              <div className={styles.availableActions}>
                <Link
                  href={`/payments/rent/${room._id}`}
                  className={styles.rentButton}
                >
                  <IndianRupee size={20} />
                  Rent This Room
                </Link>
                <p className={styles.helpText}>
                  Secure booking with instant confirmation. No hidden charges.
                </p>
                <div className={styles.paymentMethods}>
                  <span>Payment methods:</span>
                  <div className={styles.methodIcons}>
                    <span>💳</span>
                    <span>📱</span>
                    <span>🏦</span>
                    <span>💎</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.occupiedMessage}>
                <p>This room is currently occupied</p>
                <Link href="/rooms" className={styles.browseButton}>
                  <Home size={16} />
                  Browse Other Rooms
                </Link>
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className={styles.sidebar}>
          {/* Contact Information */}
          <div className={styles.sidebarCard}>
            <h3>
              <Phone size={20} />
              Contact Information
            </h3>
            <div className={styles.contactList}>
              <div className={styles.contactItem}>
                <Phone size={18} />
                <span>{ROOM_OWNER_PHONE}</span>
              </div>
              <div className={styles.contactItem}>
                <Mail size={18} />
                <span>owner@roomrent.com</span>
              </div>
              <div className={styles.contactItem}>
                <Clock size={18} />
                <span>9:00 AM - 8:00 PM</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
              <button
                onClick={handleCallOwner}
                className={`${styles.contactButton} ${styles.callButton}`}
              >
                <Phone size={18} />
                Call Now
              </button>
              <button
                onClick={handleWhatsAppOwner}
                className={`${styles.contactButton} ${styles.whatsappButton}`}
              >
                <MessageCircle size={18} />
                WhatsApp
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={styles.sidebarCard}>
            <h3>
              <Grid size={20} />
              Quick Actions
            </h3>
            <div className={styles.quickActions}>
              <Link
                href={`/rooms/book/${room._id}`}
                className={styles.quickAction}
              >
                <span>Schedule Visit</span>
                <Calendar size={18} />
              </Link>
              <Link
                href={`/rooms/compare/${room._id}`}
                className={styles.quickAction}
              >
                <span>Compare Rooms</span>
                <Grid size={18} />
              </Link>
              <Link href="/rooms/favorites" className={styles.quickAction}>
                <span>Save to Favorites</span>
                <Star size={18} />
              </Link>
              <Link href="/faq/rooms" className={styles.quickAction}>
                <span>FAQ & Policies</span>
                <BookOpen size={18} />
              </Link>
            </div>
          </div>

          {/* Payment History (if tenant) */}
          {!room.isAvailable && (
            <div className={styles.sidebarCard}>
              <h3>
                <Calendar size={20} />
                Payment History
              </h3>
              <div className={styles.paymentInfo}>
                <div className={styles.paymentItem}>
                  <span>Last Payment</span>
                  <span>{formatDate(room.lastPayment)}</span>
                </div>
                <div className={styles.paymentItem}>
                  <span>Next Payment</span>
                  <span>{formatDate(room.nextPayment)}</span>
                </div>
                <div className={styles.paymentItem}>
                  <span>Total Payments</span>
                  <span>{room.totalPayments || 0}</span>
                </div>
              </div>
            </div>
          )}

          {/* Location Info */}
          <div className={styles.sidebarCard}>
            <h3>
              <MapPin size={20} />
              Location
            </h3>
            <div className={styles.contactItem}>
              <MapPin size={18} />
              <span>Central Business District</span>
            </div>
            <div className={styles.quickActions}>
              <Link href="/rooms/map" className={styles.quickAction}>
                <span>View on Map</span>
                <MapPin size={18} />
              </Link>
              <Link href="/rooms/nearby" className={styles.quickAction}>
                <span>Nearby Amenities</span>
                <Home size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

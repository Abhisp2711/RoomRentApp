"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  Building,
  IndianRupee,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import styles from "./MyRoom.module.css";

interface Room {
  _id: string;
  roomNumber: string;
  monthlyRent: number;
  description?: string;
  amenities?: string[];
  photos: Array<{ url: string; public_id: string }>;
  tenant: {
    name: string;
    email: string;
    phone?: string;
    startDate: string;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function MyRoomPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMyRoom();
    }
  }, [user]);

  const fetchMyRoom = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/rooms/my-room`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const roomData = await response.json();
        setRoom(roomData);
      } else if (response.status === 404) {
        setRoom(null);
      }
    } catch (error) {
      console.error("Error fetching room:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading your room information...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className={styles.noRoom}>
        <Building size={64} />
        <h2>No Room Assigned</h2>
        <p>You haven't been assigned to a room yet.</p>
        <Link href="/rooms" className={styles.browseButton}>
          Browse Available Rooms
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Building className={styles.headerIcon} />
          <div>
            <h1 className={styles.title}>My Room</h1>
            <p className={styles.subtitle}>
              Room {room.roomNumber} - Your rental details
            </p>
          </div>
        </div>
        <Link href="/pay-rent" className={styles.payButton}>
          Pay Rent
        </Link>
      </div>

      {/* Room Details */}
      <div className={styles.content}>
        {/* Room Images */}
        {room.photos.length > 0 && (
          <div className={styles.imagesSection}>
            <h2 className={styles.sectionTitle}>Room Photos</h2>
            <div className={styles.imagesGrid}>
              {room.photos.map((photo, index) => (
                <img
                  key={index}
                  src={photo.url}
                  alt={`Room ${room.roomNumber} - ${index + 1}`}
                  className={styles.roomImage}
                />
              ))}
            </div>
          </div>
        )}

        <div className={styles.detailsGrid}>
          {/* Room Information */}
          <div className={styles.detailsCard}>
            <h2 className={styles.cardTitle}>
              <Building size={20} />
              Room Information
            </h2>
            <div className={styles.detailsList}>
              <div className={styles.detailItem}>
                <strong>Room Number:</strong>
                <span>{room.roomNumber}</span>
              </div>
              <div className={styles.detailItem}>
                <strong>Monthly Rent:</strong>
                <span className={styles.rent}>
                  <IndianRupee size={16} />
                  {room.monthlyRent}
                </span>
              </div>
              <div className={styles.detailItem}>
                <strong>Status:</strong>
                <span className={styles.status}>
                  <CheckCircle size={14} />
                  Occupied
                </span>
              </div>
            </div>
          </div>

          {/* Tenant Information */}
          <div className={styles.detailsCard}>
            <h2 className={styles.cardTitle}>
              <User size={20} />
              Your Information
            </h2>
            <div className={styles.detailsList}>
              <div className={styles.detailItem}>
                <User size={16} />
                <span>{room.tenant.name}</span>
              </div>
              <div className={styles.detailItem}>
                <Mail size={16} />
                <span>{room.tenant.email}</span>
              </div>
              {room.tenant.phone && (
                <div className={styles.detailItem}>
                  <Phone size={16} />
                  <span>{room.tenant.phone}</span>
                </div>
              )}
              <div className={styles.detailItem}>
                <Calendar size={16} />
                <span>
                  Since {new Date(room.tenant.startDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Room Description */}
        {room.description && (
          <div className={styles.descriptionCard}>
            <h2 className={styles.cardTitle}>Description</h2>
            <p className={styles.description}>{room.description}</p>
          </div>
        )}

        {/* Amenities */}
        {room.amenities && room.amenities.length > 0 && (
          <div className={styles.amenitiesCard}>
            <h2 className={styles.cardTitle}>Amenities</h2>
            <div className={styles.amenitiesGrid}>
              {room.amenities.map((amenity, index) => (
                <div key={index} className={styles.amenity}>
                  <CheckCircle size={16} />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className={styles.actionsSection}>
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
          <div className={styles.actionsGrid}>
            <Link href="/pay-rent" className={styles.actionButton}>
              <IndianRupee size={20} />
              Pay Rent
            </Link>
            <Link href="/payment-history" className={styles.actionButton}>
              <Calendar size={20} />
              Payment History
            </Link>
            <Link href="/profile" className={styles.actionButton}>
              <User size={20} />
              Update Profile
            </Link>
            <button className={styles.actionButton}>
              <Phone size={20} />
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

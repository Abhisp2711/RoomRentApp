"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import Link from "next/link";
import styles from "./RoomDetails.module.css";

interface Room {
  _id: string;
  roomNumber: string;
  monthlyRent: number;
  isAvailable: boolean;
  status: string;
  tenant: any;
  photos: Array<{ url: string; public_id: string }>;
  description?: string;
  amenities?: string[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function RoomDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

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
    } finally {
      setLoading(false);
    }
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
        <Link href="/rooms" className={styles.backButton}>
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
            }`}
          >
            {room.isAvailable ? "Available" : "Occupied"}
          </div>
          <div className={styles.rent}>
            <IndianRupee size={24} />
            {room.monthlyRent}/month
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      {room.photos.length > 0 && (
        <div className={styles.gallery}>
          <div className={styles.mainImage}>
            <img
              src={room.photos[selectedImage].url}
              alt={`Room ${room.roomNumber} - ${selectedImage + 1}`}
            />
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
                  <img src={photo.url} alt={`Thumbnail ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className={styles.content}>
        {/* Room Details */}
        <div className={styles.detailsSection}>
          <h2>Room Details</h2>
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <strong>Room Number:</strong>
              <span>{room.roomNumber}</span>
            </div>
            <div className={styles.detailItem}>
              <strong>Monthly Rent:</strong>
              <span>₹{room.monthlyRent}</span>
            </div>
            <div className={styles.detailItem}>
              <strong>Status:</strong>
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
              <h3>Description</h3>
              <p>{room.description}</p>
            </div>
          )}
        </div>

        {/* Amenities */}
        {room.amenities && room.amenities.length > 0 && (
          <div className={styles.amenitiesSection}>
            <h2>Amenities</h2>
            <div className={styles.amenitiesGrid}>
              {room.amenities.map((amenity, index) => (
                <div key={index} className={styles.amenityItem}>
                  <CheckCircle size={16} />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tenant Information */}
        {!room.isAvailable && room.tenant && (
          <div className={styles.tenantSection}>
            <h2>Current Tenant</h2>
            <div className={styles.tenantInfo}>
              <div className={styles.tenantDetail}>
                <Users size={18} />
                <span>{room.tenant.name}</span>
              </div>
              <div className={styles.tenantDetail}>
                <Mail size={18} />
                <span>{room.tenant.email}</span>
              </div>
              {room.tenant.phone && (
                <div className={styles.tenantDetail}>
                  <Phone size={18} />
                  <span>{room.tenant.phone}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className={styles.actionSection}>
          {room.isAvailable ? (
            <div className={styles.availableActions}>
              <Link
                href={`/payments/rent/${room._id}`}
                className={styles.rentButton}
              >
                Rent This Room
              </Link>
              <p className={styles.helpText}>
                Secure your room with instant online payment
              </p>
            </div>
          ) : (
            <div className={styles.occupiedMessage}>
              <p>This room is currently occupied</p>
              <Link href="/rooms" className={styles.browseButton}>
                Browse Other Rooms
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

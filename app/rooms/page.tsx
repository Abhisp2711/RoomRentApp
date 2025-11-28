"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Eye,
  IndianRupee,
  Building,
  Camera,
  CheckCircle,
  Users,
  Plus,
  Home,
  Sparkles,
  X,
  Edit,
  Trash2,
  Crown,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./Rooms.module.css";
import toast from "react-hot-toast";

interface Room {
  id: string;
  roomNumber: string;
  monthlyRent: number;
  isAvailable: boolean;
  status: string;
  tenant: any;
  photos: string[];
  description?: string;
  amenities?: string[];
  size?: string;
  floor?: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function RoomsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAvailable, setFilterAvailable] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  // Mock amenities for filter
  const allAmenities = [
    "WiFi",
    "AC",
    "Attached Bathroom",
    "Furnished",
    "Balcony",
    "Kitchen",
    "Laundry",
    "Parking",
    "Security",
    "Lift",
  ];

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms`);
      if (!response.ok) throw new Error("Failed to fetch rooms");
      const data = await response.json();
      setRooms(data);

      if (data.length > 0) {
        const prices = data.map((room: Room) => room.monthlyRent);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        setPriceRange([minPrice, maxPrice]);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/rooms/delete/${roomId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        toast.error("Failed to delete room");
        throw new Error("Failed to delete room");
      }
      toast.success("Room deleted successfully");
      setRooms(rooms.filter((room) => room.id !== roomId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting room:", error);
      toast.error("Something went wrong");
    }
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = !filterAvailable || room.isAvailable;

    const matchesPrice =
      room.monthlyRent >= priceRange[0] && room.monthlyRent <= priceRange[1];

    const matchesAmenities =
      selectedAmenities.length === 0 ||
      (room.amenities &&
        selectedAmenities.every((amenity) =>
          room.amenities!.includes(amenity)
        ));

    return matchesSearch && matchesFilter && matchesPrice && matchesAmenities;
  });

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const clearFilters = () => {
    setFilterAvailable(false);
    setSelectedAmenities([]);
    setPriceRange([0, 50000]);
    setSearchTerm("");
  };

  const activeFilterCount = [
    filterAvailable,
    selectedAmenities.length,
    priceRange[1] < 50000,
  ].filter(Boolean).length;

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading rooms...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIconContainer}>
              <Building className={styles.headerIcon} />
            </div>
            <div>
              <h1 className={styles.title}>Available Rooms</h1>
              <p className={styles.subtitle}>
                Find your perfect room and book instantly
                {user?.role === "admin" && (
                  <span className={styles.adminBadge}>Admin Mode</span>
                )}
              </p>
            </div>
          </div>

          {user?.role === "admin" && (
            <div className={styles.adminActions}>
              <Link
                href="admin/rooms"
                className={`${styles.rentButton} ${styles.addButton}`}
              >
                <Plus size={20} />
                Add New Room
              </Link>
            </div>
          )}
        </div>
      </header>

      <div className={styles.controls}>
        {/* Search and Filter Bar */}
        <div className={styles.searchBox}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search rooms by number, description, or amenities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={styles.filterButton}
          >
            <SlidersHorizontal size={16} />
            Filters
            {activeFilterCount > 0 && (
              <span className={styles.filterCount}>{activeFilterCount}</span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className={styles.filterPanel}>
            <div className={styles.filterHeader}>
              <h3 className={styles.filterTitle}>Filter Rooms</h3>
              <button onClick={clearFilters} className={styles.clearButton}>
                <X size={16} />
                Clear all
              </button>
            </div>

            <div className={styles.filterGrid}>
              {/* Availability Filter */}
              <div className={styles.filterSection}>
                <label className={styles.sectionLabel}>Availability</label>
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={filterAvailable}
                      onChange={(e) => setFilterAvailable(e.target.checked)}
                      className={styles.checkbox}
                    />
                    Show Available Only
                  </label>
                </div>
              </div>

              {/* Price Range */}
              <div className={styles.filterSection}>
                <label className={styles.sectionLabel}>
                  Price Range: ₹{priceRange[0].toLocaleString()} - ₹
                  {priceRange[1].toLocaleString()}
                </label>
                <input
                  type="range"
                  min="0"
                  max="50000"
                  step="1000"
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], parseInt(e.target.value)])
                  }
                  className={styles.priceRange}
                />
                <div className={styles.priceLabels}>
                  <span>₹0</span>
                  <span>₹50,000</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className={styles.filterSection}>
                <label className={styles.sectionLabel}>Quick Stats</label>
                <div className={styles.statsGrid}>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Total Rooms:</span>
                    <span className={styles.statValue}>{rooms.length}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Available:</span>
                    <span className={`${styles.statValue} ${styles.available}`}>
                      {rooms.filter((r) => r.isAvailable).length}
                    </span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Occupied:</span>
                    <span className={`${styles.statValue} ${styles.occupied}`}>
                      {rooms.filter((r) => !r.isAvailable).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities Filter */}
            <div className={styles.filterSection}>
              <label className={styles.sectionLabel}>Amenities</label>
              <div className={styles.amenitiesGrid}>
                {allAmenities.map((amenity) => (
                  <button
                    key={amenity}
                    onClick={() => toggleAmenity(amenity)}
                    className={`${styles.amenityChip} ${
                      selectedAmenities.includes(amenity) ? styles.selected : ""
                    }`}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className={styles.resultsHeader}>
        <div>
          <h2 className={styles.resultsTitle}>
            {filteredRooms.length} Room{filteredRooms.length !== 1 ? "s" : ""}{" "}
            Found
          </h2>
          <p className={styles.resultsSubtitle}>
            {filterAvailable && "Showing available rooms only"}
            {selectedAmenities.length > 0 &&
              ` with ${selectedAmenities.length} amenity filter${
                selectedAmenities.length > 1 ? "s" : ""
              }`}
          </p>
        </div>

        {selectedAmenities.length > 0 && (
          <div className={styles.activeFilters}>
            <span className={styles.activeFilterLabel}>Active filters:</span>
            {selectedAmenities.map((amenity) => (
              <span key={amenity} className={styles.activeFilterChip}>
                {amenity}
                <button
                  onClick={() => toggleAmenity(amenity)}
                  className={styles.removeFilter}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Rooms Grid */}
      {filteredRooms.length === 0 ? (
        <div className={styles.emptyState}>
          <Home className={styles.emptyIcon} />
          <h3>No rooms found</h3>
          <p>Try adjusting your search criteria or filters</p>
          <button onClick={clearFilters} className={styles.rentButton}>
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className={styles.roomsGrid}>
          {filteredRooms.map((room, index) => (
            <div
              key={room.id}
              className={styles.roomCard}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Room Images */}
              <div className={styles.roomImageContainer}>
                {room.photos && room.photos.length > 0 ? (
                  <img
                    src={room.photos[0]}
                    alt={`Room ${room.roomNumber}`}
                    className={styles.roomImage}
                  />
                ) : (
                  <div className={styles.imageFallback}>
                    <Camera size={32} className={styles.emptyIcon} />
                  </div>
                )}

                <div className={styles.imageCount}>
                  <Camera size={12} />
                  {room.photos?.length || 0}
                </div>

                <div
                  className={`${styles.statusBadge} ${
                    room.isAvailable
                      ? styles.statusAvailable
                      : styles.statusOccupied
                  }`}
                >
                  {room.isAvailable ? "Available" : "Occupied"}
                </div>

                {room.monthlyRent > 20000 && (
                  <div className={styles.premiumBadge}>
                    <Sparkles size={12} />
                    Premium
                  </div>
                )}
              </div>

              <div className={styles.roomContent}>
                {/* Room Header */}
                <div className={styles.roomHeader}>
                  <div className={styles.roomInfo}>
                    <h3 className={styles.roomNumber}>
                      Room {room.roomNumber}
                    </h3>
                    {room.floor && (
                      <p className={styles.roomFloor}>Floor {room.floor}</p>
                    )}
                  </div>
                  <div className={styles.roomRent}>
                    <IndianRupee size={20} />
                    {room.monthlyRent.toLocaleString()}
                    <span className={styles.rentPeriod}>/month</span>
                  </div>
                </div>

                {/* Description */}
                {room.description && (
                  <p className={styles.roomDescription}>{room.description}</p>
                )}

                {/* Amenities */}
                {room.amenities && room.amenities.length > 0 && (
                  <div className={styles.amenities}>
                    {room.amenities.slice(0, 4).map((amenity, index) => (
                      <span key={index} className={styles.amenity}>
                        <CheckCircle size={12} />
                        {amenity}
                      </span>
                    ))}
                    {room.amenities.length > 4 && (
                      <span className={styles.amenityMore}>
                        +{room.amenities.length - 4} more
                      </span>
                    )}
                  </div>
                )}

                {/* Tenant Info */}
                {!room.isAvailable && room.tenant && (
                  <div className={styles.tenantInfo}>
                    <Users size={14} />
                    <span>
                      Occupied by <strong>{room.tenant.name}</strong>
                    </span>
                  </div>
                )}

                {/* Room Actions */}
                <div className={styles.roomActions}>
                  <Link
                    href={`/rooms/${room.id}`}
                    className={styles.detailsButton}
                  >
                    <Eye size={16} />
                    View Details
                  </Link>

                  {room.isAvailable ? (
                    <Link
                      href={`/payments/rent/${room.id}`}
                      className={styles.rentButton}
                    >
                      Rent Now
                    </Link>
                  ) : user?.role === "admin" ? (
                    <div className={styles.adminActions}>
                      <Link
                        href={`/rooms/edit/${room.id}`}
                        className={styles.editButton}
                        title="Edit Room"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => setDeleteConfirm(room.id)}
                        className={styles.deleteButton}
                        title="Delete Room"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : null}
                </div>

                {/* Delete Confirmation */}
                {deleteConfirm === room.id && (
                  <div className={styles.deleteConfirmation}>
                    <p>Are you sure you want to delete this room?</p>
                    <div>
                      <button onClick={() => handleDeleteRoom(room.id)}>
                        Yes, Delete
                      </button>
                      <button onClick={() => setDeleteConfirm(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

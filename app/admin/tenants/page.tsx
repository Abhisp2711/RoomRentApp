"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  Building,
  User,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import styles from "./AdminTenants.module.css";

interface Tenant {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  roomId: string;
  roomNumber?: string;
  startDate: string;
  endDate?: string;
  status: "active" | "inactive";
}

interface Room {
  _id: string;
  roomNumber: string;
  isAvailable: boolean;
  tenant?: any;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminTenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchTenants();
    fetchRooms();
  }, []);

  const fetchTenants = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/rooms`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch tenants data");

      const roomsData = await response.json();

      // Extract tenants from rooms
      const tenantsData: Tenant[] = [];
      roomsData.forEach((room: Room) => {
        if (room.tenant) {
          tenantsData.push({
            _id: room.tenant._id || `tenant-${room._id}`,
            name: room.tenant.name || "Unknown Tenant",
            email: room.tenant.email || "",
            phone: room.tenant.phone,
            roomId: room._id,
            roomNumber: room.roomNumber,
            startDate: room.tenant.startDate || new Date().toISOString(),
            status: "active",
          });
        }
      });

      setTenants(tenantsData);
    } catch (error) {
      toast.error("Error fetching tenants");
      console.error("Tenants fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/rooms`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch rooms");
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const handleRemoveTenant = async (tenantId: string, roomId: string) => {
    if (!confirm("Are you sure you want to remove this tenant from the room?"))
      return;

    try {
      const token = localStorage.getItem("token");
      // Note: You might need to create an API endpoint to remove tenants
      // For now, we'll just update the local state
      setTenants((prev) => prev.filter((tenant) => tenant._id !== tenantId));
      toast.success("Tenant removed successfully");
    } catch (error) {
      toast.error("Error removing tenant");
      console.error("Remove tenant error:", error);
    }
  };

  const filteredTenants = tenants.filter((tenant) => {
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch =
      (tenant.name?.toLowerCase() || "").includes(searchLower) ||
      (tenant.email?.toLowerCase() || "").includes(searchLower) ||
      (tenant.roomNumber?.toLowerCase() || "").includes(searchLower);

    const matchesFilter =
      filterStatus === "all" || tenant.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const activeTenants = tenants.filter((t) => t.status === "active").length;
  const availableRooms = rooms.filter((r) => r.isAvailable).length;

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading tenants...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Tenant Management</h1>
          <p className={styles.subtitle}>
            Manage all tenants and their room assignments
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <div className={styles.statValue}>{tenants.length}</div>
          <div className={styles.statLabel}>Total Tenants</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>{activeTenants}</div>
          <div className={styles.statLabel}>Active Tenants</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>{availableRooms}</div>
          <div className={styles.statLabel}>Available Rooms</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>{rooms.length}</div>
          <div className={styles.statLabel}>Total Rooms</div>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by name, email, or room..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Tenants Grid */}
      <div className={styles.tenantsGrid}>
        {filteredTenants.length === 0 ? (
          <div className={styles.empty}>
            <User size={48} />
            <h3>No tenants found</h3>
            <p>
              {tenants.length === 0
                ? "No tenants have been assigned to rooms yet"
                : "Try adjusting your search criteria"}
            </p>
          </div>
        ) : (
          filteredTenants.map((tenant) => (
            <div key={tenant._id} className={styles.tenantCard}>
              <div className={styles.tenantHeader}>
                <div className={styles.tenantAvatar}>
                  {tenant.name?.charAt(0).toUpperCase()}
                </div>
                <div className={styles.tenantInfo}>
                  <h3 className={styles.tenantName}>{tenant.name}</h3>
                  <span className={`${styles.status} ${styles.active}`}>
                    Active
                  </span>
                </div>
                <div className={styles.tenantActions}>
                  <button className={styles.actionButton}>
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              <div className={styles.tenantDetails}>
                <div className={styles.detailItem}>
                  <Mail size={16} />
                  <span>{tenant.email}</span>
                </div>
                {tenant.phone && (
                  <div className={styles.detailItem}>
                    <Phone size={16} />
                    <span>{tenant.phone}</span>
                  </div>
                )}
                <div className={styles.detailItem}>
                  <Building size={16} />
                  <span>Room {tenant.roomNumber}</span>
                </div>
                <div className={styles.detailItem}>
                  <Calendar size={16} />
                  <span>
                    Since {new Date(tenant.startDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className={styles.cardActions}>
                <button className={styles.editButton}>
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleRemoveTenant(tenant._id, tenant.roomId)}
                  className={styles.removeButton}
                >
                  <Trash2 size={16} />
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

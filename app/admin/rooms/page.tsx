"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./AdminRooms.module.css";
import toast from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface Room {
  id: string;
  roomNumber: string;
  monthlyRent: number;
  isAvailable: boolean;
  photos: Array<{ url: string }>;
  tenant?: {
    name: string;
    email: string;
    startDate: string;
  };
}

interface CreateRoomForm {
  roomNumber: string;
  monthlyRent: string;
  photos: File[];
}

interface AssignTenantForm {
  userId: string;
  name: string;
  email: string;
  startDate: string;
}

export default function RoomManagement() {
  const [activeTab, setActiveTab] = useState<"rooms" | "create" | "assign">(
    "rooms"
  );
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string>("");

  const [createForm, setCreateForm] = useState<CreateRoomForm>({
    roomNumber: "",
    monthlyRent: "",
    photos: [],
  });

  const [assignForm, setAssignForm] = useState<AssignTenantForm>({
    userId: "",
    name: "",
    email: "",
    startDate: "",
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/rooms`);

      if (!response.ok) {
        throw new Error(`Failed to fetch rooms: ${response.status}`);
      }

      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast("Failed to fetch rooms");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("roomNumber", createForm.roomNumber);
      formData.append("monthlyRent", createForm.monthlyRent);

      createForm.photos.forEach((photo) => {
        formData.append("photos", photo);
      });

      const response = await fetch(`${API_BASE_URL}/rooms/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to create room: ${response.status}`);
      }

      const data = await response.json();

      toast("Room created successfully!");
      setCreateForm({ roomNumber: "", monthlyRent: "", photos: [] });
      fetchRooms();
      setActiveTab("rooms");
    } catch (error) {
      console.error("Error creating room:", error);
      toast("Failed to create room");
    } finally {
      setSaving(false);
    }
  };

  const handleAssignTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) {
      toast("Please select a room");
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/rooms/assign/${selectedRoom}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(assignForm),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to assign tenant: ${response.status}`);
      }

      const data = await response.json();

      toast("Tenant assigned successfully!");
      setAssignForm({ userId: "", name: "", email: "", startDate: "" });
      setSelectedRoom("");
      fetchRooms();
      setActiveTab("rooms");
    } catch (error) {
      console.error("Error assigning tenant:", error);
      toast("Failed to assign tenant");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm("Are you sure you want to delete this room?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/rooms/delete/${roomId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete room: ${response.status}`);
      }

      const data = await response.json();

      toast("Room deleted successfully!");
      fetchRooms();
    } catch (error) {
      console.error("Error deleting room:", error);
      toast("Failed to delete room");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setCreateForm((prev) => ({
        ...prev,
        photos: Array.from(e.target.files!),
      }));
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Room Management</h1>
          <p className={styles.subtitle}>
            Manage rooms, assign tenants, and track availability
          </p>
        </div>
        <button
          className={`${styles.saveButton} ${saving ? styles.saving : ""}`}
          disabled={saving}
          onClick={() => {
            if (activeTab === "create") {
              const form = document.getElementById(
                "create-room-form"
              ) as HTMLFormElement;
              form?.requestSubmit();
            } else if (activeTab === "assign") {
              const form = document.getElementById(
                "assign-tenant-form"
              ) as HTMLFormElement;
              form?.requestSubmit();
            }
          }}
        >
          {saving ? (
            <>
              <div className={styles.spinner}></div>
              Saving...
            </>
          ) : (
            <>
              <i className="fas fa-save"></i>
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Settings Layout */}
      <div className={styles.settingsLayout}>
        {/* Sidebar */}
        <div className={styles.sidebar}>
          <button
            className={`${styles.tabButton} ${
              activeTab === "rooms" ? styles.tabButtonActive : ""
            }`}
            onClick={() => setActiveTab("rooms")}
          >
            <i className="fas fa-door-open"></i>
            All Rooms
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === "create" ? styles.tabButtonActive : ""
            }`}
            onClick={() => setActiveTab("create")}
          >
            <i className="fas fa-plus-circle"></i>
            Create Room
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === "assign" ? styles.tabButtonActive : ""
            }`}
            onClick={() => setActiveTab("assign")}
          >
            <i className="fas fa-user-plus"></i>
            Assign Tenant
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* All Rooms */}
          {activeTab === "rooms" && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>All Rooms</h2>

              {loading ? (
                <div className={styles.loading}>Loading rooms...</div>
              ) : (
                <div className={styles.roomsGrid}>
                  {rooms.map((room) => (
                    <div key={room.id} className={styles.roomCard}>
                      <div className={styles.roomHeader}>
                        <h3>Room {room.roomNumber}</h3>
                        <span
                          className={`${styles.status} ${
                            room.isAvailable
                              ? styles.available
                              : styles.occupied
                          }`}
                        >
                          {room.isAvailable ? "Available" : "Occupied"}
                        </span>
                      </div>

                      <div className={styles.roomDetails}>
                        <p>Monthly Rent: ${room.monthlyRent}</p>

                        {room.tenant && (
                          <div className={styles.tenantInfo}>
                            <p>Tenant: {room.tenant.name}</p>
                            <p>Email: {room.tenant.email}</p>
                            <p>
                              Since:{" "}
                              {new Date(
                                room.tenant.startDate
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className={styles.roomActions}>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDeleteRoom(room.id)}
                        >
                          <i className="fas fa-trash"></i>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Create Room */}
          {activeTab === "create" && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Create New Room</h2>

              <form
                id="create-room-form"
                onSubmit={handleCreateRoom}
                className={styles.settingsGrid}
              >
                <div className={styles.settingGroup}>
                  <label className={styles.label}>Room Number</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={createForm.roomNumber}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        roomNumber: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className={styles.settingGroup}>
                  <label className={styles.label}>Monthly Rent ($)</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={createForm.monthlyRent}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        monthlyRent: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className={styles.settingGroup}>
                  <label className={styles.label}>Room Photos</label>
                  <input
                    type="file"
                    className={styles.input}
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <p className={styles.helpText}>
                    You can select multiple photos
                  </p>
                </div>
              </form>
            </div>
          )}

          {/* Assign Tenant */}
          {activeTab === "assign" && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Assign Tenant to Room</h2>

              <form
                id="assign-tenant-form"
                onSubmit={handleAssignTenant}
                className={styles.settingsGrid}
              >
                <div className={styles.settingGroup}>
                  <label className={styles.label}>Select Room</label>
                  <select
                    className={styles.input}
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    required
                  >
                    <option value="">Choose a room</option>

                    {rooms
                      .filter((room) => room.isAvailable)
                      .map((room) => (
                        <option key={room.id} value={room.id}>
                          Room {room.roomNumber} - ${room.monthlyRent}/month
                        </option>
                      ))}
                  </select>
                </div>

                <div className={styles.settingGroup}>
                  <label className={styles.label}>User ID</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={assignForm.userId}
                    onChange={(e) =>
                      setAssignForm((prev) => ({
                        ...prev,
                        userId: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className={styles.settingGroup}>
                  <label className={styles.label}>Tenant Name</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={assignForm.name}
                    onChange={(e) =>
                      setAssignForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className={styles.settingGroup}>
                  <label className={styles.label}>Email</label>
                  <input
                    type="email"
                    className={styles.input}
                    value={assignForm.email}
                    onChange={(e) =>
                      setAssignForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className={styles.settingGroup}>
                  <label className={styles.label}>Start Date</label>
                  <input
                    type="date"
                    className={styles.input}
                    value={assignForm.startDate}
                    onChange={(e) =>
                      setAssignForm((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

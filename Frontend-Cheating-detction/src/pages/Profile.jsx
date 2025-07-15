// src/pages/ProfilePage.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "./Profile.css";
// Assuming your dashboard layout styles are here

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    role: "",
    profileImage: "",
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      setProfileData({
        name: storedUser.name,
        email: storedUser.email,
        role: storedUser.role,
        profileImage: storedUser.profileImage || "",
      });
    }
  }, []);

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfileData({ ...profileData, profileImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const updatedUser = { ...user, ...profileData };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setEditing(false);
    alert("Profile updated successfully!");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/"; // Redirect to login
  };

  if (!user) return <div className="profile-container">Loading...</div>;

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <div className="content-wrapper">
          <div className="profile-container">
            <div className="profile-card">
              <h2>{user.role === "admin" ? "Admin Profile" : "Student Profile"}</h2>

              <div className="profile-image">
                <img
                  src={
                    profileData.profileImage ||
                    "https://via.placeholder.com/100?text=Photo"
                  }
                  alt="Profile"
                />
                {editing && <input type="file" onChange={handleImageUpload} />}
              </div>

              <div className="profile-detail">
                <strong>Name:</strong>
                {editing ? (
                  <input
                    name="name"
                    value={profileData.name}
                    onChange={handleChange}
                  />
                ) : (
                  <span>{user.name}</span>
                )}
              </div>

              <div className="profile-detail">
                <strong>Email:</strong>
                {editing ? (
                  <input
                    name="email"
                    value={profileData.email}
                    onChange={handleChange}
                  />
                ) : (
                  <span>{user.email}</span>
                )}
              </div>

              <div className="profile-detail">
                <strong>Role:</strong>{" "}
                <span style={{ textTransform: "capitalize" }}>{user.role}</span>
              </div>

              <div className="profile-buttons">
                {editing ? (
                  <button className="save-btn" onClick={handleSave}>
                    Save
                  </button>
                ) : (
                  <button className="edit-btn" onClick={() => setEditing(true)}>
                    Edit Profile
                  </button>
                )}

                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

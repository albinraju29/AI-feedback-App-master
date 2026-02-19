import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { signUp } from "../services/api";

const SignUp = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signUp(form);
      toast.success("Account created! Please login");
      navigate("/signin");
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div style={outerContainer}>
      <div style={cardContainer}>
        {/* LEFT SIDE */}
        <div style={leftSide}>
          <h2 style={{ marginBottom: "10px" }}>Sign up</h2>
          <p style={subText}>
            Create your account to start using the AI feedback system.
          </p>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              required
              style={inputStyle}
            />

            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              required
              style={inputStyle}
            />

            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              required
              style={inputStyle}
            />

            <button type="submit" style={buttonStyle}>
              Continue →
            </button>
          </form>

          <p style={loginText}>
            Already have an account?{" "}
            <Link to="/signin" style={loginLink}>
              Sign in
            </Link>
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div style={rightSide}>
          <div style={blobOne}></div>
          <div style={blobTwo}></div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;

/* ================= STYLES ================= */

const outerContainer = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#ffffff",
};

const cardContainer = {
  width: "900px",
  height: "500px",
  display: "flex",
  borderRadius: "16px",
  overflow: "hidden",
  boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
  background: "#fff",
};

const leftSide = {
  flex: 1,
  padding: "60px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

const rightSide = {
  flex: 1,
  position: "relative",
  background: "linear-gradient(135deg, #8e2de2, #4a00e0)",
  overflow: "hidden",
};

const subText = {
  fontSize: "14px",
  color: "#777",
  marginBottom: "30px",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "15px",
  borderRadius: "8px",
  border: "1px solid #ddd",
  outline: "none",
  fontSize: "14px",
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  border: "none",
  background: "linear-gradient(90deg, #6C63FF, #4A00E0)",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "0.3s",
};

const loginText = {
  marginTop: "20px",
  fontSize: "14px",
};

const loginLink = {
  color: "#6C63FF",
  fontWeight: "bold",
  textDecoration: "none",
};

const blobOne = {
  position: "absolute",
  width: "300px",
  height: "300px",
  background: "rgba(255,255,255,0.15)",
  borderRadius: "50%",
  top: "20%",
  left: "20%",
  animation: "float1 6s ease-in-out infinite",
};

const blobTwo = {
  position: "absolute",
  width: "200px",
  height: "200px",
  background: "rgba(255,255,255,0.1)",
  borderRadius: "50%",
  bottom: "15%",
  right: "15%",
  animation: "float2 8s ease-in-out infinite",
};







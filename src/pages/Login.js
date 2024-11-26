import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        login(data.user, data.token);
        navigate(
          data.user.role === "admin" ? "/admin-dashboard" : "/user-dashboard"
        );
      } else {
        setError(data.message);
      }
    } catch {
      setError("Login failed");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">
      {/* Background Container for Animation */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Stars */}
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full opacity-40"
            style={{
              width: `${Math.random() * 2 + 1}px`, // Random size for stars
              height: `${Math.random() * 2 + 1}px`, // Random size for stars
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          ></div>
        ))}

        {/* Asteroids */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-gray-700 rounded-full opacity-70 animate-fly-asteroid"
            style={{
              width: `${Math.random() * 40 + 20}px`, // Random size for asteroids
              height: `${Math.random() * 40 + 20}px`, // Random size for asteroids
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: "15s", // Fixed duration for smooth movement
              animationDelay: `${Math.random() * 1}s`, // Random delay for variation
            }}
          ></div>
        ))}
      </div>

      {/* Login Form */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md bg-white p-8 rounded-lg shadow-md text-center"
      >
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button
          type="submit"
          className="w-full py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
        >
          Login
        </button>
        <h3 className="mt-4 text-gray-600">
          New Registration?{" "}
          <a href="/register" className="text-blue-500 hover:underline">
            Register
          </a>
        </h3>
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
      </form>
    </div>
  );
}

export default Login;

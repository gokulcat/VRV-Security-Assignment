import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuthClient } from "../services/neonAuth";
import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    requestedRole: "user",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSubmitting(true);

    try {
      const signUpResult = await getAuthClient().signUp.email({
        email: formData.email,
        password: formData.password,
        name: formData.username,
      });
      if (signUpResult.error) {
        throw new Error(signUpResult.error.message || "Registration failed");
      }

      const sessionResult = await getAuthClient().getSession();
      if (sessionResult.data?.user) {
        const roleRequest = await apiRequest("/api/auth/me/role-request", {
          method: "PATCH",
          body: JSON.stringify({ requestedRole: formData.requestedRole }),
        });
        login(roleRequest.user);
        navigate(
          roleRequest.user.role === "admin"
            ? "/admin-dashboard"
            : "/user-dashboard",
          { replace: true }
        );
        return;
      }

      if (formData.requestedRole === "admin") {
        window.localStorage.setItem(
          "pendingRoleRequest",
          JSON.stringify({
            email: formData.email.trim().toLowerCase(),
            requestedRole: "admin",
          })
        );
      }
      setSuccess(true);
      setTimeout(() => navigate("/login", { replace: true }), 1500);
    } catch (requestError) {
      setError(requestError.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-black overflow-hidden">
      {/* Space-like Background with Flying Asteroids */}
      <div className="absolute inset-0 z-0 overflow-hidden">
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
      </div>

      {/* Registration Form */}
      <div className="relative z-10 w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Role-Based Registration
        </h2>
        {success ? (
          <p className="text-green-600 text-center">
            Registration successful! Redirecting to login...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="sr-only" htmlFor="register-username">Username</label>
              <input
                id="register-username"
                type="text"
                name="username"
                placeholder="Username"
                autoComplete="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="sr-only" htmlFor="register-email">Email</label>
              <input
                id="register-email"
                type="email"
                name="email"
                placeholder="Email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="sr-only" htmlFor="register-password">Password (8 to 72 characters)</label>
              <input
                id="register-password"
                type="password"
                name="password"
                placeholder="Password (8 to 72 characters)"
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-left text-sm font-medium text-gray-700" htmlFor="register-role">
                Enroll as
              </label>
              <select
                id="register-role"
                name="requestedRole"
                value={formData.requestedRole}
                onChange={handleChange}
                className="w-full rounded border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="user">User</option>
                <option value="admin">Admin (requires approval)</option>
              </select>
              {formData.requestedRole === "admin" && (
                <p className="mt-1 text-left text-sm text-gray-600">
                  Your account will remain a user until an administrator approves the request.
                </p>
              )}
            </div>
            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
              >
                {submitting ? "Creating account..." : "Register"}
              </button>
              <h3 className="mt-4 text-gray-600 text-center">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-blue-500 hover:underline transition duration-200"
                >
                  Login
                </Link>
              </h3>
            </div>
            {error && <p role="alert" className="text-red-500 text-sm mt-4">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}

export default Register;

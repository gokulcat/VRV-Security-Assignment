import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "user", // Default role is 'user'
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 1000); // Redirect to login after 1 second
      } else {
        setError(data.message || "Registration failed");
      }
    } catch {
      setError("An error occurred. Please try again later.");
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
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <button
                type="submit"
                className="w-full py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
              >
                Register
              </button>
              <h3 className="mt-4 text-gray-600 text-center">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="text-blue-500 hover:underline transition duration-200"
                >
                  Login
                </a>
              </h3>
            </div>
            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}

export default Register;

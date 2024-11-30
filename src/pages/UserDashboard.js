import React from 'react';
import { useAuth } from '../context/AuthContext';

function UserDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-black overflow-hidden">
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

      {/* User Dashboard Content */}
      <div className="relative z-10 w-full max-w-lg bg-white p-6 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">User Dashboard</h1>
        <p className="text-gray-600 text-lg mb-6">
          Welcome, <span className="font-semibold text-gray-900">{user?.username}</span>! <br />
          You can access user-specific content here.
        </p>
        <button
          onClick={logout}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
export default UserDashboard;

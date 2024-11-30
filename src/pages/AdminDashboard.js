import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function AdminDashboard() {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'user' });

  useEffect(() => {
    // Fetch users from the backend
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/users`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setUsers(data);
        } else {
          setError(data.message || 'Failed to fetch users');
        }
      } catch {
        setError('An error occurred while fetching users');
      }
    };

    fetchUsers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/add-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
      if (response.ok) {
        console.log('User added successfully:', data); // Debug success
        setUsers([...users, data.user]);
        setFormData({ username: '', email: '', password: '', role: 'user' });
      } else {
        console.error('Error response from backend:', data); // Log error response
        setError(data.message || 'Failed to add user');
      }
    } catch (err) {
      console.error('Network error:', err); // Log network errors
      setError('An error occurred while adding the user');
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/delete-user/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        setUsers(users.filter((u) => u._id !== id)); // Remove the user from the list
      } else {
        setError('Failed to delete user');
      }
    } catch {
      setError('An error occurred while deleting the user');
    }
  };

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

      {/* Admin Dashboard Content */}
      <div className="relative z-10 w-full max-w-3xl bg-white p-6 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
        <p className="text-gray-600 text-lg mb-6">
          Welcome, <span className="font-semibold text-gray-900">{user?.username}</span>! <br />
          You have administrative privileges.
        </p>
        <button
          onClick={logout}
          className="px-6 py-2 mb-6 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
        >
          Logout
        </button>

        {/* Add User Form */}
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Add New User</h2>
        <form onSubmit={handleAddUser} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            name="role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            required
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            className="w-full py-3 bg-green-500 text-white rounded hover:bg-green-600 transition duration-200"
          >
            Add User
          </button>
        </form>

        {/* User List */}
        <h2 className="text-2xl font-semibold text-gray-700 mt-8 mb-4">Registered Users</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 border-b">Username</th>
                <th className="px-6 py-3 border-b">Email</th>
                <th className="px-6 py-3 border-b">Role</th>
                <th className="px-6 py-3 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="px-6 py-4 border-b text-gray-800">{u.username}</td>
                  <td className="px-6 py-4 border-b text-gray-600">{u.email}</td>
                  <td className="px-6 py-4 border-b text-gray-600">{u.role}</td>
                  <td className="px-6 py-4 border-b text-gray-600">
                    <button
                      onClick={() => handleDeleteUser(u._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-200"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
export default AdminDashboard;

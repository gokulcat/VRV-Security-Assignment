import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiRequest, checkNeonFunction } from "../services/api";

function AdminDashboard() {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkingFunction, setCheckingFunction] = useState(false);
  const [functionStatus, setFunctionStatus] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest("/api/auth/users");
      setUsers(data);
    } catch (requestError) {
      if (requestError.status === 401) {
        await logout();
      } else {
        setError(requestError.message || "Failed to fetch users");
      }
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const updateUser = async (id, path, body, successMessage) => {
    setError("");
    setNotice("");
    try {
      const result = await apiRequest(`/api/auth/users/${encodeURIComponent(id)}/${path}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      setUsers((currentUsers) =>
        currentUsers.map((item) => (item.id === id ? result.user : item))
      );
      setNotice(successMessage);
    } catch (requestError) {
      if (requestError.status === 401) {
        await logout();
      } else {
        setError(requestError.message || "Failed to update user");
      }
    }
  };

  const handleFunctionCheck = async () => {
    setCheckingFunction(true);
    setError("");
    setFunctionStatus("");
    try {
      const result = await checkNeonFunction();
      setFunctionStatus(
        result.ok
          ? "Neon Function and PostgreSQL connection are healthy."
          : "Neon Function returned an unhealthy status."
      );
    } catch (requestError) {
      setError(requestError.message || "Neon Function health check failed");
    } finally {
      setCheckingFunction(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (logoutError) {
      setError(logoutError.message || "Could not sign out");
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10">
      <section className="mx-auto w-full max-w-5xl rounded-lg bg-white p-6 shadow-lg sm:p-8">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Signed in as <span className="font-semibold">{user?.username}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
          >
            Logout
          </button>
        </header>

        <section aria-labelledby="neon-status-heading" className="mb-8 rounded border p-4">
          <h2 id="neon-status-heading" className="text-xl font-semibold text-gray-700">
            Neon services
          </h2>
          <p className="mt-1 text-gray-600">
            Authentication uses Neon Auth; application roles and user profiles use Neon PostgreSQL.
          </p>
          <button
            type="button"
            onClick={handleFunctionCheck}
            disabled={checkingFunction}
            className="mt-3 rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {checkingFunction ? "Checking..." : "Check Neon Function"}
          </button>
          {functionStatus && <p role="status" className="mt-3 text-green-700">{functionStatus}</p>}
        </section>

        <section aria-labelledby="user-list-heading">
          <h2 id="user-list-heading" className="mb-4 text-2xl font-semibold text-gray-700">
            Registered users
          </h2>
          <p className="mb-4 text-gray-600">
            Users create their own Neon Auth accounts. Admin enrollment requests stay pending until approved here.
          </p>
          {error && <p role="alert" className="mb-4 text-red-600">{error}</p>}
          {notice && <p role="status" className="mb-4 text-green-700">{notice}</p>}
          {loading ? (
            <p role="status" className="text-gray-600">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="text-gray-600">No users have signed in yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="border-b px-4 py-3">Username</th>
                    <th scope="col" className="border-b px-4 py-3">Email</th>
                    <th scope="col" className="border-b px-4 py-3">Role</th>
                    <th scope="col" className="border-b px-4 py-3">Role request</th>
                    <th scope="col" className="border-b px-4 py-3">Access</th>
                    <th scope="col" className="border-b px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((item) => {
                    const isCurrentUser = item.id === user?.id;
                    return (
                      <tr key={item.id}>
                        <td className="border-b px-4 py-3">{item.username}</td>
                        <td className="border-b px-4 py-3">{item.email}</td>
                        <td className="border-b px-4 py-3">
                          <label className="sr-only" htmlFor={`role-${item.id}`}>
                            Role for {item.username}
                          </label>
                          <select
                            id={`role-${item.id}`}
                            value={item.role}
                            disabled={isCurrentUser || !item.is_active}
                            onChange={(event) =>
                              updateUser(
                                item.id,
                                "role",
                                { role: event.target.value },
                                `Updated ${item.username}'s role.`
                              )
                            }
                            className="rounded border border-gray-300 p-2 disabled:opacity-60"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="border-b px-4 py-3">
                          {item.requested_role === "admin" && item.role !== "admin" ? (
                            <div className="flex flex-wrap gap-2">
                              <span className="w-full text-amber-700">Admin approval pending</span>
                              <button
                                type="button"
                                disabled={!item.is_active}
                                onClick={() =>
                                  updateUser(
                                    item.id,
                                    "role",
                                    { role: "admin" },
                                    `Approved ${item.username} as an administrator.`
                                  )
                                }
                                className="rounded bg-green-600 px-3 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  updateUser(
                                    item.id,
                                    "role",
                                    { role: "user" },
                                    `Declined ${item.username}'s administrator request.`
                                  )
                                }
                                className="rounded bg-gray-600 px-3 py-2 text-white hover:bg-gray-700"
                              >
                                Decline
                              </button>
                            </div>
                          ) : item.role === "admin" ? (
                            "Approved"
                          ) : (
                            "None"
                          )}
                        </td>
                        <td className="border-b px-4 py-3">
                          {item.is_active ? "Active" : "Disabled"}
                        </td>
                        <td className="border-b px-4 py-3">
                          <button
                            type="button"
                            disabled={isCurrentUser}
                            onClick={() =>
                              updateUser(
                                item.id,
                                "active",
                                { isActive: !item.is_active },
                                `${item.username}'s access was ${item.is_active ? "disabled" : "enabled"}.`
                              )
                            }
                            aria-label={`${item.is_active ? "Disable" : "Enable"} ${item.username}`}
                            className="rounded bg-amber-600 px-3 py-2 text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {item.is_active ? "Disable" : "Enable"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default AdminDashboard;

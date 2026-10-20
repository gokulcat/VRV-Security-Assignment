import { render, screen } from "@testing-library/react";
import AdminDashboard from "./AdminDashboard";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../services/api";

jest.mock("../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../services/api", () => ({
  apiRequest: jest.fn(),
}));

const registeredUsers = [
  {
    id: "user-1",
    username: "Alice",
    email: "alice@example.com",
    role: "user",
    is_active: true,
  },
];

beforeEach(() => {
  apiRequest.mockResolvedValue(registeredUsers);
  useAuth.mockReturnValue({
    user: { id: "admin-1", username: "Admin", role: "user" },
    logout: jest.fn(),
  });
});

test("users see the registered-users dashboard without role editing controls", async () => {
  render(<AdminDashboard />);

  expect(await screen.findByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
  expect(await screen.findByText("alice@example.com")).toBeInTheDocument();
  expect(screen.getByText("You can view registered users. Your access is read-only."))
    .toBeInTheDocument();
  expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
});

test("admins can edit roles in the same dashboard", async () => {
  useAuth.mockReturnValue({
    user: { id: "admin-1", username: "Admin", role: "admin" },
    logout: jest.fn(),
  });

  render(<AdminDashboard />);

  expect(await screen.findByRole("combobox", { name: "Role for Alice" }))
    .toHaveValue("user");
});

import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./services/neonAuth', () => ({
  getAuthClient: () => ({
    getSession: () => new Promise(() => {}),
  }),
}));

jest.mock('./services/api', () => ({
  apiRequest: jest.fn(),
  checkNeonFunction: jest.fn(),
}));

test('shows registration for the root route', () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: /role-based registration/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/enroll as/i)).toHaveValue('user');
  expect(screen.getByRole('option', { name: 'User' })).toBeInTheDocument();
  expect(screen.getByRole('option', { name: 'Admin' })).toBeInTheDocument();
});

test('uses a single login page for admins and users', () => {
  render(<App />);

  fireEvent.click(screen.getByRole('link', { name: /^login$/i }));

  expect(screen.getByRole('heading', { name: /^login$/i })).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /admin login/i })).not.toBeInTheDocument();
});

test('lets registrants choose the admin role without an approval step', () => {
  window.history.replaceState({}, '', '/register');
  render(<App />);

  fireEvent.change(screen.getByLabelText(/enroll as/i), { target: { value: 'admin' } });

  expect(screen.getByLabelText(/enroll as/i)).toHaveValue('admin');
  expect(screen.queryByText(/requires approval/i)).not.toBeInTheDocument();
});

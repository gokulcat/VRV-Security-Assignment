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
});

test('provides an admin login route from the login page', () => {
  render(<App />);

  fireEvent.click(screen.getByRole('link', { name: /^login$/i }));
  fireEvent.click(screen.getByRole('link', { name: /admin login/i }));

  expect(screen.getByRole('heading', { name: /admin login/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /regular user login/i })).toBeInTheDocument();
});

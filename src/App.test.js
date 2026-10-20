import { render, screen } from '@testing-library/react';
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

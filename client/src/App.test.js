import { render, screen } from '@testing-library/react';
import App from './App';

test('renders nutrition intelligence platform', () => {
  render(<App />);
  const titleElement = screen.getByText(/nutrition intelligence platform/i);
  expect(titleElement).toBeInTheDocument();
});

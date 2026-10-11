import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import App from './App';

describe('App Root Component', () => {
  it('renders landing page navigation and branding', async () => {
    await act(async () => {
      render(<App />);
    });

    // Brand and primary navigation
    expect(screen.getByLabelText('Aura Campus Home')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /explore students/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /join campus/i })).toBeInTheDocument();

    // Hero title
    expect(
      screen.getByRole('heading', {
        name: /build your future/i,
      })
    ).toBeInTheDocument();

    // Hero primary CTA
    expect(screen.getByRole('link', { name: /build your profile/i })).toBeInTheDocument();
  });
});

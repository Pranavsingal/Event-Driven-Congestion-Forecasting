import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SidebarFilters from '../SidebarFilters';

const Wrapper = ({ initialFilters }) => {
  const [filters, setFilters] = useState(initialFilters);
  return <SidebarFilters filters={filters} setFilters={setFilters} />;
};

describe('SidebarFilters Component', () => {
  const mockFilters = {
    cause: 'Unknown',
    veh_type: 'Unknown',
    corridor: 'Unknown',
    zone: 'Unknown',
    junction: 'Unknown',
    hour: 12,
    day: 3,
    event: 'none',
    mode: 'reactive'
  };

  it('renders correctly with default filters', () => {
    render(<Wrapper initialFilters={mockFilters} />);
    
    expect(screen.getByText('Forecasting Engine')).toBeInTheDocument();
    expect(screen.getByText('Start Hour')).toBeInTheDocument();
    
    // Check if the mode toggle is set to Reactive (Live)
    expect(screen.getByText('Reactive (Live)')).toHaveStyle('background: rgb(255, 255, 255)');
  });

  it('calls setFilters when mode is toggled', () => {
    render(<Wrapper initialFilters={mockFilters} />);
    
    const predictiveBtn = screen.getByText('AI Predictive');
    fireEvent.click(predictiveBtn);
    
    // After click, AI Predictive should have the active background
    expect(predictiveBtn).toHaveStyle('background: var(--primary)');
  });

  it('calls setFilters when an event cause is selected', () => {
    render(<Wrapper initialFilters={mockFilters} />);
    
    const selectCause = screen.getByLabelText('Event Cause');
    fireEvent.change(selectCause, { target: { value: 'water_logging' } });
    
    expect(selectCause.value).toBe('water_logging');
  });
});

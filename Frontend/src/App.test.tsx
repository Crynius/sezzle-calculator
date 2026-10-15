import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { App } from './App';
import * as api from './services/api';

vi.mock('./services/api');

describe('Sezzle Calculator Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with initial display at 0', () => {
    render(<App />);
    expect(screen.getByText('Sezzle')).toBeInTheDocument();
    expect(screen.getByTestId('display-value')).toHaveTextContent('0');
    expect(screen.getByRole('button', { name: /historial/i })).toBeInTheDocument();
  });

  it('allows entering digits and building expressions', () => {
    render(<App />);

    fireEvent.click(screen.getByText('7'));
    fireEvent.click(screen.getByText('+'));
    fireEvent.click(screen.getByText('8'));

    expect(screen.getByTestId('display-value')).toHaveTextContent('7 + 8');
  });

  it('clears display when C button is clicked', () => {
    render(<App />);

    fireEvent.click(screen.getByText('9'));
    fireEvent.click(screen.getByText('C'));

    expect(screen.getByTestId('display-value')).toHaveTextContent('0');
  });

  it('deletes last character when ⌫ is clicked', () => {
    render(<App />);

    fireEvent.click(screen.getByText('4'));
    fireEvent.click(screen.getByText('5'));
    expect(screen.getByTestId('display-value')).toHaveTextContent('45');

    fireEvent.click(screen.getByText('⌫'));
    expect(screen.getByTestId('display-value')).toHaveTextContent('4');
  });

  it('toggles the history panel when clicking the Historial button', () => {
    render(<App />);

    const historyBtn = screen.getByRole('button', { name: /historial/i });
    fireEvent.click(historyBtn);

    expect(screen.getByText(/no hay operaciones registradas aún/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText('✕'));
    expect(screen.queryByText(/no hay operaciones registradas aún/i)).not.toBeInTheDocument();
  });

  it('calls backend API and displays result on equals (=)', async () => {
    vi.spyOn(api, 'calculateExpression').mockResolvedValueOnce({
      result: 25,
      expression: '15 + 10',
    });

    render(<App />);

    fireEvent.click(screen.getByText('1'));
    fireEvent.click(screen.getByText('5'));
    fireEvent.click(screen.getByText('+'));
    fireEvent.click(screen.getByText('1'));
    fireEvent.click(screen.getByText('0'));

    const equalsBtn = screen.getByText('=');
    fireEvent.click(equalsBtn);

    await waitFor(() => {
      expect(screen.getByTestId('display-value')).toHaveTextContent('25');
    });
  });

  it('displays error toast when backend rejects operation (e.g. division by zero)', async () => {
    vi.spyOn(api, 'calculateExpression').mockRejectedValueOnce(
      new Error('division by zero is not allowed')
    );

    render(<App />);

    fireEvent.click(screen.getByText('5'));
    fireEvent.click(screen.getByText('÷'));
    fireEvent.click(screen.getByText('0'));
    fireEvent.click(screen.getByText('='));

    await waitFor(() => {
      expect(screen.getByText(/division by zero is not allowed/i)).toBeInTheDocument();
    });
  });
});
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../App';

describe('App triage gating', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('blocks modal save into non-backlog column when triage fields are missing', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /quick add/i }));
    await user.type(screen.getByLabelText(/title/i), 'Task without triage');
    await user.selectOptions(screen.getByLabelText(/column/i), 'todo');
    await user.click(screen.getByRole('button', { name: /create task/i }));

    expect(screen.getByText(/complete triage before saving outside backlog/i)).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Task without triage' })).toBeNull();
  });

  it('supports edit and delete actions from card buttons', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /quick add/i }));
    await user.type(screen.getByLabelText(/title/i), 'Clickable card');
    await user.click(screen.getByRole('button', { name: /create task/i }));

    expect(screen.getByRole('heading', { name: 'Clickable card' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^edit$/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Clickable card')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    await user.click(screen.getByRole('button', { name: /^delete$/i }));

    expect(screen.queryByRole('heading', { name: 'Clickable card' })).toBeNull();
  });
});

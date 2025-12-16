import { describe, it, expect } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SimulatorScreen } from '@/features/simulator/ui/simulator-screen';

function getEstimateValueText() {
  const labels = screen.getAllByText('Estimativa mensal');

  for (const label of labels) {
    const container = label.parentElement;
    if (!container) continue;

    const currency = within(container).queryByText(/R\$\s*\d/);
    if (currency?.textContent) return currency.textContent;
  }

  throw new Error('Estimate value not found');
}

describe('SimulatorScreen', () => {
  it('altera estimativa ao desmarcar uma cobertura', async () => {
    const user = userEvent.setup();
    render(<SimulatorScreen />);

    const before = getEstimateValueText();

    await user.click(screen.getByLabelText('Cobertura contra roubo e furto'));

    await waitFor(() => {
      expect(getEstimateValueText()).not.toEqual(before);
    });
  });

  it('altera estimativa ao marcar cobertura opcional', async () => {
    const user = userEvent.setup();
    render(<SimulatorScreen />);

    const before = getEstimateValueText();

    await user.click(screen.getByLabelText('Fenômenos naturais (granizo, enchente)'));

    await waitFor(() => {
      expect(getEstimateValueText()).not.toEqual(before);
    });
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SimulatorScreen } from './simulator-screen';

describe('SimulatorScreen', () => {
  it('altera o valor estimado ao ativar/desativar uma cobertura opcional', async () => {
    const user = userEvent.setup();
    render(<SimulatorScreen />);

    const getEstimateText = () => screen.getByTestId('estimate').textContent ?? '';

    const before = getEstimateText();

    await user.click(screen.getByRole('checkbox', { name: 'coverages.natural' }));

    const after = getEstimateText();

    expect(after).not.toEqual(before);
  });
});

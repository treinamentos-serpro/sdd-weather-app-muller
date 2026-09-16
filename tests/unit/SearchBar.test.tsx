import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '../../src/components/SearchBar';

describe('SearchBar', () => {
  it('renders an accessible search form and city input', () => {
    render(<SearchBar onSearch={vi.fn()} />);

    expect(screen.getByRole('search', { name: 'Buscar cidade' })).toBeInTheDocument();
    expect(screen.getByLabelText('Cidade')).toHaveAttribute('type', 'search');
  });

  it('does not submit an empty trimmed city', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchBar onSearch={onSearch} />);

    await user.type(screen.getByLabelText('Cidade'), '   ');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).not.toHaveBeenCalled();
  });

  it('does not submit an empty city', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchBar onSearch={onSearch} />);

    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).not.toHaveBeenCalled();
  });

  it('does not submit a city with fewer than two characters', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchBar onSearch={onSearch} />);

    await user.type(screen.getByLabelText('Cidade'), 'S');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).not.toHaveBeenCalled();
  });

  it('submits the trimmed city', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchBar onSearch={onSearch} />);

    await user.type(screen.getByLabelText('Cidade'), '  Recife  ');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).toHaveBeenCalledWith('Recife');
  });

  it('preserves special characters in a valid city name', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchBar onSearch={onSearch} />);

    await user.type(screen.getByLabelText('Cidade'), '  São Paulo & Co.  ');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).toHaveBeenCalledWith('São Paulo & Co.');
  });

  it('disables controls when disabled is true', () => {
    render(<SearchBar disabled onSearch={vi.fn()} />);

    expect(screen.getByLabelText('Cidade')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeDisabled();
  });
});

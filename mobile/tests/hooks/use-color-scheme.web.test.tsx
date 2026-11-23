/** @jest-environment jsdom */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, useSyncExternalStore } from 'react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server.node';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { useColorScheme } from '../../src/hooks/use-color-scheme.web';

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockedUseRNColorScheme = jest.mocked(useRNColorScheme);
let currentScheme: 'light' | 'dark' = 'dark';
const listeners = new Set<() => void>();

mockedUseRNColorScheme.mockImplementation(() => {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => currentScheme,
    () => currentScheme,
  );
});

function Scheme() {
  return <span>{useColorScheme()}</span>;
}

describe('web useColorScheme', () => {
  beforeEach(() => {
    currentScheme = 'dark';
    listeners.clear();
  });

  it('renders light on the server, hydrates with the client scheme, tracks changes, and cleans up', async () => {
    const markup = renderToString(<Scheme />);
    expect(markup).toContain('light');
    const container = document.createElement('div');
    container.innerHTML = markup;

    let root!: Root;
    await act(async () => {
      root = hydrateRoot(container, <Scheme />);
    });
    expect(container.textContent).toBe('dark');

    await act(async () => {
      currentScheme = 'light';
      listeners.forEach((listener) => listener());
    });
    expect(container.textContent).toBe('light');

    await act(async () => root.unmount());
    expect(listeners.size).toBe(0);
  });
});

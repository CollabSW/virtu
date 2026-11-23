import { describe, expect, it, jest } from '@jest/globals';

jest.mock('expo-router', () => ({ Redirect: ({ href }: { href: string }) => <>{`redirect:${href}`}</> }));
jest.mock('./QuizDemo', () => { throw new Error('Release must not load the test demo'); });

describe('PruebasRoute', () => {
  it('redirects in release without loading the demo', async () => {
    jest.replaceProperty(globalThis as typeof globalThis & { __DEV__: boolean }, '__DEV__', false);
    try { jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Route = require('../../src/app/pruebas').default;
      const result = Route();
      expect(result.type).toBe(jest.requireMock<typeof import('expo-router')>('expo-router').Redirect);
      expect(result.props.href).toBe('/');
    }); } finally { jest.restoreAllMocks(); }
  });
});

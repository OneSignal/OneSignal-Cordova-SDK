export const mockExec = vi.fn();

export function mockCordova(): void {
  mockExec.mockReset();
  window.cordova = {
    exec: mockExec,
    platformId: 'android',
    version: '1.0.0',
    define: vi.fn(),
    require: vi.fn(),
    plugins: {},
  };
}

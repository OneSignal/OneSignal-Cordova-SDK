// Mirrors the trim/strict-equals check used elsewhere so a stray newline
// or whitespace in `.env` doesn't accidentally enable masking.
const E2E_MODE = (import.meta.env.VITE_E2E_MODE ?? '').trim() === 'true';
const MASK_CHAR = '•';

export function maskValue(value: string): string {
  if (E2E_MODE) {
    return MASK_CHAR.repeat(value.length);
  }
  return value;
}

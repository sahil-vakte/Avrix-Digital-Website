import { beforeEach, expect, it } from 'vitest';
import { captureAttribution } from './utm';
beforeEach(() => sessionStorage.clear());
it('keeps first touch and every click ID', () => {
  const first = captureAttribution(
    sessionStorage,
    'https://example.com/?utm_source=google&gclid=abc&fbclid=fb&msclkid=ms',
    'https://google.com',
  );
  expect(first.gclid).toBe('abc');
  expect(first.fbclid).toBe('fb');
  expect(first.msclkid).toBe('ms');
  expect(
    captureAttribution(sessionStorage, 'https://example.com/contact-us/?utm_source=other', ''),
  ).toEqual(first);
});
it('handles denied storage and bounds input', () => {
  const storage = {
    getItem() {
      throw Error();
    },
    setItem() {
      throw Error();
    },
  } as unknown as Storage;
  expect(
    captureAttribution(storage, 'https://example.com/?utm_source=' + 'a'.repeat(500), '').utm_source
      .length,
  ).toBe(150);
});

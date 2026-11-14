import { expect, it } from 'vitest';
import { image, statSchema, serviceSchema } from './schemas';
import { markdown, loadContent } from './loader';
it('requires evidence for verified claims', () => {
  expect(
    statSchema.safeParse({
      id: 'x',
      value: '42',
      label: 'Clients',
      source_note: '',
      verified: true,
      evidence_note: '',
    }).success,
  ).toBe(false);
});
it('requires meaningful image alt', () => {
  expect(image.safeParse({ src: '/a.svg', alt: '' }).success).toBe(false);
  expect(image.safeParse({ src: '/a.svg', alt: '', decorative: true }).success).toBe(true);
});
it('sanitises markdown and prevents secondary H1s', () => {
  expect(() => markdown('# Wrong')).toThrow();
  expect(markdown('## Hello\n<script>alert(1)</script>').html).not.toContain('<script>');
});
it('loads all content and removes unverified proof', () => {
  const c = loadContent();
  expect(c.services).toHaveLength(20);
  expect(c.industries).toHaveLength(7);
  expect(c.posts).toHaveLength(3);
  expect(c.solutions.map((s) => s.slug)).toEqual(
    c.site.show_solutions ? ['phishdrill', 'attack-surface-monitor', 'compliance-hub'] : [],
  );
  if (!c.site.show_solutions) {
    expect(c.pages.some((p) => p.slug === 'solutions')).toBe(false);
    expect(JSON.stringify(c.nav)).not.toContain('/solutions/');
  }
  expect(c.stats).toHaveLength(0);
  expect(c.testimonials).toHaveLength(0);
  expect(serviceSchema.safeParse({ ...c.services[0], process: [] }).success).toBe(false);
});

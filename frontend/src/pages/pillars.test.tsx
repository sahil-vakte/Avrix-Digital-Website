import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import Pillars from './Pillars';
import CaseStudies from './CaseStudies';
import { caseStudies, offerings, offeringPath, subPages } from '../content';
import { buildRoutes } from '../content/routes';
import { content } from '../content';

afterEach(cleanup);

const route = (path: string) => buildRoutes(content).find((r) => r.path === path)!;

it('builds a hub and sub-pages for every pillar', () => {
  for (const pillar of [
    'digital-transformation',
    'ai-solutions',
    'cyber-security',
    'professional-services',
  ])
    expect(route(`/${pillar}/`).kind).toBe('pillar');
  expect(offerings.filter((o) => o.slug !== 'index')).toHaveLength(21);
});

it('links a hub to each of its sub-pages', () => {
  render(<Pillars route={route('/ai-solutions/')} />);
  const deliver = document.getElementById('deliver')!;
  for (const o of subPages('ai-solutions'))
    expect(within(deliver).getByRole('link', { name: o.title }).getAttribute('href')).toBe(
      offeringPath(o),
    );
});

it('lists the existing cyber services on each cyber group page', () => {
  render(<Pillars route={route('/cyber-security/test-and-find/')} />);
  expect(screen.getByRole('link', { name: 'Web & Mobile App Penetration Testing' })).toBeTruthy();
  expect(screen.getByText(/Under attack now/)).toBeTruthy();
});

it('filters case studies by solution area and hides empty areas', () => {
  render(<CaseStudies route={route('/case-studies/')} />);
  expect(screen.queryByRole('button', { name: /^Cyber Security/ })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: /^AI Solutions/ }));
  const expected = caseStudies.filter((c) => c.areas.includes('ai-solutions'));
  expect(screen.getByRole('status').textContent).toContain(String(expected.length));
});

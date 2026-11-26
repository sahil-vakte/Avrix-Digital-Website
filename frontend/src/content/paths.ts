/** URL helpers shared by the build and the browser (kept free of dependencies). */
export const offeringPath = (o: { pillar: string; slug: string }) =>
  o.slug === 'index' ? `/${o.pillar}/` : `/${o.pillar}/${o.slug}/`;

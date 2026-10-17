import { loadContent } from '../src/content/loader';
const c = loadContent();
console.log(
  `Validated ${c.services.length} services, ${c.solutions.length} solutions, ${c.posts.length} posts and ${c.pages.length + c.legal.length} pages.`,
);

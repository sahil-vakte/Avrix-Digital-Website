import { describe, it, expect } from 'vitest';
import { enquirySchema } from './form';
const valid = {
  full_name: 'Jane Smith',
  email: 'jane@example.co.uk',
  services: ['ga4-consulting'],
  budget: '1k-3k',
  message: 'Please help us audit our analytics setup.',
  privacy_ack: true,
  marketing_opt_in: false,
  preferred_contact: 'email',
};
describe('enquiry validation', () => {
  it('accepts a realistic enquiry', () =>
    expect(enquirySchema.safeParse(valid).success).toBe(true));
  it.each(['voice-call-agent', 'wims', 'hr-desk'])('accepts a %s solution enquiry', (solution) =>
    expect(enquirySchema.safeParse({ ...valid, services: [solution] }).success).toBe(true),
  );
  it.each([
    { privacy_ack: false },
    { services: [] },
    { services: ['invalid'] },
    { email: 'wrong' },
    { message: 'short' },
    { website: 'javascript:alert(1)' },
    { budget: 'unlimited' },
  ])('rejects invalid fields %j', (change) =>
    expect(enquirySchema.safeParse({ ...valid, ...change }).success).toBe(false),
  );
});

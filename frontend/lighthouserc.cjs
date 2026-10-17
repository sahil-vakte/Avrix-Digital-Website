module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      url: [
        'http://localhost/',
        'http://localhost/services/',
        'http://localhost/services/ga4-consulting/',
        'http://localhost/contact-us/',
        'http://localhost/blog/',
      ],
      numberOfRuns: 3,
      settings: {
        preset: 'perf',
        formFactor: 'mobile',
        screenEmulation: {
          mobile: true,
          width: 390,
          height: 844,
          deviceScaleFactor: 1,
          disabled: false,
        },
        chromeFlags: '--no-sandbox',
      },
    },
    assert: {
      assertMatrix: [
        {
          matchingUrlPattern: '.*',
          assertions: {
            'categories:performance': ['error', { minScore: 0.95 }],
            'categories:accessibility': ['error', { minScore: 0.98 }],
            'categories:best-practices': ['error', { minScore: 1 }],
            'categories:seo': ['error', { minScore: 1 }],
            'largest-contentful-paint': ['error', { maxNumericValue: 2000 }],
            'cumulative-layout-shift': ['error', { maxNumericValue: 0.05 }],
          },
        },
        {
          matchingUrlPattern: '^http://localhost(:[0-9]+)?/$',
          assertions: { 'categories:performance': ['error', { minScore: 0.9 }] },
        },
      ],
    },
    upload: { target: 'temporary-public-storage' },
  },
};

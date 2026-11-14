---
slug: cloud-security-assessment
title: Cloud Security Review
pillar: offensive
order: 3
icon: cloud
h1: "Moved to the cloud quickly? *Let's check it's locked down.*"
seo_title: 'Cloud Security Review: AWS, Azure, Google | AVRIX'
seo_description: 'Security reviews of AWS, Microsoft Azure, Google Cloud and Microsoft 365 for UK and European organisations: exposed data, excess access and missing logging.'
summary: 'AWS, Azure, Google Cloud and Microsoft 365 checked for exposed data, risky settings and excess access.'
intro: 'Cloud platforms are secure by design, but how you set them up is your responsibility. We review your AWS, Azure, Google Cloud and Microsoft 365 settings with read-only access, then give you a short, prioritised list of what to change.'
tags: ['AWS', 'Microsoft Azure', 'Google Cloud', 'Microsoft 365']
included:
  - {
      title: 'Settings review',
      text: "Your configuration compared with CIS Benchmarks and each provider's own guidance.",
    }
  - {
      title: 'Who has access',
      text: 'Users, roles and keys checked for missing MFA and more access than needed.',
    }
  - { title: 'Exposed data', text: 'Storage, databases and file shares checked for public access.' }
  - {
      title: 'Logging',
      text: 'Would you notice an attack, and could you investigate it afterwards?',
    }
  - {
      title: 'Microsoft 365 and Entra ID',
      text: 'Email, SharePoint, Teams and sign-in settings hardened against account takeover.',
    }
  - {
      title: 'Pipelines and containers',
      text: 'Build pipelines, infrastructure code and Kubernetes reviewed for gaps.',
    }
outcomes:
  - {
      title: 'Nothing left open by accident',
      text: 'Public buckets and forgotten keys found before someone else finds them.',
    }
  - {
      title: 'Only the access people need',
      text: 'Smaller blast radius if an account is ever compromised.',
    }
  - {
      title: 'Easier compliance',
      text: 'Findings that map straight to ISO 27001, SOC 2 and customer questions.',
    }
tools:
  [
    'CIS Benchmarks',
    'AWS Well-Architected',
    'Microsoft Cloud Security Benchmark',
    'Google Cloud Security Foundations',
    'ISO 27017',
    'SOC 2',
    'DORA',
    'NCSC Cloud Security Principles',
  ]
process:
  - {
      title: 'Read-only access',
      text: 'You grant temporary read-only access, which you can remove at any time.',
    }
  - {
      title: 'Review',
      text: 'Automated checks for coverage and an expert look at how you actually use the platform.',
    }
  - { title: 'Prioritise', text: 'A short list of changes, ranked by risk, with exact steps.' }
  - {
      title: 'Fix and confirm',
      text: "We help your team make the changes and confirm they're in place.",
    }
faqs:
  - q: 'Will you change anything in our accounts?'
    a: 'No. The review uses read-only access. We only make changes if you ask us to as a separate piece of work.'
  - q: "Isn't security the cloud provider's job?"
    a: "Partly. The provider secures the platform, but you're responsible for configuration, access and what you store. That's known as the shared responsibility model, and it's where most cloud incidents start."
  - q: 'We use Microsoft 365 and AWS. Can you review both?'
    a: 'Yes. Many clients use more than one platform. We review them together and give you one combined plan.'
related: [penetration-testing, vulnerability-management, iso-27001]
updated: 2026-11-14
---

## Who it's for

Teams that have moved quickly to the cloud, inherited an environment from someone else, or need to show customers and auditors that their cloud setup is sound.

## Why it matters to your business

A single public storage bucket, an old access key in a code repository or an admin account without MFA can expose everything you hold. These mistakes are easy to make under deadline pressure, and automated tools make them easy for attackers to find.

## How AVRIX Digital does it

We compare your setup with recognised benchmarks, then look at how your team really works. You get a short list of changes in priority order, not an unreadable export from a scanner.

---
slug: ga4-health-check-for-uk-smes
title: "GA4 health check: 12 things to check before you trust your data"
seo_title: "GA4 Health Check: 12 Things to Check | AVRIX Digital"
seo_description: "Not sure your Google Analytics 4 data is right? Work through this 12-point GA4 health check covering events, conversions, consent, filters and ad links."
excerpt: "Most GA4 problems are invisible until you make a decision based on bad data. Work through these 12 checks in under an hour."
category: analytics
author: avrix-team
published: 2026-10-17
updated: 2026-10-17
cover: { src: /media/covers/blog/ga4-health-check-for-uk-smes.svg, alt: "Abstract AVRIX Digital cover graphic for the article GA4 health check: 12 things to check before you trust your data" }
related_service: ga4-consulting
draft: false
---

Google Analytics 4 is where most UK businesses look when they want to know whether their website and marketing are working. The trouble is that GA4 rarely tells you when it's set up wrong. It keeps producing tidy-looking charts, and you only find out the numbers were off after you've moved budget, cut a campaign or reported to the board.

This checklist takes under an hour. You'll need **Editor** access to your GA4 property and, ideally, access to Google Tag Manager.

## 1. Is GA4 installed once, and only once?

Duplicate tags are the most common cause of inflated page views and conversions. Open your site, then open Google Tag Assistant (tagassistant.google.com) and look for the same Measurement ID firing twice. It's often installed once by a plugin and again in Tag Manager.

## 2. Are your key events actually firing?

List the actions that matter to your business: enquiry form submissions, phone and email clicks, bookings, purchases, quote requests. Then check **Admin › Events** to confirm each one appears with sensible daily volumes. If an event you rely on isn't there, you're making decisions without it.

## 3. Are the right events marked as key events (conversions)?

GA4 calls conversions "key events". Only the actions that represent real business value should be marked. Marking page views or scrolls as key events makes your conversion rate look great and means nothing.

## 4. Does each form count once per submission?

Submit a test enquiry and watch **Realtime**. If you see two or three `generate_lead` (or equivalent) events, your tracking is double-counting, often because it's triggered on both the button click and the thank-you page.

## 5. Is e-commerce tracking complete?

For online shops, check the full funnel: `view_item`, `add_to_cart`, `begin_checkout`, `add_payment_info` and `purchase`, all with item data and the correct currency (GBP). Compare GA4 revenue against your shop platform for the same week. Some gap is normal, but a large one means something is broken.

## 6. Is Consent Mode set up correctly?

UK businesses need visitor consent for analytics and advertising cookies. Google Consent Mode v2 lets tags respect those choices while still sending privacy-safe signals. Check that your cookie banner updates consent and that tags don't fire before a choice is made.

## 7. Is internal traffic filtered out?

Your own team browsing the site can distort small-business data significantly. Define internal traffic by IP under **Admin › Data streams › Configure tag settings**, then activate the internal traffic filter.

## 8. Are unwanted referrals excluded?

Payment gateways (PayPal, Stripe checkout) and booking tools can appear as "referral" sources and steal credit from the channel that actually brought the customer. Add them under **List unwanted referrals**.

## 9. Is data retention set to the maximum?

GA4's default retention for detailed exploration data is two months. Change it to 14 months under **Admin › Data retention**, or year-on-year analysis won't be possible.

## 10. Are Google Ads and Search Console linked?

Linking Google Ads lets you see campaign performance alongside on-site behaviour and import key events for bidding. Linking Search Console shows which search queries bring people in. Both take a couple of minutes under **Admin › Product links**.

## 11. Are your UTM tags consistent?

Check **Reports › Acquisition › Traffic acquisition** for messy source/medium values such as `Facebook`, `facebook.com` and `fb` all appearing separately. Agree a simple UTM naming convention and stick to it, or channel reporting becomes guesswork.

## 12. Does someone own it?

GA4 setups decay. Websites change, forms get rebuilt and new campaigns launch with no tracking. Give one person responsibility for checking tracking after every website change, and run this checklist every quarter.

## What to do with the results

If you ticked everything, your data is in good shape. If you found three or more problems, fix the tracking **before** making any big marketing decisions, because every report built on top of it inherits the errors.

Want a second pair of eyes? Our [GA4 consulting](/services/ga4-consulting/) team can audit your setup, fix what's broken and build a Looker Studio dashboard your whole team can understand.

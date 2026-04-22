# Security & Infrastructure Decisions

This document captures security choices, design decisions, and troubleshooting guidance for the Lumicello website.

**Last Updated:** 2026-04-22
**Maintained By:** Development Team

---

## Table of Contents

1. [Subresource Integrity (SRI)](#subresource-integrity-sri)
2. [Content Security Policy (CSP)](#content-security-policy-csp)
3. [Security Headers](#security-headers)
4. [Email Obfuscation](#email-obfuscation)
5. [SEO Infrastructure](#seo-infrastructure)
6. [Structured Data (JSON-LD)](#structured-data-json-ld)
7. [AI Crawler Policy](#ai-crawler-policy)
8. [Analytics (Umami)](#analytics-umami)
9. [Analytics (Meta Pixel)](#analytics-meta-pixel)
10. [Troubleshooting Guide](#troubleshooting-guide)

---

## Subresource Integrity (SRI)

### What It Does
SRI verifies that external scripts haven't been tampered with by checking a cryptographic hash before execution.

### Current Implementation

| Resource | Hash (SHA-384) | Generated |
|----------|----------------|-----------|
| FontAwesome Kit (bc46e65664) | `Ndyvb54bOrSvO4TpXhLQp7K9lpIkhNGHhhipHDmRnyedrzDauT9T1ddcMH96pK1a` | 2025-12-01 |

### Files Using SRI
- `index.html:33`
- `contact.html:33`
- `coming-soon.html:33`
- `404.html:33`
- `privacy.html:33`
- `terms.html:33`
- `welcome.html:33`

### When to Regenerate Hash

**Regenerate the SRI hash if:**
- You update FontAwesome Kit settings (icons, version, etc.)
- FontAwesome icons stop loading (hash mismatch)
- Console shows: `Failed to find a valid digest in the 'integrity' attribute`

### How to Regenerate

```bash
# Generate new hash
curl -s https://kit.fontawesome.com/bc46e65664.js | openssl dgst -sha384 -binary | openssl base64 -A

# Or use https://www.srihash.org/ with the URL
```

Then update all HTML files with the new hash.

### Decision Rationale
- **Accepted Risk:** FontAwesome Kit scripts can change when kit settings are updated
- **Mitigation:** We don't frequently change FA settings; hash regeneration is documented
- **Alternative Considered:** Self-hosting FA (rejected due to maintenance overhead)

---

## Content Security Policy (CSP)

### Current Policy (render.yaml)

```
default-src 'self';
script-src 'self' https://kit.fontawesome.com https://app.kit.com https://analytics.lumicello.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com https://ka-f.fontawesome.com;
img-src 'self' data: https:;
connect-src 'self' https://app.kit.com https://formspree.io https://ka-f.fontawesome.com https://analytics.lumicello.com;
form-action 'self' https://app.kit.com https://formspree.io;
frame-src 'self' https://www.facebook.com;
frame-ancestors 'none';
base-uri 'self';
object-src 'none';
```

### Directive Explanations

| Directive | Value | Why |
|-----------|-------|-----|
| `default-src` | `'self'` | Only load resources from our domain by default |
| `script-src` | `'self' https://kit.fontawesome.com https://app.kit.com https://analytics.lumicello.com https://connect.facebook.net` | Allow our scripts (external files only), FontAwesome, Kit.com newsletter, Umami analytics, and Meta Pixel |
| `style-src` | `'self' 'unsafe-inline' https://fonts.googleapis.com` | Allow our CSS, inline styles (used in pages), Google Fonts |
| `font-src` | `'self' https://fonts.gstatic.com https://ka-f.fontawesome.com` | Google Fonts and FontAwesome icon fonts |
| `img-src` | `'self' data: https:` | Our images, data URIs (SVGs), any HTTPS images |
| `connect-src` | `'self' https://app.kit.com https://formspree.io https://ka-f.fontawesome.com https://analytics.lumicello.com https://www.facebook.com` | AJAX/fetch to newsletter, contact form, and analytics services |
| `form-action` | `'self' https://app.kit.com https://formspree.io https://www.facebook.com` | Forms can only submit to these destinations, including Meta Pixel fallback posts |
| `frame-src` | `'self' https://www.facebook.com` | Allow Meta Pixel iframe-based fallback transport |
| `frame-ancestors` | `'none'` | Prevent site from being embedded in iframes (clickjacking protection) |
| `base-uri` | `'self'` | Prevent base tag injection |
| `object-src` | `'none'` | Block Flash/plugins |

### Known Limitations

**`'unsafe-inline'` for styles only:**
- Required because pages use inline `<style>` blocks and style attributes
- Scripts no longer use `'unsafe-inline'` - all JavaScript is in external files (`main.js`, `components.js`)
- **Future improvement:** Extract inline styles to CSS files, use nonces or hashes

### Meta Pixel

The site loads Meta Pixel from a local bootstrap file (`js/meta-pixel.js`) so the Pixel ID stays explicit in-repo while the CSP remains narrow.

- `script-src` allows `https://connect.facebook.net` for the Meta loader
- `connect-src` allows `https://www.facebook.com` for browser-side event delivery
- `form-action` allows `https://www.facebook.com` for Meta's form-post fallback transport
- `frame-src` allows `https://www.facebook.com` for Meta's iframe fallback transport
- `img-src https:` already covers the noscript tracking beacon

### Adding New External Resources

If you add a new third-party service:

1. Identify what CSP directives it needs (check browser console for violations)
2. Update `render.yaml` with the minimum necessary permissions
3. Document the change in this file
4. Test thoroughly before deploying

---

## Security Headers

### Current Headers (render.yaml)

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Frame-Options` | `DENY` | Prevent clickjacking by blocking iframe embedding |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME-type sniffing attacks |
| `X-XSS-Protection` | `1; mode=block` | Legacy XSS filter (browsers are deprecating, but still useful) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control referrer information leakage |
| `Permissions-Policy` | `geolocation=(), microphone=(), camera=()` | Disable sensitive browser features we don't need |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Force HTTPS for 1 year |

### Headers NOT Implemented (and why)

| Header | Reason Not Implemented |
|--------|------------------------|
| `X-Permitted-Cross-Domain-Policies` | No Flash/PDF embedding needed |
| `Expect-CT` | Deprecated in favor of built-in CT enforcement |

---

## Email Obfuscation

### What It Does
Protects email addresses from automated bot scraping by assembling them via JavaScript rather than exposing them in plain HTML.

### Implementation

**Method:** JavaScript Assembly (95%+ bot protection)

Email addresses are stored as separate data attributes and assembled at runtime:

```html
<!-- In HTML (what bots see): -->
<span class="protected-email" data-u="contact" data-d="lumicello.com">
  <noscript>contact [at] lumicello [dot] com</noscript>
</span>

<!-- After JavaScript runs (what users see): -->
<a href="mailto:contact@lumicello.com">contact@lumicello.com</a>
```

### Protected Emails

| Page | Email | Method |
|------|-------|--------|
| `contact.html` | contact@lumicello.com | Button (no visible email) |
| `privacy.html` | contact@lumicello.com | Inline span (visible after JS) |
| `terms.html` | contact@lumicello.com | Inline span (visible after JS) |

### Code Location

- **JavaScript function:** `js/main.js` → `initEmailProtection()`
- **CSS classes:** `.protected-email` (inline), `.protected-email-btn` (button)

### Usage

**For inline email display:**
```html
<span class="protected-email" data-u="username" data-d="domain.com">
  <noscript>username [at] domain [dot] com</noscript>
</span>
```

**For email button (no visible email):**
```html
<button class="protected-email-btn" data-u="username" data-d="domain.com">
  Email Us
</button>
```

### Why JavaScript Assembly?

| Method | Bot Protection | Accessibility | Chose? |
|--------|---------------|---------------|--------|
| Plain text | 0% | ✓ | ✗ |
| HTML entities | ~80% | ✓ | ✗ |
| CSS reversal | ~90% | ✗ (screen readers fail) | ✗ |
| **JavaScript assembly** | ~95% | ✓ | ✓ |
| Image of email | ~99% | ✗ | ✗ |

### Limitations

- Users with JavaScript disabled see fallback text: `username [at] domain [dot] com`
- Sophisticated bots that execute JavaScript can still extract emails
- Not a replacement for spam filtering on your email server

---

## SEO Infrastructure

### robots.txt

**Location:** `/robots.txt`

**Purpose:**
- Guide search engine crawlers
- Point to sitemap
- Block internal/development files (defense in depth)

**Key Rules:**
```
User-agent: *
Allow: /
Sitemap: https://lumicello.com/sitemap.xml
Disallow: /design_specs/
Disallow: /*.md$
```

### sitemap.xml

**Location:** `/sitemap.xml`

**Pages Included:**
| Page | Priority | Change Frequency |
|------|----------|------------------|
| `/` (homepage) | 1.0 | weekly |
| `/contact.html` | 0.8 | monthly |
| `/welcome.html` | 0.6 | monthly |
| `/privacy.html` | 0.5 | yearly |
| `/terms.html` | 0.5 | yearly |
| `/ai-info.html` | 0.4 | yearly |
| `/coming-soon.html` | 0.3 | monthly |

**Excluded:** `404.html` (intentionally not indexed)

### Maintenance

**Update sitemap when:**
- Adding new pages
- Significantly updating existing pages
- Changing URL structure

### Canonical URLs

All pages include canonical URL tags to prevent duplicate content issues:

```html
<link rel="canonical" href="https://lumicello.com/page.html">
```

**Files with canonical URLs:** All 7 HTML files

### Theme Color

All pages include a theme-color meta tag for mobile browser chrome customization:

```html
<meta name="theme-color" content="#4A5D4B">
```

**Purpose:** Sets the browser toolbar/address bar color on mobile devices to match the brand (Forest Olive).

**Files with theme-color:** All 7 HTML files

### OG Locale Tags

Pages specify language/region for social sharing:

```html
<meta property="og:locale" content="en_US">
<meta property="og:locale:alternate" content="th_TH">
```

**Purpose:** Helps social platforms understand the target audience (English primary, Thai alternate).

---

## Structured Data (JSON-LD)

### What It Does
JSON-LD (JavaScript Object Notation for Linked Data) provides structured information about your website to search engines and AI systems, enabling rich search results and better content understanding.

### Current Implementation

**Location:** `index.html` (homepage only)

#### Organization Schema

Provides company/brand information:

```json
{
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Lumicello",
    "description": "Personalized learning platform for children...",
    "url": "https://lumicello.com",
    "logo": "https://lumicello.com/assets/images/lumicello_logo.webp",
    "sameAs": [
        "https://www.instagram.com/lumicello.th",
        "https://lin.ee/eH1GxA5"
    ],
    "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "availableLanguage": ["English", "Thai"]
    }
}
```

**Benefits:**
- Knowledge panel in Google search results
- Brand verification for social profiles
- Consistent company information across search engines

#### Product Schema (ItemList)

Lists all 6 LumiBox kits with structured product data:

```json
{
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "First Year Collection - LumiBox",
    "description": "Monthly LumiBox learning kits for babies 0-12 months",
    "numberOfItems": 6,
    "itemListElement": [
        {
            "@type": "ListItem",
            "position": 1,
            "item": {
                "@type": "Product",
                "name": "First Gazes Kit",
                "description": "High-contrast cards and gentle sounds...",
                "brand": { "@type": "Brand", "name": "Lumicello" },
                "audience": { "@type": "PeopleAudience", "suggestedMinAge": 0, "suggestedMaxAge": 2 }
            }
        }
        // ... 5 more kits
    ]
}
```

**Benefits:**
- Rich product snippets in search results
- Better product discovery
- Age-appropriate content signals for AI recommendations

### Testing JSON-LD

Use these tools to validate your structured data:
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)

### Maintenance

**Update JSON-LD when:**
- Adding new products/kits
- Changing company contact information
- Adding new social media profiles
- Modifying product descriptions or age ranges

---

## AI Crawler Policy

### Current Policy: ALLOW (Default)

AI crawlers (GPTBot, ChatGPT-User, anthropic-ai, Claude-Web, etc.) are currently **allowed** to crawl the site.

### Rationale
- Lumicello is a public marketing site
- AI visibility may increase brand awareness
- No sensitive/proprietary content on public pages

### How to Restrict AI Crawlers

If you decide to block AI training on your content, uncomment these lines in `robots.txt`:

```
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Claude-Web
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: Google-Extended
Disallow: /
```

### llms.txt

**Location:** `/llms.txt`

An AI-specific guidance file (emerging standard) that provides:
- Site description and purpose
- Content policy for AI use
- Preferred citation format
- Contact information
- Technical metadata

**Content summary:**
- Allows indexing for search and discovery
- Allows answering questions about Lumicello
- Provides preferred citation format
- Links to sitemap for structured crawling

---

## Analytics (Umami)

### What It Does

Umami is a privacy-focused, open-source web analytics platform. We use a self-hosted instance to track website usage without cookies or personal data collection.

### Current Implementation

**Umami Instance:** Self-hosted via Tailscale Funnel

| Setting | Value |
|---------|-------|
| Script URL | `https://analytics.lumicello.com/script.js` |
| Website ID | `dd17445d-a227-413a-bcca-4c5b8f31b8cf` |
| Dashboard | `https://analytics.lumicello.com` (internal access) |

**Script added to all pages:**
```html
<script
    defer
    src="https://analytics.lumicello.com/script.js"
    data-website-id="dd17445d-a227-413a-bcca-4c5b8f31b8cf"
></script>
```

### Files with Analytics Script

All 8 HTML files include the Umami script:
- `index.html`
- `contact.html`
- `coming-soon.html`
- `privacy.html`
- `terms.html`
- `welcome.html`
- `404.html`
- `ai-info.html`

### Privacy Benefits

- **No cookies** - GDPR/CCPA compliant without consent banners
- **No personal data** - Only page views, referrers, and device info
- **Self-hosted** - Data stays on our infrastructure
- **Lightweight** - Script is ~2KB, minimal performance impact

### Infrastructure Note

> **⚠️ Current Setup: Tailscale Funnel**
>
> The Umami instance is currently exposed to the public internet via [Tailscale Funnel](https://tailscale.com/kb/1223/funnel).
> This configuration may change in the future.
>
> **If migrating to a different hosting solution:**
> 1. Update the script URL in all 7 HTML files
> 2. Update CSP in `render.yaml` (script-src and connect-src)
> 3. Update this documentation
> 4. Verify analytics continue working after deployment

### CSP Requirements

The following CSP directives were added for Umami:

| Directive | Domain Added | Purpose |
|-----------|--------------|---------|
| `script-src` | `https://analytics.lumicello.com` | Load tracking script |
| `connect-src` | `https://analytics.lumicello.com` | Send analytics data |

### Verification

After deployment, verify analytics are working:

1. Visit lumicello.com
2. Open browser DevTools → Network tab
3. Filter by "script.js" - should load from `persistence.taild1c286.ts.net`
4. Check Umami dashboard for new page views

### Tracking Static .txt Files (robots.txt, llms.txt)

**Challenge:** Static text files cannot include JavaScript tracking. They're served as `text/plain` without executing code.

**Solution Implemented (2025-01-13):**

| File | Tracking Approach | Notes |
|------|-------------------|-------|
| `robots.txt` | **Not tracked** | Must remain at exact path for crawlers. SEO requirement. |
| `llms.txt` | **Indirect via ai-info.html** | HTML page with same content, trackable via Umami |

**How it works:**
- `ai-info.html` - Formatted HTML version of llms.txt with Umami tracking
- Both `robots.txt` and `llms.txt` reference `ai-info.html` for visitors
- AI crawlers that process the reference will visit the HTML page (tracked)
- Direct .txt file access remains untracked (acceptable trade-off)

**Why robots.txt cannot be tracked:**
- Search engines require `/robots.txt` at exact path
- Must be served as plain text (`text/plain`)
- Redirecting would break crawler behavior

**Alternative options considered but not implemented:**
- Cloudflare Analytics (requires Cloudflare setup)
- Render.com logs (not available for static sites)
- Server-side Umami API (requires backend, not a static site)

**Files added:**
- `ai-info.html` - Trackable HTML version of llms.txt content

---

## Troubleshooting Guide

### FontAwesome Icons Not Loading

**Symptoms:**
- Icons appear as empty squares or missing
- Console error: `Failed to find a valid digest in the 'integrity' attribute`

**Cause:** SRI hash mismatch (FontAwesome updated their kit file)

**Fix:**
1. Regenerate the hash (see [SRI section](#when-to-regenerate-hash))
2. Update all 7 HTML files
3. Update this document with new hash and date
4. Commit and deploy

---

### Forms Not Submitting

**Symptoms:**
- Newsletter or contact form submissions fail silently
- Console shows CSP violation for `form-action`

**Cause:** New form destination not in CSP allowlist

**Fix:**
1. Add the form destination to `form-action` in `render.yaml`
2. Also add to `connect-src` if using AJAX submission
3. Redeploy

---

### New Third-Party Script Blocked

**Symptoms:**
- New feature/integration not working
- Console shows CSP violation for `script-src`

**Fix:**
1. Identify the script domain from console error
2. Add to appropriate CSP directive in `render.yaml`
3. Document the addition in this file
4. Test and deploy

---

### Site Not Appearing in Search Results

**Checklist:**
1. Verify `robots.txt` allows crawling (`Allow: /`)
2. Check `sitemap.xml` is accessible and valid
3. Submit sitemap to Google Search Console
4. Ensure no `noindex` meta tags on pages
5. Check for canonical URL issues

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-13 | Update CSP for new Umami Tailscale domain (taild1c286) | Claude |
| 2025-12-03 | Add Umami Analytics (self-hosted via Tailscale Funnel); update CSP for analytics | Claude |
| 2025-12-02 | Remove 'unsafe-inline' from script-src CSP; refactor inline scripts to main.js | Claude |
| 2025-12-01 | Add theme-color meta tag to all pages | Claude |
| 2025-12-01 | Add code formatting config (.prettierrc, .eslintrc.json) | Claude |
| 2025-12-01 | Document JSON-LD structured data implementation | Claude |
| 2025-12-01 | Add canonical URLs and OG locale tags to all pages | Claude |
| 2025-12-01 | Implement email obfuscation via JavaScript assembly | Claude |
| 2025-12-01 | Create llms.txt for AI crawler guidance | Claude |
| 2025-12-01 | Initial security implementation: CSP, SRI, security headers, robots.txt, sitemap.xml | Claude |

---

## References

- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [MDN: Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity)
- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [Google: robots.txt Specification](https://developers.google.com/search/docs/crawling-indexing/robots/intro)
- [Sitemaps.org Protocol](https://www.sitemaps.org/protocol.html)

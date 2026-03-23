### Document 2: Website Technical Specifications (`website_specs_requirements.md`)

**Target Audience:** Frontend Engineer  
**Goal:** Technical implementation details for a pure HTML/CSS build.

```markdown
# Lumicello — Technical Specifications & Implementation

## 1. Technology Stack
* **Core:** Semantic HTML5 + CSS3 (No preprocessors required, use native CSS Nesting if supported, or standard CSS).
* **Scripting:** Vanilla JavaScript (ES6+) only for mobile menu toggles and intersection observers (scroll animations). **No heavy frameworks** (No React/Vue) to ensure "comfortable browsing" performance.
* **External Dependencies:**
    * Google Fonts (DM Sans + Fraunces + Noto Sans Thai).
    * FontAwesome (or Phosphor Icons) for UI icons.

## 2. Directory Structure
Keep the project flat and clean to allow easy handoff.
```

/lumicello-web
/assets
/images (AI generated assets)
/icons
/css
style.css (Main stylesheet)
variables.css (Design tokens)
animations.css (Keyframes)
/js
main.js (Scroll logic + Mobile menu)
index.html
kits.html
about.html

````

## 3. Global CSS Variables (`variables.css`)
Copy this directly to ensure the design specs are met programmatically.

```css
:root {
    /* Brand Colors */
    --color-primary: #1A2B4C;      /* Jefferson Blue */
    --color-accent: #F2C94C;       /* Lumen Gold */
    --color-bg-main: #F9F8F4;      /* Soft Canvas */
    
    /* Section Backgrounds */
    --color-bg-sage: #E6EBE6;
    --color-bg-clay: #F0E6DD;
    
    /* Typography */
    --font-heading: 'Fraunces', serif;
    --font-body: 'DM Sans', 'Noto Sans Thai', sans-serif;
    
    /* Spacing & Layout */
    --radius-card: 24px;
    --radius-btn: 50px;
    --spacing-section: 120px;      /* Breathable space */
    
    /* Animation Tokens */
    --ease-fluid: cubic-bezier(0.25, 1, 0.5, 1); /* The "Adaline" smooth feel */
}
````

## 4\. Key Implementation Requirements

### A. Navigation Bar (Sticky & Fluid)

  * **Behavior:** Fixed at the top. On scroll down, the background becomes slightly translucent (`backdrop-filter: blur(10px)`) with a white tint.
  * **Mobile:** Hamburger menu must animate into a full-screen overlay with a soft fade, not a harsh slide-in.

### B. The "Fluid" Scroll Animation

Do not use heavy libraries like GSAP unless necessary. Use `IntersectionObserver` in `main.js` to toggle a class `.in-view`.

```css
/* CSS logic for smooth entry */
.reveal-on-scroll {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 1s ease, transform 1s var(--ease-fluid);
}

.reveal-on-scroll.in-view {
    opacity: 1;
    transform: translateY(0);
}
```

### C. LumiBox (Grid Layout)

Use CSS Grid to create the "Poketo" bento-box feel.

  * **Desktop:** 3-column grid.
  * **Mobile:** 1-column stack.
  * **Gap:** 2rem (32px).
  * **Cards:** Must use `overflow: hidden` on the border-radius so images zoom slightly on hover without breaking the rounded corner shape.

### D. Accessibility & Localization (Mandatory)

1.  **Contrast:** Ensure `--color-primary` text on `--color-bg-sage` passes WCAG AA.
2.  **Language Support:** The HTML tag must be `<html lang="en">`.
3.  **Thai Font:** Ensure `Noto Sans Thai` is loaded. CSS rule: `font-family: 'DM Sans', 'Noto Sans Thai', sans-serif;`.

## 5\. Page Structure (Single Page strategy for Phase 1)

1.  **Hero Section:**
      * H1: "Unlocking the Genius in Every Child." (Centered, large serif).
      * Background: Soft gradient or the "Abstract 3D" AI image.
      * Primary CTA: "Join our Community"
2.  **Community Section:**
      * Social links (Line, Instagram) as prominent cards.
      * Newsletter signup form (Name + Email).
      * Placed immediately after Hero to prioritize community building.
3.  **Value Prop (The "Headspace" Cards):**
      * 3 cards horizontally: "Research-Backed," "Customized," "Right Pace."
      * Icons: Soft, colorful SVG icons.
4.  **Curio Types:**
      * Visual data visualization showing the personalized learning concept.
      * Floating animation for engagement.
5.  **The Product (LumiBox):**
      * Grid of physical kits (3-column on desktop).
      * "Coming Soon" badges for pre-launch phase.
6.  **Social Proof:**
      * Parent quotes.
      * Design: Large text, centered, very clean.
7.  **Footer:**
      * Simple columns with navigation links.

## 6\. Performance Optimization

  * **Images:** All AI images must be converted to `.webp` format.
  * **Loading:** Use `loading="lazy"` on all images below the fold.
  * **Code:** Minify CSS before deployment.

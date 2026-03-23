# Lumicello — Design Specifications & Requirements

Target Audience: UI Designer / Frontend Developer
Goal: Define the aesthetic, motion, and asset generation strategy.

## 1. Design Philosophy: "Warm Intelligence"
**The Vibe:** The site must feel like a "digital hug" (Headspace) backed by "scientific precision" (Adaline).
* **Core aesthetic:** Soft, fluid, and organic. No sharp 90-degree angles.
* **The "Adaline" Influence:** Use generous whitespace and sophisticated typography. The site should feel "premium" and "fluid," not childish.
* **The "Headspace" Influence:** Use approachable colors, rounded shapes, and "breathing" motion.
* **The "Poketo" Influence:** Use clear, grid-based layouts (Bento grids) for *LumiBox* to make products pop without feeling cluttered.

## 2. Visual Identity & Color System
**Rule:** Colors must be AA accessible. Do not use pure black (#000000).

### Primary Palette (Brand Anchors)
* **Forest Olive:** `#4A5D4B` (Use for primary text and strong calls-to-action to ground the design).
* **Soft Mustard:** `#D9A835` (Use sparingly for "spark" elements, buttons, and high-priority highlights).
* **Warm Cream:** `#F7F4EE` (Main background. A warm off-white, never pure white).

### Secondary Palette (The "Exploration" Tones)
* *Use these for section backgrounds and "Kit" cards to create separation without lines.*
* **Muted Sage:** `#D5DDD0` (Calm, nature-focused).
* **Soft Clay:** `#EAE1D7` (Warm, tactile).
* **Dusty Blue:** `#DEE5E5` (Curiosity, sky).

### Gradients & Depth
* **Fluid Gradients:** Very subtle background blurs using CSS filters.
    * *Example:* `background: radial-gradient(circle at 50% 50%, #D9A83520 0%, transparent 70%);`
* **Shadows:** Soft, diffused shadows only. No hard drop shadows.
    * *Spec:* `box-shadow: 0 10px 40px -10px rgba(74, 93, 75, 0.08);`

## 3. Typography
* **Headings (The "Warm" Voice):** A serif font that feels human and literary.
    * *Reference:* `Fraunces` or `Merriweather` (Google Fonts).
    * *Usage:* H1, H2, and "Pull Quotes" from parents/teachers.
* **Body (The "Accessible" Voice):** A clean, rounded sans-serif.
    * *Reference:* `Nunito` or `DM Sans` (Google Fonts).
    * *Constraint:* Must support Thai characters (e.g., `Noto Sans Thai` fallback).

## 4. UI Components & Layouts (HTML/CSS Only)

### A. The "Fluid Container" (Adaline Style)
Instead of hard lines separating sections, use **padding** and **background color transitions**.
* **Border Radius:** All cards must have `border-radius: 24px`. Buttons must be pill-shaped (`50px`).
* **Spacing:** Generous. Minimum `120px` padding between major sections on desktop.

### B. The "Bento Grid" (Poketo Style)
For the *LumiBox* section:
* Use CSS Grid.
* Items should look like "Toy Boxes"—contained, colorful, but organized.
* *Interaction:* On hover, the card should float up slightly (`transform: translateY(-5px)`) with a "breathing" ease.

### C. Buttons
* **Primary:** Pill-shaped. Forest Olive background, White text.
* **Secondary:** Ghost button with a 2px solid border (Soft Mustard) and Forest Olive text.

## 5. Motion Guidelines (CSS Transitions)
**Key Requirement:** "Variety of movements that go well together."
1.  **Scroll Reveal:** Elements should fade in and slide up gently as the user scrolls.
    * *Timing:* `transition: all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);`
2.  **The "Constellation" Effect:** Connective lines between dots (representing "Curio Types") should gently pulse opacity (0.4 to 1.0) over 4 seconds.
3.  **No "Jank":** Avoid distinct/sharp hover states. Everything must fade or morph.

## 6. AI Image Generation Strategy (No Graphic Designer)
Since we have no designer, use these exact prompts in Midjourney/DALL-E to generate assets.

**A. Hero Image (Abstract/Warm):**
> *Prompt:* "Abstract 3D shapes representing curiosity and learning, soft round forms, floating in a bright airy space, warm lighting, pastel colors, sage green and soft gold, minimalism, high definition, soft focus, style of Headspace app illustrations, white background --ar 16:9"

**B. LumiBox (Product Mockup):**
> *Prompt:* "A wooden educational toy set arranged neatly on a pastel beige surface, shot from directly above (knolling), soft natural lighting, high end product photography, colorful geometric shapes, Montessori style, zero clutter --ar 4:3"

**C. "Curio Types" (Data Viz):**
> *Prompt:* "A beautiful abstract data visualization of a radar chart, glowing lines, connecting dots, soft mustard and forest olive, soft gradient background, minimalist UI design, looking distinct and scientific but friendly --ar 1:1"

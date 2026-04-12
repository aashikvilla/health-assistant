# Design System Document
 
## 1. Overview & Creative North Star: "The Clinical Curator"
The objective of this design system is to transcend the generic "medical app" aesthetic. We are building *The Clinical Curator*—a visual identity that combines the rigorous precision of a laboratory with the warm, approachable high-touch experience of a premium boutique. 
 
We break the "template" look through *Intentional Asymmetry*. By utilizing overlapping elements (e.g., product illustrations breaking the boundaries of their background containers) and high-contrast typography scales, we create a layout that feels editorial rather than industrial. This system prioritizes breathing room, allowing complex medical data to feel organized, manageable, and sophisticated.
 
---
 
## 2. Colors: Tonal Depth & The No-Line Rule
 
Our palette leverages vibrant healthcare tones balanced against a sophisticated neutral foundation.
 
### Palette Highlights
*   *Primary (#0058bd):* Use for high-intent actions and authoritative branding.
*   *Secondary/Teal (#006a66):* Reserved for "Human" health tracks, wellness, and clinical stability.
*   *Tertiary/Pink-Red (#ab2653):* Explicitly for the "For Pet" segments, alerts, or urgent health markers.
*   *Surface Foundation (#f7f9ff):* A tinted background that provides more "soul" than pure white.
 
### The "No-Line" Rule
*Designers are prohibited from using 1px solid borders for sectioning.* Boundaries must be defined solely through background color shifts or subtle tonal transitions. For example, a surface-container-low section should sit directly on a surface background to define its territory. 
 
### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of fine paper. 
*   *Base:* surface (#f7f9ff)
*   *Secondary Level:* surface-container-low (#f1f4fa) for grouping related content.
*   *Action Level:* surface-container-lowest (#ffffff) for interactive cards that need to "pop" against the background.
 
### The "Glass & Gradient" Rule
To achieve a premium, custom feel, use *Glassmorphism* for floating elements (e.g., navigation bars or mobile overlays). Apply a semi-transparent surface color with a backdrop-blur of 12px–20px. 
*   *Signature Textures:* Use subtle linear gradients transitioning from primary to primary_container for hero CTAs to provide depth that flat colors cannot achieve.
 
---
 
## 3. Typography: Editorial Authority
 
We use a dual-font strategy to balance professional clinical tone with modern readability.
 
*   *Display & Headlines (Plus Jakarta Sans):* These are our "Voice." Large, bold, and authoritative. The wide apertures of Plus Jakarta Sans provide an open, honest feel.
    *   Usage: display-lg (3.5rem) for hero marketing; headline-md (1.75rem) for section titles.
*   *Body & Titles (Manrope):* Our "Information Architect." Manrope is highly legible at small sizes, perfect for lab results and prescription details.
    *   Usage: body-lg (1rem) for standard reading; label-sm (0.6875rem) for metadata.
 
*Hierarchy Tip:* Always lean into high contrast. Pair a display-md headline with a body-sm description to create a sophisticated, high-end editorial rhythm.
 
---
 
## 4. Elevation & Depth: Tonal Layering
 
Traditional drop shadows are often too "muddy" for clean healthcare UI. We use *Tonal Layering*.
 
*   *The Layering Principle:* Depth is achieved by "stacking" surface tiers. Place a surface-container-lowest card on a surface-container-low background. This creates a soft, natural lift without a border.
*   *Ambient Shadows:* If a floating effect is required (e.g., a "Go to shop" button), shadows must be extra-diffused: blur: 24px, opacity: 6%, and tinted with the on-surface color.
*   *The "Ghost Border" Fallback:* If a border is required for accessibility, use the outline-variant token at *15% opacity*. Never use 100% opaque borders.
 
---
 
## 5. Components: Precision Primitives
 
### Buttons
*   *Primary:* High-gloss. Transition from primary to primary_container. Rounded-xl (1.5rem) for a friendly, approachable touch.
*   *Secondary:* surface-container-highest background with on-surface text. No border.
*   *Ghost:* Transparent background, on-surface text, with a subtle background shift to surface-variant on hover.
 
### Cards & Lists
*   *Rule:* Forbid divider lines. Use vertical whitespace (referencing the Spacing Scale) or subtle background shifts.
*   *Interactive Cards:* Should utilize surface-container-lowest (#ffffff) to appear as the top-most layer.
 
### Custom Health Illustrations
*   *Style:* Minimalist line art with "floating" spot colors (Teal for humans, Pink for pets).
*   *Context:* Illustrations for Lab Tests, Prescriptions, and Reminders should use the "breaking the container" technique—letting parts of the graphic bleed outside the rounded card boundaries to emphasize the asymmetrical, high-end look.
 
### Input Fields
*   Use surface-container-low for the input track.
*   *State Change:* On focus, the field should not gain a heavy border; instead, transition the background to surface-container-lowest and apply a "Ghost Border" at 20% opacity.
 
---
 
## 6. Do's and Don'ts
 
### Do
*   *DO* use whitespace as a functional tool. If the screen feels crowded, increase the spacing rather than adding a divider line.
*   *DO* use "Human" (Teal) and "Pet" (Pink) accents consistently to help users subconsciously categorize data.
*   *DO* utilize the full roundedness scale for selection chips and tags to contrast against the xl roundedness of main containers.
 
### Don't
*   *DON'T* use pure black (#000000) for text. Always use on-surface (#181c21) to maintain a soft, high-end look.
*   *DON'T* use standard Material Design elevation shadows. Stick to the Tonal Layering or Ambient Shadow rules defined in Section 4.
*   *DON'T* align everything to a rigid center. Use the asymmetrical "Clinical Curator" approach by offsetting images and text blocks to create visual interest.
# GridWatch implementation plan

## Product intent
GridWatch is a portfolio-quality, responsive presentation site for a student-level Data Science prototype that turns historical transformer operating data into decision-support outputs. It must be clear that the workflow complements existing SCADA, sensors, alarms, diagnostics, inspections, and engineering judgement.

## Design direction
- **Design movement:** Editorial industrial telemetry — a blend of Swiss information design and dark control-room instrumentation.
- **Core principles:** (1) evidence before assertion, (2) operational clarity, (3) cautious confidence, (4) progressive disclosure.
- **Color philosophy:** Near-black graphite creates a calm monitoring surface; warm paper panels add an academic/editorial feel; a single high-visibility signal-lime accent marks approved/active states; amber and coral are reserved for risk semantics, not decoration.
- **Layout paradigm:** A left-rail “field notebook” spine and offset content bands, with the main workflow running as a horizontal track on desktop and a readable stacked sequence on mobile. Avoid generic centered marketing cards.
- **Signature elements:** numbered phase markers, a thin luminous signal line, and a rotating “decision boundary” dial motif used as a non-data visual anchor.
- **Interaction philosophy:** Interactions reveal reasoning, not gimmicks: phase tabs filter context, a sample risk row expands its rationale, and the CTA makes the next approval explicit.
- **Animation:** restrained 160–300ms transitions; signal line draws on scroll, phase markers pulse only for the active phase, and risk bars fill once. Respect reduced-motion preferences.
- **Typography system:** IBM Plex Mono for labels/metadata; Space Grotesk for headings and body; oversized condensed-ish numeric accents via font-weight and tracking rather than display fonts.
- **Brand essence:** A transparent transformer-risk workbench for students, reviewers, and engineering-minded collaborators; **precise, grounded, inspectable**.
- **Brand voice:** Direct, careful, and non-hype. Example lines: “Turn operating history into a reviewable signal.” / “The model can prioritise attention; it cannot replace inspection.”
- **Wordmark & logo:** `GW` monogram formed by two offset vertical busbars joined by a short waveform bridge, paired with the GridWatch wordmark.
- **Signature brand color:** signal-lime `#d7ff57`.

## Implementation approach
- Use a lightweight static Vite app with semantic HTML, CSS, and vanilla TypeScript/JavaScript.
- Keep the page as a single scrollable narrative with anchored sections: overview, existing system/gap, workflow, methodology, sample outputs, boundaries, and next-phase gate.
- Include `public/manus-routes.json` for the single `/` route.
- Use only illustrative/sample records and explicitly label them as non-dataset values.
- No backend, database, authentication, or external data calls are required.

## Project structure
- `src/main.ts`: page markup, small interaction handlers, phase/risk data.
- `src/style.css`: design tokens, responsive layout, animations, accessibility.
- `index.html`: document shell, metadata, font loading.
- `public/manus-routes.json`: route manifest.
- `app.config.ts`: project logo metadata.
- `TODO.md`: acceptance outcomes.

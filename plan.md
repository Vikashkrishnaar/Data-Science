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
- `PHASE_1_DATASET_VALIDATION.md`: dataset-selection gate, validation protocol, target rules, leakage controls, and feature-engineering strategy.
- `PHASE_2_DATA_DICTIONARY_AND_MODEL_SPEC.md`: data dictionary contract, preprocessing, EDA, baseline-model protocol, and feature-engineering specification.
- `scripts/phase3_pipeline.py`: fixed-seed synthetic transformer-sensor generator, preprocessing, EDA plots, feature engineering, and baseline evaluation.
- `artifacts/phase3/`: generated synthetic data, processed features, EDA images, metrics, risk predictions, and Phase 3 execution report.
- `requirements-phase3.txt`: pinned Python dependencies for rerunning the Phase 3 pipeline.
- `scripts/phase4_explainability.py`: global feature importance, local reason codes, transparent health scoring, maintenance suggestions, and fleet prioritisation.
- `artifacts/phase4/`: explainability rankings, local factors, health assessment, maintenance recommendations, prioritisation outputs, plots, and Phase 4 report.
- `PHASE_5_COMPREHENSIVE_PROJECT_REPORT.md`: consolidated methodology, results, limitations, reproducibility notes, final dashboard scope, and TX-010 inspection detail.
- `data/real/uk_power_station_dga_2010_2015/`: real CC BY 4.0 UK power-station transformer DGA source archive, normalized long table, source metadata, quality summary, and validation outputs.
- `scripts/phase6_real_dataset_validation.py`: reproducible real-dataset normalization and validation pipeline.
- `data/real/uk_power_station_dga_2010_2015/validated/PHASE_6_REAL_DATASET_VALIDATION.md`: Phase 6 source, quality, licensing, and target-feasibility report.

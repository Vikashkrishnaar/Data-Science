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
- `scripts/phase7_real_model_pipeline.py`: real-data preprocessing, EDA, leakage-safe DGA feature engineering, and supervised-target approval gate.
- `artifacts/phase7_real/`: real feature table, gas/asset EDA summaries, plots, and the Phase 7 target decision record. Supervised train/test modelling is intentionally stopped until an authoritative target label is obtained.
- Phase 8 dashboard update: the final UI foregrounds verified real DGA coverage, gas-level distributions, 13-transformer asset coverage, 48 feature columns grouped by engineering purpose, and the open target gate. Synthetic model and explainability labs remain clearly marked optional demonstrations.
- Phase 9A research gate: eight real or clearly documented candidate datasets were compared across asset identity, timestamps, sensors, labels, event times, join keys, cadence, volume, missingness, provenance, licence, target feasibility, and leakage risk. No candidate supports a verified future transformer-failure target from the documented release alone; no download or modelling is approved yet. See `artifacts/phase9a/PHASE_9A_DATASET_SUITABILITY_COMPARISON.md` and `artifacts/phase9a/candidates/`.
- Phase 9B approved unsupervised/proxy path: scored 203,214 real UK DGA feature rows across 13 transformers with a fixed-seed Isolation Forest; produced a descriptive top-5% anomaly proxy, transformer summaries, monthly summaries, robust deviation reason codes, and a dashboard review layer. The proxy is not a failure label or probability.
- Phase 10 real anomaly methodology validation: audited trailing-feature leakage, added a time-safe earlier-70% / later-30% comparison, compared global Isolation Forest with transformer-specific median/MAD baselines, tested parameter and threshold sensitivity, validated temporal behaviour, reason codes, missingness, and sampling-gap effects, and added 8 reproducible unit tests. Findings: global Isolation Forest rankings were stable across tested parameters, but method rankings were materially sensitive and anomaly rates were strongly confounded by missingness and sparse sampling gaps. Human approval is required before any real condition indicator, health score, maintenance prioritisation, supervised modelling, or major dashboard redesign.
- Phase 11 implementation plan: reuse Phase 9B row-level anomaly scores/reason codes and Phase 10 transformer-specific robust deviations; compute a transparent retrospective DGA Condition Indicator from fleet-relative anomaly intensity, persistence, recency, transformer-specific deviation, and trend/change; keep data confidence as a separate interpretation control so missingness cannot inflate condition; assign prototype NORMAL/MONITOR/REVIEW/HIGH REVIEW bands and P1–P4 engineering-review priorities with confidence-based caps; generate conservative suggestions and transformer detail data; add reproducible CSV/PNG/report artifacts, boundary/edge-case tests, and a dedicated real DGA dashboard section while preserving the synthetic model lab as a separate evidence path.
- Phase 11 completed: `scripts/phase11_condition_assessment.py` generated a retrospective indicator for 13 real transformers and 203,214 scored rows, with 2 P1, 6 P2, and 5 P3 screening priorities; 11 assets have high confidence, one moderate, and TX-J is limited due to 40.27% missing-gas rows. Added 9 edge-case unit tests, CSV/PNG outputs, `PHASE_11_CONDITION_ASSESSMENT_REPORT.md`, and an interactive Phase 11 dashboard queue/detail view. Human approval remains required before supervised modelling, engineering validation, or autonomous action.

- Phase 12 completed: `scripts/phase12_robustness_validation.py` tested thresholds (1%, 2.5%, 5%, 7.5%, 10%), fixed-seed Isolation Forest parameter variants, robust MAD and within-transformer percentile alternatives, ranking/top-k stability, condition-weight/band/persistence/recency sensitivity, missingness, sampling-gap, and temporal robustness across 13 transformers and 203,214 real rows. Generated the required sensitivity tables, consensus screen, transformer robustness summary, charts, metadata, and `PHASE_12_ROBUSTNESS_VALIDATION_REPORT.md`; added 6 Phase 12 tests and reran the full 23-test suite. TX-I and TX-M remain consistently high screening across most runs; TX-J is insufficient-data/limited-confidence; seven assets are method-sensitive or uncertain. The dashboard now includes a restrained expandable Phase 12 validation section. Stop here pending human approval; no supervised failure prediction, RUL modelling, autonomous maintenance, or engineering diagnosis is authorized without a new authoritative labelled event dataset.

- Phase 13 completed: redesigned the dashboard as an evidence-first industrial review console. The real-data path now has filterable transformer/priority/band/confidence controls, a precomputed recent-anomaly activity chart, queue-to-detail interaction, and Phase 12 stability/consensus context. Synthetic outputs remain in a separately labelled model lab. The visual system is now dark navy with cyan signal accents, lime active states, amber review semantics, and coral high-review emphasis. Added `DASHBOARD_GUIDE.md`, `artifacts/phase13_dashboard/PHASE_13_FINAL_DASHBOARD_REPORT.md`, and `tests/test_phase13_dashboard_contract.py`. The target gate, no-fabricated-label rule, screening vocabulary, and engineering-review boundary remain explicit.

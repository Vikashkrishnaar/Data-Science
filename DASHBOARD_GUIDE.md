# GridWatch Dashboard Guide

## Purpose

GridWatch is a student-level Data Science prototype for transforming transformer DGA telemetry into an auditable screening workflow. It complements SCADA, condition-monitoring sensors, alarms, diagnostics, maintenance records, and professional engineering inspection. It is not a production utility system, automated controller, failure diagnosis, or replacement for engineering judgment.

## How to read the dashboard

1. **Start with Real UK DGA Data.** This is the evidence path: 13 transformers, 316,203 raw rows, and coverage from July 2010 to July 2015.
2. **Read the target gate before the models.** The validated real source has no failure, fault, health, maintenance-outcome, outage, or event label. Therefore no real failure probability is shown.
3. **Use the Engineering Review Queue.** Filter by transformer, priority, condition band, or confidence. Select a row to open the evidence-bound detail panel.
4. **Interpret the DGA Condition Indicator as a review indicator.** It combines anomaly intensity, persistence, recency, transformer-specific deviation, and trend/change. It does not estimate failure probability.
5. **Check robustness before certainty.** Phase 12 shows which findings persist across reasonable analytical choices and which are method-sensitive.
6. **Use the Synthetic Model Lab only as a demonstration.** Its metrics and risk snapshot are fixed-seed synthetic outputs and are not performance results for the real UK DGA assets.

## Evidence vocabulary

| Dashboard term | Meaning | Does not mean |
| --- | --- | --- |
| Anomaly Score | Unsupervised statistical deviation from observed patterns | Failure probability or physical diagnosis |
| Review Indicator | Transparent screening index for prioritising human attention | Health certification or alarm limit |
| High review | A project-defined analytical band | A utility protection threshold |
| Confidence | A data-quality interpretation control based on coverage/missingness | Model calibration |
| Method-sensitive | The ranking changes across reasonable configurations | Equipment is failing |
| Synthetic demonstration | Reproducible example of the intended supervised workflow | Evidence from the 13-transformer source |

## Review protocol

For a selected transformer, inspect the score, confidence, recent anomaly activity, longest run, last anomaly timing, component contributions, reason codes, and conservative suggestion together. Then compare the Phase 12 stability label. Confirm the underlying DGA history, sampling continuity, maintenance/oil-processing context, and qualified engineering interpretation before action.

## Scope boundary

The dashboard does not invent labels, sensor variables, probabilities, causal explanations, or production performance. **Never fabricate labels.** It does not initiate a model run or maintenance action. The approval checkpoint is deliberately explicit: a future supervised target requires an authoritative event table or a documented, approved engineering objective with leakage controls.

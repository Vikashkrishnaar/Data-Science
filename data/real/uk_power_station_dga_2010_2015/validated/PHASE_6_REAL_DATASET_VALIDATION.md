# Phase 6 — Real dataset validation

## Selected dataset

**UK Power Station Transformer Dissolved Gas Analysis Data (2010-2015)** is a real, publicly downloadable dataset published on Zenodo under **CC BY 4.0**. It contains dissolved-gas analysis records from 13 UK power-station transformers, with timestamps in UTC and gas concentrations in ppm. Source DOI: [10.5281/zenodo.5796243](https://doi.org/10.5281/zenodo.5796243).

The raw archive was downloaded from the Zenodo record and retained in this project under `data/real/uk_power_station_dga_2010_2015/`.

## Validation results

- Transformer files: **13**
- Raw rows: **316,203**
- Normalized non-null DGA measurements: **1,920,417**
- Date coverage: **2010-07-02T00:00:00 to 2015-07-09T14:00:00**
- Timestamp parse failures: **0**
- Duplicate timestamps across source files: **19**
- Gas families: **Acetylene, Carbon Dioxide, Carbon Monoxide, Ethane, Ethylene, Hydrogen, Methane, Oxygen, Water**
- Measurement units: **ppm**

## Important limitations

The dataset does **not** contain a failure-event, fault-label, health-index, load, current, voltage, or temperature field. Therefore the original provisional `failure_24h` target is **not supported** by this source as downloaded. Do not train a future-failure classifier by inventing labels.

The most defensible Phase 6 directions are: (1) DGA trend and anomaly analysis, (2) transformer-level comparison of gas behaviour, or (3) a fault/health classification task only if an authoritative external label table can be obtained and joined under a documented key.

Several files have phase-wise wide layouts and substantial missingness because a given file may record one phase at a time. The normalized long table preserves phase, gas, timestamp, and ppm while retaining only non-null measurements. It is stored as `normalized_dga_long.csv.gz` to keep the repository artifact size manageable; pandas can read it directly with `compression="gzip"`.

## Recommended approval gate

Approve this dataset for **real DGA condition-monitoring analysis**, not yet for the original 24-hour failure-prediction question. Before modelling, review the phase semantics, missingness mechanism, duplicate timestamps, sampling intervals, and the exact target definition with a domain supervisor.

## Attribution

Credit Zoë M. Lewis, James A. Wild, and Matthew Allcock; cite DOI `10.5281/zenodo.5796243`; retain the Zenodo CC BY 4.0 attribution and the source readme.

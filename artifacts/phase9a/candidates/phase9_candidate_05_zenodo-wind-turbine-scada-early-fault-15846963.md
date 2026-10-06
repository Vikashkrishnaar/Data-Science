# Phase 9A candidate review: Wind Turbine SCADA Data For Early Fault Detection

**Candidate ID:** `zenodo-wind-turbine-scada-early-fault-15846963`  
**Zenodo record:** [10.5281/zenodo.15846963](https://zenodo.org/records/15846963)  
**Review scope:** Metadata, the official dataset description, the companion paper, the authors' documentation/repository, and the published FAQ were reviewed. **The archive was not downloaded and no model was trained.**

## Review outcome

**This is a strong candidate for an event-based, sequence/transformer early-fault-detection benchmark, but not a clean asset-level failure-forecasting dataset.** The current Zenodo record documents 95 CSV sub-datasets from 36 turbines and three wind farms, with 10-minute SCADA observations, one year of training data per sub-dataset, a prediction section, timestamp-level operating-status labels, event-level anomaly labels, and event start/end metadata. Those ingredients support a future-target construction for retrospective early-warning evaluation.

The target must be defined against the published event metadata rather than treated as an exact physical failure-onset label. The anomaly start is an estimate, especially for Wind Farm A, and the event end is defined as the start of the turbine fault in the companion paper. The record also warns that the current data release has unreliable per-timestamp `Min`, `Max`, and `Std` statistics; average signals are the safer starting point. Missing-value rates are not published, and zero values in Wind Farms B and C are used in place of missing values, so the exact missingness burden remains **unknown without file-level inspection**.

## 1. Transformer / asset identity

**Confirmed:** The primary asset is a **wind turbine**, not an electrical transformer. The dataset covers **36 turbines**: 5 in Wind Farm A, 9 in Wind Farm B, and 22 in Wind Farm C. The paper describes 95 sub-datasets: 22 from A, 15 from B, and 58 from C. [2] [3]

Each row has an `asset_id`, and the authors state that randomized asset IDs were assigned so that datasets belonging to the same turbine can still be linked. The repository loader also groups event records by `wind_farm` and `asset_id`. [3] [5]

**Not confirmed / not available:** There is no published stable transformer identifier, transformer serial number, turbine manufacturer/type, or physical location. Wind Farm B and C information was anonymized, including original turbine names, turbine type, and location. Some event descriptions refer to transformer-related faults, but that does not create a separate transformer asset key. [3]

**Implication:** Use `asset_id` as a randomized turbine-level key. Do not represent this candidate as a transformer dataset or assume transformer-specific identity is available.

## 2. Timestamp availability and time coverage

**Confirmed:** Each CSV contains a timestamp column. The paper identifies the descriptive fields as a row ID, timestamp, asset ID, `train_test`, and timestamp-level status ID. The repository loader supports `time_stamp` as the time index and matches it to event metadata. [3] [5] [7]

Each sub-dataset contains approximately one year of training data and **4–98 days of prediction data**. The aggregate description states **89 years of SCADA time series** across all 95 sub-datasets; this is aggregate coverage, not 89 continuous years for one turbine. [1] [3]

Timestamps were anonymized by shifting each dataset by a random number of years. This preserves within-file seasonal structure but distorts the chronological order between datasets. The FAQ further warns that different event files can have overlapping timestamp ranges and that the true chronology of events for one asset generally cannot be reconstructed. [3] [4]

**Unknown:** The official sources do not provide one global minimum/maximum date or a verified continuous coverage interval for every asset. The current release notes say the timestamp procedure was revised so each sub-dataset starts in 2022 and that an earlier duplicate-timestamp issue was fixed, but this does not restore real-world calendar time or cross-file ordering. [1]

## 3. Sensor measurements and variables

**Confirmed:** Feature dimensionality varies by wind farm:

- **Wind Farm A:** 86 total features, including 54 sensor features.
- **Wind Farm B:** 257 total features, including 63 sensor features.
- **Wind Farm C:** 957 total features, including 238 sensor features.

The remaining five descriptive fields are the row ID, timestamp, asset ID, `train_test`, and status ID. [3]

For each sensor, a **10-minute average** is available. Some sensors additionally provide 10-minute minimum, maximum, and standard-deviation summaries. The original physical names were mostly replaced for anonymization. Names that remain semantically recognizable include groups such as `power`, `reactive_power`, and `wind_speed`; feature descriptions also identify units and whether a signal is a regular sensor, counter, or angle. [3]

The published documentation identifies practical signal issues. Pitch-angle values in Wind Farm A can be ambiguous because of angle wrapping. The current Zenodo notes also list specific sensor groups with unreliable statistics, including constant-zero summary statistics for some Wind Farm B sensors and varying contamination across Wind Farm C. [1]

**Recommended variable set for an initial benchmark:** timestamp, `asset_id`, `train_test`, the average-valued sensor channels, and carefully selected feature metadata. Treat `status_type_id`, `event_label`, `event_start`, and `event_end` as labels/metadata, not model inputs. Avoid using `Min`, `Max`, and `Std` by default, particularly in Wind Farm B.

## 4. Failure, fault, and event labels

**Confirmed:** There are two distinct label levels.

1. **Event-level `event_label`:** whether the prediction section of a sub-dataset contains an anomalous event. The normal/anomaly label is the main retrospective benchmark target.
2. **Timestamp-level `status_type_id`:** the recorded or derived operating state of the turbine at each timestamp.

The status categories are documented as follows: 0 = normal operation without limitations; 1 = derated power generation; 2 = idling; 3 = service mode; 4 = down due to fault or other reasons; and 5 = other operational states such as system test, setup, ice build-up, or emergency power. The paper treats 0 and 2 as normal and the other categories as non-normal, with wind-farm-specific qualifications. [3] [4]

For Wind Farms B and C, timestamp status labels come from operator-provided operating modes combined with service-report information. For Wind Farm A, they were derived from the EDP fault logbook. In A, the preceding 14 days were marked status 4 and the following three days status 3 around a logged fault. The Zenodo page specifically says A's status labels should be ignored for prediction-time error-event evaluation and used mainly to filter training data. [1] [3]

**Release-count discrepancy that must be recorded:** The current Zenodo record says **45 of 95** sub-datasets contain a labeled anomaly event and **50** are normal. The companion paper and arXiv version describe the earlier release as **44 anomaly and 51 normal**. The Zenodo version notes explain a later correction: event 51 was changed from normal to anomaly after status labels were added, and other status-label corrections were made. For this candidate's specified current record, use **45/50**, not the earlier paper count, while retaining the discrepancy in provenance notes. [1] [2] [3]

## 5. Event timestamps

**Confirmed:** Event metadata includes at least `event_id`, `asset_id`, `wind_farm`, `event_label`, `event_start`, and `event_end`; the authors' loader and guide use these fields to join event metadata to CSV data. [4] [5] [7]

The paper's benchmark definition states that every anomaly has an assigned start timestamp and that the anomaly end is the start of the turbine fault. The event window is therefore a retrospective estimated pre-fault interval, not necessarily the exact first instant of physical degradation. [2] [3]

Event-start quality differs by source:

- **Wind Farm A:** The EDP fault logbook supplies fault-start timestamps, but not the true duration or onset of the preceding anomaly. The authors used analysis before each fault to estimate the event start; the true start may differ.
- **Wind Farms B and C:** Event starts were defined using data analysis, operator feedback, service reports, and expert knowledge. The paper says the defined start is unlikely to be too early; it may be later than the true onset.

The FAQ also notes that an anomalous event can contain `status_type_id = 0`, because the turbine may still have been considered operationally normal during the retrospectively defined pre-fault window. [3] [4]

## 6. Join keys and file structure

**Confirmed:** Each sub-dataset is a CSV with columns as features and rows as time-series observations. The authors' loader expects a directory containing `Wind Farm A`, `Wind Farm B`, and `Wind Farm C` and loads event metadata separately. It supports event-level access by `event_id`, grouping by `asset_id`, and row indexing by either `id` or `time_stamp`. [1] [5]

The practical join hierarchy is:

- `event_info.event_id` ↔ the sub-dataset/event CSV selected by event ID;
- `asset_id` ↔ the turbine identity shared by multiple sub-datasets/events;
- `wind_farm` ↔ the farm partition;
- row `id` or `time_stamp` ↔ observations within a CSV;
- `train_test` ↔ `train` versus `prediction` rows.

**Important join limitation:** Timestamp is not a safe global join key across event files. Anonymization can produce overlapping timestamp ranges, and chronological order across files is not preserved. Use event ID and randomized asset ID for structural joins, and treat timestamps as within-file sequence coordinates unless the analysis explicitly accepts the anonymization. [4] [7]

**Unknown:** The public text does not state a single universal naming convention for every CSV/event file or publish a complete file manifest in the HTML. The current Zenodo record contains one archive, `CARE_To_Compare.zip`; the exact per-file row counts and full column inventories were not verified because the archive was not downloaded. [6]

## 7. Sampling frequency

**Confirmed:** The SCADA resolution is **10 minutes**. This is suitable for fixed-step sequence windows, provided the implementation checks for duplicated or missing time steps within each file and does not assume that all timestamps form a globally ordered panel. [3]

Each sub-dataset was selected to include a full year of training data so that seasonal effects can be learned, followed by 4–98 days of prediction data. [2] [3]

## 8. Data volume

**Confirmed:** The current Zenodo record exposes a single `CARE_To_Compare.zip` archive with a metadata-reported size of **5,503,439,673 bytes** (approximately 5.50 GB decimal, or 5.13 GiB). The repository loader describes the downloaded archive as roughly 5 GB and the unzipped dataset as roughly 20 GB. [5] [6]

The dataset contains 95 CSV sub-datasets and associated documentation/metadata, 89 aggregate years of 10-minute time series, 36 turbines, and 45 current-release anomaly-labelled sub-datasets plus 50 normal sub-datasets. [1] [3]

As a rough scale check only, 89 complete years at 6 samples/hour would be about **4.68 million timestamp rows** before considering whether the published aggregate includes gaps or the exact prediction-window accounting. This is a derived estimate, not a published row count.

**Unknown:** Exact row counts, per-file byte counts after extraction, and the precise number of non-null cells were not verified without downloading the archive.

## 9. Missingness and data quality

**Confirmed:** Wind Farms B and C were supplied with **0 values replacing missing values**. Long runs of zeroes therefore cannot automatically be interpreted as true zero output or a functioning sensor. The paper recommends checking this carefully. [3]

The data is not fully preprocessed. The FAQ lists missing-value handling, invalid-measurement filtering, feature selection, angle transformation, and scaling as possible required preprocessing steps. [4] [7]

The current Zenodo release adds a detailed warning that per-timestamp `Min`, `Max`, and `Std` statistics contain implausible values across farms. The authors say these values were provided as-is apart from anonymization scaling/feature renaming, and that average measurements are generally more plausible. In Wind Farm B, many summary statistics are affected on more than 50% of datapoints and can be close to 100% for some signals; the release recommends average signals only for most analyses. [1]

**Unknown:** No authoritative overall missingness percentage, per-column missingness rate, zero-as-missing rate, or complete-case rate is published in the sources reviewed. Do not report a numeric missingness rate unless it is computed from the downloaded files in a separate data-audit phase.

## 10. Provenance

**Confirmed:** The Zenodo record names Christian Gück and Cyriana Roelofs as creators and affiliates them with the **Fraunhofer Institute for Energy Economics and Energy System Technology (Fraunhofer IEE)**. The companion paper is by Gück, Roelofs, and Stefan Faulstich. [1] [2]

Wind Farm A is based on the **EDP open-data platform** and consists of five turbines from an onshore wind farm in Portugal. The dataset includes SCADA data and information derived from an EDP fault logbook. Wind Farms B and C are offshore wind farms in Germany, with operator-provided data and confidentiality-driven anonymization. [1] [3]

The authors' EnergyFaultDetector repository is an original supporting implementation. It documents CARE2Compare loading, event metadata, normal-operation masks, and CARE evaluation, and its background states that the software originated with the Fraunhofer IEE AEFDI research team. [5] [7]

**Provenance limitation:** The public release does not expose the real names, locations, turbine types, or original sensor names for the anonymized farms. The data is therefore reproducible as a benchmark but limited for physical interpretation and external asset matching.

## 11. Licence

**Confirmed for the specified Zenodo record:** Zenodo API metadata identifies the archive as **Creative Commons Attribution-ShareAlike 4.0 International (`CC BY-SA 4.0`)**. The release is therefore usable subject to attribution and ShareAlike obligations. [6]

The companion MDPI article is separately published under **CC BY 4.0**; that article licence should not be substituted for the dataset archive licence. [2]

## 12. Can a future target be constructed without leakage?

**Yes, conditionally:** A future target can be constructed for a **retrospective early-warning benchmark** because the current record provides:

- a `train_test` separation between one-year training data and prediction data;
- event-level anomaly/normal labels;
- event start and end timestamps in event metadata;
- timestamp-level status information for training-data filtering and, with qualifications, evaluation;
- a fixed 10-minute sampling grid.

A defensible target is either:

1. **Timestamp-level early-warning target:** for anomaly-labelled events, mark timestamps in the published `event_start`–`event_end` window as positive, with the exact status-based evaluation rule chosen per farm; or
2. **Event-level target:** predict whether the prediction section contains an anomaly (`event_label`) and evaluate detection before the documented fault boundary using CARE-style coverage, accuracy, reliability, and earliness.

The target is **not** an exact future-failure target in the industrial reliability sense. Event starts are estimated and anonymized, and the release does not provide a universal physical failure timestamp for every event. For Wind Farm A, the source logbook gives fault starts but not the true anomaly onset. Therefore report the target as “published retrospective anomaly-window / event-label prediction,” not “time-to-failure” or “exact fault onset forecasting.”

### Leakage controls required

- Use the supplied `train_test` split and do not randomly mix training and prediction rows.
- Exclude `event_label`, `event_start`, `event_end`, fault descriptions, and event metadata from model inputs.
- Use `status_type_id` only for the documented purpose of filtering normal training data, unless a separate experiment explicitly studies status prediction. Feeding it as a feature can reveal operational states that are downstream of or close to the fault.
- Split by event and preferably by `asset_id` or wind farm for generalization tests. Multiple event datasets can share the same turbine; a random row or random event split can leak turbine-specific behavior.
- Do not use cross-file timestamp ordering as a future/past split. Timestamps were anonymized per dataset and can overlap across files.
- Check for duplicated or near-duplicated observations within an asset/event collection before constructing sequence windows.
- Keep all preprocessing fit within the training portion. This is especially important for imputation, scaling, feature filtering, and any zero-as-missing logic.
- For Wind Farm A, do not use status labels as if they were operator-recorded prediction-time ground truth; the Zenodo record says they are primarily training filters for that farm. [1] [3] [4] [7]

## 13. Limitations and recommended use

### Limitations

1. **Small number of independent events:** 45 current-release anomaly-labelled sub-datasets across 36 turbines is valuable for a public benchmark but too small for broad claims about failure probabilities or rare-fault incidence.
2. **Event onset uncertainty:** Event starts are retrospectively estimated, especially for Wind Farm A. They should not be interpreted as exact physical degradation onset.
3. **Anonymization:** Wind Farms B and C lack original turbine identity, location, turbine type, and original sensor names. Cross-site physical interpretation and direct transfer to a named fleet are limited.
4. **Non-global chronology:** Timestamp shifts preserve within-file seasonality but destroy real cross-file ordering; overlaps between event files are expected.
5. **Missingness ambiguity:** In B and C, zero can mean missing rather than a genuine measurement. A numeric missingness rate is not published.
6. **Unreliable summary statistics:** `Min`, `Max`, and `Std` can be physically implausible, particularly in B. Average channels are generally safer, but still require validation.
7. **Farm-specific labels:** `status_type_id` does not have exactly the same provenance or evaluation meaning in A versus B/C. Anomalous windows can contain status 0.
8. **Release drift:** The current 45/50 balance differs from the 44/51 balance in the paper because later release corrections changed labels. Analyses must pin the Zenodo record/DOI and release notes.
9. **Archive size:** The current archive is about 5.5 GB compressed and about 20 GB according to the loader documentation after extraction, which may be material for constrained environments.

### Recommended use

- Use it as a **sequence-model benchmark for early anomaly detection before a documented turbine fault**, comparing models with event-level and time-to-warning metrics.
- Start with farm-specific models or carefully designed cross-farm transfer experiments. Keep asset-aware and event-aware splits explicit.
- Prefer average-valued sensor channels, particularly in Wind Farm B. Add `Min`, `Max`, and `Std` only after feature-specific plausibility checks.
- Preserve the 10-minute cadence inside each file, explicitly detect gaps/duplicates, and document any resampling.
- Treat `status_type_id` as a training normality mask, with the Wind Farm A exception. Follow the CARE-style distinction between operator-known non-normal states and retrospectively defined pre-fault anomalies.
- Report results separately by wind farm and, where possible, by fault/event type. Do not pool all 95 datasets and present one number without an asset/event-aware uncertainty analysis.
- Use the published CARE evaluation concepts when benchmarking early-warning performance, but pin the dataset release and package version because the exact original benchmark implementation is not guaranteed to match later repository versions. [4] [7]

**Bottom line:** **Accept as a Phase 9A candidate for retrospective early-fault/anomaly sequence modeling, with a qualified target.** It has the required labels and event timing for a future target, but the target is an anonymized, estimated anomaly window leading to a documented fault—not a clean exact-failure horizon. The main gating work before modeling is a file-level audit of row counts, timestamp regularity, zero-as-missing patterns, and feature validity; that audit was intentionally not performed here because the task prohibited downloading the data.

## References

[1]: https://zenodo.org/records/15846963 "Wind Turbine SCADA Data For Early Fault Detection — current Zenodo record"

[2]: https://www.mdpi.com/2306-5729/9/12/138 "CARE to Compare: A Real-World Benchmark Dataset for Early Fault Detection in Wind Turbine Data"

[3]: https://arxiv.org/html/2404.10320v2 "CARE to Compare — open paper version, dataset, labeling, and anonymization sections"

[4]: https://aefdi.github.io/EnergyFaultDetector/care2compare_faq.html "CARE2Compare FAQ — label semantics, preprocessing, evaluation, and timestamp caveats"

[5]: https://raw.githubusercontent.com/AEFDI/EnergyFaultDetector/main/energy_fault_detector/evaluation/care2compare.py "EnergyFaultDetector CARE2Compare loader source"

[6]: https://zenodo.org/api/records/15846963 "Zenodo API metadata for record 15846963, including licence and archive size"

[7]: https://aefdi.github.io/EnergyFaultDetector/care2compare_guide.html "EnergyFaultDetector CARE2Compare guide"

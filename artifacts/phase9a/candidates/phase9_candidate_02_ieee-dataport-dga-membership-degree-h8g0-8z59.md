# Phase 9A candidate review: dissolved-gas data in transformer oil

**Candidate ID:** `ieee-dataport-dga-membership-degree-h8g0-8z59`  
**Dataset name:** Dissolved gas data in transformer oil---Fault Diagnosis of Power Transformers with Membership Degree  
**DOI:** [10.21227/h8g0-8z59](https://doi.org/10.21227/h8g0-8z59)  
**Review scope:** This review evaluates the cited record and its original documentation only. No dataset files were downloaded and no model was trained.

## Decision-relevant finding

This is a **small, curated, cross-sectional DGA classification dataset**, not a longitudinal asset-monitoring dataset. The matching original paper describes a 60-instance reference dataset with six fault classes and ten instances per class. Each instance has five dissolved-gas concentrations: H2, CH4, C2H6, C2H4, and C2H2, in µL/L. The IEEE DataPort abstract confirms the same five gases and says that the data are from transformers in a fault state with corresponding fault types, but the DataPort metadata does not itself state the row count, asset count, timestamps, sampling interval, or missingness statistics [1] [2] [3].

A supervised target for **retrospective fault-type classification** is therefore present. A leakage-safe **future-fault, failure-time, remaining-life, or event-forecasting target cannot be constructed from the documented record** because per-observation timestamps, event times, asset identifiers, and repeated pre-fault histories are not documented. Do not treat the six labels as future targets.

## Evidence and certainty

The IEEE DataPort page identifies Enwen Li as the creator and describes DGA data in the fault state of the transformer with the corresponding fault type [1]. DataCite independently registers the DOI, title, creator, IEEE DataPort as publisher, issue date 2019-01-14, dataset resource type, and a Creative Commons Attribution 4.0 rights entry [2].

The original IEEE Access paper is the strongest source for the dataset's content and construction. It states that more than 2,000 DGA records were collected from published literature, screened to 60 records, and organized as six classes of ten instances each. It lists the five gas attributes and the six classes: low-, middle-, and high-temperature faults, plus partial, spark, and arc discharges [3]. The paper also distinguishes this 60-record reference set from a separate 201-case collection used for evaluation; those figures must not be conflated with the DataPort file count.

## 1. Transformer/asset identity

**Confirmed:** The DataPort abstract places the observations in oil-paper insulation systems of oil-immersed/oil-filled power transformers and describes them as being in a fault state [1]. The paper's source discussion includes field cases, laboratory-simulated faults, the IEC TC 10 database, a Chinese power-industry-standard appendix, and cases from a State Grid book [3].

**Unknown:** No per-row transformer ID, asset/serial identifier, site, manufacturer, rated power, voltage class, age, or geographic location is documented in the DataPort metadata or the paper's description of the 60-record reference set. The number of distinct transformers/assets is therefore **unknown**. The paper's four source collections cover heterogeneous equipment and case contexts; they should not be assumed to represent 60 independent transformers.

**Implication:** Asset-level holdout, cross-transformer generalization, and asset-specific temporal analysis cannot be verified. A row index must not be treated as an asset key.

## 2. Timestamp availability

**Confirmed:** The dataset record and DOI metadata contain publication/record dates, including 2019-01-14, but these are metadata dates, not measurement timestamps [1] [2].

**Unknown/not documented:** No observation-time column, sample date, commissioning date, or regular time index is described for the 60-record DataPort dataset. The paper gives a dated illustrative source case in which DGA changed between 2011-07-21 and 2011-07-27, but that example does not establish that all 60 reference rows carry dates or belong to a common time series [3].

## 3. Sensor measurements

**Confirmed:** Each DGA instance has five dissolved-gas concentration attributes: **H2, CH4, C2H6, C2H4, and C2H2**, with units reported as µL/L (equivalent to ppm by volume in the paper's notation) [1] [2] [3]. The paper also describes derived gas proportions used during screening, including H2 relative to H2 plus hydrocarbons and each hydrocarbon relative to total hydrocarbons [3].

**Unknown/not documented:** The DataPort record does not specify instrument/vendor, sampling method, laboratory protocol, detection limits, calibration, uncertainty, oil temperature/pressure correction, sensor serial number, or whether values are online sensor readings or laboratory DGA results. The source paper describes DGA records gathered from literature, not a common sensor campaign [3].

## 4. Failure/fault/event labels

**Confirmed:** The matching paper documents six known fault classes, balanced at ten reference instances per class: partial discharge, spark discharge, arc discharge, low-temperature overheating, middle-temperature overheating, and high-temperature overheating [3]. In the paper's shorthand these are PD, D1, D2, T1, T2, and T3; it notes that some source data did not separate T1 and T2 [3]. The DataPort abstract independently confirms that corresponding fault types are included [1] [2].

**Caveat:** These are retrospective diagnostic/fault-state labels. They are not documented as labels for a future event horizon, failure onset, alarm time, or failure severity trajectory. The paper also discusses a separate 201-case evaluation set; its class composition and labeling conventions should not be silently substituted for the 60-record DataPort candidate [3].

## 5. Event timestamps

**Unknown/not documented:** No event/failure onset timestamp, inspection timestamp, trip date, alarm time, or label-effective time is documented for the 60-record dataset. The one dated example in the original article is source-case context, not a documented schema guarantee [3]. Consequently, event-to-measurement lag and whether a measurement precedes or follows failure are unavailable.

## 6. Join keys

**Unknown/not documented:** No stable row ID, transformer ID, case ID, source-document ID, or timestamp key is exposed in the DataPort description or DOI metadata [1] [2]. The five gas values plus fault label are not a reliable relational key. Joining to external maintenance, weather, load, or asset data cannot be performed reproducibly from the documented record alone.

## 7. Sampling frequency

**Unknown/not applicable as a documented time-series field:** The sources describe selected DGA observations assembled from literature rather than a regularly sampled sensor stream [3]. No sampling interval, reporting cadence, asynchronous-channel timing, or aggregation window is reported. DGA values should be treated as individual observations unless the actual file documentation proves otherwise.

## 8. Data volume

**Confirmed at paper level:** The original paper defines a reference dataset X with **60 instances**, comprising **six classes × ten instances** [3]. This is the only authoritative row count located for the matching reference dataset. The IEEE DataPort page and DataCite record do not repeat the count, and no file was downloaded for this review; therefore, 60 should be recorded as the paper-level count rather than as an independently verified file-row count [1] [2].

**Do not conflate counts:** The paper says that the source material contained more than 2,000 DGA records and describes a separate 201-case collection from four source families. Those numbers refer to the literature pool and evaluation data, not necessarily to the DataPort file [3].

## 9. Missingness

**Unknown:** Neither the DataPort record nor the DOI metadata reports null counts, detection-limit handling, censored values, invalid readings, or missingness by gas [1] [2]. The paper does not provide a missingness audit for the 60-record reference set. Some related DGA tables in the paper use “ND” (no detection) in the broader 201-case material, but this does not establish that the 60 candidate rows contain, or do not contain, such values [3]. Do not infer that zeros are valid concentrations or missing values without inspecting the file documentation and raw encoding.

## 10. Provenance

**Confirmed:** The record is attributed to Enwen Li and published by IEEE DataPort under DOI 10.21227/h8g0-8z59 [1] [2]. The original article is by Enwen Li, Linong Wang, and Bin Song and explains that the 60 records were selected from more than 2,000 DGA records found in publicly published literature. Screening involved fault grouping, gas-proportion calculations, and iterative removal of observations more than two standard deviations from class means [3].

The paper identifies four source families for the broader material: 117 IEC TC 10 field cases with faults identified by visual inspection; 39 laboratory-simulated fault cases; 17 cases in the Chinese DL/T722-2014 appendix; and 28 field cases from a State Grid case book, totaling 201 [3]. This supports a literature-compiled, heterogeneous provenance rather than a single controlled measurement campaign.

A public GitHub repository references the exact DOI but is a third-party mirror/curation source, not the canonical record; its README also describes combining DGA data from multiple literature sources [6]. It should not override the IEEE DataPort or original-paper metadata.

## 11. Licence

**Confirmed:** DataCite records **Creative Commons Attribution 4.0** for this DOI, with a link to the CC BY 4.0 deed [2]. CC BY 4.0 permits sharing and adaptation, including commercially, provided appropriate credit, a license link, and an indication of changes are supplied; it provides no-warranty and other-rights notices [5]. IEEE DataPort's terms also state that uploaded content is generally made available under CC-BY unless otherwise specifically permitted, and users remain responsible for checking the licensing obligations of the particular content [4].

Use the dataset citation/DOI and preserve attribution. The CC BY statement does not guarantee that every third-party source record embedded in the compiled dataset has no additional rights or ethical restrictions; provenance and source-document rights should be checked before redistribution of a repackaged derivative.

## 12. Whether a future target can be constructed without leakage

**Retrospective classification target: feasible, with caveats.** A row-level target such as `fault_type ∈ {PD, D1, D2, T1, T2, T3}` is documented. It is suitable for a small cross-sectional benchmark if the task is explicitly “classify a labelled fault-state DGA observation.”

**Future/prognostic target: not feasible from the documented record.** A target such as “fault in the next 7/30/90 days,” “time to failure,” “fault onset,” “next inspection label,” or “gas growth before failure” requires event times, observation times, asset IDs, and repeated histories. Those fields are not documented. The dated example in the paper is insufficient to construct such a target for the candidate as a whole [3]. Do not impute event times from the 2019 publication date or from the source-book years.

**Leakage controls required even for classification:**

- The six-class 10-per-class balance is a curated selection outcome, not an operational prevalence estimate. Random row splits can overstate performance.
- The screening procedure used fault classes and class statistics before the 60-record reference set was finalized. Any preprocessing, feature selection, normalization, or prototype construction based on all 60 rows must be recomputed inside training folds.
- Mixed literature sources and undocumented case/asset identifiers make duplicate or related observations across splits impossible to rule out. Grouped splitting by source, case, or transformer would be preferable, but those keys are not available.
- The paper's membership-degree method constructs a reference fault set from the selected data. Reusing that reference set or any paper-derived centroids in test evaluation is leakage unless it is fit only on the training partition.
- A class label is contemporaneous/retrospective fault diagnosis, not an early-warning outcome. Calling it “future failure” would be unsupported.

## 13. Limitations and recommended use

### Limitations

The dataset is very small (paper-level count 60), artificially balanced, and curated through class-aware statistical screening. It is therefore vulnerable to selection bias, optimistic class separability, and poor calibration to real-world fault prevalence. The source records were assembled from heterogeneous published cases, with no common instrument protocol or documented measurement uncertainty. Per-row asset identity, source/case key, observation time, event time, cadence, missingness, and maintenance context are not documented. The labels distinguish fault categories, but the paper notes ambiguity and overlap between neighboring fault types and source-dependent differences such as T1/T2 separation [3].

The record should not be represented as a fleet-scale dataset, a sensor time series, a failure-history dataset, or a basis for remaining-useful-life modeling. The 201-case evaluation material discussed in the paper is not evidence that the DataPort candidate contains 201 rows [3].

### Recommended use

Use it for **method replication, educational examples, and carefully labeled cross-sectional DGA fault-classification benchmarks**. Report the six classes, the paper-level 60-instance count, the curated 10-per-class balance, and the literature-compiled provenance. Prefer leave-one-source-out or other grouped evaluation if source/case identifiers can be recovered from the original documentation; otherwise state that independent-asset generalization cannot be established.

Do not use this record alone for future-fault prediction, event-time prediction, early-warning lead-time claims, failure-rate estimation, asset-level generalization, maintenance scheduling, or RUL estimation. A suitable future-target study would need a separate longitudinal dataset with stable transformer IDs, observation timestamps, repeated DGA measurements, explicit event/failure timestamps, and documented missingness and measurement protocols.

## References

[1]: https://ieee-dataport.org/documents/dissolved-gas-data-transformer-oil-fault-diagnosis-power-transformers-membership-degree "IEEE DataPort record: Dissolved gas data in transformer oil—Fault Diagnosis of Power Transformers with Membership Degree"

[2]: https://api.datacite.org/dois/10.21227/h8g0-8z59 "DataCite metadata for DOI 10.21227/h8g0-8z59"

[3]: https://ieeexplore.ieee.org/document/8654646 "Fault Diagnosis of Power Transformers With Membership Degree, IEEE Access"

[4]: https://ieee-dataport.org/ieee-dataport-terms-use "IEEE DataPort Terms of Use"

[5]: https://creativecommons.org/licenses/by/4.0/ "Creative Commons Attribution 4.0 International"

[6]: https://github.com/alan-456/transformer-fault-dataset "Third-party GitHub repository referencing the IEEE DataPort DGA dataset"

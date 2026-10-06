# Phase 9A candidate review: Power transformer data for fault diagnosis

**Candidate ID:** `mendeley-power-transformer-fault-diagnosis-98f4z3f8tx`  
**Review status:** **Conditional candidate for cross-sectional DGA diagnosis research; not verified as a leakage-safe future-failure dataset.**  
**Scope:** This review evaluates the published metadata and the authors' original documentation. The candidate CSV was **not downloaded or inspected**, and no model was trained.

## Identity and provenance

The authoritative repository record is **Power transformer data for fault diagnosis**, Mendeley Data DOI `10.17632/98f4z3f8tx.2`, version 2, published 9 February 2026. The record credits Juan José Montero Jiménez and Gustavo Adolfo Gómez-Ramírez of Tecnológico de Costa Rica and describes oil-gas analysis from real transformers over multiple years of service. [1] [2] DataCite independently confirms the title, contributors, publisher, DOI, publication year, subjects, and CC BY 4.0 rights statement. [3]

The public Mendeley API exposes one version-2 file, `Base_de_Datos_Eng_5_2_2026_V1.csv`, with content type `text/csv`, status `COMPLETED`, and a published size of **395,917 bytes**. The older version 1 has one CSV, `PowerTransformersData.csv`, of **295,649 bytes**. These are repository file sizes, not observation counts. The API reports no file description, custom metadata, linked article, or row count. [2] The Mendeley landing page's ordinary rendering also exposes no file listing or schema; the API response with `fields=*` is needed to see the file-level metadata. [1] [7]

The original Costa Rica paper gives the key provenance details. It says the data are physical dissolved-gas-analysis (DGA) records from **107 power transformers** installed in different Central American electricity networks over several years. The records were supplied for academic purposes, anonymized, and digitized from real oil-test reports into a historical database. The company name, sampling year, and transformer brand were anonymized because the authors considered them unnecessary for diagnosis. [4] [5]

## Field-by-field assessment

### 1. Transformer/asset identity — **Partly confirmed; stable key unknown**

**Confirmed:** The source study concerns real power transformers and reports records from 107 transformers. [4] [5]  
**Unknown:** The released file schema does not document whether each record retains a stable, pseudonymous transformer identifier. The anonymization of company, sampling year, and brand removes useful asset context, and the Mendeley metadata does not expose an asset-ID field. Do not assume that a row number, filename, or diagnosis label is an asset key.

**Implication:** The dataset can support a transformer-level count as reported by the paper, but asset-level longitudinal grouping cannot be accepted until a stable ID and its semantics are verified from the file or an author-provided data dictionary.

### 2. Timestamp availability — **Not verified and likely unavailable in the release**

The Mendeley record contains publication and file-creation dates, but those are repository metadata, not measurement timestamps. The original paper explicitly says that the **sampling year was anonymized**. It does not provide sampling dates, dates at any stated resolution, or a usable time index. [2] [5]

Therefore, timestamp availability for observations is **unknown in the CSV and not supported by the published documentation**; exact dates should be treated as absent unless the authors confirm otherwise. The repository publication date must not be used as a measurement date.

### 3. Sensor measurements — **Confirmed as laboratory DGA variables; not a continuous sensor stream**

The paper identifies the input measurements as dissolved-gas concentrations from insulating oil: **hydrogen (H2), acetylene (C2H2), ethylene (C2H4), ethane (C2H6), and methane (CH4)**. It describes these values as the inputs used for the diagnostic methods and discusses ppm for the gas calculations. [5]

These are historical oil-sample/laboratory DGA measurements, not high-frequency telemetry. No continuous sensor channel, operating load, temperature, electrical-test, dielectric, or maintenance variable is documented. The authors explicitly list the absence of complementary electrical tests, dielectric parameters, and maintenance histories as a limitation. [5]

### 4. Failure/fault/event labels — **Diagnostic labels confirmed; ground-truth failure outcomes not confirmed**

The original paper says the data include diagnosis outputs calculated using **Rogers, Dornenburg, Duval Triangle, and the IEC dissolved-gas-ratio method**. The paper unifies several method-specific names into labels including **UF (Sin Falla/no fault), T1, T2, T3, D1, D2, DT, and PD**. [5]

The paper's label-frequency table lists UF, T1, T2, T3, D1, D2, DT, PD, and a column rendered as “Descomposición Térmica,” with reported counts of 5,364, 628, 476, 704, 110, 94, 26, 4, and 36 respectively. These are reported label frequencies or label assignments, **not a confirmed row count**; the paper does not explain the apparent extra category or state whether counts are aggregated across diagnostic methods. [5]

These are **rule-/method-derived diagnostic classifications from DGA**, not independently verified failure events, repair records, trips, or failure-free survival labels. In particular, “UF” is a diagnostic category, not proof that an asset never failed.

### 5. Event timestamps — **Unknown/not documented**

No failure, fault, maintenance, trip, replacement, or alarm event timestamp is supplied in the Mendeley metadata or described in the paper. Because the sampling year was anonymized and event histories are not reported, there is no documented way to establish an event time or an observation-to-event horizon. [2] [5]

### 6. Join keys — **Unknown**

No documented join key links a DGA record to a transformer, site, company, sample, maintenance event, or time period. The paper's statement that records cover 107 transformers does not establish that the released rows can be grouped by transformer. A stable transformer ID, sample ID, or documented composite key must be verified before joining to any external asset or event table.

### 7. Sampling frequency — **Unknown; likely irregular historical sampling, but do not infer a rate**

The description says the records span multiple years of service, and the paper calls them a historical database of oil-test reports. Neither source specifies an interval, cadence, clock resolution, or sampling policy. The data should not be represented as regularly sampled time series. [1] [5]

### 8. Data volume — **File size confirmed; observation volume unknown**

Version 2 contains one completed CSV of 395,917 bytes; version 1 contains one completed CSV of 295,649 bytes. The Mendeley API provides no row count, and the review did not download the CSV. The paper confirms 107 transformers and reports the label frequencies above, but it does not state the number of DGA rows or whether multiple rows per transformer exist. [2] [5]

Consequently, the usable data volume is best recorded as **one CSV / 395,917 bytes / 107 source transformers reported in the paper / row count unknown**. The sum of the paper's label-frequency cells must not be substituted for the number of observations.

### 9. Missingness — **Unknown**

Neither the Mendeley landing page/API nor the paper reports missing-value counts, missingness codes, censoring, below-detection-limit handling, duplicate records, or per-variable completeness. Missingness cannot be estimated without inspecting the CSV or receiving a data dictionary. The class imbalance discussed in the paper is not evidence about missing values. [2] [5]

### 10. Provenance — **Strong high-level provenance; limited operational detail**

**Confirmed:** The data were supplied by/through the Tecnológico de Costa Rica authors, funded by Instituto Tecnológico de Costa Rica, and described as digitized records from real DGA oil tests on transformers in Central American networks. The Mendeley record identifies both authors and the institution, and the original paper describes academic-use supply and anonymization. [2] [3] [5]

**Not documented:** the utility or laboratory identities, exact countries/sites, transformer makes/ratings/ages, sampling protocol, laboratory instruments, calibration/quality-control procedures, detection limits, data-entry checks, row-generation rules, and the mapping from each released column to source report fields. No related article is linked in the Mendeley API record, although the journal paper provides contextual documentation. [2] [5]

### 11. Licence — **Confirmed: CC BY 4.0**

Mendeley and DataCite identify the dataset as **Creative Commons Attribution 4.0 International (CC BY 4.0)**. Reuse, redistribution, and modification require attribution, a link to the licence, and indication of changes; third-party content, if present, may require separate permission. [2] [3] [6]

This dataset licence is separate from the journal article's publication licence. The article page states CC BY-NC-ND 4.0 for the article, while the data record states CC BY 4.0 for the dataset. Do not apply the article licence to the CSV. [4]

### 12. Can a future target be constructed without leakage? — **No, not from the published release/documentation**

A **contemporaneous diagnostic target** can be described in principle: predict the published method-derived labels from the five DGA gas concentrations. The original paper did exactly that as a multi-label classification task. [5]

A **future failure, future fault, time-to-event, or early-warning target is not currently constructible in a defensible way**. The required ingredients—measurement timestamps, event timestamps, a stable asset key, and an observation-to-event horizon—are not documented. The sampling year was anonymized, and no maintenance/failure history is supplied. Do not claim that the candidate supports supervised failure prediction merely because its title mentions fault diagnosis.

There is also a direct label leakage/target-definition problem for contemporaneous diagnosis: the published labels are computed from the same DGA gas values used as model inputs. A model trained on the five gases to reproduce Rogers/Dornenburg/Duval/IEC outputs may be learning a proxy for the published threshold/ratio rules rather than independently validated physical failure outcomes. Any derived ratios or features that are themselves used to calculate the labels would make this leakage even more direct. A chronological, asset-held-out evaluation is impossible to verify until timestamps and IDs are documented.

### 13. Limitations and recommended use

The paper itself identifies the main limitations: only 107 transformers, a substantial imbalance toward UF, rare PD and DT labels, DGA-only inputs, Central American network provenance, and no complementary electrical, dielectric, or maintenance variables. It cautions that rare-label performance and generalization may be weak and recommends expanding/balancing the database and adding diagnostic sources. [5]

The candidate is recommended for:

- **Cross-sectional DGA diagnostic benchmarking**, provided the exact released columns and label semantics are verified.
- **Reproduction or audit of multi-method DGA rule classification**, with explicit acknowledgement that labels are derived diagnostic outputs.
- **Multi-label classification demonstrations** and feature/threshold sensitivity analysis, not claims of real-world failure forecasting.
- **Schema/provenance-gap assessment** as a candidate for later adoption if the authors can provide a codebook, row count, asset/sample identifiers, timestamp policy, missingness summary, and outcome definitions.

It is not recommended, without additional author documentation and linked operational data, for:

- future failure prediction, survival analysis, RUL, or time-to-event modeling;
- asset-level train/test separation or longitudinal trend modeling;
- estimating a sampling frequency or detecting degradation trajectories;
- claims about independently observed failures, maintenance outcomes, or utility-wide generalization;
- leakage-sensitive benchmark comparisons that treat the method-derived labels as ground truth.

## Adoption decision

**Decision: conditional / hold for verification, not ready for a future-target dataset track.** The candidate has strong real-world relevance, credible high-level provenance, a permissive data licence, five clearly described DGA gas measurements, and method-derived diagnostic labels. However, the published materials do not establish the released schema, row count, stable asset or sample keys, observation timestamps, event timestamps, sampling frequency, or missingness. The strongest supported use is a static or cross-sectional DGA-to-diagnostic-label benchmark. A future-failure target must be marked **not feasible from the current evidence**.

## References

[1]: https://data.mendeley.com/datasets/98f4z3f8tx/2 "Mendeley Data: Power transformer data for fault diagnosis, version 2"

[2]: https://data.mendeley.com/public-api/datasets/98f4z3f8tx?version=2&fields=* "Mendeley public API metadata for dataset 98f4z3f8tx, version 2"

[3]: https://api.datacite.org/dois/10.17632/98f4z3f8tx.2 "DataCite DOI metadata for 10.17632/98f4z3f8tx.2"

[4]: https://revistas.tec.ac.cr/index.php/tec_marcha/article/view/8525 "Tecnología en Marcha: Diagnóstico de fallas en transformadores de potencia usando modelos de redes Neuronales Perceptrón Multicapa"

[5]: https://revistas.tec.ac.cr/index.php/tec_marcha/article/download/8525/8315/31397 "Original article PDF: Diagnóstico de fallas en transformadores de potencia usando modelos de redes Neuronales Perceptrón Multicapa"

[6]: https://creativecommons.org/licenses/by/4.0/legalcode "Creative Commons Attribution 4.0 International legal code"

[7]: https://data.mendeley.com/api/docs/ "Mendeley Data API documentation"

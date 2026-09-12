# Data Limitations & Ethical Governance — Nellai HealthGrid

This document explicitly outlines the constraints, assumptions, ethical boundaries, and limitations governing the data and algorithms implemented within Nellai HealthGrid.

---

## 1. Prototype Demonstration Boundaries

1. **Synthetic Catchment Metrics**:
   - The catchment-level workforce numbers (doctors per 10k, nurses per 10k), essential drug inventory stock percentages, and travel distances for the 10 Tirunelveli rural blocks are **synthetically calibrated prototype demonstration metrics**.
   - While based on official district-level indicators from the Ministry of Health and Family Welfare (MoHFW), Rural Health Statistics, and NFHS-5, village-level data points are **not official census records**.
   - The application does not claim live, real-time database synchronisation with state public health intranets.

2. **No Real-Time Medical Dispatch Authority**:
   - The submission of an intervention request within this application **records an administrative request for authorized review**.
   - It **does NOT** automatically dispatch, schedule, or steer real-world ambulances, Mobile Medical Units, or medical officers. Final deployment decisions remain exclusively within the jurisdiction of authorized district health officials (Deputy Director of Health Services / District Collector).

3. **Non-Clinical Decision Support Only**:
   - Nellai HealthGrid is strictly a macro-level public health infrastructure planning and resource prioritization platform.
   - It **does NOT** collect individual patient records, diagnose medical conditions, prescribe treatments, or substitute for professional medical practitioners.

---

## 2. Missing Fields and Data Gaps

| Dimension | Real-World Public Health Requirement | Current Prototype Handling | Impact & Limitation |
| :--- | :--- | :--- | :--- |
| **Seasonal Disease Surges** | Real-time monsoon epidemic tracking (Dengue, Leptospirosis, Diarrhea) | Static quarterly trend signals (Declining, Improving, Stable) | Rapid outbreak spikes between reporting cycles are not modeled dynamically. |
| **Village-to-PHC Road Quality** | Detailed GIS road network topology, bridge washouts, and public bus schedules | Metric approximation based on Euclidean road distance | Does not reflect weather-related road impassability during active northeast monsoon downpours. |
| **Private Healthcare Provider Density** | Local informal practitioners, private clinics, and tertiary nursing homes | Excluded; focuses exclusively on public primary healthcare assets | True patient diversion to private care providers is not captured in gap calculation. |
| **Staff Absenteeism & Deputation** | Doctors on study leave, court summons, or rural deputation transfers | Normalized doctor availability ratio per 10k | May overestimate effective physician consulting hours on given clinic days. |
| **Batch Drug Expiry & Cold-Chain Faults** | Real-time eVIN (electronic Vaccine Intelligence Network) sensor logs | Aggregate medicine stock percentage checklist | Individual vaccine vial spoilage or specific antibiotic stockouts are generalized into an index score. |

---

## 3. Data Completeness vs. Prediction Confidence

- **Data Completeness Definition**:
  - The completeness percentage (e.g. 95% across 9 blocks; 78% in Kadayam Block) strictly measures the **percentage of required baseline input fields populated without missing values**.
  - It does **NOT** represent clinical prediction certainty or statistical model accuracy.
- **Missing Indicators Flagging**:
  - Kadayam Rural Zone explicitly flags missing historical outpatient consultation records to alert planners of data collection gaps.

---

## 4. Governance & Safety Disclaimer

> **Public Health Planning Notice:**
> Nellai HealthGrid supports public-health planning and resource prioritization. It does not diagnose patients, replace healthcare professionals, or automatically make final healthcare decisions. Intervention requests require review and authorization by responsible officials.

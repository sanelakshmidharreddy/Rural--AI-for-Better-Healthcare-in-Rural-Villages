# Nellai HealthGrid — Data Limitations & Transparency Statement

This document details the data boundaries, assumptions, and governance rules enforced across **Nellai HealthGrid**.

---

## 1. Prototype Demonstration Data Notice

The current version of **Nellai HealthGrid** operates in **Tirunelveli Pilot Demonstration Mode**.

- **Spatial Granularity**: Analysis is structured at the **Block and PHC Catchment level** for 10 Tirunelveli rural health zones.
- **Village-Level Data**: Micro village-level values are simulated based on block health averages. Synthetic values are never presented as official village observations or live government telemetry.
- **Scenario Period**: Synthetic demonstration indicators are labeled as **Prototype scenario period** to prevent confusion with official government releases.
- **Data Completeness vs Prediction Confidence**: Indicators measuring data completeness display **Data Completeness %** (proportion of non-null fields populated) rather than misleading "AI prediction confidence".

---

## 2. Technical Limitations

1. **No Live Telemetry Sensor Integration**: Daily pharmacy stock levels and real-time clinician biometric attendance require API integration with state logistics systems (TNMSC & HMIS).
2. **Simulation Bounds**: What-If resource allocation scenarios model projected risk reduction using transparent linear impact coefficients. Scores do not drop to zero unrealistically, and estimates are explicitly labeled: *"Simulation only — not an actual deployment decision."*
3. **Application-Level Requests**: Submitting an intervention request creates a persistent review record with a tracking ID (e.g. `NHG-2026-0001`) for administrative review. It does not automatically dispatch physical government vehicles.

---

## 3. Governance Disclaimer

> **Public-Health Planning Support**: Nellai HealthGrid is built to support public-health administrators in resource prioritization. It does **not** diagnose individual patients, replace medical professionals, or make autonomous government resource dispatch decisions.

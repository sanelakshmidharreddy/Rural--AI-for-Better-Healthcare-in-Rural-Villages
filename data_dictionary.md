# Nellai HealthGrid — Data Dictionary

This document defines the schema, field descriptions, data types, and indicator benchmarks used in **Nellai HealthGrid**.

---

## 1. Rural Health Zone Entity Schema

| Field Name | Type | Description | Unit / Range | Source Mapping |
| :--- | :--- | :--- | :--- | :--- |
| `id` | String | Unique zone identifier | e.g. `zone-manur-01` | System Primary Key |
| `name` | String | Rural Health Zone / PHC Catchment Name | e.g. `Manur Catchment Zone` | Block PHC Registry |
| `block` | String | Administrative Block Name | e.g. `Manur` | Tamil Nadu Revenue Records |
| `district` | String | District Name | Fixed: `Tirunelveli` | District Health Office |
| `population` | Integer | Catchment rural population | 10,000 – 100,000 | Census / Sub-district Estimate |
| `facilityCount` | Integer | Count of health facilities in zone | Integer &ge; 1 | RHS Facility Directory |
| `facilityTypes` | String | Types of facilities present | e.g. `PHC, Sub Center` | RHS Facility Directory |
| `bedCount` | Integer | Total operational inpatient beds | Integer &ge; 0 | Facility Inpatient Log |
| `doctorAvailability` | Float | Clinicians per 10,000 population | Benchmark: 2.5 / 10k | HMIS / Staffing Registry |
| `nurseAvailability` | Float | Nurses/ANMs per 10,000 population | Benchmark: 4.0 / 10k | HMIS / Staffing Registry |
| `medicineAvailability` | Float | Essential drug stock fulfillment % | 0.0% – 100.0% | TNMSC Pharmacy Inventory |
| `infrastructureAvailability` | Float | Physical facility infrastructure index | 0.0% – 100.0% | RHS Facility Audit |
| `immunizationCoverage` | Float | Infant full immunization rate | 0.0% – 100.0% | HMIS / RCH Portal |
| `maternalCareCoverage` | Float | 4+ ANC visit & institutional delivery % | 0.0% – 100.0% | HMIS / RCH Portal |
| `serviceUtilization` | Float | Outpatient consultation utilization % | 0.0% – 100.0% | HMIS Outpatient Register |
| `nearestFacilityDistance` | Float | Distance to nearest referral hospital | Kilometers (km) | GIS Road Network Matrix |
| `mobileUnitCoverage` | Float | Mobile Medical Unit visit coverage % | 0.0% – 100.0% | MMU Route Audit |
| `dataPeriod` | String | Period tag for records | e.g. `Prototype scenario period` | Metadata Engine |
| `dataConfidence` | String | Confidence rating for record completeness | e.g. `High (89%)` | Audit Engine |

---

## 2. Healthcare Gap Score Formula Components

1. **Infrastructure Gap ($0-100$)**:
   $$\text{Infra Gap} = (100 - \text{infrastructureAvailability}) \times 0.6 + \text{Bed Shortfall} \times 0.4$$
   where Bed Shortfall is calculated against a benchmark of 1.2 beds per 1,000 population.

2. **Workforce Gap ($0-100$)**:
   $$\text{Workforce Gap} = \text{Doctor Shortfall \%} \times 0.6 + \text{Nurse Shortfall \%} \times 0.4$$
   benchmarked against 2.5 doctors and 4.0 nurses/ANMs per 10,000 population.

3. **Service Utilization Gap ($0-100$)**:
   $$\text{Service Gap} = (100 - \text{immunizationCoverage}) \times 0.4 + (100 - \text{maternalCareCoverage}) \times 0.4 + (100 - \text{serviceUtilization}) \times 0.2$$

4. **Medicine and Equipment Gap ($0-100$)**:
   $$\text{Medicine Gap} = 100 - \text{medicineAvailability}$$

5. **Accessibility & Population Pressure Gap ($0-100$)**:
   $$\text{Accessibility Gap} = \min(100, (\text{nearestFacilityDistance} / 18.0) \times 100) \times 0.65 + (100 - \text{mobileUnitCoverage}) \times 0.35$$

---

## 3. Intervention Request Schema

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | String | Generated ID (e.g. `NHG-2026-0001`) |
| `zoneId` | String | Target Rural Health Zone ID |
| `zoneName` | String | Target Zone Name |
| `block` | String | Administrative Block |
| `interventionType` | String | Selected Intervention Strategy |
| `resourceType` | String | Resource package type |
| `quantity` | Integer | Requested units (must be > 0) |
| `requestedDate` | String | Desired deployment date |
| `priority` | String | Priority level (Immediate, High, Medium, Standard) |
| `justification` | String | Detailed administrative rationale |
| `notes` | String | Optional operational notes |
| `requestingOrg` | String | Submitting organization name |
| `contactPerson` | String | Officer contact name |
| `contactPhone` | String | Contact phone number |
| `contactEmail` | String | Contact email address |
| `status` | String | Workflow status: `Draft`, `Submitted`, `Under review`, `Approved`, `Scheduled`, `Completed`, `Rejected` |
| `createdAt` | DateTime | Submission timestamp |

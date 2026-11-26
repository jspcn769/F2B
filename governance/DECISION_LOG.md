# Governance Decision Log

This file records explicit project decisions. Draft proposals and assumptions must not be promoted to approved decisions without user confirmation.

| ID | Decision | Status | Notes |
|---|---|---|---|
| DEC-001 | F2B covers eligible midfielders and forwards; excludes goalkeepers and defenders. | APPROVED | Global eligibility rule. |
| DEC-002 | F2B height conversion is real verified height +15 cm. | APPROVED | Preserve real and converted values separately. |
| DEC-003 | F2B weight conversion is real verified weight +7 kg. | APPROVED | Preserve real and converted values separately. |
| DEC-004 | Assign basketball position using real height before conversion. | APPROVED | Then consider football role, versatility and context. |
| DEC-005 | Initial historical coverage begins in 1974/75. | APPROVED | Historical database scope. |
| DEC-006 | Standard game assumption is 48 minutes and 240 team player-minutes. | APPROVED | Five players × 48 minutes. Reconfirmed explicitly on 2026-11-26. The 40-minute prototypes are recorded with their own rules. |
| DEC-007 | Typical roster range is 10–16, without a hard limit. | APPROVED | Duplicated or absent positions are permitted. |
| DEC-008 | FC Barcelona 2008/09 pilot roster contains the 12 listed eligible first-team players. | APPROVED | Pilot scope only; does not approve all physical data or positions. |
| DEC-009 | Lionel Messi's F2B position in the pilot is ES. | APPROVED | Explicit user decision. |
| DEC-010 | Xavi Hernández's pilot position proposal is BA. | DRAFT | Not approved; retain as draft only. |
| DEC-011 | Physical measurements in the pilot CSV are provisional. | DRAFT | Source basis noted; each value requires verification. |
| DEC-012 | OVR bands and historical anchors are initial calibration references. | REVIEWED | Boundary overlaps and potential model remain unresolved. |

## Decisions imported on 2026-11-26

| ID | Decision | Status | Notes |
|---|---|---|---|
| DEC-013 | Xavi Hernández is BA in the 2008/09 pilot. | APPROVED | Supersedes the draft status in DEC-010. |
| DEC-014 | The F2B archetype catalogue contains 75 named entries, 15 per position. | APPROVED | Names and codes from the validated catalogue of 2026-11-23. Recovered matrix rows are stored separately within the catalogue. |
| DEC-015 | Higuaín P/AL/AP, Robben AL/ES and Guðjohnsen P/AP in 2008/09. | APPROVED | Ordered alternatives are attached to the player-season records. |
| DEC-016 | Adopt the 13 corrected OVRs for Barcelona and Madrid 2008/09. | APPROVED | The conversion dataset records the approved fields. The derived POT and archetype adjustments remain drafts. |
| DEC-017 | F2B should commonly reach 100 points per team. | APPROVED | Direction for engine calibration. The scoring distribution, pace and baseline efficiency remain open. |
| DEC-018 | Version the encyclopedia and structured data together in this repository. | APPROVED | The standalone HTML is generated. Browser edits are drafts until imported and reviewed. |

## Change protocol
For each new decision, add a unique ID, concise wording, status, date/context if known, rationale and affected files. If a decision is superseded, preserve it and add a replacement entry rather than deleting history.

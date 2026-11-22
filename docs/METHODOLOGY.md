# Data Methodology

## 1. Evidence layers
Each fact belongs to one of four conceptual layers:
- REAL: directly supported by historical evidence.
- F2B: deterministic conversion from a REAL input using an approved project rule.
- ALT: an intentional alternate-history decision or outcome.
- SIM: a generated result from the simulation engine.

A record may contain multiple layers, but each field must identify its own layer. For example, real height and converted F2B height are separate fields.

## 2. Approval states
- PENDING: not yet researched or not enough evidence.
- DRAFT: proposed value or interpretation awaiting review.
- REVIEWED: evidence and interpretation checked, but not formally approved.
- APPROVED: explicitly accepted as canonical for the project.

Do not infer APPROVED from repetition, inclusion in a draft, or apparent plausibility.

## 3. Source hierarchy
Prefer, in order where applicable:
1. Official club, league, federation or competition records and contemporaneous publications.
2. Reputable statistical databases and established sports reference works.
3. Reliable contemporary journalism.
4. Secondary databases and specialist community resources.
5. Unsourced aggregations only as leads, never as sole evidence for important disputed facts.

Record the source, the exact fact it supports, access/retrieval date where available, and any conflict or caveat. A source supporting a roster does not automatically support a player's height, weight or position.

## 4. Physical data
Store real height and weight independently from F2B converted values. Apply +15 cm and +7 kg only when the real input is sufficiently supported. If the real value is uncertain, the conversion remains provisional too.

## 5. Player eligibility and season membership
Determine eligibility from the player's football role in the relevant period. Determine season membership from first-team status and credible squad evidence. A single youth or reserve appearance does not automatically establish first-team roster membership.

## 6. Position assignment
Use the position matrix. The decision sequence is:
1. Verified real height.
2. Football role and characteristic responsibilities.
3. Versatility and physical profile.
4. Coach/system context where evidence exists.
5. Coherence with the season roster, without forcing positional balance.

The matrix is a guide, not an automatic height-only classifier. Record rationale and confidence. Exceptional assignments require an explicit note.

## 7. Ratings and simulation
Ratings are F2B evaluations, not real-world football statistics. Use the rating framework as a calibration guide, not as an invented formula. Potential, attributes, progression and salary models must not be fabricated until their definitions are agreed.

## 8. Change control
When a value changes, preserve the previous decision in the governance log or version history. Record what changed, why, evidence, author/reviewer and approval state. Do not silently rewrite canonical historical facts.

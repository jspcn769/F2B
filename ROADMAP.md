# F2B Roadmap

## Phase 0 — Repository foundation
- [x] Establish project overview and core rules.
- [x] Establish methodology and evidence/status vocabulary.
- [x] Record initial position matrix and OVR calibration references.
- [x] Add the FC Barcelona 2008/09 pilot roster and provisional physical dataset.
- [ ] Validate repository schema and naming conventions.

## Phase 1 — Pilot data validation
- [ ] Verify each pilot player's real height and weight against reliable sources.
- [ ] Store source-level evidence and conflicts for each physical field.
- [ ] Review all 12 player position assignments; preserve Messi = ES.
- [ ] Recover and validate the full approved BA archetype list (15 archetypes) from the original design work.
  - [x] Create a first refinement draft for BA-01, BA-02, BA-03 and BA-15 in `docs/ARCHETYPES_BA_REFINEMENT.md` (not approved; attributes retained pending audit).
- [ ] Confirm first-team roster evidence and season membership.

## Phase 2 — Canonical data model
- [ ] Define stable IDs and schemas for players, clubs, seasons, rosters, competitions, matches and sources.
- [ ] Define player-club-season relationship model and chronology.
- [ ] Define field-level provenance and approval workflow.
- [ ] Define import/export formats and validation rules.

## Phase 3 — Basketball player model
- [ ] Finalize position archetypes.
- [ ] Resolve OVR boundary conventions.
- [ ] Define attributes and potential only after explicit design approval.
- [ ] Create season-specific player profiles.

## Phase 4 — Clubs, competitions and seasons
- [ ] Build controlled club and competition registries.
- [ ] Expand season rosters from 1974/75 onward in validated batches.
- [ ] Preserve real competition chronology and agreed formats.
- [ ] Add alternate-history outcomes only with ALT/SIM labels.

## Phase 5 — Simulation and historical records
- [ ] Define match engine and statistical model.
- [ ] Define standings, awards, records and honours.
- [ ] Define contracts, salaries and transaction ledgers.
- [ ] Build reproducible simulation snapshots and audit trail.

## Working rule
Proceed in small reviewable batches. Do not mark a phase complete merely because draft files exist. User approval is required for canonical design decisions.

## Integration checkpoint · 2026-11-26

- [x] Move the v0.5 encyclopedia data into the repository and publish the generated v0.6 HTML.
- [x] Register the 75 archetype identifiers and names, the 36 attributes, the available matrix rows and the 48-minute ruleset.
- [x] Register and display Barcelona, Madrid and Inter conversions and nine Valencia position decisions.
- [ ] Recover the remaining archetype fit and comparison cells from their original sources.
- [x] Convert the four remaining pilot squads (València, Sevilla, Atlético and Villarreal), preserving approved positions and documenting draft ratings and availability.
- [ ] Review the new draft ratings, field sources and tactical rotations across several matchups.
- [ ] Implement a reproducible 48-minute match engine with possession timing and calibrate scoring across several matchups.
- [ ] Build standings and season progression from reproducible match results.

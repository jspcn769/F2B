# F2B — Football to Basketball

F2B is an alternate-history basketball simulation built from the history of association football. It preserves the identity and real-world career paths of clubs, competitions and eligible players, while allowing basketball performance, results, statistics, honours, contracts and records to diverge within the simulation.

## Core principles
- Eligible players: midfielders and forwards only, including their football sub-positions. Goalkeepers and defenders are excluded.
- F2B height = verified real height + 15 cm.
- F2B weight = verified real weight + 7 kg.
- Basketball position is assigned from the player's **real height before conversion**, then assessed against football role, versatility and roster context.
- Preserve real clubs, chronology and season-by-season career order.
- Season rosters include eligible first-team players, not reserve/youth players merely making occasional appearances.
- Keep real-world facts separate from conversions and alternate simulation outcomes.

## Evidence and status vocabulary
- `REAL`: verified historical fact.
- `F2B`: mechanical conversion under project rules.
- `ALT`: alternate-history divergence.
- `SIM`: generated simulation output.

Approval states: `PENDING`, `DRAFT`, `REVIEWED`, `APPROVED`.

## Project period
The initial historical coverage begins in season **1974/75**.

## Repository map
- `docs/`: project definition, methodology, position matrix and rating framework.
- `data/pilots/`: controlled pilot datasets.
- `governance/`: decisions, approvals and change control.
- `ROADMAP.md`: staged implementation plan.

## Current pilot
FC Barcelona 2008/09 is the initial roster pilot. The 12-player selection is approved as a pilot scope. Physical measurements remain provisional pending source-by-source verification. Only Lionel Messi's F2B position (ES) is explicitly approved at this stage; other positions must not be treated as final.

## Data integrity
Do not bulk-convert seasons or players without validation. Never silently upgrade provisional information to approved. Every future dataset should carry provenance, evidence status and a clear distinction between REAL, F2B, ALT and SIM.

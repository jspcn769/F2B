# F2B Rating Framework

## Overall rating (OVR) calibration
The initial OVR bands are deliberately overlapping reference ranges. They are calibration language, not a fully specified mathematical model.

| OVR range | Calibration description |
|---|---|
| 93–96 | Absolute global superstars |
| 90–93 | Top-tier global stars |
| 87–90 | Elite stars |
| 84–87 | Strong, established starters |
| 81–84 | Good starters or high-quality rotation |
| 77–81 | Quality rotation or high-upside young players |
| 76 and below | Lower rotation, veterans in decline or developing young players |

Because the bands overlap at their boundaries, an exact boundary convention must be agreed before automation. Do not silently resolve the overlaps in code or data.

## Historical calibration anchors
These are initial reference anchors, not a complete player database:
- Lionel Messi, 2011/12: 96.
- Diego Maradona, 1986: 96.
- Cristiano Ronaldo, 2013/14: 95.
- Ronaldinho, 2004/05: 93.
- Thierry Henry, 2003/04: 93.
- Xavi Hernández, 2009/10: 92.

## Rating principles
- Rate the player as a basketball player within the F2B universe, informed by football skill set, physical conversion and role translation.
- A rating is season-specific, not an immutable career label.
- Distinguish current ability from potential.
- Keep positional role and archetype separate from OVR.
- Explain unusual ratings with concise rationale and comparable anchors.
- Do not create an attribute formula, potential formula or progression curve until the user approves the model.

## Status
This framework is an initial calibration reference. Exact boundary handling, attribute taxonomy, potential model and age/progression model remain open design decisions.

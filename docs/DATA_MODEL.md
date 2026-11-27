# F2B — Diccionari de dades v0.3

## Entitats carregades
- `Competition`: id, slug, nom, país, nivell, esport F2B i temporada associada.
- `Season`: id, competitionId, temporada, sistema de competició, participants, jornades i nombre d'enfrontaments.
- `Club`: id estable, nom, nom curt, ciutat, país i àlies.
- `TeamSeason`: id de participació, seasonId, clubId i estat de plantilla.
- `Round`: id, seasonId, número, etiqueta i llista d'identificadors de fixtures.
- `Fixture`: id, seasonId, roundId, roundNumber, homeClubId, awayClubId, homeTeamSeasonId, awayTeamSeasonId, estat F2B, enllaç opcional a MatchF2B i procedència del calendari.

## Camps de procedència dels fixtures
- `fixtureBase=REAL_REFERENCE_PAIRING`: emparellament de primera volta contrastat amb la font de referència.
- `fixtureBase=DERIVED_RETURN_LEG`: emparellament de tornada derivat per inversió de localia.
- `derivedFromFixtureId`: identificador del partit de primera volta que origina el partit de tornada.

## Entitats futures
- `Player`, `PlayerSeason`: identitat i trajectòria de jugador.
- `MatchF2B`, `ResultF2B`: partit simulat i marcador propi.
- `StandingF2B`: classificació derivada dels resultats F2B.
- `TeamStatsF2B`, `PlayerStatsF2B`: rendiment col·lectiu i individual.
- `AwardF2B`, `RecordF2B`, `TransferF2B`: premis, rècords i mercat.

## Regles
- Identificadors persistents, independents dels noms visibles.
- Un club pot tenir múltiples participacions TeamSeason.
- Un fixture és l'estructura de l'enfrontament; el seu resultat F2B és un registre separat.
- Cap marcador o estadística absent es reemplaça amb dades futbolístiques.

## Addició v0.6

- `pilot-base.json` conserva els IDs i les relacions de l’enciclopèdia v0.5.
- `conversions.json` desa cada conversió amb `membershipId` i `playerId`, posicions ordenades, mesures, OVR/POT, estats de confirmació, codi d’arquetip, notes de disponibilitat i valors dels 36 atributs. Inclou una llista de posicions parcials.
- `inter.json` desa les fitxes sota l’ID d’equip de temporada de l’Inter. Els IDs compartits apunten als jugadors presents a l’enciclopèdia. La vista històrica és independent del calendari pilot espanyol.
- `archetypes.json` separa el catàleg de les files metodològiques recuperades. L’absència d’una fila indica que la matriu d’aquell arquetip és pendent.
- `regulation.json` fixa la configuració general de 48 minuts.

## Fitxa de jugador v0.12

La identitat i la biografia continuen a `players`. La conversió, els atributs i el context del curs són a `playerSeasons`. L’HTML prioritza aquests valors a Resum i Atributs. La ruta `#/player/<playerId>/<apartat>/<membershipId>` pot apuntar a una participació concreta. Les rutes anteriors sense apartat obren el resum.

Els continguts històrics addicionals es guarden a `data/catalog/player-history.json`, amb un objecte per identificador de jugador. Els apartats admeten llistes de files. Quan un apartat està absent o buit, el visor mostra l’estat pendent. Els camps de data s’expressen en format ISO.

| Apartat | Camps de les files |
|---|---|
| `career` | season, club, from, until, note |
| `transfers` | date, from, to, type, fee, note |
| `statistics` | season, competition, games, starts, minutes, points, assists, rebounds, steals, blocks |
| `honours` | season, competition, club, honour, note |
| `awards` | season, competition, award |
| `contracts` | club, from, until, type, note |
| `salaries` | season, club, annual, currency, note |

Les files d’aquests apartats són contingut del repositori. L’editor local i les còpies JSON del pilot continuen actuant sobre identitats, participacions i conversions.

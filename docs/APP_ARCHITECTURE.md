# F2B — Arquitectura de l'enciclopèdia v0.3

## Filosofia
F2B no replica la història estadística del futbol. Manté les dades REAL mínimes necessàries per identificar la competició, la temporada, els clubs, els participants i l'estructura de local/visitant dels enfrontaments. La història esportiva pròpia (resultats, classificacions, estadístiques, rècords i trajectòries) és F2B.

## Temporada pilot
- Competició: Primera Divisió espanyola (`CMP-ESP-PRIMERA`).
- Temporada: 2008/09 (`SEA-ESP-PRI-2008-09`).
- 20 identitats de club; 20 participacions d'equip.
- 38 jornades; 380 enfrontaments.
- Cap jugador ni plantilla carregats.
- Cap resultat ni classificació F2B simulats.

## Dades REAL conservades
1. Identitat de la competició i de la temporada.
2. Identitat estable dels 20 clubs.
3. Participació dels 20 clubs en la temporada.
4. Jornada i emparellament local/visitant dels 380 enfrontaments.

Els 190 emparellaments de la primera volta es contrasten amb la referència BDFutbol. Els 190 emparellaments de tornada es deriven invertint la localia de la parella corresponent de la primera volta i conserven el camp `derivedFromFixtureId`. No s'han copiat marcadors ni classificacions futbolístiques.

No es conserven resultats de futbol, classificacions futbolístiques, estadístiques futbolístiques, dates, estadis, àrbitres ni dades de jugadors.

## Dades F2B
Les dades futures es mantindran separades: `MatchF2B`, `ResultF2B`, `StandingF2B`, `TeamStatsF2B` i `PlayerStatsF2B`. Els resultats i classificacions F2B no es calcularan mai a partir dels resultats del futbol. Les classificacions es derivaran dels partits F2B simulats.

## Entitats i relacions
- `Competition` 1:N `Season`.
- `Season` 1:N `TeamSeason`.
- `Club` 1:N `TeamSeason`.
- `Season` 1:N `Round`.
- `Round` 1:N `Fixture`.
- `Fixture` 1:0..1 `MatchF2B`.
- `MatchF2B` generarà registres de resultat i estadístiques.

## Navegació
Inici → Competició → Temporada → Club → Equip de temporada → Jornada → Enfrontament. Cada pàgina ofereix enllaços cap a les entitats relacionades. Les fitxes d'equip tenen pestanyes de resum, enfrontaments, estadístiques i plantilla (buida en aquesta fase).

## Distribució
El `index.html` de la branca principal és una compilació autònoma. El ZIP de distribució conserva la versió modular i les dades JSON separades. Això permet publicar la demo sense infraestructura, alhora que manté una base de codi editable i preparada per créixer.

## Límits v0.3
No hi ha backend, autenticació, editor complet, simulador, resultats F2B ni sincronització d'edicions amb GitHub.

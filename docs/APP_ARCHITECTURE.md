# F2B — Arquitectura de navegació v0.2

## Canvi de concepció
La v0.1 estava plantejada com un gestor de registres amb un editor universal al centre. La v0.2 passa a ser una enciclopèdia estadística de consulta. L'usuari no entra primer a crear registres: entra a explorar l'historial i obre fitxes interconnectades.

## Flux principal
Competició → Temporada → Equip de la temporada → Plantilla → Fitxa de jugador → Trajectòria / estadístiques.

Aquest flux pren com a referència funcional BDFutbol: pàgines de competició i temporada, classificació i jornades; fitxes d'equip vinculades a temporada amb plantilla i estadístiques; fitxes individuals amb historial.

## Seccions principals
- Inici
- Competicions
- Clubs i equips
- Jugadors
- Rànquings
- Arxiu de temporades
- Base de dades
- Editor i administració

L'editor és una eina interna separada de la consulta pública.

## Fitxa de competició
- Identitat i país/àmbit de la competició
- Selector d'anys/temporades
- Accés a la fitxa de temporada
- Cobertura de dades per temporada

## Fitxa de temporada
Pestanyes previstes: resum, equips, classificació, partits/jornades i estadístiques. La classificació i estadístiques són F2B; no es poden copiar les taules ni els resultats del futbol perquè el rendiment simulat és diferent.

## Fitxa de club
Pàgina pròpia de l'entitat amb dades d'identitat, palmarès i llistat de temporades/competicions. No conté una única plantilla atemporal.

## Fitxa d'equip per temporada
Pestanyes: plantilla, estadístiques, partits i historial de temporades. La plantilla és contextual a la temporada seleccionada. La fitxa general de club i la fitxa d’equip en una temporada concreta són pantalles diferents. Els jugadors enllacen a una fitxa individual.

## Fitxa individual de jugador
Pestanyes: resum, trajectòria, perfil físic, valoració, estadístiques i palmarès. Cal separar dades REAL, dades convertides F2B i divergències ALT/SIM, i mantenir estats PENDING/DRAFT/REVIEWED/APPROVED.

## Pilot visual incorporat
S'ha utilitzat el pilot FC Barcelona 2008/09 com a ruta de navegació, incloent-hi els 12 migcampistes i davanters aprovats per al pilot. No s'hi incorporen estadístiques F2B, alçades/pesos definitius, OVR, potencials ni posicions pendents. Lionel Messi conserva ES com a única posició F2B explícitament aprovada fins ara. Aquesta ruta és una estructura de revisió, no una plantilla exhaustiva de futbol de l'equip.

## Cobertura de temporades
La interfície mostra l'índex de temporades 1974/75–2026/27 de la Primera Divisió com a arquitectura de navegació. Només 2008/09 té una fitxa pilot parcial. La resta de temporades es marquen com a no carregades; no s'infereixen equips, classificacions ni estadístiques.

## Model de dades a consolidar
Entitats mínimes: Competition, Season, Club, TeamSeason, Player, PlayerSeason, Match, MatchPlayerStats, TeamSeasonStats, Standing, Award, Record, Source, ChangeLog.

Relacions: una competició conté temporades; una temporada conté equips participants i partits; un TeamSeason connecta club, temporada, plantilla, entrenador i estadístiques; PlayerSeason connecta jugador, equip/temporada i el seu perfil/rendiment d'aquell any.

## Estat funcional v0.2
Implementat: navegació entre mòduls, fitxa de competició, selector d'anys, fitxa de temporada i pestanyes, fitxa general de club, accés a equip per temporada, plantilla pilot, filtres de plantilla i directoris de jugadors/clubs, fitxa de jugador i pestanyes estructurals.

Pendent: backend/base central, sincronització amb GitHub, editor de dades complet, relacions operatives, classificacions i estadístiques F2B reals, resultats i fitxes de partit, rànquings, fonts detallades, auditoria i permisos.

## Principis
1. La temporada és el context central de consulta.
2. Les plantilles pertanyen a un equip en una temporada concreta; no hi ha una plantilla atemporal.
3. Les estadístiques pertanyen a una competició/temporada i poden desglossar-se per partit.
4. La trajectòria real del jugador es conserva, però les estadístiques F2B són pròpies.
5. Cap valor absent es completa amb una estimació no etiquetada.
6. La consulta enciclopèdica i l'administració de la base de dades són experiències separades.

# F2B · Informe de situació v0.13

**Tall de treball: 27 de novembre de 2026.** El catàleg general i el directori pilot ja comparteixen el mateix arxiu històric.

## Reglament vigent

- **48 minuts reglamentaris en quatre quarts de 12, cinc jugadors a pista i 240 minuts de participació per equip.** Confirmació de l’usuari del 26 de novembre de 2026. El reglament consultable és `data/rules/regulation.json`.
- Només entren a F2B els migcampistes i davanters elegibles. Físic convertit: +15 cm i +7 kg.
- La posició principal i les alternatives pertanyen a la fitxa de temporada. Els quintets accepten rols situacionals i poden alinear dos bases, tres interiors o cap pivot nominal.
- La trajectòria i el marc de les competicions donen el punt de partida històric. Els resultats i les estadístiques sorgeixen del joc F2B.

## Catàleg i navegació v0.7

El catàleg de competicions conté **29 identitats estables**, agrupades en set països, clubs europeus i seleccions. Inclou les copes de lliga d’Anglaterra, França i Portugal. La Copa de la UEFA i l’Europa League comparteixen una identitat de competició. Els noms i formats de temporada s’apliquen a cada edició quan es carrega.

L’HTML distingeix una competició catalogada d’una edició amb dades. La nova navegació organitza l’arxiu per competicions, edicions i directoris. L’única edició amb calendari i fitxes visibles és Primera Divisió 2008/09. La cerca consulta el catàleg, inclosos els noms alternatius, i els directoris pilot. Les eines d’edició local i còpia JSON es mostren a Jugadors i Cobertura.

Model de dades: `data/catalog/competitions.json` conté l’identificador de competició, l’àmbit, el tipus i els àlies. Les edicions que mostra l’HTML deriven de dades de temporada existents. La compilació comprova la unicitat dels identificadors i que l’edició enllaci amb la seva competició. La següent incorporació de dades podrà afegir edicions sense crear cap competició duplicada.

## Escuts històrics v0.13

Els vint participants de Primera Divisió 2008/09 tenen escut documentat. El visor els mostra als directoris, les fitxes de club, equip i jugador i els enfrontaments. El catàleg conserva la font i pàgina originals i l’HTML els carrega sense connexió.

## Fitxes de jugador v0.12

Les 83 fitxes visibles comparteixen una estructura amb sis apartats. Al resum destaquen la posició F2B, l’arquetip amb enllaç, l’OVR, el POT, el físic convertit i la biografia documentada. Les 28 conversions del Barça i el Madrid mostren data de naixement i nacionalitat de referència. La data de les 16 fitxes del Madrid s’ha incorporat amb font explícita. Els atributs F2B LAB tenen un apartat propi i l’origen futbolístic es consulta a Fonts i notes.

Trajectòria mostra les participacions conegudes. Els registres addicionals de carrera, traspassos, estadístiques, palmarès, premis, contractes i salaris es poden incorporar per identificador de jugador al fitxer `data/catalog/player-history.json`. Les fitxes reconeixen els apartats encara buits sense publicar resultats o xifres provisionals com a registres vàlids.

## Arquetips v0.11

El catàleg enllaça a **75 fitxes detallades**, 15 per cadascuna de les posicions BA, ES, AL, AP i P. Cada fitxa recull identitat, comportament en pista, possessió il·lustrativa, encaix, límits, criteris d’assignació, referències i proposta per al motor. Les referències diferencien una assignació existent al pilot d’un cas de contrast, i els enllaços entre posicions permeten comparar els perfils que coincideixen en funcions.

Les fitxes parteixen de `data/catalog/archetype-profiles.json`. BA-01 i ES-01 mostren les files registrades al catàleg F2B LAB. Els altres 73 perfils mostren propostes de calibratge pendents de contrast amb la matriu original.

## Inventari integrat

| Material | Volum | Detall |
|---|---:|---|
| Primera Divisió 2008/09 | 20 clubs, 38 jornades, 380 enfrontaments | Calendari pilot heretat, amb procedència de cada emparellament. |
| Directori pilot | 83 fitxes, sis clubs | Barça, Madrid, València, Sevilla, Vila-real i Atlètic de Madrid. Es conserven els seus IDs. |
| Barça i Madrid 2008/09 | 28 conversions, 36 atributs cadascuna | Barça 12, Madrid 16. Es van incorporar les 3 correccions de posició i les 13 d’OVR. Els ajustos derivats de POT/arquetip i els atributs estimats conserven estat provisional. |
| València 2008/09 | 16 fitxes, 9 posicions acordades | Les altres set posicions i les valoracions continuen pendents a la versió integrada. |
| Sevilla, Vila-real i Atlètic | 14, 13 i 12 fitxes | Inventari del pilot. Les conversions completes requereixen una font recuperable o una nova validació. |
| Inter 2009/10 | 17 fitxes | Dades conservades al repositori amb etapa, arquetip, físic, OVR/POT i funció. Eto’o i Sneijder reutilitzen la identitat del pilot espanyol. Es mantenen les valoracions aprovades Sneijder 89, Milito 88 i Cambiasso 86. L’Inter queda fora del visor fins que s’incorpori a una edició de la seva competició. |
| Catàleg | 75 arquetips, 15 per posició | Codis i noms aprovats. La matriu comparativa té cinc dimensions. Hi ha dues files originals recuperades de la comparativa i dues de l’encaix; la resta continuen pendents de recuperació. |
| Laboratori F2B | 36 camps d’atributs | Codis i noms registrats. Els valors individuals de Barça i Madrid són una proposta de calibratge. L’Inter conserva les dades disponibles al seu Excel. |

## Decisions incorporades

| Canvi | Valor |
|---|---|
| Posicions | Higuaín P/AL/AP, Robben AL/ES, Guðjohnsen P/AP. |
| OVR Barça | Bojan 79, Pedro 77, Hleb 81, Keita 83, Guðjohnsen 81. |
| OVR Madrid | Sneijder 85, Van Nistelrooy 85, Huntelaar 84, Lass 82, Saviola 81, Javi García 78, Parejo 76, Faubert 74. |
| Direcció del motor | Superar els 100 punts per equip ha de ser habitual. Cal calibrar la distribució amb 48 minuts, rellotge i múltiples encreuaments abans de convertir els objectius numèrics en estàndard. |

## On es manté cada peça

- **`data/seasons/`** conté el pilot, les conversions de jugadors per temporada i l’Inter. Les conversions del pilot utilitzen el mateix identificador de participació que el directori.
- **`data/catalog/`** conté arquetips, atributs i les files de matriu recuperades.
- **`data/rules/`** fixa el reglament. **`data/scenarios/`** recull configuracions i resultats d’experiments.
- **`app/encyclopedia.template.html`** conté la interfície. **`index.html`** s’obté amb `node scripts/build-encyclopedia.mjs` i funciona sense servidor. Les edicions locals de fitxes es poden exportar en JSON com a esborranys. Per incorporar un canvi a la base comuna, revisa’l amb el jugador i la temporada i aplica’l a les dades estructurades.
- **`governance/DECISION_LOG.md`** recull les decisions explícites. **`ROADMAP.md`** manté les fases i les dependències.

## Fonts de la integració

S’han usat l’artefacte `F2B-Primera-Divisio-2008-09-6-clubs-v0.5.html`, els llibres `F2B_Barca_Real_Madrid_2008-09.xlsx` i `F2B_Inter_2009-10.xlsx`, el catàleg validat el 23 de novembre i les correccions i decisions posteriors. La procedència del calendari és a la base del pilot. El físic dels equips espanyols remet a FootballSquads i el de l’Inter conserva la font que consta al seu full.

## Flux de treball per a les entregues següents

1. Afegir cada correcció a la fitxa de club i temporada i actualitzar el registre si hi ha una decisió explícita de disseny.
2. Comprovar els enllaços entre jugador, club, temporada i arquetip. Mantenir separats els valors aprovats i les propostes d’OVR/POT, d’arquetip i d’atributs.
3. Regenerar l’HTML i verificar que coincideix amb les dades. En les proves de partit, desar regles, quintets, versió del motor, llavor i resultat.
4. Actualitzar aquest informe quan canviï la cobertura o el grau de validació.

## Direcció històrica aprovada

El [cànon històric](HISTORICAL_CANON.md) fixa la cobertura, els moviments de categoria, les trajectòries i l’aprovació de les excepcions que afecten el palmarès o les places. El primer curs de construcció confirmat és el 2008/09.

## Bloc següent

El primer bloc adient és un **motor de partit reproduïble de 48 minuts** per al Barça i el Madrid. Ha de validar 240 minuts per equip, treure el nombre de possessions del rellotge i conservar qui inicia, qui crea l’avantatge i qui finalitza. Amb aquests dos equips es poden contrastar un partit obert, un ritme controlat i diversos quintets amb les mateixes llavors. Abans d’escalar a competicions, cal provar també perfils de joc diferents i recuperar les matrius d’arquetips originals.


## Verificació d’aquesta entrega

La compilació comprova les relacions i els recomptes de calendari i plantilles, els codis d’arquetip, els 36 atributs, la coherència OVR/POT i les conversions físiques. El redisseny s’ha comprovat amb un DOM de prova i amb la regeneració de l’HTML.

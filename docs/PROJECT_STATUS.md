# F2B · Informe de situació v0.6

**Tall de treball: 26 de novembre de 2026.** Aquesta és la primera base integrada per continuar l’enciclopèdia i desenvolupar el simulador.

## Reglament vigent

- **48 minuts reglamentaris en quatre quarts de 12, cinc jugadors a pista i 240 minuts de participació per equip.** Confirmació de l’usuari del 26 de novembre de 2026. El reglament consultable és `data/rules/regulation.json`.
- Només entren a F2B els migcampistes i davanters elegibles. Físic convertit: +15 cm i +7 kg.
- La posició principal i les alternatives pertanyen a la fitxa de temporada. Els quintets accepten rols situacionals i poden alinear dos bases, tres interiors o cap pivot nominal.
- La trajectòria i el marc de les competicions donen el punt de partida històric. Els resultats i les estadístiques sorgeixen del joc F2B.

## Inventari integrat

| Material | Volum | Detall |
|---|---:|---|
| Primera Divisió 2008/09 | 20 clubs, 38 jornades, 380 enfrontaments | Calendari pilot heretat, amb procedència de cada emparellament. |
| Directori pilot | 83 fitxes, sis clubs | Barça, Madrid, València, Sevilla, Vila-real i Atlètic de Madrid. Es conserven els seus IDs. |
| Barça i Madrid 2008/09 | 28 conversions, 36 atributs cadascuna | Barça 12, Madrid 16. Es van incorporar les 3 correccions de posició i les 13 d’OVR. Els ajustos derivats de POT/arquetip i els atributs estimats conserven estat provisional. |
| València 2008/09 | 16 fitxes, 9 posicions acordades | Les altres set posicions i les valoracions continuen pendents a la versió integrada. |
| Sevilla, Vila-real i Atlètic | 14, 13 i 12 fitxes | Inventari del pilot. Les conversions completes requereixen una font recuperable o una nova validació. |
| Inter 2009/10 | 17 fitxes | Vista pròpia dins l’HTML amb etapa, arquetip, físic, OVR/POT i funció. Eto’o i Sneijder reutilitzen la identitat del pilot espanyol. Es mantenen les valoracions aprovades Sneijder 89, Milito 88 i Cambiasso 86. Inter no forma part del calendari espanyol. |
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

El [cànon històric](HISTORICAL_CANON.md) fixa la cobertura, els moviments de categoria, les trajectòries i l’aprovació de les excepcions que afecten el palmarès o les places. El primer curs complet proposat és el 2008/09.

## Bloc següent

El primer bloc adient és un **motor de partit reproduïble de 48 minuts** per al Barça i el Madrid. Ha de validar 240 minuts per equip, treure el nombre de possessions del rellotge i conservar qui inicia, qui crea l’avantatge i qui finalitza. Amb aquests dos equips es poden contrastar un partit obert, un ritme controlat i diversos quintets amb les mateixes llavors. Abans d’escalar a competicions, cal provar també perfils de joc diferents i recuperar les matrius d’arquetips originals.


## Verificació d’aquesta entrega

La compilació comprova les relacions i els recomptes de calendari i plantilles, els codis d’arquetip, els 36 atributs, la coherència OVR/POT i les conversions físiques. També s’ha executat el renderitzat JavaScript de set rutes amb un DOM de prova.

# F2B · Informe de situació v0.18

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

## Espanyol, Almeria, Racing i Athletic v0.18

La incorporació amplia el pilot a tretze clubs, 198 identitats i 199 participacions convertides. El bloc aporta 68 fitxes de plantilla, repartides entre Espanyol (17), Almeria (14), Racing (20) i Athletic (17). Žigić té una sola identitat i les participacions del València i el Racing. Valera queda en revisió d’elegibilitat pel seu perfil mixt de lateral i migcampista de banda. Les posicions, valoracions i rotacions són propostes F2B.

El resum d’equip mostra les set etapes de banqueta documentades de Primera Divisió. L’Espanyol passa per Márquez, Mané i Pochettino. L’Almeria passa d’Arconada a Hugo Sánchez. Al Racing i a l’Athletic, Muñiz i Caparrós cobreixen les 38 jornades respectives.

## Deportivo, Málaga i Mallorca v0.17

Les tres plantilles afegeixen 48 participacions amb conversió completa, 17 del Deportivo, 17 del Málaga i 14 del Mallorca. Cadascuna inclou perfil físic amb font, posicions, arquetip, OVR/POT, 36 atributs i paper de joc. Els equips incorporen sistema ofensiu i defensiu, quintet, tancament i una rotació de referència de 240 minuts. Les valoracions, posicions i rotacions són propostes F2B.

El Deportivo inclou Xisco pel tram inicial, Chirri com a convocat del filial i Lassad després de promocionar. Al Málaga s’han documentat les cessions d’Adrián i Lolo, l’alta hivernal d’Adriano Ferreira i el rol mixt de Nacho, que queda en revisió d’elegibilitat. El Mallorca conserva Jordi López al primer tram i registra Aduriz com a excepció proposada de pivot a 196 cm convertits.

## Correccions i plantilles v0.16

Les fitxes admeten correccions per participació amb valors abans i després, motiu i data. El navegador desa els ajustos localment i el JSON permet incorporar-los al registre compartit després de revisar-los. El compilador comprova els valors de partida i detecta conflictes. Els totals manuals de temporada tenen el seu apartat dins el rendiment de cada participació.

Les plantilles s’agrupen per posició principal i s’ordenen per OVR dins de cada grup. Les posicions alternatives es mantenen visibles. Les edicions de posició actualitzen la pertinença al grup i la vinculació amb l’arquetip.

## Conversió de quatre plantilles v0.15

Les **55 conversions noves** corresponen al València (16), Sevilla (14), Atlètic de Madrid (12) i Vila-real (13). Porten el pilot a **83 conversions**. Cada fitxa inclou la biografia documentada, el físic convertit, les posicions, l’arquetip, OVR/POT, els 36 atributs i el paper tàctic. Es preserven les nou posicions principals acordades del València. Els 55 OVR/POT i atributs són propostes; mantenen l’estat editorial d’esborrany. Forlán queda a 89 i Agüero a 87, d’acord amb les referències de calibratge del projecte.

Els atributs nous parteixen de bandes per posició i del rol de l’arquetip, amb ajustos físics i trets individuals. L’edat de referència es calcula a 30 d’agost de 2008. El cas de Guillermo Franco a pivot, amb 197 cm convertits, queda documentat com a excepció de rotació. Les fonts de les mesures i de les baixes es registren amb la participació. Žigić i Altidore es mantenen al directori dels clubs d’origen fins a les seves cessions.

Les quatre fitxes d’equip incorporen la identitat tàctica, atac, defensa, quintet, tancament i una rotació de **240 minuts**. Els llocs del quintet descriuen el rol a pista. Les rotacions i valoracions queden disponibles per a calibratge de partits.

## Navegació i integritat v0.14

El visor resol les edicions, plantilles, jornades i partits a partir d’identificadors. Les fitxes de club llisten participacions, les d’equip enllacen les altres competicions registrades del mateix curs i els partits deriven la jornada i els equips de les relacions validades. Els perfils de jugador i els arquetips enllacen la participació concreta. El pilot continua sent l’única edició publicada.

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
| Directori pilot | 198 jugadors i 199 participacions en tretze clubs | Barça, Madrid, València, Sevilla, Vila-real, Atlètic de Madrid, Deportivo, Málaga, Mallorca, Espanyol, Almeria, Racing i Athletic. |
| Barça i Madrid 2008/09 | 28 conversions, 36 atributs cadascuna | Barça 12, Madrid 16. Es van incorporar les 3 correccions de posició i les 13 d’OVR. Els ajustos derivats de POT/arquetip i els atributs estimats conserven estat provisional. |
| València 2008/09 | 16 conversions | 9 posicions principals acordades; la resta de posicions noves i el calibratge són propostes. |
| Sevilla, Vila-real i Atlètic | 14, 13 i 12 conversions | Biografia i físic amb fonts. Posicions, arquetips, valoracions i atributs proposats. |
| Inter 2009/10 | 17 fitxes | Dades conservades al repositori amb etapa, arquetip, físic, OVR/POT i funció. Eto’o i Sneijder reutilitzen la identitat del pilot espanyol. Es mantenen les valoracions aprovades Sneijder 89, Milito 88 i Cambiasso 86. L’Inter queda fora del visor fins que s’incorpori a una edició de la seva competició. |
| Catàleg | 75 arquetips, 15 per posició | Codis i noms aprovats. La matriu comparativa té cinc dimensions. Hi ha dues files originals recuperades de la comparativa i dues de l’encaix; la resta continuen pendents de recuperació. |
| Laboratori F2B | 36 camps d’atributs | Codis i noms registrats. Els atributs individuals de les sis plantilles són una proposta de calibratge. L’Inter conserva les dades disponibles al seu Excel. |

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
- **`app/encyclopedia.template.html`** conté la interfície. **`index.html`** s’obté amb `node scripts/build-encyclopedia.mjs` i funciona sense servidor. Les edicions locals s’exporten en un JSON de correccions. Un cop revisades, s’incorporen a `data/catalog/player-corrections.json` amb el comandament documentat al README.
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

La compilació comprova les relacions i els recomptes de calendari i plantilles, els codis d’arquetip, els 36 atributs, la coherència OVR/POT i les conversions físiques. La v0.15 també valida les posicions acordades, els enllaços de quintet i rotació i els 240 minuts de cadascun dels quatre equips.

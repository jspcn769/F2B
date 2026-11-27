# F2B · Football to Basketball

F2B és una enciclopèdia d’història alternativa del bàsquet. Conserva els clubs i el marc històric del futbol i hi construeix un joc de cinc contra cinc amb regles, plantilles i estadístiques pròpies.

## Enciclopèdia v0.17

Obre [index.html](index.html) amb el navegador. El fitxer funciona de manera autònoma.

- Navegació per identificadors entre competicions, edicions, clubs, plantilles, jugadors, arquetips i enfrontaments.
- **29 competicions catalogades** en set països i dos àmbits internacionals. Catàleg, filtres, cerca i fitxa per competició.
- **20 escuts històrics** de la Primera Divisió 2008/09, extrets de la memòria oficial LFP i incorporats a l’HTML.
- **Una edició amb dades**, la Primera Divisió 2008/09, amb 20 clubs, 38 jornades i 380 enfrontaments.
- 131 conversions de nou clubs amb els 36 atributs F2B LAB. Set clubs tenen fitxa tàctica, quintet i rotació de referència, inclosos Deportivo, Málaga i Mallorca.
- Fitxes de jugador amb resum F2B, atributs, trajectòria, rendiment, contractes i fonts.
- 75 arquetips, **75 fitxes detallades en cinc posicions** i diccionari F2B LAB de 36 atributs.
- Reglament de 48 minuts, amb 240 minuts per equip en temps reglamentari.

Les edicions addicionals es declaren a `data/catalog/edition-files.json` i reutilitzen les mateixes pantalles. El directori de l’Inter 2009/10 queda conservat a `data/seasons/italy/2009-10/inter.json`; la seva edició encara no forma part del visor.

## Edició i comprovació

Edita les dades versionades a [data/](data/) o la plantilla a [app/](app/). Executa amb Node.js:

```sh
node scripts/build-encyclopedia.mjs
node scripts/build-encyclopedia.mjs --check
```

El primer comandament valida les dades i regenera `index.html`. El segon comprova que el fitxer lliurat coincideix amb les dades. L’HTML generat coincideix amb les dades versionades i el registre de correccions compartides.

Consulta l’[informe de situació](docs/PROJECT_STATUS.md), el [registre de decisions](governance/DECISION_LOG.md) i el [full de ruta](ROADMAP.md).

## Correccions de jugador

A la fitxa d’una participació, obre **Edita la fitxa**. Pots ajustar OVR, POT, posició principal i alternatives, arquetip, alçada real, pes real, atributs F2B LAB i totals manuals de temporada. Escriu el motiu i prem **Desa la correcció**. La fitxa i la plantilla reflecteixen el canvi immediatament. L’alçada i el pes F2B es recalculen en desar amb +15 cm i +7 kg. Els totals manuals apareixen a Rendiment al costat de les estadístiques d’acta.

La pestanya d’edició mostra l’historial de la participació. **Cobertura** mostra el registre general amb la data, el motiu i els valors abans i després. Els canvis es desen al navegador. **Exporta correccions** crea un JSON amb els canvis locals. Porta’l a un altre navegador amb **Importa JSON** o comparteix-lo per incorporar-lo al repositori. Si el navegador restringeix l’emmagatzematge de l’HTML local, exporta el JSON abans de tancar la pàgina.

La v0.16 utilitza un format de correccions per camp. Els esborranys de les versions anteriors es poden obrir amb la seva versió o descarregar des de Cobertura si són al mateix emmagatzematge local. Les còpies antigues amb plantilles senceres s’han de revisar abans de traslladar-ne els canvis al format nou.

Per validar i incorporar un JSON rebut a la base comuna:

```sh
node scripts/build-encyclopedia.mjs --import-corrections F2B-correccions.json --dry-run
node scripts/build-encyclopedia.mjs --import-corrections F2B-correccions.json
node scripts/build-encyclopedia.mjs --check
```

El segon comandament actualitza `data/catalog/player-corrections.json` i regenera `index.html`. Els dos fitxers es versionen junts. La importació evita duplicar correccions i s’atura si algun valor de partida ja ha canviat. La base compartida conserva els motius per revisar el criteri i aplicar-lo a casos similars.

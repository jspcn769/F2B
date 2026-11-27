# F2B · Football to Basketball

F2B és una enciclopèdia d’història alternativa del bàsquet. Conserva els clubs i el marc històric del futbol i hi construeix un joc de cinc contra cinc amb regles, plantilles i estadístiques pròpies.

## Enciclopèdia v0.15

Obre [index.html](index.html) amb el navegador. El fitxer funciona de manera autònoma.

- Navegació per identificadors entre competicions, edicions, clubs, plantilles, jugadors, arquetips i enfrontaments.
- **29 competicions catalogades** en set països i dos àmbits internacionals. Catàleg, filtres, cerca i fitxa per competició.
- **20 escuts històrics** de la Primera Divisió 2008/09, extrets de la memòria oficial LFP i incorporats a l’HTML.
- **Una edició amb dades**, la Primera Divisió 2008/09, amb 20 clubs, 38 jornades i 380 enfrontaments.
- 83 conversions del pilot amb els 36 atributs F2B LAB. València, Sevilla, Atlètic de Madrid i Vila-real incorporen fitxa tàctica, quintet i rotació de referència.
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

El primer comandament valida les dades i regenera `index.html`. El segon comprova que el fitxer lliurat coincideix amb les dades. L’editor del navegador desa esborranys locals i permet exportar-los. Els esborranys locals anteriors a v0.15 es conserven a la versió anterior. El format d’exportació JSON continua compatible i es poden revisar les còpies abans d’importar-les.

Consulta l’[informe de situació](docs/PROJECT_STATUS.md), el [registre de decisions](governance/DECISION_LOG.md) i el [full de ruta](ROADMAP.md).

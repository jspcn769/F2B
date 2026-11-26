# F2B · Football to Basketball

F2B és una enciclopèdia d’història alternativa del bàsquet. Conserva els clubs i el marc històric del futbol i hi construeix un joc de cinc contra cinc amb regles, plantilles i estadístiques pròpies.

## Enciclopèdia v0.6

Obre [index.html](index.html) en un navegador. El fitxer és autònom i inclou el pilot de Primera Divisió 2008/09, el catàleg d’arquetips i la plantilla de l’Inter 2009/10.

- 20 clubs, 38 jornades i 380 enfrontaments en el calendari pilot.
- 83 fitxes de sis clubs del pilot, amb 28 conversions del Barça i Madrid i 9 assignacions posicionals del València.
- 17 fitxes de l’Inter 2009/10, registrades amb disponibilitat de temporada.
- 75 arquetips i diccionari F2B LAB de 36 atributs.
- Reglament F2B de 48 minuts, amb 240 minuts per equip en temps reglamentari.

## Edició i comprovació

Edita les dades versionades a [data/](data/) o la plantilla a [app/](app/). Executa amb Node.js:

```sh
node scripts/build-encyclopedia.mjs
node scripts/build-encyclopedia.mjs --check
```

El primer comandament valida les dades i regenera `index.html`. El segon comprova que el fitxer lliurat coincideix amb les dades. L’editor del navegador desa esborranys locals i permet exportar-los. L’espai d’edició de v0.6 té una clau i format propis per evitar sobreescriure el catàleg nou amb còpies v0.5. Les còpies antigues es poden revisar separadament abans de migrar-les.

Consulta l’[informe de situació](docs/PROJECT_STATUS.md), el [registre de decisions](governance/DECISION_LOG.md) i el [full de ruta](ROADMAP.md).

# F2B · Football to Basketball

F2B és una enciclopèdia d’història alternativa del bàsquet. Conserva els clubs i el marc històric del futbol i hi construeix un joc de cinc contra cinc amb regles, plantilles i estadístiques pròpies.

## Enciclopèdia v0.22

Obre [index.html](index.html) amb el navegador. El fitxer funciona de manera autònoma, també al mòbil.

**Estructura**

- **Arxiu**: Inici, Competicions (29 identitats en nou àmbits) i Edicions. La temporada 2008/09 té Resum, Equips, Calendari, Jugadors, Rànquings i Estadístiques.
- **Explora**: Equips i clubs, Jugadors i Arquetips.
- **Eines F2B**: Rànquings, Comparador, i Cobertura i correccions.
- Ruta clicable a la barra superior, context de temporada al menú lateral i barra de navegació inferior al mòbil.

**Fitxes**

- **Equip**: Resum (identitat de joc, banqueta per jornades, quintets de referència a pista, laboratori de quintet i rotació), Plantilla, Sistema de joc, Rotació, Calendari, Mercat i Estadístiques.
- **Plantilla**: agrupada per posició o en llista, amb filtre, ordenació, dorsal, OVR/POT, nacionalitat, alçada i pes F2B, posicions, arquetip, contracte i minuts de referència.
- **Jugador**: Resum, Atributs (amb la mitjana de la posició), Conversió F2B (física, estats de validació i encaix amb els 15 arquetips de la posició), Trajectòria, Rendiment i palmarès, Contractes, Fonts i Edita la fitxa.
- **Partit**: comparació de les plantilles i quintets dels dos equips. El resultat queda pendent del motor.

**Eines**

- Directori de jugadors amb cerca, filtres per equip, posició, arquetip, nacionalitat, OVR i estat, ordenació per columna i vista de taula o targetes. Els filtres queden a l’adreça.
- Comparador de fins a quatre participacions, amb gràfic de grups i taula d’atributs. Es pot compartir amb un enllaç.
- Rànquings: OVR, millors per posició, marge POT − OVR, líders per atribut, distribució d’OVR, joves i alçada F2B.
- Cerca global amb teclat (`/`, fletxes i Retorn).

Els indicadors derivats (índex de plantilla: mitjana de l’OVR dels vuit millors; encaix d’arquetip: pesos del catàleg) s’etiqueten com a F2B i no substitueixen cap classificació ni assignació.

## Codi de la interfície

- `app/encyclopedia.template.html`: estructura de la pàgina.
- `app/styles.css`: sistema visual.
- `app/app.js`: rutes, vistes, eines i edició.
- `app/player-corrections.mjs`: model de correccions compartit amb el compilador.

El compilador incorpora els quatre fitxers i les dades a `index.html`.

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

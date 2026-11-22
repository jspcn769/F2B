# F2B — Football to Basketball

F2B és una enciclopèdia d'història alternativa del bàsquet. Reutilitza la identitat de les competicions, els clubs, els participants i l'estructura dels enfrontaments del futbol com a context; no replica les classificacions ni les estadístiques futbolístiques.

## Versió actual: v0.3 — Primera Divisió 2008/09

La temporada pilot incorpora:
- 1 competició i 1 temporada.
- 20 identitats de club i 20 participacions d'equip.
- 38 jornades i 380 enfrontaments (10 per jornada).
- 190 emparellaments de la primera volta contrastats amb la font de referència.
- 190 emparellaments de tornada derivats invertint la localia, amb enllaç explícit al partit de primera volta.
- Cap jugador, plantilla, marcador de futbol, classificació de futbol o estadística futbolística.
- Cap resultat, classificació o estadística F2B simulat encara.

## Obrir l'aplicació

Obre `index.html` directament o utilitza GitHub Pages quan estigui activat al repositori. L'entrada és una compilació autònoma amb CSS, JavaScript i les dades del pilot incrustades; no necessita paquets externs.

## Paquet de projecte editable

El paquet ZIP distribuït amb aquesta versió inclou l'estructura modular del projecte:
- `assets/css/app.css`
- `assets/js/app.js`
- `data/catalog/`
- `data/seasons/laliga/2008-09/`
- `docs/`
- `tests/`

Per executar el projecte modular localment, inicia un servidor estàtic des de la carpeta arrel:

```bash
python -m http.server 8000
```

Després obre `http://localhost:8000`.

## Validar les dades

```bash
python tests/validate_season.py
node tests/render_smoke.js
```

Les comprovacions confirmen 20 clubs, 20 participacions, 38 jornades, 380 enfrontaments, 19 partits locals i 19 visitants per equip i emparellaments de doble volta. També comproven que no hi hagi marcadors ni registres de jugadors a la base del pilot.

## Abast i filosofia

F2B prioritza les dades que constitueixen la història pròpia de la simulació: resultats de bàsquet, classificacions F2B, estadístiques, jugadors, trajectòries, rècords i història de les competicions. Les dades REAL es limiten a la informació d'identitat i estructura necessària. La informació que no s'ha verificat no es completa amb valors ficticis.

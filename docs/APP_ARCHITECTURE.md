# F2B — Aplicació web, arquitectura v0.1

## Objectiu
Primera versió navegable per validar l'estructura i el model d'interacció de F2B abans d'importar les dades històriques i el pilot de FC Barcelona 2008/09.

## Fitxers
- `/index.html`: entrada de la demo del projecte, preparada per servir-se des de GitHub Pages. Conté el paquet inicial de la interfície incrustat i no depèn de biblioteques externes.
- El fitxer HTML autònom de distribució es lliura separadament per obrir-lo localment sense servidor.

## Mòduls de navegació
1. Centre de comandament
2. Jugadors
3. Clubs
4. Temporades
5. Competicions
6. Partits
7. Estadístiques
8. Mercat i contractes
9. Premis i rècords
10. Base de dades
11. Editor i configuració

## Capacitats implementades
- Navegació per mòduls amb disseny responsive.
- Registres buits per defecte: no es carreguen dades fictícies.
- Editor universal amb formularis variables segons el tipus d'entitat.
- Operacions bàsiques de crear, llegir, modificar i eliminar registres.
- Identificadors per tipus d'entitat: PLY, CLU, SEA, COM, MAT, STA, CTR i HON.
- Classificació de procedència: REAL, F2B, ALT i SIM.
- Estat editorial: PENDING, DRAFT, REVIEWED i APPROVED.
- Cerca bàsica i filtres per estat i procedència.
- Persistència provisional a `localStorage`.
- Importació i exportació de la base de dades en JSON.

## Model de registre
Cada registre té camps comuns:
- `id`: identificador únic
- `type`: tipus d'entitat
- `origin`: REAL, F2B, ALT o SIM
- `status`: PENDING, DRAFT, REVIEWED o APPROVED
- `source`: font o referència
- `notes`: notes editorials
- `createdAt` i `updatedAt`: marques temporals

Els camps específics depenen del tipus d'entitat i s'amplien des de l'esquema.

## Límits conscients d'aquesta versió
- Les dades s'emmagatzemen només al navegador actual.
- No existeix encara sincronització directa amb GitHub, backend compartit, autenticació ni permisos multiusuari.
- La importació substitueix la base local només després de confirmació.
- La validació de dades és inicial; no hi ha encara comprovació automàtica de relacions, fonts, duplicats o coherència històrica.
- Les relacions entre entitats estan representades conceptualment, però encara no són enllaços de dades operatius.
- No s'han importat dades reals del pilot Barça ni cap temporada.

## Evolució recomanada
1. Aprovar o modificar navegació, jerarquia visual i mòduls.
2. Fixar l'esquema de dades i les relacions entre entitats.
3. Construir el sistema de fitxes i editor per camps i relacions.
4. Importar el pilot Barça 2008/09 amb els estats de validació acordats.
5. Afegir auditoria, historial de canvis i validacions.
6. Definir backend i sincronització segura amb GitHub o una base central compartida.

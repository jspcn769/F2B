import fs from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = (file) => fs.readFile(new URL(file, root), 'utf8');
const json = async (file) => JSON.parse(await read(file));
const [db, conversion, inter, catalog, dictionary, rules, competitionCatalog, archetypeProfiles, playerHistory, crestCatalog, editionFiles, template] = await Promise.all([
  json('data/seasons/laliga/2008-09/pilot-base.json'),
  json('data/seasons/laliga/2008-09/conversions.json'),
  json('data/seasons/italy/2009-10/inter.json'),
  json('data/catalog/archetypes.json'),
  json('data/catalog/attributes.json'),
  json('data/rules/regulation.json'),
  json('data/catalog/competitions.json'),
  json('data/catalog/archetype-profiles.json'),
  json('data/catalog/player-history.json'),
  json('data/catalog/club-crests.json'),
  json('data/catalog/edition-files.json'),
  read('app/encyclopedia.template.html'),
]);
const check = (condition, message) => {
  if (!condition) throw new Error(message);
};
const unique = (rows, key) => new Set(rows.map(row => row[key])).size === rows.length;
const positions = ['BA','ES','AL','AP','P'];
const entries = new Map(catalog.entries.map(entry => [entry.id, entry]));
const attributeCodes = new Set(dictionary.map(([id]) => id));
check(entries.size === 75 && catalog.entries.length === 75, 'Calen 75 arquetips únics');
for (const position of positions) {
  check(catalog.entries.filter(entry => entry.position === position).length === 15, position);
  for (let index = 1; index <= 15; index++) {
    check(entries.has(position + '-' + String(index).padStart(2, '0')), 'Seqüència d’arquetips incompleta');
  }
}
check(attributeCodes.size === 36 && dictionary.length === 36, 'Calen 36 atributs únics');
check(rules.periods * rules.minutesPerPeriod === 48 && rules.regulationMinutes === 48 && rules.playersOnCourtPerTeam * rules.regulationMinutes === 240 && rules.teamPlayerMinutes === 240, 'Reglament invàlid');
check(db.clubs.length === 20 && db.rounds.length === 38 && db.fixtures.length === 380, 'Calendari incomplet');
check(db.players.length === 83 && unique(db.players,'id') && unique(db.playerSeasons,'id'), 'Identitats pilot invàlides');
check(conversion.profiles.length === 28 && unique(conversion.profiles,'membershipId') && conversion.partialPositions.length === 9 && unique(conversion.partialPositions,'membershipId'), 'Conversions pilot incompletes');
check(inter.players.length === 17 && unique(inter.players,'playerId'), 'Plantilla Inter incompleta');
const members = new Map(db.playerSeasons.map(row => [row.id,row]));
const players = new Map(db.players.map(row => [row.id,row]));
const teams = new Map(db.participants.map(row => [row.id,row]));
for (const m of members.values()) check(players.has(m.playerId) && teams.get(m.teamSeasonId)?.clubId === m.clubId, m.id);
const normalizeConversion = (profile) => {
  const {positions: roles, ovr, pot, archetypeId} = profile;
  check(roles.length >= 1 && roles.length <= 3 && new Set(roles).size === roles.length && roles.every(r=>positions.includes(r)), profile.name);
  check(entries.get(archetypeId)?.position === roles[0], profile.name + ' arquetip');
  check(Number.isInteger(ovr) && Number.isInteger(pot) && ovr >= 0 && ovr <= pot && pot <= 99, profile.name + ' OVR/POT');
  check(profile.heightCm + 15 === profile.heightF2bCm && profile.weightKg + 7 === profile.weightF2bKg, profile.name + ' físic');
};
for (const profile of conversion.profiles) {
  normalizeConversion(profile);
  const m = members.get(profile.membershipId);
  check(m?.playerId === profile.playerId && m.clubId === 'CLU-' + profile.team, profile.name + ' pertinença');
  check(Object.keys(profile.attributes).length === 36 && Object.entries(profile.attributes).every(([id,value])=>attributeCodes.has(id)&&Number.isInteger(value)&&value>=0&&value<=99) && profile.attributes.M2 === profile.pot, profile.name + ' atributs');
  const physicalSource = profile.team === 'FCB'
    ? 'https://www.footballsquads.co.uk/spain/2008-2009/laliga/barce.htm'
    : 'https://footballsquads.co.uk/spain/2008-2009/laliga/rmadrid.htm';
  const status = value => value ? 'APPROVED' : 'DRAFT';
  const [primary, secondary, tertiary] = profile.positions;
  Object.assign(m.conversion,{
    status:'IN_REVIEW',seasonAge:profile.age,nationalityReference:profile.country,realHeightCm:profile.heightCm,realWeightKg:profile.weightKg,
    realHeightSource:physicalSource,realWeightSource:physicalSource,physicalDataStatus:'REVIEWED',
    f2bHeightCm:profile.heightF2bCm,f2bWeightKg:profile.weightF2bKg,
    primaryPosition:primary,secondaryPosition:secondary??null,tertiaryPosition:tertiary??null,
    primaryPositionStatus:status(profile.confirmed.position),secondaryPositionStatus:secondary?status(profile.confirmed.position):'PENDING',
    archetypeId:profile.archetypeId,archetype:profile.archetypeId+' · '+entries.get(profile.archetypeId).name,
    archetypeStatus:'DRAFT',ovr:profile.ovr,ovrStatus:status(profile.confirmed.ovr),potential:profile.pot,potentialStatus:status(profile.confirmed.pot),
    attributes:{lab:profile.attributes},attributeStatus:'DRAFT',
    attributeNotes:'Valors estimats per al pilot. M2 reflecteix el POT.',
    conversionNotes:profile.role+' Disponibilitat: '+profile.availability+'.'
  });
  if(profile.name === 'Julien Faubert'){
    m.eligibilityStatus='REVIEW';
    m.eligibilityNotes='El rol de lateral durant la temporada requereix revisió.';
  }
  if(profile.name === 'Xavi Hernández') m.scopeEvidence='Plantilla pilot i posició de base aprovades.';
}
for(const row of conversion.partialPositions){
  const m=members.get(row.membershipId);
  check(m?.playerId===row.playerId && m.clubId==='CLU-VAL' && positions.includes(row.position), 'Posició parcial invàlida');
  Object.assign(m.conversion,{status:'IN_REVIEW',primaryPosition:row.position,primaryPositionStatus:row.status});
}
for(const profile of inter.players) normalizeConversion(profile);
const {groups, competitions}=competitionCatalog;
check(unique(groups,'id') && unique(competitions,'id'), 'IDs de competició o grup duplicats');
const groupIds = new Set(groups.map(group=>group.id));
const types = ['league','cup','league-cup','supercup','continental-cup','national-teams'];
for (const item of competitions) {
  check(/^CMP-[A-Z0-9-]+$/.test(item.id) && item.name && groupIds.has(item.groupId), 'Fitxa de competició invàlida');
  check(types.includes(item.type) && Array.isArray(item.aliases) && item.aliases.every(alias=>typeof alias==='string'), item.id);
}
check(groups.filter(group=>group.scope==='domestic').length===7, 'Calen set països al catàleg');
for (const group of groups.filter(group=>group.scope==='domestic')) {
  const domestic=competitions.filter(item=>item.groupId===group.id);
  for (const type of ['league','cup','supercup']) {
    check(domestic.some(item=>item.type===type), group.id+' sense '+type);
  }
}
const seasons = [db.season];
check(Array.isArray(editionFiles), 'Llista d’edicions invàlida');
for (const path of editionFiles) {
  check(/^data\/seasons\/[\w/-]+\.json$/.test(path) && !path.includes('//'), 'Ruta d’edició invàlida');
  const addition = await json(path);
  seasons.push(addition.season);
  for (const key of ['clubs','sources','players','participants','rounds','fixtures','playerSeasons']) {
    db[key].push(...(addition[key] ?? []));
  }
}
const byId = rows => new Map(rows.map(row => [row.id, row]));
const groupBy = (rows, key) => {
  const map = new Map();
  for (const row of rows) {
    const id = row[key];
    if (!map.has(id)) map.set(id, []);
    map.get(id).push(row);
  }
  return map;
};
for (const rows of [seasons, db.clubs, db.sources, db.players, db.participants, db.rounds, db.fixtures, db.playerSeasons]) {
  check(rows.every(row => typeof row?.id === 'string' && /^[A-Z0-9-]+$/.test(row.id)) && unique(rows, 'id'), 'Identificadors absents, invàlids o duplicats');
}
const seasonRecords = byId(seasons);
const clubRecords = byId(db.clubs);
const playerRecords = byId(db.players);
const teamRecords = byId(db.participants);
const fixtureRecords = byId(db.fixtures);
const sourceRecords = byId(db.sources);
const competitionRecords = byId(competitions);
const teamsByEdition = groupBy(db.participants, 'seasonId');
const roundsByEdition = groupBy(db.rounds, 'seasonId');
const fixturesByEdition = groupBy(db.fixtures, 'seasonId');
const editionIndex = seasons.map(s => {
  check(competitionRecords.has(s.competitionId) && s.seasonLabel && s.seasonKey, s.id + ' edició sense competició o curs');
  const teams = teamsByEdition.get(s.id) ?? [];
  const rounds = roundsByEdition.get(s.id) ?? [];
  const fixtures = fixturesByEdition.get(s.id) ?? [];
  check(unique(teams, 'clubId') && unique(rounds, 'roundNumber'), s.id + ' club o jornada duplicats');
  check((s.fixtureSourceIds ?? []).every(id => sourceRecords.has(id)), s.id + ' font desconeguda');
  return {id:s.id, competitionId:s.competitionId, label:s.seasonLabel, teams:teams.length, rounds:rounds.length, fixtures:fixtures.length};
});
for (const t of db.participants) {
  const s = seasonRecords.get(t.seasonId);
  check(clubRecords.has(t.clubId) && s && s.competitionId === t.competitionId, t.id + ' participació invàlida');
}
const fixtureRounds = new Map();
for (const r of db.rounds) {
  check(seasonRecords.has(r.seasonId) && Number.isInteger(r.roundNumber) && r.roundNumber > 0, r.id + ' jornada invàlida');
  for (const id of r.fixtureIds) {
    const f = fixtureRecords.get(id);
    check(f?.seasonId === r.seasonId && f.roundNumber === r.roundNumber && !fixtureRounds.has(id), r.id + ' partit sense jornada única: ' + id);
    fixtureRounds.set(id, r.id);
  }
}
for (const f of db.fixtures) {
  const home = teamRecords.get(f.homeTeamSeasonId), away = teamRecords.get(f.awayTeamSeasonId);
  check(seasonRecords.has(f.seasonId) && home?.seasonId === f.seasonId && away?.seasonId === f.seasonId &&
    home.clubId === f.homeClubId && away.clubId === f.awayClubId && home.id !== away.id, f.id + ' equips incompatibles');
  const roundId = fixtureRounds.get(f.id);
  check(roundId && (!f.roundId || f.roundId === roundId), f.id + ' jornada incompatible');
  f.roundId = roundId;
  check((f.sourceIds ?? []).every(id => sourceRecords.has(id)), f.id + ' font desconeguda');
  if (f.derivedFromFixtureId) {
    const base = fixtureRecords.get(f.derivedFromFixtureId);
    check(base?.seasonId === f.seasonId && base.homeTeamSeasonId === away.id && base.awayTeamSeasonId === home.id && !base.derivedFromFixtureId, f.id + ' primera volta incompatible');
  }
}
for (const p of db.players) {
  check((p.identitySourceIds ?? []).every(id => sourceRecords.has(id)), p.id + ' font desconeguda');
}
for (const m of db.playerSeasons) {
  const t = teamRecords.get(m.teamSeasonId);
  check(playerRecords.has(m.playerId) && t && t.clubId === m.clubId && t.seasonId === m.seasonId && m.conversion, m.id + ' jugador o plantilla incompatible');
  check(!m.sourceId || sourceRecords.has(m.sourceId), m.id + ' font desconeguda');
  check(!m.conversion.archetypeId || entries.has(m.conversion.archetypeId), m.id + ' arquetip desconegut');
}

const requiredProfileText=['family','identity','offense','offBallDefense','possession','fit','limits','physical','assignment','engine'];
check(catalog.entries.every(entry=>Object.hasOwn(archetypeProfiles,entry.id)), 'Falta una fitxa d’arquetip');
for(const [id,profile] of Object.entries(archetypeProfiles)){
  check(entries.has(id) && requiredProfileText.every(key=>typeof profile[key]==='string'&&profile[key].trim()), id+' incomplet');
  check(profile.indicators.length>0 && profile.indicators.every(value=>typeof value==='string'&&value.trim()), id+' sense indicadors');
  check(profile.near.length>0 && unique(profile.near,'id') && profile.near.every(peer=>peer.id!==id&&entries.has(peer.id)&&peer.distinction), id+' contrast invàlid');
  const official=catalog.fit.rows[id];
  const groups=official??profile.proposal?.groups;
  const dimensions=catalog.comparison.rows[id]??profile.proposal?.dimensions;
  check(groups?.length===3 && groups.every(group=>group.length>0&&group.every(code=>attributeCodes.has(code))) && new Set(groups.flat()).size===groups.flat().length, id+' atributs invàlids');
  check(dimensions?.length===catalog.comparison.dimensions.length && dimensions.every(symbol=>Object.values(catalog.comparison.levels).includes(symbol)), id+' dimensions invàlides');
  check(profile.references.length>0 && profile.references.every(ref=>{
    const m=members.get(ref.membershipId);
    return m?.playerId===ref.playerId && (ref.kind==='contrast'||(ref.kind==='pilot'&&m.conversion.archetypeId===id));
  }), id+' referències invàlides');
}
const archiveSections=['career','transfers','statistics','honours','awards','contracts','salaries'];
check(playerHistory && typeof playerHistory==='object' && !Array.isArray(playerHistory), 'Registre històric invàlid');
const archiveReferences = {
  clubId:clubRecords, fromClubId:clubRecords, toClubId:clubRecords,
  editionId:seasonRecords, competitionId:competitionRecords, teamSeasonId:teamRecords, sourceId:sourceRecords
};
for(const [id,record] of Object.entries(playerHistory)){
  check(playerRecords.has(id) && record && typeof record==='object' && !Array.isArray(record), id+' fitxa històrica invàlida');
  for(const [key,rows] of Object.entries(record)){
    check(archiveSections.includes(key) && Array.isArray(rows) && rows.every(row=>row && typeof row==='object' && !Array.isArray(row)), id+' apartat històric invàlid');
    for (const row of rows) {
      for (const [field, records] of Object.entries(archiveReferences)) {
        check(row[field] == null || records.has(row[field]), id + ' ' + key + ' referència desconeguda: ' + field);
      }
      const t = teamRecords.get(row.teamSeasonId);
      const s = seasonRecords.get(row.editionId ?? t?.seasonId);
      check(!t || ((!row.clubId || t.clubId === row.clubId) && (!row.editionId || t.seasonId === row.editionId)), id + ' equip històric incompatible');
      check(!s || !row.competitionId || s.competitionId === row.competitionId, id + ' competició històrica incompatible');
    }
  }
}
const pilotCrests = crestCatalog.bySeason[db.season.id];
const clubIds = new Set(db.participants.map(row => row.clubId));
check(pilotCrests && Object.keys(pilotCrests).length === clubIds.size && [...clubIds].every(id => pilotCrests[id]), 'Escuts pilot incomplets');
const crestImages = await Promise.all(Object.entries(crestCatalog.assets).map(async ([id, asset]) => {
  const source = crestCatalog.sources[asset.sourceId];
  check(/^assets\/crests\/[a-z0-9-]+\.webp$/.test(asset.file), id + ' ruta de l’escut invàlida');
  check(source?.title && source.rights && /^https:\/\//.test(source.url) && Number.isInteger(asset.sourcePage) && asset.sourcePage > 0, id + ' font de l’escut invàlida');
  const image = await fs.readFile(new URL(asset.file, root));
  check(image.toString('ascii', 0, 4) === 'RIFF' && image.toString('ascii', 8, 12) === 'WEBP', id + ' imatge WebP invàlida');
  return [id, {clubId:asset.clubId, src:'data:image/webp;base64,' + image.toString('base64'), sourceTitle:source.title, sourceUrl:source.url + '#page=' + asset.sourcePage}];
}));
const crestAssets = Object.fromEntries(crestImages);
for (const [editionId, assignments] of Object.entries(crestCatalog.bySeason)) {
  check(seasonRecords.has(editionId), editionId + ' edició d’escut desconeguda');
  for (const [clubId, id] of Object.entries(assignments)) check(crestAssets[id]?.clubId === clubId, clubId + ' escut assignat a un altre club');
}
const clubCrests = {assets:crestAssets, bySeason:crestCatalog.bySeason};
Object.assign(db,{archetypeCatalog:catalog,archetypeProfiles,attributeDictionary:dictionary,competitionCatalog,editionIndex,seasons,playerHistory,clubCrests,rules});
const token='__F2B_EMBEDDED_DATA__';
check(template.split(token).length===2, 'Punt d’injecció únic');
const output = template.replace(token, () => JSON.stringify(db).replaceAll('<','\\u003c'));
const destination = new URL('index.html', root);
if(process.argv.includes('--check')){
  check((await fs.readFile(destination,'utf8'))===output,'index.html requereix regeneració');
}else{
  await fs.writeFile(destination,output);
}
console.log(`F2B · ${seasons.length} edicions, ${db.participants.length} equips, ${db.fixtures.length} enfrontaments i ${db.playerSeasons.length} participacions de jugador validats`);

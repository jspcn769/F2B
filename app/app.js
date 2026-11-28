(() => {
'use strict';
__F2B_CORRECTION_MODULE__

/* ═══ Constants i estat ═══════════════════════════════════════════ */
const VERSION = 'v0.22';
const PILOT = 'SEA-ESP-PRI-2008-09';
const LOCAL_KEY = 'F2B_PLAYER_CORRECTIONS_V1';
const LEGACY_KEYS = ['F2B_LOCAL_PLAYER_DATA_V015','F2B_LOCAL_PLAYER_DATA_V06'];
const COMPARE_KEY = 'F2B_COMPARE_V1';
const COMPARE_MAX = 4;
const POS = ['BA','ES','AL','AP','P'];
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm = v => String(v ?? '').toLocaleLowerCase('ca').normalize('NFD').replace(/\p{M}/gu,'');
const hasData = v => Array.isArray(v) ? v.length > 0 : v !== null && v !== undefined && v !== '';
const avg = list => list.length ? list.reduce((a,b)=>a+b,0)/list.length : null;
const fmt1 = new Intl.NumberFormat('ca-ES',{maximumFractionDigits:1,minimumFractionDigits:1});
const fmt2 = new Intl.NumberFormat('ca-ES',{maximumFractionDigits:2,minimumFractionDigits:2});

let DB = null, indexes = {}, corrections, baseMembers, canonical = [], pending = [], storageFault = '';
let route = {page:'home', query:{}};
let cache = new Map();
let compareIds = [];
const ui = {
  roster:{group:true, sort:'ovr', q:''},
  lineup:{}, builder:{},
  calendar:{},
  attrAvg:true,
  rankAttr:'S3',
  dirView:null, dirLimit:60,
};

/* ═══ Etiquetes ═══════════════════════════════════════════════════ */
const playerStatus = {NOT_STARTED:'Pendent de conversió',PENDING:'Pendent',DRAFT:'Proposta',IN_REVIEW:'En revisió',REVIEWED:'Revisat',APPROVED:'Validat',LOCAL:'Edició local'};
const statusTone = {APPROVED:'ok',REVIEWED:'info',IN_REVIEW:'info',DRAFT:'warn',LOCAL:'accent',PENDING:'',NOT_STARTED:''};
const posName = {BA:'Base',ES:'Escolta',AL:'Aler',AP:'Ala pivot',P:'Pivot'};
const posPlural = {BA:'Bases',ES:'Escoltes',AL:'Alers',AP:'Ales pivots',P:'Pivots'};
const posColor = {BA:'#132236',ES:'#2d5f8a',AL:'#d9622b',AP:'#a8641a',P:'#2f7a4f'};
const attributeGroups = [['S','Tir'],['F','Finalització'],['C','Creació i conducció'],['D','Defensa'],['R','Rebot'],['A','Físic i atletisme'],['M','Intangibles']];
const competitionTypes = {league:'Lliga',cup:'Copa','league-cup':'Copa de la Lliga',supercup:'Supercopa','continental-cup':'Copa europea','national-teams':'Seleccions'};
const membershipLabels = {FIRST_TEAM_CORE:'Primer equip · nucli',MID_SEASON_SIGNING:'Incorporació durant el curs',MID_SEASON_DEPARTURE:'Baixa durant el curs',PROMOTED_TO_FIRST_TEAM:'Promocionat al primer equip',FIRST_TEAM_LOAN:'Cessió durant el curs',FIRST_TEAM_SQUAD:'Membre de la plantilla'};
const countryNames = {ARG:'Argentina',ESP:'Espanya',CMR:'Camerun',FRA:'França',CIV:'Costa d’Ivori',MLI:'Mali',ISL:'Islàndia',BLR:'Belarús',NED:'Països Baixos',BRA:'Brasil',POR:'Portugal',ITA:'Itàlia',URU:'Uruguai',SRB:'Sèrbia',BEL:'Bèlgica',CHI:'Xile',MEX:'Mèxic',TUR:'Turquia',USA:'Estats Units',CAN:'Canadà',EQG:'Guinea Equatorial',TUN:'Tunísia',MAR:'Marroc',GUI:'Guinea',VEN:'Veneçuela',ALG:'Algèria',NGA:'Nigèria',PER:'Perú',SUI:'Suïssa',IRN:'Iran',CPV:'Cap Verd',CZE:'Txèquia',HUN:'Hongria',SWE:'Suècia',BIH:'Bòsnia i Hercegovina',CRO:'Croàcia',ECU:'Equador',GER:'Alemanya'};
const archiveSections = {
  career:['Etapes de carrera','Encara no hi ha altres etapes documentades.',[['season','Temporada'],['club','Club'],['from','Des de','date'],['until','Fins a','date'],['note','Detall']]],
  transfers:['Traspassos i cessions','El mercat de traspassos encara està pendent de documentar.',[['date','Data','date'],['from','Origen'],['to','Destí'],['type','Moviment'],['fee','Import'],['note','Detall']]],
  statistics:['Estadístiques F2B','Apareixeran quan es publiquin actes de partits F2B.',[['season','Temporada'],['competition','Competició'],['games','PJ'],['starts','Tit.'],['minutes','Min.'],['points','Pts.'],['assists','Ast.'],['rebounds','Reb.'],['steals','Rob.'],['blocks','Taps']]],
  honours:['Palmarès','Els títols apareixeran quan es publiquin les edicions F2B.',[['season','Temporada'],['competition','Competició'],['club','Club'],['honour','Títol'],['note','Participació']]],
  awards:['Premis individuals','Els guardons encara estan pendents de publicació.',[['season','Temporada'],['competition','Competició'],['award','Premi']]],
  contracts:['Contractes','El registre contractual F2B encara està pendent.',[['club','Club'],['from','Inici','date'],['until','Venciment','date'],['type','Tipus'],['note','Condicions i primes']]],
  salaries:['Salaris','Les xifres arribaran amb l’escala econòmica F2B.',[['season','Temporada'],['club','Club'],['annual','Sou anual'],['currency','Moneda'],['note','Detall']]]
};

/* ═══ Emmagatzematge i correccions ════════════════════════════════ */
const store = {
  get(key){ try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value){ try { localStorage.setItem(key, value); return true; } catch { return false; } },
};
function loadData(){
  DB = window.F2B_DATA;
  if(!DB) throw new Error('Obre l’HTML compilat de l’enciclopèdia.');
  corrections = createPlayerCorrections(DB);
  baseMembers = DB.playerSeasons;
  canonical = DB.playerCorrections;
  try { pending = readStoredCorrections(); applyPending(pending); }
  catch(error){ storageFault = error.message; rebuildIndexes(); }
  try { const saved = JSON.parse(store.get(COMPARE_KEY) || '[]'); compareIds = Array.isArray(saved) ? saved.filter(id => indexes.playerSeasons.has(id)).slice(0, COMPARE_MAX) : []; }
  catch { compareIds = []; }
  showCorrectionStatus();
  window.addEventListener('storage', event => {
    if(event.key === COMPARE_KEY){ try { compareIds = JSON.parse(event.newValue || '[]').filter(id => indexes.playerSeasons.has(id)); } catch {} updateCompareUI(); return; }
    if(event.key !== LOCAL_KEY) return;
    try {
      const stored = readStoredCorrections();
      applyPending(corrections.merge(stored, pending));
      if(pending.some(entry => !stored.some(saved => saved.id === entry.id))) localStorage.setItem(LOCAL_KEY, JSON.stringify(corrections.pack(pending)));
      storageFault = '';
      if(!(route.page === 'player' && route.playerTab === 'editar')) render();
      showCorrectionStatus();
    } catch(error){ storageFault = error.message; showCorrectionStatus(); }
  });
}
function readStoredCorrections(){
  const raw = localStorage.getItem(LOCAL_KEY);
  return raw ? corrections.parse(JSON.parse(raw)) : [];
}
function applyPending(changes){
  const merged = corrections.merge(canonical, changes).slice(canonical.length);
  DB.playerSeasons = corrections.replay(baseMembers, merged, 'LOCAL');
  pending = merged;
  rebuildIndexes();
}
function saveCorrections(incoming){
  let stored = [];
  try { stored = readStoredCorrections(); }
  catch(error){ if(error.name !== 'SecurityError') throw error; }
  const merged = corrections.merge(stored, pending);
  applyPending(corrections.merge(merged, incoming));
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(corrections.pack(pending))); storageFault = ''; }
  catch { storageFault = 'El navegador no desa aquesta còpia. Exporta el JSON abans de tancar.'; }
  showCorrectionStatus();
}
function showCorrectionStatus(){
  $$('[data-local-count]').forEach(el => { el.textContent = pending.length || ''; el.dataset.count = pending.length; });
  const foot = $('#sideFoot');
  if(foot) foot.innerHTML = storageFault
    ? `<span style="color:#f2b8a6">${esc(storageFault)}</span>`
    : pending.length ? `${pending.length} ${pending.length === 1 ? 'correcció local desada' : 'correccions locals desades'} en aquest navegador.` : `Dades de l’arxiu ${esc(VERSION)} · sense correccions locals.`;
}
function downloadJson(payload, filename){
  const blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function exportLocalData(){
  if(!pending.length){ toast('No hi ha correccions locals per exportar.', 'error'); return; }
  downloadJson(corrections.pack(pending), 'F2B-correccions-' + new Date().toISOString().slice(0,10) + '.json');
  toast('JSON de correccions exportat.', 'ok');
}
function legacyBackups(){ try { return LEGACY_KEYS.filter(key => localStorage.getItem(key)); } catch { return []; } }
async function importLocalData(file){
  const before = pending.length;
  const changes = corrections.parse(JSON.parse(await file.text()));
  saveCorrections(changes);
  render();
  const added = pending.length - before;
  toast(added ? `${added} ${added === 1 ? 'correcció importada' : 'correccions importades'}.` : 'El fitxer no aporta correccions noves.', 'ok');
}

/* ═══ Índexs ══════════════════════════════════════════════════════ */
function groupBy(rows, key){
  const map = new Map();
  for(const item of rows){ const id = key(item); if(!map.has(id)) map.set(id, []); map.get(id).push(item); }
  return map;
}
function rebuildIndexes(){
  cache = new Map();
  indexes.editions = new Map(DB.editionIndex.map(x => [x.id, x]));
  indexes.seasons = new Map(DB.seasons.map(x => [x.id, x]));
  indexes.editionsByCompetition = groupBy(DB.editionIndex, x => x.competitionId);
  indexes.teamsByEdition = groupBy(DB.participants, x => x.seasonId);
  indexes.teamsByClub = groupBy(DB.participants, x => x.clubId);
  indexes.roundsByEdition = groupBy(DB.rounds, x => x.seasonId);
  for(const rows of indexes.roundsByEdition.values()) rows.sort((a,b) => a.roundNumber - b.roundNumber);
  indexes.sources = new Map(DB.sources.map(x => [x.id, x]));
  indexes.returnFixtures = groupBy(DB.fixtures.filter(x => x.derivedFromFixtureId), x => x.derivedFromFixtureId);
  indexes.homeFixtures = groupBy(DB.fixtures, x => x.homeTeamSeasonId);
  indexes.awayFixtures = groupBy(DB.fixtures, x => x.awayTeamSeasonId);
  indexes.membersByArchetype = groupBy(DB.playerSeasons.filter(x => x.conversion.archetypeId), x => x.conversion.archetypeId);
  indexes.competitions = new Map(DB.competitionCatalog.competitions.map(x => [x.id, x]));
  indexes.groups = new Map(DB.competitionCatalog.groups.map(x => [x.id, x]));
  indexes.clubs = new Map(DB.clubs.map(x => [x.id, x]));
  indexes.teams = new Map(DB.participants.map(x => [x.id, x]));
  indexes.rounds = new Map(DB.rounds.map(x => [x.id, x]));
  indexes.fixtures = new Map(DB.fixtures.map(x => [x.id, x]));
  indexes.players = new Map(DB.players.map(x => [x.id, x]));
  indexes.playerSeasons = new Map(DB.playerSeasons.map(x => [x.id, x]));
  indexes.playerSeasonsByTeam = groupBy(DB.playerSeasons, x => x.teamSeasonId);
  indexes.playerSeasonsByPlayer = groupBy(DB.playerSeasons, x => x.playerId);
  indexes.playerSeasonsBySeason = groupBy(DB.playerSeasons, x => x.seasonId);
  indexes.fixturesByRound = new Map(DB.rounds.map(r => [r.id, r.fixtureIds.map(id => indexes.fixtures.get(id))]));
  indexes.archetypes = new Map(DB.archetypeCatalog.entries.map(x => [x.id, x]));
  indexes.attrNames = new Map(DB.attributeDictionary);
  indexes.localMembers = new Set(pending.map(entry => entry.membershipId));
}
const player = id => indexes.players.get(id);
const playerSeason = id => indexes.playerSeasons.get(id);
const club = id => indexes.clubs.get(id);
const team = id => indexes.teams.get(id);
const round = id => indexes.rounds.get(id);
const fixture = id => indexes.fixtures.get(id);
const edition = id => indexes.editions.get(id);
const getCompetition = id => indexes.competitions.get(id);
const getGroup = id => indexes.groups.get(id);
const archetypeEntry = id => indexes.archetypes.get(id);
const archetypeProfile = id => Object.hasOwn(DB.archetypeProfiles, id) ? DB.archetypeProfiles[id] : undefined;
const seasonTeams = id => indexes.teamsByEdition.get(id) ?? [];
const seasonRounds = id => indexes.roundsByEdition.get(id) ?? [];
const clubTeams = id => indexes.teamsByClub.get(id) ?? [];
const teamMembers = id => indexes.playerSeasonsByTeam.get(id) ?? [];
const teamFixtures = id => [...(indexes.homeFixtures.get(id) ?? []), ...(indexes.awayFixtures.get(id) ?? [])].sort((a,b) => a.roundNumber - b.roundNumber);
const editionTitle = e => `${getCompetition(e.competitionId)?.name ?? 'Competició'} · ${e.label}`;
const shortName = p => p?.displayName || p?.fullName || '—';
const clubOf = t => t ? club(t.clubId) : null;
const positionsOf = cv => [cv.primaryPosition, cv.secondaryPosition, cv.tertiaryPosition].filter(Boolean);
const lab = m => m?.conversion?.attributes?.lab ?? null;
function memo(key, fn){ if(!cache.has(key)) cache.set(key, fn()); return cache.get(key); }

/* ═══ Rutes ═══════════════════════════════════════════════════════ */
const P = {
  home:() => '/home',
  competitions:id => '/competitions' + (id ? '/' + id.toLowerCase() : ''),
  competition:id => '/competition/' + id,
  season:(id=PILOT, tab='overview', q='') => `/season/${id}/${tab}${q}`,
  club:id => '/club/' + id,
  team:(t, tab='overview') => `/team/${typeof t === 'string' ? t : t.id}/${tab}`,
  round:id => '/round/' + id,
  fixture:id => '/fixture/' + id,
  player:(id, tab='resum', ms) => `/player/${id}/${tab}${ms ? '/' + ms : ''}`,
  member:(m, tab='resum') => P.player(m.playerId, tab, m.id),
  archetype:id => '/archetypes/' + id,
  players:(q={}) => '/players' + qs(q),
  compare:ids => '/compare' + (ids?.length ? '/' + ids.join(',') : ''),
  rankings:() => '/rankings',
  database:(tab) => '/database' + (tab ? '/' + tab : ''),
};
function qs(obj){
  const entries = Object.entries(obj).filter(([,v]) => hasData(v));
  return entries.length ? '?' + entries.map(([k,v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v)).join('&') : '';
}
function parseRoute(){
  const raw = location.hash.replace(/^#\/?/, '');
  const [pathPart, queryPart=''] = raw.split('?');
  const query = Object.fromEntries(new URLSearchParams(queryPart));
  const [page, ...p] = pathPart.split('/').filter(Boolean).map(decodeURIComponent);
  route = {page: page || 'home', query};
  if(page === 'competitions') route.groupId = p[0];
  if(page === 'competition') route.competitionId = p[0];
  if(page === 'season'){ route.seasonId = p[0] || PILOT; route.tab = p[1] || 'overview'; }
  if(page === 'club') route.clubId = p[0];
  if(page === 'team'){ route.teamId = p[0]; route.tab = p[1] || 'overview'; }
  if(page === 'round') route.roundId = p[0];
  if(page === 'fixture') route.fixtureId = p[0];
  if(page === 'player'){ route.playerId = p[0]; route.playerTab = p[1]; route.membershipId = p[2]; }
  if(page === 'archetypes') route.archetypeId = p[0]?.toUpperCase();
  if(page === 'database') route.tab = p[0] || 'resum';
  if(page === 'compare' && p[0]){ route.compare = p[0].split(',').filter(id => indexes.playerSeasons.has(id)).slice(0, COMPARE_MAX); }
}
function navigate(path, {replace=false}={}){
  const hash = '#' + path;
  if(replace) history.replaceState(null, '', hash);
  else if(location.hash !== hash) history.pushState(null, '', hash);
  parseRoute(); render({focus:true}); closeMenu();
}
function replaceQuery(path){ history.replaceState(null, '', '#' + path); parseRoute(); }

/* ═══ Peces d'interfície ══════════════════════════════════════════ */
const link = (path, html, cls='', attrs='') => `<a class="${cls}" href="#${esc(path)}" data-route="${esc(path)}" ${attrs}>${html}</a>`;
const initials = name => (name || 'F2B').replace(/[^A-Za-zÀ-ÿ ]/g,'').split(/\s+/).filter(Boolean).slice(0,2).map(x => x[0]).join('').toUpperCase();
function crestAsset(clubId, editionId){ const c = DB.clubCrests; return c?.assets[c.bySeason[editionId]?.[clubId]]; }
function crest(c, editionId, size=''){
  const editions = editionId ?? clubTeams(c?.id)[0]?.seasonId;
  const image = crestAsset(c?.id, editions);
  return `<span class="crest ${size}" aria-hidden="true">${image ? `<img src="${esc(image.src)}" alt="" decoding="async" loading="lazy">` : esc(initials(c?.shortName || c?.name))}</span>`;
}
function flag(code){
  const svg = Object.hasOwn(DB.countryFlags.flags, code) ? DB.countryFlags.flags[code] : null;
  const label = countryNames[code] ?? code ?? 'Nacionalitat pendent';
  return svg ? `<img class="flag" src="data:image/svg+xml,${esc(encodeURIComponent(svg))}" width="21" height="14" alt="${esc(label)}" title="${esc(label)}">` : `<span class="faint" title="${esc(label)}">—</span>`;
}
function ovr(value, kind='ovr', title=''){
  if(!hasData(value)) return `<span class="ovr none${kind === 'pot' ? ' pot' : ''}" title="Pendent">—</span>`;
  const t = Math.max(0, Math.min(1, (value - 60) / 36));
  return `<span class="ovr${kind === 'pot' ? ' pot' : ''}${kind !== 'pot' && t > .55 ? ' hi' : ''}" style="--t:${t.toFixed(3)}" ${title ? `title="${esc(title)}"` : ''}>${esc(value)}</span>`;
}
const posChip = (code, alt=false) => `<span class="pos${alt ? ' alt' : ''}" title="${esc(posName[code] ?? code)}">${esc(code)}</span>`;
const posChips = cv => { const list = positionsOf(cv); return list.length ? `<span class="pos-list">${list.map((c,i) => posChip(c, i > 0)).join('')}</span>` : '<span class="faint">Pendent</span>'; };
const statusTag = (status, label) => `<span class="tag ${statusTone[status] ?? ''}">${esc(label ?? playerStatus[status] ?? status ?? 'Pendent')}</span>`;
const layer = (name, title='') => `<span class="layer ${name}" title="${esc(title || ({REAL:'Dada històrica documentada',F2B:'Conversió o valoració F2B',ALT:'Decisió d’història alternativa',SIM:'Resultat de simulació'})[name])}">${name}</span>`;
const empty = (icon, title, desc, action='') => `<div class="empty"><div class="icon" aria-hidden="true">${icon}</div><b>${esc(title)}</b>${desc ? `<p>${esc(desc)}</p>` : ''}${action ? `<div class="actions" style="justify-content:center;margin-top:12px">${action}</div>` : ''}</div>`;
const pageHead = (eyebrow, title, desc='', actions='') => `<header class="page-head"><div><div class="eyebrow">${eyebrow}</div><h1>${esc(title)}</h1>${desc ? `<p>${desc}</p>` : ''}</div>${actions ? `<div class="actions">${actions}</div>` : ''}</header>`;
const sectionHead = (title, desc='', actions='') => `<div class="section-head"><div><h2>${esc(title)}</h2>${desc ? `<p>${desc}</p>` : ''}</div>${actions ? `<div class="actions">${actions}</div>` : ''}</div>`;
const metric = (value, label, note='') => `<div class="metric"><b>${esc(value)}</b><span>${esc(label)}</span>${note ? `<small>${note}</small>` : ''}</div>`;
const card = (title, body, {desc='', actions='', cls=''}={}) => `<section class="card ${cls}"><div class="card-head"><div><h3>${title}</h3>${desc ? `<p>${desc}</p>` : ''}</div>${actions}</div>${body}</section>`;
const kv = rows => { const list = rows.filter(([,v]) => hasData(v)); return list.length ? `<dl class="kv">${list.map(([k,v]) => `<div><dt>${esc(k)}</dt><dd>${v}</dd></div>`).join('')}</dl>` : ''; };
const tabsNav = (items, active, pathFn, label) => `<nav class="tabs" aria-label="${esc(label)}">${items.map(([id,name,count]) => link(pathFn(id), `${esc(name)}${hasData(count) ? `<span class="count">${esc(count)}</span>` : ''}`, active === id ? 'active' : '', active === id ? 'aria-current="page"' : '')).join('')}</nav>`;
const heightF2B = cm => Number.isFinite(cm) ? fmt2.format(cm/100) + ' m' : '—';
const weightF2B = kg => Number.isFinite(kg) ? kg + ' kg' : '—';
const displayDate = value => { if(!value) return '—'; const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value); return m ? `${m[3]}/${m[2]}/${m[1]}` : String(value); };
const sourceLinks = ids => ids.map(id => indexes.sources.get(id)).filter(src => /^https?:\/\//i.test(src?.url ?? '')).map(src => `<a class="link" href="${esc(src.url)}" target="_blank" rel="noopener noreferrer">${esc(src.name)} ↗</a>`).join(' · ');
const bar = (value, max=99, mark=null, cls='') => `<div class="bar ${cls}" aria-hidden="true"><i style="width:${Math.max(0, Math.min(100, value / max * 100)).toFixed(1)}%"></i>${mark != null ? `<span class="mark" style="left:${Math.max(0, Math.min(100, mark / max * 100)).toFixed(1)}%"></span>` : ''}</div>`;
const sortable = (label, cls='') => `<th scope="col" class="${cls}" aria-sort="none"><button type="button" data-action="sort-table">${label}</button></th>`;
function toast(message, kind='ok'){
  const box = $('#toasts'); if(!box) return;
  const el = document.createElement('div');
  el.className = 'toast ' + kind; el.setAttribute('role', kind === 'error' ? 'alert' : 'status'); el.textContent = message;
  box.append(el); setTimeout(() => el.remove(), 3800);
}

/* ═══ Càlculs F2B (derivats de dades existents) ═══════════════════ */
function memberRow(m){
  const p = player(m.playerId), c = club(m.clubId), t = team(m.teamSeasonId);
  return {m, p, c, t, cv:m.conversion};
}
function groupScore(attrs, prefix){
  if(!attrs) return null;
  const values = Object.entries(attrs).filter(([id,v]) => id.startsWith(prefix) && id !== 'M2' && Number.isFinite(v)).map(([,v]) => v);
  return values.length ? avg(values) : null;
}
function archetypeGroups(id){
  const official = DB.archetypeCatalog.fit.rows[id];
  return official ? {groups:official, official:true} : (archetypeProfile(id)?.proposal ? {groups:archetypeProfile(id).proposal.groups, official:false} : null);
}
function fitScore(attrs, id){
  const def = archetypeGroups(id);
  if(!attrs || !def) return null;
  const weights = Object.values(DB.archetypeCatalog.fit.weights);
  let total = 0;
  for(const [i, codes] of def.groups.entries()){
    const values = codes.map(code => attrs[code]).filter(Number.isFinite);
    if(values.length !== codes.length) return null;
    total += weights[i] * avg(values);
  }
  return {score:total, official:def.official};
}
function teamStats(t){
  return memo('team:' + t.id, () => {
    const rows = teamMembers(t.id).map(memberRow).filter(r => r.p);
    const rated = rows.filter(r => Number.isFinite(r.cv.ovr)).sort((a,b) => b.cv.ovr - a.cv.ovr);
    const top = rated.slice(0, 8);
    const heights = rows.map(r => r.cv.f2bHeightCm).filter(Number.isFinite);
    const ages = rows.map(r => r.cv.seasonAge).filter(Number.isFinite);
    const posCounts = Object.fromEntries(POS.map(code => [code, rows.filter(r => r.cv.primaryPosition === code).length]));
    return {rows, count:rows.length, index:top.length ? avg(top.map(r => r.cv.ovr)) : null, best:rated[0] ?? null, avgHeight:avg(heights), avgAge:avg(ages), posCounts};
  });
}
function seasonRows(seasonId){
  return memo('season:' + (seasonId ?? 'all'), () => (seasonId ? indexes.playerSeasonsBySeason.get(seasonId) ?? [] : DB.playerSeasons).map(memberRow).filter(r => r.p && r.c));
}
function positionAverages(seasonId, position){
  return memo(`posavg:${seasonId}:${position}`, () => {
    const rows = seasonRows(seasonId).filter(r => r.cv.primaryPosition === position && lab(r.m));
    const out = {};
    for(const [id] of DB.attributeDictionary){ const v = rows.map(r => lab(r.m)[id]).filter(Number.isFinite); out[id] = avg(v); }
    return out;
  });
}
function teamLineups(t){
  const tp = t.teamProfile, tac = t.tacticalProfile;
  if(tp) return tp.lineups.map(l => ({id:l.id, name:l.name, description:l.description, players:l.players.map(p => ({id:p.membershipId, role:p.role}))}));
  if(tac) return [{id:'base', name:'Quintet base', description:'Tancament: ' + tac.closing, players:tac.starters.map((id,i) => ({id, role:posName[POS[i]]}))}];
  return [];
}
function teamRotation(t){
  const tp = t.teamProfile, tac = t.tacticalProfile;
  if(tp){
    const starters = new Set(tp.lineups[0].players.map(r => r.membershipId));
    const rows = Object.entries(tp.rotationRoles).map(([id, role]) => {
      const segs = tp.stints.filter(s => s.memberships.includes(id)).map(s => [s.start, s.end]);
      return {id, role, segs, minutes:segs.reduce((a,[s,e]) => a + e - s, 0), starter:starters.has(id)};
    }).sort((a,b) => b.minutes - a.minutes);
    return {mode:'stints', rows, stints:tp.stints, note:null};
  }
  if(tac){
    const starters = new Set(tac.starters);
    return {mode:'minutes', rows:tac.rotation.map(r => ({id:r.membershipId, minutes:r.minutes, role:null, starter:starters.has(r.membershipId)})).sort((a,b) => b.minutes - a.minutes), note:tac.availability};
  }
  return null;
}
function rotationMinutes(t){ return memo('rotmin:' + t.id, () => new Map((teamRotation(t)?.rows ?? []).map(r => [r.id, r]))); }
function contractCell(m){
  const h = DB.playerHistory?.[m.playerId];
  const contract = h?.contracts?.find(row => row.teamSeasonId === m.teamSeasonId || row.clubId === m.clubId);
  const salary = h?.salaries?.find(row => row.teamSeasonId === m.teamSeasonId || row.editionId === m.seasonId);
  if(salary?.annual) return esc(salary.annual + (salary.currency ? ' ' + salary.currency : ''));
  if(contract?.until) return 'Fins ' + esc(displayDate(contract.until));
  return '<span class="faint" title="Escala econòmica F2B pendent">Pendent</span>';
}

/* ═══ Navegació: ruta, menú lateral i context ═════════════════════ */
function crumbs(){
  const items = [{label:'F2B', path:'/home'}];
  const ctxSeason = route.seasonId || team(route.teamId)?.seasonId || round(route.roundId)?.seasonId || fixture(route.fixtureId)?.seasonId;
  const e = edition(ctxSeason);
  const seasonCrumbs = () => { if(!e) return; const c = getCompetition(e.competitionId); items.push({label:'Competicions', path:P.competitions()}, {label:c.name, path:P.competition(c.id)}, {label:e.label, path:P.season(e.id)}); };
  switch(route.page){
    case 'home': items.push({label:'Inici'}); break;
    case 'competitions': items.push({label:'Competicions', path:P.competitions()}); if(route.groupId) items.push({label:getGroup(route.groupId.toUpperCase())?.name ?? route.groupId}); break;
    case 'competition': items.push({label:'Competicions', path:P.competitions()}, {label:getCompetition(route.competitionId)?.name ?? 'Fitxa'}); break;
    case 'seasons': items.push({label:'Edicions'}); break;
    case 'season': seasonCrumbs(); break;
    case 'clubs': items.push({label:'Equips i clubs'}); break;
    case 'club': items.push({label:'Equips i clubs', path:'/clubs'}, {label:club(route.clubId)?.name ?? 'Club'}); break;
    case 'team': seasonCrumbs(); items.push({label:clubOf(team(route.teamId))?.name ?? 'Equip'}); break;
    case 'round': seasonCrumbs(); items.push({label:round(route.roundId)?.label ?? 'Jornada'}); break;
    case 'fixture': { seasonCrumbs(); const f = fixture(route.fixtureId); if(f) items.push({label:round(f.roundId).label, path:P.round(f.roundId)}, {label:`${club(f.homeClubId).shortName} – ${club(f.awayClubId).shortName}`}); break; }
    case 'players': items.push({label:'Jugadors'}); break;
    case 'player': { const p = player(route.playerId); const m = currentMembership(p); items.push({label:'Jugadors', path:P.players()}); if(m) items.push({label:club(m.clubId).name, path:P.team(m.teamSeasonId, 'roster')}); items.push({label:shortName(p)}); break; }
    case 'archetypes': items.push({label:'Arquetips', path:'/archetypes'}); if(route.archetypeId) items.push({label:archetypeEntry(route.archetypeId)?.name ?? route.archetypeId}); break;
    case 'compare': items.push({label:'Comparador'}); break;
    case 'rankings': items.push({label:'Rànquings'}); break;
    case 'database': items.push({label:'Cobertura i correccions'}); break;
  }
  return items;
}
function renderCrumbs(items){
  const html = items.map((it, i) => (i ? '<span class="sep" aria-hidden="true">›</span>' : '') + (it.path && i < items.length - 1 ? link(it.path, esc(it.label)) : `<b aria-current="page">${esc(it.label)}</b>`)).join('');
  $('#crumbs').innerHTML = html;
  return items.length > 2 ? `<nav class="crumbs-mobile" aria-label="Ruta">${items.slice(1).map((it,i,arr) => (i ? '<span class="sep">›</span>' : '') + (it.path && i < arr.length - 1 ? link(it.path, esc(it.label)) : `<b>${esc(it.label)}</b>`)).join('')}</nav>` : '';
}
function setNav(){
  const map = {competition:'competitions', season:'seasons', round:'seasons', fixture:'seasons', club:'clubs', team:'clubs', player:'players'};
  const active = map[route.page] ?? route.page;
  $$('[data-nav]').forEach(a => { const on = a.dataset.nav === active; a.classList.toggle('active', on); on ? a.setAttribute('aria-current','page') : a.removeAttribute('aria-current'); });
  const ctx = route.seasonId || team(route.teamId)?.seasonId || PILOT;
  const e = edition(ctx) ?? DB.editionIndex[0];
  $('#sideContext').innerHTML = e ? `<small>Temporada en curs</small><b>${esc(editionTitle(e))}</b>
    <div class="side-links">${link(P.season(e.id),'Resum')}${link(P.season(e.id,'teams'),'Equips')}${link(P.season(e.id,'calendar'),'Calendari')}${link(P.season(e.id,'rankings'),'Rànquings')}</div>` : '';
}
function openMenu(){ $('#sidebar').classList.add('open'); $('#scrim').classList.add('open'); $('#menuButton').setAttribute('aria-expanded','true'); $('#sidebar a')?.focus(); }
function closeMenu(){ $('#sidebar').classList.remove('open'); $('#scrim').classList.remove('open'); $('#menuButton').setAttribute('aria-expanded','false'); }

/* ═══ Comparador: estat compartit ═════════════════════════════════ */
function setCompare(ids){
  compareIds = [...new Set(ids)].filter(id => indexes.playerSeasons.has(id)).slice(0, COMPARE_MAX);
  store.set(COMPARE_KEY, JSON.stringify(compareIds));
  updateCompareUI();
}
function toggleCompare(id){
  if(compareIds.includes(id)) setCompare(compareIds.filter(x => x !== id));
  else if(compareIds.length >= COMPARE_MAX){ toast(`El comparador admet ${COMPARE_MAX} jugadors. Treu-ne un abans d’afegir-ne un altre.`, 'error'); return; }
  else { setCompare([...compareIds, id]); toast(`${shortName(player(playerSeason(id).playerId))} afegit al comparador.`, 'ok'); }
}
function updateCompareUI(){
  $$('[data-compare-count]').forEach(el => { el.textContent = compareIds.length || ''; el.dataset.count = compareIds.length; });
  $$('[data-compare-toggle]').forEach(el => {
    const on = compareIds.includes(el.dataset.compareToggle);
    if(el.type === 'checkbox') el.checked = on;
    else { el.classList.toggle('is-on', on); el.setAttribute('aria-pressed', on); const lbl = el.querySelector('[data-label]'); if(lbl) lbl.textContent = on ? 'Al comparador' : 'Compara'; }
  });
  const tray = $('#compareTray');
  if(!compareIds.length || route.page === 'compare'){ tray.hidden = true; return; }
  tray.hidden = false;
  tray.innerHTML = `<span class="dots" aria-hidden="true">${Array.from({length:COMPARE_MAX}, (_,i) => `<i class="${i < compareIds.length ? 'on' : ''}"></i>`).join('')}</span>
    <span>${compareIds.length} al comparador</span>${link(P.compare(compareIds), 'Compara', 'btn accent sm')}<button class="btn ghost sm" type="button" data-action="compare-clear" style="color:#fff" aria-label="Buida el comparador">✕</button>`;
}
const compareButton = m => `<button class="btn sm${compareIds.includes(m.id) ? ' is-on' : ''}" type="button" data-compare-toggle="${esc(m.id)}" aria-pressed="${compareIds.includes(m.id)}"><span aria-hidden="true">⇄</span><span data-label>${compareIds.includes(m.id) ? 'Al comparador' : 'Compara'}</span></button>`;
const compareCheck = m => `<input class="check" type="checkbox" data-compare-toggle="${esc(m.id)}" ${compareIds.includes(m.id) ? 'checked' : ''} aria-label="Afegeix ${esc(shortName(player(m.playerId)))} al comparador">`;

/* ═══ Inici ═══════════════════════════════════════════════════════ */
function renderHome(){
  const e = edition(PILOT) ?? DB.editionIndex[0];
  const teams = seasonTeams(e.id);
  const rows = seasonRows(e.id);
  const rated = rows.filter(r => Number.isFinite(r.cv.ovr)).sort((a,b) => b.cv.ovr - a.cv.ovr || b.cv.potential - a.cv.potential);
  const tactical = teams.filter(t => t.tacticalProfile || t.teamProfile).length;
  const r = DB.rules;
  const posCounts = POS.map(code => [code, rows.filter(x => x.cv.primaryPosition === code).length]);
  const maxPos = Math.max(...posCounts.map(([,n]) => n), 1);
  const groups = DB.competitionCatalog.groups;
  return `<section class="hero">
      <div style="position:relative;z-index:1">
        <div class="eyebrow">Enciclopèdia d’història alternativa</div>
        <h1>La història del futbol,<br>jugada en bàsquet.</h1>
        <p>Clubs, temporades i carreres reals. Plantilles convertides a cinc contra cinc, amb posicions, arquetips, valoracions i sistemes de joc propis de F2B.</p>
        <div class="actions">${link(P.season(e.id), 'Obre la temporada ' + esc(e.label) + ' <span aria-hidden="true">→</span>', 'btn accent')}${link(P.players(), 'Explora jugadors', 'btn')}<button class="btn" type="button" data-scroll="guia">Com es llegeix</button></div>
      </div>
      <div class="hero-panel"><small>Temporada de construcció</small><h2>${esc(editionTitle(e))}</h2>
        <div class="hero-stats"><div><b>${e.teams}</b><span>equips</span></div><div><b>${rows.length}</b><span>jugadors convertits</span></div>
        <div><b>${e.fixtures}</b><span>enfrontaments al calendari</span></div><div><b>${tactical}</b><span>fitxes tàctiques</span></div></div>
      </div>
    </section>
    <section class="section">${sectionHead('Equips de la temporada', 'Cada fitxa reuneix la identitat de joc, el quintet, la rotació, la plantilla i el calendari.', link(P.season(e.id,'teams'), 'Taula d’equips', 'btn sm'))}
      <div class="crest-wall">${teams.map(t => link(P.team(t), crest(clubOf(t), t.seasonId, 'md') + `<span>${esc(clubOf(t).shortName || clubOf(t).name)}</span>`, 'crest-tile')).join('')}</div>
    </section>
    <section class="section grid g2">
      ${card('Valoracions més altes', `<ol class="leader-list">${rated.slice(0,8).map((x,i) => leaderItem(x, i, ovr(x.cv.ovr))).join('')}</ol>`, {desc:'OVR F2B del curs ' + esc(e.label) + '.', actions:link(P.rankings(), 'Rànquings', 'btn sm')})}
      ${card('Jugadors per posició', `<div class="hbars">${posCounts.map(([code,n]) => `<div class="hbar">${link(P.players({pos:code}), `${posChip(code)} ${esc(posPlural[code])}`)}${bar(n, maxPos)}<b>${n}</b></div>`).join('')}</div>
        <p class="small muted" style="margin:12px 0 0">Posició principal de cada participació. Toca una posició per filtrar el directori.</p>`, {desc:'Repartiment de la plantilla convertida.'})}
    </section>
    <section class="section" id="guia">${sectionHead('Com es llegeix F2B', 'Cada dada indica d’on ve. La història real fixa el marc i el joc F2B construeix el que passa a pista.')}
      <div class="layers">
        <div>${layer('REAL')} <b>Història</b><p>Clubs, temporades, calendari, trajectòries, dates i mesures documentades amb font.</p></div>
        <div>${layer('F2B')} <b>Conversió</b><p>Posicions, arquetips, OVR/POT, atributs, físic convertit i plantejaments tàctics.</p></div>
        <div>${layer('ALT')} <b>Alternativa</b><p>Decisions d’història alternativa aprovades manualment, sempre traçables.</p></div>
        <div>${layer('SIM')} <b>Simulació</b><p>Resultats, classificacions i estadístiques generats pel motor. Encara pendents.</p></div>
      </div>
      <div class="rules" style="margin-top:10px">
        <div class="rule"><b>${r.regulationMinutes} min</b><span>${r.periods} quarts de ${r.minutesPerPeriod} minuts</span></div>
        <div class="rule"><b>${r.playersOnCourtPerTeam} a pista</b><span>${r.teamPlayerMinutes} minuts de participació per equip</span></div>
        <div class="rule"><b>+15 cm · +7 kg</b><span>Conversió física sobre la mesura real</span></div>
        <div class="rule"><b>5 posicions</b><span>${POS.map(c => posName[c]).join(', ')}</span></div>
        <div class="rule"><b>Elegibilitat</b><span>Només migcampistes i davanters del primer equip</span></div>
      </div>
    </section>
    <section class="section">${sectionHead('Catàleg de competicions', `${DB.competitionCatalog.competitions.length} competicions en ${groups.length} àmbits.`, link(P.competitions(), 'Tot el catàleg', 'btn sm'))}
      <div class="crest-wall">${groups.map(g => link(P.competitions(g.id), `<span class="crest md" aria-hidden="true">${esc(g.id)}</span><span>${esc(g.name)}<small class="faint" style="display:block;font-weight:500;font-size:12px">${DB.competitionCatalog.competitions.filter(c => c.groupId === g.id).length} competicions</small></span>`, 'crest-tile')).join('')}</div>
    </section>`;
}
function leaderItem(x, i, value){
  return `<li><span class="rank">${i + 1}</span><span class="who">${crest(x.c, x.m.seasonId, 'sm')}<span>${link(P.member(x.m), esc(shortName(x.p)))}<small>${esc(x.c.shortName || x.c.name)} · ${esc(positionsOf(x.cv).join('/') || '—')}${x.cv.archetypeId ? ' · ' + esc(archetypeEntry(x.cv.archetypeId)?.name ?? '') : ''}</small></span></span>${value}</li>`;
}

/* ═══ Competicions i edicions ═════════════════════════════════════ */
function editionCard(e){
  const c = getCompetition(e.competitionId);
  const players = (indexes.playerSeasonsBySeason.get(e.id) ?? []).length;
  return `<article class="card edition-card"><div class="yr">${esc(e.label)}</div><div><div class="eyebrow">${e.id === PILOT ? 'Temporada de construcció' : 'Edició'}</div><h3 style="font:700 20px var(--serif);margin:3px 0">${esc(c.name)}</h3>
    <p class="muted small" style="margin:0">${e.teams} equips · ${e.rounds} jornades · ${e.fixtures} enfrontaments · ${players} jugadors convertits</p></div>
    <div class="actions">${link(P.season(e.id,'teams'), 'Equips', 'btn sm')}${link(P.season(e.id), 'Obre l’edició →', 'btn primary sm')}</div></article>`;
}
function renderCompetitions(){
  const groups = DB.competitionCatalog.groups;
  const selected = groups.find(g => g.id.toLowerCase() === route.groupId);
  if(route.groupId && !selected) return empty('▤', 'Àmbit desconegut', 'Consulta els àmbits del catàleg.', link(P.competitions(), 'Totes les competicions', 'btn'));
  const shown = selected ? [selected] : groups;
  const total = DB.competitionCatalog.competitions.length, withEditions = DB.competitionCatalog.competitions.filter(c => (indexes.editionsByCompetition.get(c.id) ?? []).length).length;
  return pageHead('Arxiu', 'Competicions', `${total} competicions catalogades. ${withEditions} ${withEditions === 1 ? 'té' : 'tenen'} edicions amb dades. Les altres ja tenen identitat estable i rebran edicions per temporades.`)
    + `<div class="chips" style="margin-bottom:18px" role="list">${link(P.competitions(), 'Totes', 'chip' + (!selected ? ' active' : ''))}${groups.map(g => link(P.competitions(g.id), `${esc(g.name)} <span class="count">${DB.competitionCatalog.competitions.filter(c => c.groupId === g.id).length}</span>`, 'chip' + (g === selected ? ' active' : ''))).join('')}</div>
    <div class="catalog">${shown.map(g => `<section><h2 style="font:700 21px var(--serif);margin:0 0 8px">${esc(g.name)}</h2><div class="comp-list">${DB.competitionCatalog.competitions.filter(c => c.groupId === g.id).map(compRow).join('')}</div></section>`).join('')}</div>`;
}
function compRow(c){
  const eds = indexes.editionsByCompetition.get(c.id) ?? [];
  return link(P.competition(c.id), `<span><b>${esc(c.name)}</b>${c.historicalOnly ? '<small>Denominació històrica</small>' : ''}</span><span class="cat small muted">${esc(competitionTypes[c.type])}</span><span>${eds.length ? `<span class="tag ok dot">${eds.length} ${eds.length === 1 ? 'edició' : 'edicions'}</span>` : '<span class="tag">Sense edicions</span>'}</span>`, 'comp-row');
}
function renderCompetition(){
  const c = getCompetition(route.competitionId);
  if(!c) return empty('▤', 'Competició no trobada', 'La fitxa no consta al catàleg F2B.', link(P.competitions(), 'Tornar al catàleg', 'btn'));
  const g = getGroup(c.groupId), eds = indexes.editionsByCompetition.get(c.id) ?? [];
  return `<section class="mast"><div class="mast-body"><div class="eyebrow">${esc(g.name)} · ${esc(competitionTypes[c.type])}</div><h1>${esc(c.name)}</h1>
      ${c.aliases.length ? `<p>També: ${esc(c.aliases.join(' · '))}</p>` : ''}<div class="mast-links">${link(P.competitions(g.id), 'Altres competicions de ' + esc(g.name))}</div></div>
      <div class="mast-stats"><div><b>${eds.length}</b><span>edicions</span></div></div></section>
    ${sectionHead('Edicions')}${eds.length ? eds.map(editionCard).join('') : empty('◷', 'Encara no hi ha edicions', 'La competició ja és al catàleg. Els equips i el calendari apareixeran quan s’incorpori la primera edició.')}`;
}
function renderSeasons(){
  return pageHead('Arxiu', 'Edicions', 'Edicions amb equips, calendari i plantilles incorporades. L’arxiu es construeix temporada a temporada.') + DB.editionIndex.map(editionCard).join('');
}

/* ═══ Temporada ═══════════════════════════════════════════════════ */
function renderSeason(){
  const e = edition(route.seasonId);
  if(!e) return empty('◷', 'Edició no trobada', 'Consulta les edicions disponibles.', link('/seasons', 'Veure edicions', 'btn'));
  const c = getCompetition(e.competitionId);
  const rows = seasonRows(e.id);
  const tabs = [['overview','Resum'],['teams','Equips',e.teams],['calendar','Calendari',e.rounds],['players','Jugadors',rows.length],['rankings','Rànquings'],['statistics','Estadístiques']];
  const views = {overview:seasonOverview, teams:seasonTeamsView, calendar:seasonCalendar, players:seasonPlayers, rankings:() => rankingsBody(e.id), statistics:seasonStatistics};
  const active = Object.hasOwn(views, route.tab) ? route.tab : 'overview';
  return `<section class="mast"><div class="mast-body"><div class="eyebrow">${esc(getGroup(c.groupId).name)} · ${esc(competitionTypes[c.type])}</div><h1>${esc(c.name)} ${esc(e.label)}</h1>
      <p>${e.teams} equips · ${e.rounds} jornades · ${e.fixtures} enfrontaments a doble volta</p>
      <div class="mast-links">${link(P.competition(c.id), 'Fitxa de la competició')}${sourceLinks(indexes.seasons.get(e.id).fixtureSourceIds ?? [])}</div></div>
      <div class="mast-stats"><div><b>${rows.length}</b><span>jugadors</span></div><div><b>${seasonTeams(e.id).filter(t => t.tacticalProfile || t.teamProfile).length}</b><span>fitxes tàctiques</span></div><div><b>${DB.fixtures.filter(f => f.seasonId === e.id && f.resultF2B != null).length}</b><span>partits simulats</span></div></div></section>
    ${tabsNav(tabs, active, id => P.season(e.id, id), 'Apartats de l’edició')}${views[active](e)}`;
}
function seasonOverview(e){
  const teams = seasonTeams(e.id).map(t => ({t, s:teamStats(t), c:clubOf(t)})).sort((a,b) => (b.s.index ?? 0) - (a.s.index ?? 0));
  const max = Math.max(...teams.map(x => x.s.index ?? 0)), min = Math.min(...teams.map(x => x.s.index ?? 99));
  const first = seasonRounds(e.id)[0];
  const rows = seasonRows(e.id);
  const review = rows.filter(r => r.m.eligibilityStatus === 'REVIEW');
  return `<div class="split">
      ${card('Força de plantilla F2B', `<div class="hbars">${teams.map(({t,s,c}) => `<div class="hbar">${link(P.team(t), `${esc(c.shortName || c.name)}`)}${bar((s.index ?? min) - (min - 3), (max - (min - 3)) || 1)}<b>${s.index ? fmt1.format(s.index) : '—'}</b></div>`).join('')}</div>
        <p class="small muted" style="margin:12px 0 0">${layer('F2B')} Mitjana de l’OVR dels vuit jugadors millor valorats. És un indicador de plantilla, no una classificació: els resultats sortiran del motor de partit.</p>`, {desc:'Índex de plantilla per equip.'})}
      <div class="stack">
        ${card('Estat de l’edició', kv([
          ['Equips amb plantilla', esc(`${teams.filter(x => x.s.count).length} de ${teams.length}`)],
          ['Jugadors convertits', esc(rows.length)],
          ['Amb atributs F2B LAB', esc(rows.filter(r => lab(r.m)).length)],
          ['Fitxes tàctiques', esc(teams.filter(x => x.t.tacticalProfile || x.t.teamProfile).length)],
          ['Elegibilitat en revisió', review.length ? link(P.database('revisio'), esc(review.length)) : '0'],
          ['Resultats F2B', '<span class="tag">Pendents de simulació</span>'],
        ]))}
        ${first ? card(esc(first.label), `<div class="fixtures">${(indexes.fixturesByRound.get(first.id) ?? []).slice(0,5).map(f => fixtureRow(f)).join('')}</div>`, {desc:'Primers enfrontaments del calendari.', actions:link(P.season(e.id,'calendar'), 'Calendari', 'btn sm')}) : ''}
      </div>
    </div>`;
}
function seasonTeamsView(e){
  const teams = seasonTeams(e.id);
  if(!teams.length) return empty('◈', 'Participants pendents', 'Els equips es mostraran quan es registrin.');
  return `<div class="table-wrap"><table class="t"><thead><tr>${sortable('Equip')}${sortable('Entrenador', 'hide-m')}${sortable('Jugadors','r')}${sortable('Índex F2B','r')}${sortable('Millor jugador','hide-m')}${sortable('Alçada mitjana','r hide-m')}${sortable('Edat mitjana','r hide-m')}${sortable('Fitxa tàctica','c')}</tr></thead><tbody>
    ${teams.map(t => { const s = teamStats(t), c = clubOf(t); const coaches = t.coachingStaff?.stints.map(x => x.name) ?? [];
      return `<tr><td data-v="${esc(c.name)}">${link(P.team(t), crest(c, t.seasonId) + `<span><b>${esc(c.name)}</b></span>`, 'club-chip')}</td>
        <td class="hide-m small" data-v="${esc(coaches[coaches.length - 1] ?? '')}">${coaches.length ? esc(coaches.join(' → ')) : '<span class="faint">—</span>'}</td>
        <td class="r" data-v="${s.count}">${s.count}</td><td class="r" data-v="${s.index ?? 0}"><b>${s.index ? fmt1.format(s.index) : '—'}</b></td>
        <td class="hide-m" data-v="${s.best?.cv.ovr ?? 0}">${s.best ? `${link(P.member(s.best.m), esc(shortName(s.best.p)), 'link')} ${ovr(s.best.cv.ovr)}` : '—'}</td>
        <td class="r hide-m" data-v="${s.avgHeight ?? 0}">${s.avgHeight ? heightF2B(s.avgHeight) : '—'}</td><td class="r hide-m" data-v="${s.avgAge ?? 0}">${s.avgAge ? fmt1.format(s.avgAge) : '—'}</td>
        <td class="c" data-v="${t.teamProfile ? 2 : t.tacticalProfile ? 1 : 0}">${t.teamProfile ? '<span class="tag ok">Ampliada</span>' : t.tacticalProfile ? '<span class="tag info">Base</span>' : '<span class="tag">Pendent</span>'}</td></tr>`; }).join('')}
    </tbody></table></div><p class="small muted">Toca la capçalera d’una columna per ordenar. Índex F2B: mitjana de l’OVR dels vuit millors jugadors.</p>`;
}
function seasonCalendar(e){
  const rounds = seasonRounds(e.id);
  if(!rounds.length) return empty('▦', 'Calendari pendent', 'Les jornades apareixeran quan es registrin.');
  const teamId = route.query.team && team(route.query.team)?.seasonId === e.id ? route.query.team : '';
  const rn = Math.min(Math.max(Number(route.query.round) || 1, 1), rounds.length);
  const r = rounds[rn - 1];
  const filter = `<div class="toolbar"><label class="field grow"><span>Equip</span><select data-bind="calendar-team" data-season="${esc(e.id)}"><option value="">Totes les jornades</option>${seasonTeams(e.id).map(t => `<option value="${esc(t.id)}" ${t.id === teamId ? 'selected' : ''}>${esc(clubOf(t).name)}</option>`).join('')}</select></label>
    <span class="result-count">${teamId ? `${teamFixtures(teamId).length} enfrontaments de ${esc(clubOf(team(teamId)).name)}` : `${esc(r.label)} · ${(indexes.fixturesByRound.get(r.id) ?? []).length} enfrontaments`}</span></div>`;
  if(teamId) return filter + `<div class="fixtures">${teamFixtures(teamId).map(f => fixtureRow(f, teamId)).join('')}</div>`;
  return filter + `<div class="round-strip" role="list" aria-label="Jornades">${rounds.map(x => link(P.season(e.id, 'calendar', qs({round:x.roundNumber})), String(x.roundNumber), x === r ? 'active' : '', `aria-label="${esc(x.label)}" ${x === r ? 'aria-current="true"' : ''}`)).join('')}</div>
    <div class="section-head" style="margin-top:14px"><div><h2>${esc(r.label)}</h2></div><div class="actions">${rn > 1 ? link(P.season(e.id,'calendar',qs({round:rn - 1})), '← Anterior', 'btn sm') : ''}${rn < rounds.length ? link(P.season(e.id,'calendar',qs({round:rn + 1})), 'Següent →', 'btn sm') : ''}${link(P.round(r.id), 'Fitxa de la jornada', 'btn sm')}</div></div>
    <div class="fixtures">${(indexes.fixturesByRound.get(r.id) ?? []).map(f => fixtureRow(f)).join('')}</div>`;
}
function seasonPlayers(e){ return directory({season:e.id, embedded:true}); }
function seasonStatistics(){
  return empty('▥', 'Estadístiques F2B pendents', 'Les estadístiques sortiran de les actes del motor de partit (capa SIM). No s’importa cap registre de gols ni d’estadística del futbol.', link(P.rankings(), 'Mentrestant, consulta els rànquings de valoració', 'btn'));
}
function fixtureRow(f, focusTeam=''){
  const h = club(f.homeClubId), a = club(f.awayClubId), r = round(f.roundId);
  const me = id => focusTeam && id === focusTeam ? ' me' : '';
  return link(P.fixture(f.id), `<span class="rd">${esc(r.label.replace('Jornada','J.'))}</span><span class="side home${me(f.homeTeamSeasonId)}"><span>${esc(h.shortName || h.name)}</span>${crest(h, f.seasonId)}</span><span class="vs">${f.resultF2B == null ? 'VS' : esc(f.resultF2B)}</span><span class="side away${me(f.awayTeamSeasonId)}">${crest(a, f.seasonId)}<span>${esc(a.shortName || a.name)}</span></span>${focusTeam ? `<span class="tag">${f.homeTeamSeasonId === focusTeam ? 'Local' : 'Fora'}</span>` : '<span></span>'}`, 'fixture' + (focusTeam ? ' is-focus' : ''), `aria-label="${esc(r.label)}: ${esc(h.name)} contra ${esc(a.name)}"`);
}

/* ═══ Clubs ═══════════════════════════════════════════════════════ */
function renderClubs(){
  const e = edition(PILOT);
  const teams = seasonTeams(e.id).map(t => ({t, s:teamStats(t), c:clubOf(t)}));
  const order = route.query.sort === 'index' ? (a,b) => (b.s.index ?? 0) - (a.s.index ?? 0) : (a,b) => a.c.name.localeCompare(b.c.name, 'ca');
  teams.sort(order);
  return pageHead('Explora', 'Equips i clubs', `${DB.clubs.length} clubs amb identitat estable. Cada equip-temporada té la seva fitxa amb plantilla, quintets, rotació i calendari.`, `<div class="seg" role="group" aria-label="Ordre">${['name','index'].map(k => `<button type="button" data-action="route" data-path="${esc('/clubs' + (k === 'index' ? '?sort=index' : ''))}" aria-pressed="${(route.query.sort === 'index') === (k === 'index')}">${k === 'index' ? 'Per índex F2B' : 'Alfabètic'}</button>`).join('')}</div>`)
    + `<div class="grid g3">${teams.map(({t,s,c}) => {
      const coach = t.coachingStaff?.stints.at(-1)?.name;
      return link(P.team(t), `<div class="card-head" style="align-items:center">${crest(c, t.seasonId, 'md')}<div style="flex:1;min-width:0"><h3 style="font:700 18px var(--serif)">${esc(c.name)}</h3><p class="small muted" style="margin:2px 0 0">${esc(c.city ?? '')}${coach ? ' · ' + esc(coach) : ''}</p></div><span class="tag" title="Índex F2B">${s.index ? fmt1.format(s.index) : '—'}</span></div>
        <div class="pos-dist" title="Jugadors per posició">${POS.map(code => s.posCounts[code] ? `<i style="flex:${s.posCounts[code]};background:${posColor[code]}" title="${esc(posPlural[code])}: ${s.posCounts[code]}"></i>` : '').join('')}</div>
        <p class="small muted" style="margin:10px 0 0">${s.count} jugadors${s.best ? ` · Referent: <b style="color:var(--ink)">${esc(shortName(s.best.p))}</b> (${s.best.cv.ovr})` : ''}</p>`, 'card link-card');
    }).join('')}</div><div class="legend" style="justify-content:flex-start;margin-top:12px">${POS.map(code => `<span><i style="background:${posColor[code]}"></i>${esc(posPlural[code])}</span>`).join('')}</div>`;
}
function renderClub(){
  const c = club(route.clubId);
  if(!c) return empty('◈', 'Club no trobat', 'El club sol·licitat no consta al directori.', link('/clubs', 'Equips i clubs', 'btn'));
  const teams = clubTeams(c.id);
  const image = teams.length ? crestAsset(c.id, teams[0].seasonId) : null;
  return `<section class="mast">${crest(c, teams[0]?.seasonId, 'lg')}<div class="mast-body"><div class="eyebrow">Club</div><h1>${esc(c.name)}</h1><p>${esc([c.city, c.country === 'Spain' ? 'Espanya' : c.country].filter(Boolean).join(' · '))}</p>
      ${c.aliases?.length ? `<div class="mast-links"><span style="color:#c3d0dd">També: ${esc(c.aliases.join(' · '))}</span></div>` : ''}</div>
      <div class="mast-stats"><div><b>${teams.length}</b><span>${teams.length === 1 ? 'participació' : 'participacions'}</span></div></div></section>
    ${sectionHead('Participacions F2B', 'Cada participació és un equip-temporada amb plantilla pròpia.')}
    ${teams.length ? `<div class="grid g2">${teams.map(t => { const e = edition(t.seasonId), s = teamStats(t);
      return card(link(P.team(t), esc(editionTitle(e))), `${kv([['Jugadors', esc(s.count)], ['Índex F2B', s.index ? esc(fmt1.format(s.index)) : '—'], ['Entrenadors', esc(t.coachingStaff?.stints.map(x => x.name).join(' → ') ?? '—')], ['Referent', s.best ? link(P.member(s.best.m), esc(shortName(s.best.p)), 'link') : '—']])}
        <div class="actions" style="margin-top:12px">${link(P.team(t), 'Resum', 'btn sm primary')}${link(P.team(t,'roster'), 'Plantilla', 'btn sm')}${link(P.team(t,'calendar'), 'Calendari', 'btn sm')}</div>`); }).join('')}</div>`
      : empty('◈', 'Participacions pendents', 'Aquí apareixeran les edicions en què consta el club.')}
    ${image ? `<p class="note info" style="margin-top:16px">Escut de ${esc(edition(teams[0].seasonId).label)} · <a class="link" href="${esc(image.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(image.sourceTitle)} ↗</a></p>` : ''}`;
}

/* ═══ Equip ═══════════════════════════════════════════════════════ */
function renderTeam(){
  const t = team(route.teamId);
  if(!t) return empty('◈', 'Equip no trobat', 'Aquesta participació no consta a l’arxiu.', link('/clubs', 'Equips i clubs', 'btn'));
  const c = clubOf(t), e = edition(t.seasonId), s = teamStats(t);
  const tabs = [['overview','Resum'],['roster','Plantilla',s.count],['tactics','Sistema de joc'],['rotation','Rotació'],['calendar','Calendari',teamFixtures(t.id).length]];
  if(t.teamProfile) tabs.push(['market','Mercat']);
  tabs.push(['stats','Estadístiques']);
  const views = {overview:teamOverview, roster:teamRoster, tactics:teamTactics, rotation:teamRotationView, calendar:teamCalendar, market:teamMarket, stats:teamStatsView};
  const active = tabs.some(([id]) => id === route.tab) ? route.tab : 'overview';
  const coaches = t.coachingStaff?.stints ?? [];
  const sameYear = clubTeams(c.id).filter(o => o.id !== t.id && edition(o.seasonId)?.label === e.label);
  return `<section class="mast">${crest(c, e.id, 'lg')}<div class="mast-body"><div class="eyebrow">${esc(editionTitle(e))}</div><h1>${esc(c.name)}</h1>
      <p>${coaches.length ? 'Banqueta: ' + esc(coaches.map(x => x.name).join(' → ')) : esc(c.city ?? '')}</p>
      <div class="mast-links">${link(P.club(c.id), 'Fitxa del club')}${link(P.season(e.id,'teams'), 'Altres equips del curs')}${sameYear.map(o => link(P.team(o), esc(editionTitle(edition(o.seasonId))))).join('')}</div></div>
      <div class="mast-stats"><div><b>${s.index ? fmt1.format(s.index) : '—'}</b><span>índex F2B</span></div><div><b>${s.count}</b><span>jugadors</span></div><div><b>${s.avgHeight ? heightF2B(s.avgHeight) : '—'}</b><span>alçada mitjana</span></div></div></section>
    ${tabsNav(tabs, active, id => P.team(t, id), 'Apartats de l’equip')}<div id="teamView">${views[active](t)}</div>`;
}
function teamOverview(t){
  const s = teamStats(t);
  if(!s.count) return empty('◉', 'Plantilla pendent', 'Aquest equip encara no té jugadors convertits.');
  const identity = t.teamProfile?.summary ?? t.tacticalProfile?.identity;
  const rot = teamRotation(t);
  const coaches = t.coachingStaff;
  const bestByPos = POS.map(code => [code, s.rows.filter(r => r.cv.primaryPosition === code).sort((a,b) => (b.cv.ovr ?? 0) - (a.cv.ovr ?? 0))[0]]);
  return `<div class="split">
      <div class="stack">
        ${card('Identitat de joc', identity ? `<div class="prose"><p style="font-size:16px">${esc(identity)}</p></div><p class="small muted" style="margin:0">${layer('F2B')} Plantejament proposat a partir del perfil històric de la plantilla.${t.teamProfile ? ' Context: ' + sourceLinks([t.teamProfile.historySourceId]) : ''}</p>` : empty('◇', 'Fitxa tàctica pendent', 'La identitat de joc d’aquest equip encara no s’ha redactat.'), {actions:link(P.team(t,'tactics'), 'Sistema complet', 'btn sm')})}
        ${lineupExplorer(t)}
      </div>
      <div class="stack">
        ${coaches ? card('Banqueta', coachTimeline(coaches), {desc:'Etapes per jornada.'}) : ''}
        ${rot ? card('Rotació de referència', `<div class="hbars">${rot.rows.slice(0,9).map(r => { const m = playerSeason(r.id); return `<div class="hbar">${link(P.member(m), esc(shortName(player(m.playerId))))}<div class="minutes-bar${r.starter ? ' starter' : ''}"><i style="width:calc(${(r.minutes / DB.rules.regulationMinutes * 100).toFixed(1)}% - 4px)"></i></div><b>${r.minutes}′</b></div>`; }).join('')}</div>
          <div class="legend" style="justify-content:flex-start"><span><i style="background:var(--accent)"></i>Quintet inicial</span><span><i style="background:var(--navy-3)"></i>Rotació</span></div>`, {desc:`Minuts sobre ${DB.rules.regulationMinutes}. Total d’equip: ${DB.rules.teamPlayerMinutes}.`, actions:link(P.team(t,'rotation'), 'Detall', 'btn sm')}) : ''}
        ${card('Referents per posició', `<ul class="lineup-list">${bestByPos.map(([code, r]) => `<li>${posChip(code)}${r ? `<span>${link(P.member(r.m), esc(shortName(r.p)), 'link')}<small>${esc(archetypeEntry(r.cv.archetypeId)?.name ?? '—')}</small></span>${ovr(r.cv.ovr)}` : '<span class="faint">Sense jugador principal</span><span></span>'}</li>`).join('')}</ul>`, {actions:link(P.team(t,'roster'), 'Plantilla', 'btn sm')})}
      </div>
    </div>`;
}
function coachTimeline({sourceId, stints}){
  const total = DB.rounds.filter(r => r.seasonId === PILOT).length || 38;
  return stints.map(x => `<div class="coach-line"><b>${esc(x.name)}</b><span class="small muted">J${x.firstRound}–J${x.lastRound}</span><div class="coach-span"><i style="left:${((x.firstRound - 1) / total * 100).toFixed(1)}%;width:${((x.lastRound - x.firstRound + 1) / total * 100).toFixed(1)}%"></i></div></div>`).join('') + `<p class="small muted" style="margin:10px 0 0">${layer('REAL')} ${sourceLinks([sourceId])}</p>`;
}
function lineupExplorer(t){
  const lineups = teamLineups(t).filter(l => !l.textOnly);
  const rosterIds = new Set(teamMembers(t.id).map(m => m.id));
  const activeId = ui.lineup[t.id] ?? lineups[0]?.id ?? 'builder';
  const options = [...lineups.map(l => [l.id, l.name]), ['builder', 'Construeix un quintet']];
  return `<section class="card" data-lineup-team="${esc(t.id)}"><div class="card-head"><div><h3>Quintets</h3><p>${lineups.length ? 'Quintets de referència de la fitxa tàctica. Construeix-ne un per comparar perfils.' : 'Encara no hi ha quintets de referència. Pots construir-ne un amb la plantilla.'}</p></div></div>
    <div class="chips" role="group" aria-label="Tria quintet" style="margin-bottom:14px">${options.map(([id,name]) => `<button class="chip" type="button" data-action="lineup" data-team="${esc(t.id)}" data-lineup="${esc(id)}" aria-pressed="${id === activeId}">${esc(name)}</button>`).join('')}</div>
    <div data-lineup-view>${lineupView(t, activeId, lineups, rosterIds)}</div></section>`;
}
function lineupView(t, activeId, lineups=teamLineups(t).filter(l => !l.textOnly)){
  if(activeId === 'builder'){
    const roster = teamStats(t).rows.slice().sort((a,b) => POS.indexOf(a.cv.primaryPosition) - POS.indexOf(b.cv.primaryPosition) || (b.cv.ovr ?? 0) - (a.cv.ovr ?? 0));
    const ids = ui.builder[t.id] ?? (lineups[0]?.players.map(p => p.id) ?? POS.map(code => roster.find(r => r.cv.primaryPosition === code)?.m.id ?? roster[0]?.m.id));
    ui.builder[t.id] = ids;
    const players = ids.map((id, i) => ({id, role:'Experiment · ' + posName[POS[i]]}));
    return `<div class="builder" role="group" aria-label="Selecció del quintet">${POS.map((code, i) => `<label>${esc(posName[code])}<select data-bind="builder" data-team="${esc(t.id)}" data-slot="${i}">${roster.map(r => `<option value="${esc(r.m.id)}" ${r.m.id === ids[i] ? 'selected' : ''}>${esc(shortName(r.p))} · ${esc(r.cv.primaryPosition ?? '—')} ${esc(r.cv.ovr ?? '')}</option>`).join('')}</select></label>`).join('')}</div>
      <p class="small muted" style="margin:10px 0 14px">Laboratori local: el quintet no es desa ni modifica la fitxa tàctica.</p>${courtAndList(players, 'Quintet construït')}`;
  }
  const l = lineups.find(x => x.id === activeId) ?? lineups[0];
  if(!l) return empty('◇', 'Sense quintet', '');
  return (l.description ? `<p style="margin:0 0 14px">${esc(l.description)}</p>` : '') + courtAndList(l.players, l.name);
}
function courtAndList(players, name){
  const rows = players.map((p, i) => { const m = playerSeason(p.id); return {...p, m, pl:player(m.playerId), cv:m.conversion, slot:POS[i]}; });
  const sum = lineupSummary(rows.map(r => r.m));
  return `<div class="court-wrap"><div class="court" role="group" aria-label="${esc(name)} a mitja pista">
      <svg viewBox="0 0 500 370" preserveAspectRatio="none" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2"><path d="M13 18H487V354H13ZM13 177H57C91 322 409 322 443 177H487M176 18V149H324V18M176 149A74 58 0 0 0 324 149M222 37H278"/><circle cx="250" cy="50" r="13"/><path d="M202 354A48 43 0 0 1 298 354"/></g></svg>
      ${rows.map((r, i) => `<div class="slot s${i + 1}">${link(P.member(r.m), `<span class="p">${esc(r.slot)}</span><strong>${esc(shortName(r.pl))}</strong><span class="o">OVR ${esc(r.cv.ovr ?? '—')}</span>`)}</div>`).join('')}
    </div>
    <div class="court-side"><ul class="lineup-list">${rows.map(r => `<li>${posChip(r.slot)}<span>${link(P.member(r.m), esc(shortName(r.pl)), 'link')}<small>${esc(r.role)} · ${esc(positionsOf(r.cv).join('/') || '—')}</small></span>${ovr(r.cv.ovr)}</li>`).join('')}</ul>
      <div><div class="lineup-sum" style="margin-top:0"><div><b>${sum.ovr ? fmt1.format(sum.ovr) : '—'}</b><span>OVR mitjà</span></div><div><b>${sum.height ? heightF2B(sum.height) : '—'}</b><span>alçada</span></div><div><b>${sum.weight ? Math.round(sum.weight) + ' kg' : '—'}</b><span>pes</span></div><div><b>${sum.covered}/5</b><span>posicions</span></div></div>
      <div class="hbars" style="margin-top:12px">${sum.groups.map(([label, v]) => `<div class="hbar"><span class="small">${esc(label)}</span>${bar(v ?? 0)}<b class="small">${v ? Math.round(v) : '—'}</b></div>`).join('')}</div></div>
    </div></div>`;
}
function lineupSummary(members){
  const cvs = members.map(m => m.conversion);
  const g = prefix => avg(members.map(m => groupScore(lab(m), prefix)).filter(Number.isFinite));
  return {ovr:avg(cvs.map(c => c.ovr).filter(Number.isFinite)), height:avg(cvs.map(c => c.f2bHeightCm).filter(Number.isFinite)), weight:avg(cvs.map(c => c.f2bWeightKg).filter(Number.isFinite)),
    covered:new Set(cvs.map(c => c.primaryPosition).filter(Boolean)).size,
    groups:[['Creació','C'],['Tir','S'],['Finalització','F'],['Defensa','D'],['Rebot','R'],['Físic','A']].map(([l,p]) => [l, g(p)])};
}
function teamRoster(t){
  const s = teamStats(t);
  if(!s.count) return empty('◉', 'Plantilla pendent', 'Aquest equip encara no té fitxes de jugador.');
  return `<div class="toolbar">
      <label class="field grow"><span>Filtra la plantilla</span><input type="search" data-bind="roster-q" value="${esc(ui.roster.q)}" placeholder="Nom, posició o arquetip"></label>
      <label class="field"><span>Ordena per</span><select data-bind="roster-sort">${[['ovr','OVR'],['pot','POT'],['number','Dorsal'],['name','Nom'],['height','Alçada F2B'],['age','Edat'],['minutes','Minuts de referència']].map(([k,l]) => `<option value="${k}" ${ui.roster.sort === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      <div class="field"><span>Vista</span><div class="seg" role="group" aria-label="Agrupació"><button type="button" data-action="roster-group" data-value="1" aria-pressed="${ui.roster.group}">Per posició</button><button type="button" data-action="roster-group" data-value="0" aria-pressed="${!ui.roster.group}">Llista</button></div></div>
    </div><div id="rosterTable">${rosterTable(t)}</div>
    <p class="small muted">${layer('REAL')} dorsal, nacionalitat i mesura d’origen · ${layer('F2B')} posicions, arquetip, OVR/POT, alçada i pes convertits. Les files marcades tenen correccions locals.</p>`;
}
function rosterTable(t){
  const rot = rotationMinutes(t);
  const q = norm(ui.roster.q);
  const sorters = {
    ovr:(a,b) => (b.cv.ovr ?? -1) - (a.cv.ovr ?? -1) || (b.cv.potential ?? -1) - (a.cv.potential ?? -1),
    pot:(a,b) => (b.cv.potential ?? -1) - (a.cv.potential ?? -1),
    number:(a,b) => (a.m.squadNumber ?? 999) - (b.m.squadNumber ?? 999),
    name:(a,b) => shortName(a.p).localeCompare(shortName(b.p), 'ca'),
    height:(a,b) => (b.cv.f2bHeightCm ?? 0) - (a.cv.f2bHeightCm ?? 0),
    age:(a,b) => (a.cv.seasonAge ?? 99) - (b.cv.seasonAge ?? 99),
    minutes:(a,b) => (rot.get(b.m.id)?.minutes ?? 0) - (rot.get(a.m.id)?.minutes ?? 0),
  };
  const rows = teamStats(t).rows.filter(r => !q || norm([r.p.fullName, r.p.displayName, ...positionsOf(r.cv), archetypeEntry(r.cv.archetypeId)?.name, r.cv.archetypeId].join(' ')).includes(q)).sort(sorters[ui.roster.sort] ?? sorters.ovr);
  if(!rows.length) return empty('⌕', 'Cap jugador coincideix amb el filtre', 'Prova amb un altre nom o posició.');
  const head = `<thead><tr><th scope="col" class="c">#</th><th scope="col">Jugador</th><th scope="col" class="c">OVR</th><th scope="col" class="c">POT</th><th scope="col" class="c">Nac.</th><th scope="col" class="r">Alçada F2B</th><th scope="col" class="r hide-m">Pes F2B</th><th scope="col">Posicions</th><th scope="col" class="hide-m">Arquetip</th><th scope="col" class="hide-m">Contracte</th><th scope="col" class="r hide-m">Min.</th><th scope="col" class="c"><span class="sr-only">Comparador</span>⇄</th></tr></thead>`;
  const line = r => { const rm = rot.get(r.m.id); const arch = archetypeEntry(r.cv.archetypeId);
    return `<tr class="${indexes.localMembers.has(r.m.id) ? 'is-local' : ''}"><td class="c"><span class="dorsal">${esc(r.m.squadNumber ?? '–')}</span></td>
      <td><div class="player-cell"><div class="who">${link(P.member(r.m), esc(shortName(r.p)))}<small>${esc(r.p.displayName && r.p.displayName !== r.p.fullName ? r.p.fullName : (membershipLabels[r.m.membershipType] ?? ''))}${r.m.eligibilityStatus === 'REVIEW' ? ' · elegibilitat en revisió' : ''}</small></div></div></td>
      <td class="c">${ovr(r.cv.ovr, 'ovr', playerStatus[r.cv.ovrStatus])}</td><td class="c">${ovr(r.cv.potential, 'pot', playerStatus[r.cv.potentialStatus])}</td>
      <td class="c">${flag(r.p.nationality || r.cv.nationalityReference)}</td><td class="r">${heightF2B(r.cv.f2bHeightCm)}</td><td class="r hide-m">${weightF2B(r.cv.f2bWeightKg)}</td>
      <td>${posChips(r.cv)}</td><td class="hide-m small">${arch ? link(P.archetype(arch.id), esc(arch.name), 'link') : '—'}</td><td class="hide-m small">${contractCell(r.m)}</td>
      <td class="r hide-m">${rm ? `<b>${rm.minutes}′</b>${rm.starter ? ' <span title="Quintet inicial" style="color:var(--accent)">●</span>' : ''}` : '<span class="faint">—</span>'}</td><td class="c">${compareCheck(r.m)}</td></tr>`; };
  let body;
  if(ui.roster.group){
    body = [...POS, null].map(code => { const list = rows.filter(r => (r.cv.primaryPosition ?? null) === code); if(!list.length) return '';
      return `<tr class="group-row"><td colspan="12">${code ? esc(posPlural[code]) : 'Posició pendent'}<small>${list.length}</small></td></tr>` + list.map(line).join(''); }).join('');
  } else body = rows.map(line).join('');
  return `<div class="table-wrap"><table class="t">${head}<tbody>${body}</tbody></table></div>`;
}
function teamTactics(t){
  if(t.teamProfile){
    return `<div class="strategy">${t.teamProfile.strategy.map(({title, items}) => `<section><h3>${esc(title)}</h3><dl>${items.map(([l, b]) => `<dt>${esc(l)}</dt><dd>${esc(b)}</dd>`).join('')}</dl></section>`).join('')}</div>
      <p class="small muted" style="margin-top:12px">${layer('F2B')} Proposta de com ataca, defensa i ajusta l’equip. Context històric: ${sourceLinks([t.teamProfile.historySourceId])}</p>`;
  }
  const tac = t.tacticalProfile;
  if(!tac) return empty('◇', 'Sistema de joc pendent', 'Aquest equip encara no té plantejament tàctic F2B. La plantilla ja és consultable.', link(P.team(t, 'roster'), 'Veure plantilla', 'btn'));
  return `<div class="strategy">
      <section><h3>Identitat</h3><dd style="margin:0">${esc(tac.identity)}</dd></section>
      <section><h3>Atac</h3><dd style="margin:0">${esc(tac.offense)}</dd></section>
      <section><h3>Defensa</h3><dd style="margin:0">${esc(tac.defense)}</dd></section>
      <section><h3>Tancament de partit</h3><dd style="margin:0">${esc(tac.closing)}</dd></section>
    </div><div class="note" style="margin-top:12px"><b>Disponibilitat.</b> ${esc(tac.availability)}</div>
    <p class="small muted">${layer('F2B')} Proposta tàctica pendent de calibratge amb el motor de partit.</p>`;
}
function teamRotationView(t){
  const rot = teamRotation(t);
  if(!rot) return empty('◷', 'Rotació pendent', 'La rotació de referència arribarà amb la fitxa tàctica de l’equip.');
  const {periods, minutesPerPeriod, regulationMinutes, teamPlayerMinutes} = DB.rules;
  const total = rot.rows.reduce((a, r) => a + r.minutes, 0);
  const head = `<div class="card-head"><div><h3>Rotació de referència</h3><p>Minuts previstos en un partit ajustat de ${regulationMinutes} minuts.</p></div><span class="tag ${total === teamPlayerMinutes ? 'ok' : 'bad'}">${total} / ${teamPlayerMinutes} min</span></div>`;
  const nameCell = r => { const m = playerSeason(r.id); return `<div>${link(P.member(m), esc(shortName(player(m.playerId))))}<small>${esc(r.role ?? ((positionsOf(m.conversion).join('/') || '—') + ' · ' + (archetypeEntry(m.conversion.archetypeId)?.name ?? '')))}</small></div>`; };
  if(rot.mode === 'stints'){
    return `<section class="card">${head}<div class="rotation"><div class="rot-head"><span>Jugador</span><div class="q" style="--q:${periods}">${Array.from({length:periods}, (_,i) => `<span>Q${i + 1}</span>`).join('')}</div><span style="text-align:right">Min</span></div>
      ${rot.rows.map(r => `<div class="rot-row">${nameCell(r)}<div class="track${r.starter ? ' starter' : ''}" aria-label="${r.minutes} minuts">${r.segs.map(([s, e]) => `<i style="left:${(s / regulationMinutes * 100).toFixed(2)}%;width:${((e - s) / regulationMinutes * 100).toFixed(2)}%"></i>`).join('')}</div><b>${r.minutes}</b></div>`).join('')}</div>
      <details style="margin-top:14px"><summary class="link" style="cursor:pointer">Cinc a pista per tram</summary><div class="grid g2" style="margin-top:10px">${Array.from({length:periods}, (_, q) => { const off = q * minutesPerPeriod;
        return `<div class="card tight"><b>Quart ${q + 1}</b>${rot.stints.filter(st => st.start >= off && st.start < off + minutesPerPeriod).map(st => `<p class="small" style="margin:6px 0 0"><b>${st.start}–${st.end}′</b> ${st.memberships.map(id => link(P.member(playerSeason(id)), esc(shortName(player(playerSeason(id).playerId))), 'link')).join(', ')}</p>`).join('')}</div>`; }).join('')}</div></details></section>
      <div class="legend" style="justify-content:flex-start"><span><i style="background:var(--accent)"></i>Quintet inicial</span><span><i style="background:var(--navy-3)"></i>Relleus</span></div>`;
  }
  return `<section class="card">${head}<div class="rotation"><div class="rot-head"><span>Jugador</span><span>Minuts sobre ${regulationMinutes}</span><span style="text-align:right">Min</span></div>
    ${rot.rows.map(r => `<div class="rot-row">${nameCell(r)}<div class="minutes-bar${r.starter ? ' starter' : ''}"><i style="width:calc(${(r.minutes / regulationMinutes * 100).toFixed(1)}% - 4px)"></i></div><b>${r.minutes}</b></div>`).join('')}</div></section>
    <div class="legend" style="justify-content:flex-start"><span><i style="background:var(--accent)"></i>Quintet inicial</span><span><i style="background:var(--navy-3)"></i>Relleus</span></div>
    ${rot.note ? `<div class="note" style="margin-top:12px"><b>Disponibilitat.</b> ${esc(rot.note)}</div>` : ''}`;
}
function teamCalendar(t){
  const all = teamFixtures(t.id);
  const filter = ui.calendar[t.id] ?? 'all';
  const list = all.filter(f => filter === 'all' || (filter === 'home' ? f.homeTeamSeasonId === t.id : f.awayTeamSeasonId === t.id));
  return `<div class="toolbar"><div class="seg" role="group" aria-label="Filtre de localia">${[['all','Tots',all.length],['home','Local',all.filter(f => f.homeTeamSeasonId === t.id).length],['away','Fora',all.filter(f => f.awayTeamSeasonId === t.id).length]].map(([k,l,n]) => `<button type="button" data-action="team-calendar" data-team="${esc(t.id)}" data-value="${k}" aria-pressed="${filter === k}">${l} · ${n}</button>`).join('')}</div>
    <span class="result-count">Resultats F2B pendents de simulació</span></div>
    ${list.length ? `<div class="fixtures">${list.map(f => fixtureRow(f, t.id)).join('')}</div>` : empty('▦', 'Calendari pendent', 'Encara no hi ha partits registrats.')}`;
}
function teamMarket(t){
  const market = t.teamProfile?.market ?? [];
  const members = teamMembers(t.id);
  const table = (dir, title, clubLabel) => { const rows = market.filter(r => r.direction === dir);
    return card(title, rows.length ? `<div class="table-wrap"><table class="t"><thead><tr><th scope="col">Jugador</th><th scope="col">Operació</th><th scope="col">${clubLabel}</th><th scope="col">Lectura F2B</th></tr></thead><tbody>${rows.map(r => {
      const m = members.find(x => x.playerId === r.playerId);
      return `<tr><td><b>${r.playerId && m ? link(P.member(m), esc(r.name), 'link') : esc(r.name)}</b></td><td class="small">${esc(r.kind)}</td><td class="small">${esc(r.club ?? '—')}</td><td class="small" style="min-width:220px">${esc(r.impact)}<div class="faint">${sourceLinks([r.sourceId])}</div></td></tr>`; }).join('')}</tbody></table></div>` : empty('⇄', 'Sense moviments', ''), {desc:`${rows.length} operacions`}); };
  return `<p class="muted" style="margin-top:0">${layer('REAL')} Moviments històrics del primer equip · ${layer('F2B')} efecte sobre la plantilla convertida.</p><div class="stack">${table('in', 'Altes', 'Procedència')}${table('out', 'Baixes i cessions', 'Destí')}</div>`;
}
function teamStatsView(t){
  const manual = teamMembers(t.id).filter(m => m.manualStatistics && Object.values(m.manualStatistics).some(v => v != null));
  const keys = Object.keys(corrections.statistics);
  return empty('▥', 'Estadístiques d’equip pendents', `${clubOf(t).name} encara no ha disputat partits a la simulació F2B (capa SIM). No s’importa cap estadística del futbol.`)
    + (manual.length ? `<div class="section">${sectionHead('Totals manuals de temporada', 'Introduïts des de l’edició de cada fitxa de jugador.')}<div class="table-wrap"><table class="t"><thead><tr><th scope="col">Jugador</th>${keys.map(k => `<th scope="col" class="r">${esc(corrections.statistics[k])}</th>`).join('')}</tr></thead><tbody>${manual.map(m => `<tr><td>${link(P.member(m), esc(shortName(player(m.playerId))), 'link')}</td>${keys.map(k => `<td class="r">${esc(m.manualStatistics[k] ?? '—')}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>` : '');
}

/* ═══ Jornades i partits ══════════════════════════════════════════ */
function renderRound(){
  const r = round(route.roundId);
  if(!r) return empty('▦', 'Jornada no trobada', 'Aquesta jornada no consta a l’arxiu.');
  const e = edition(r.seasonId), games = indexes.fixturesByRound.get(r.id), rounds = seasonRounds(e.id);
  const i = rounds.indexOf(r), prev = rounds[i - 1], next = rounds[i + 1];
  return pageHead(esc(editionTitle(e)), r.label, `${games.length} enfrontaments · ${r.roundNumber <= rounds.length / 2 ? 'primera volta' : 'segona volta'}`, `${prev ? link(P.round(prev.id), '← ' + esc(prev.label), 'btn') : ''}${next ? link(P.round(next.id), esc(next.label) + ' →', 'btn primary') : ''}`)
    + `<div class="round-strip" style="margin-bottom:14px">${rounds.map(x => link(P.round(x.id), String(x.roundNumber), x === r ? 'active' : '', `aria-label="${esc(x.label)}"`)).join('')}</div><div class="fixtures">${games.map(f => fixtureRow(f)).join('')}</div>`;
}
function renderFixture(){
  const f = fixture(route.fixtureId);
  if(!f) return empty('◉', 'Enfrontament no trobat', 'Aquesta fitxa de partit no consta a l’arxiu.');
  const e = edition(f.seasonId), r = round(f.roundId), h = team(f.homeTeamSeasonId), a = team(f.awayTeamSeasonId);
  const hs = teamStats(h), as = teamStats(a);
  const related = [f.derivedFromFixtureId, ...(indexes.returnFixtures.get(f.id) ?? []).map(o => o.id)].filter(Boolean);
  const duel = (label, x, y, fmt = v => v, higher = true) => { const win = x != null && y != null && x !== y ? ((x > y) === higher ? 'l' : 'r') : '';
    return `<div class="duel"><span class="l${win === 'l' ? ' win' : ''}">${x != null ? fmt(x) : '—'}</span><span class="m">${esc(label)}</span><span class="${win === 'r' ? 'win' : ''}">${y != null ? fmt(y) : '—'}</span></div>`; };
  const five = t => { const l = teamLineups(t)[0]; return l ? `<ul class="lineup-list">${l.players.map((p, i) => { const m = playerSeason(p.id); return `<li>${posChip(POS[i])}<span>${link(P.member(m), esc(shortName(player(m.playerId))), 'link')}<small>${esc(p.role)}</small></span>${ovr(m.conversion.ovr)}</li>`; }).join('')}</ul>` : empty('◇', 'Quintet pendent', ''); };
  return `<h1 class="sr-only">${esc(clubOf(h).name)} – ${esc(clubOf(a).name)}</h1><section class="versus"><div class="team">${link(P.team(h), crest(clubOf(h), e.id, 'lg'))}<b>${link(P.team(h), esc(clubOf(h).name))}</b><span class="tag">Local</span></div>
      <div><div class="eyebrow">${esc(r.label)}</div><div class="vs" style="margin:8px 0">${f.resultF2B == null ? 'VS' : esc(f.resultF2B)}</div><span class="tag">${f.resultF2B == null ? 'Resultat pendent' : 'Simulat'}</span></div>
      <div class="team">${link(P.team(a), crest(clubOf(a), e.id, 'lg'))}<b>${link(P.team(a), esc(clubOf(a).name))}</b><span class="tag">Visitant</span></div></section>
    <div class="section grid g2">
      ${card('Comparació de plantilles', duel('Índex F2B', hs.index, as.index, v => fmt1.format(v)) + duel('Millor OVR', hs.best?.cv.ovr, as.best?.cv.ovr) + duel('Jugadors', hs.count, as.count) + duel('Alçada mitjana', hs.avgHeight, as.avgHeight, heightF2B) + duel('Edat mitjana', hs.avgAge, as.avgAge, v => fmt1.format(v), false)
        + `<p class="small muted" style="margin:12px 0 0">${layer('F2B')} Lectura prèvia de les plantilles. El resultat sortirà del motor de partit (${layer('SIM')}).</p>`, {desc:'Indicadors F2B de cada equip.'})}
      ${card('Enfrontament', kv([['Jornada', link(P.round(r.id), esc(r.label), 'link')], ['Edició', link(P.season(e.id), esc(editionTitle(e)), 'link')], ['Base', esc(f.fixtureBase === 'DERIVED_RETURN_LEG' ? 'Tornada derivada de l’anada' : f.fixtureBase === 'REAL_REFERENCE_PAIRING' ? 'Emparellament i localia de referència' : '—')], ...related.map(id => [id === f.derivedFromFixtureId ? 'Partit d’anada' : 'Partit de tornada', link(P.fixture(id), esc(round(fixture(id).roundId).label), 'link')]), ['Fonts', sourceLinks(f.sourceIds ?? []) || '—'], ['Identificador', `<code class="small">${esc(f.id)}</code>`]]))}
    </div>
    <div class="section grid g2">${card(esc(clubOf(h).name) + ' · quintet', five(h), {actions:link(P.team(h), 'Equip', 'btn sm')})}${card(esc(clubOf(a).name) + ' · quintet', five(a), {actions:link(P.team(a), 'Equip', 'btn sm')})}</div>`;
}

/* ═══ Directori de jugadors ═══════════════════════════════════════ */
const dirDefaults = {q:'', club:'', pos:'', any:'', arch:'', nat:'', min:'', max:'', status:'', sort:'ovr', dir:'desc', season:''};
function dirState(){ return {...dirDefaults, ...Object.fromEntries(Object.entries(route.query).filter(([k]) => Object.hasOwn(dirDefaults, k)))}; }
function renderPlayers(){
  return pageHead('Explora', 'Jugadors', 'Directori de totes les participacions convertides. Filtra, ordena i afegeix jugadors al comparador.') + directory({});
}
function directory({season='', embedded=false}){
  const st = dirState(); if(season) st.season = season;
  const rows = seasonRows(st.season || null);
  const clubs = [...new Map(rows.map(r => [r.c.id, r.c])).values()].sort((a,b) => a.name.localeCompare(b.name, 'ca'));
  const nats = [...new Set(rows.map(r => r.p.nationality || r.cv.nationalityReference).filter(Boolean))].sort((a,b) => (countryNames[a] ?? a).localeCompare(countryNames[b] ?? b, 'ca'));
  const archs = DB.archetypeCatalog.entries.filter(a => !st.pos || a.position === st.pos);
  const sel = (bind, label, options, value) => `<label class="field"><span>${label}</span><select data-bind="dir" data-key="${bind}"><option value="">Tots</option>${options.map(([v,l]) => `<option value="${esc(v)}" ${String(v) === String(value) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></label>`;
  const view = ui.dirView ?? (window.innerWidth < 700 ? 'cards' : 'table');
  return `<div class="toolbar" data-dir-season="${esc(st.season)}" data-embedded="${embedded ? 1 : 0}">
      <label class="field grow"><span>Cerca</span><input type="search" data-bind="dir" data-key="q" value="${esc(st.q)}" placeholder="Nom, club o arquetip"></label>
      ${sel('club', 'Equip', clubs.map(c => [c.id, c.name]), st.club)}
      ${sel('pos', 'Posició', POS.map(c => [c, posName[c]]), st.pos)}
      ${sel('arch', 'Arquetip', archs.map(a => [a.id, a.id + ' · ' + a.name]), st.arch)}
      ${sel('nat', 'Nacionalitat', nats.map(n => [n, countryNames[n] ?? n]), st.nat)}
      <label class="field"><span>OVR mínim · <b data-min-out>${esc(st.min || 'tots')}</b></span><input type="range" min="60" max="96" step="1" value="${esc(st.min || 60)}" data-bind="dir" data-key="min" aria-label="OVR mínim"></label>
      ${sel('status', 'Estat', [['review','Elegibilitat en revisió'],['local','Amb correccions locals'],['approved','OVR validat'],['draft','OVR en proposta']], st.status)}
      <label class="field" style="flex:0 0 auto"><span>Alternatives</span><span style="display:flex;align-items:center;gap:6px;height:38px"><input class="check" type="checkbox" data-bind="dir" data-key="any" ${st.any ? 'checked' : ''}> <span class="small">Inclou 2a i 3a posició</span></span></label>
      <div class="field" style="flex:0 0 auto"><span>Vista</span><div class="seg" role="group" aria-label="Vista"><button type="button" data-action="dir-view" data-value="table" aria-pressed="${view === 'table'}">Taula</button><button type="button" data-action="dir-view" data-value="cards" aria-pressed="${view === 'cards'}">Targetes</button></div></div>
      <button class="btn ghost sm" type="button" data-action="dir-reset" style="align-self:end">Neteja filtres</button>
    </div><div id="dirResults">${directoryResults(st, view)}</div>`;
}
function directoryFilter(st){
  const q = norm(st.q), min = Number(st.min) || 0, max = Number(st.max) || 99;
  return seasonRows(st.season || null).filter(r => {
    const cv = r.cv;
    if(st.club && r.c.id !== st.club) return false;
    if(st.pos && !(st.any ? positionsOf(cv).includes(st.pos) : cv.primaryPosition === st.pos)) return false;
    if(st.arch && cv.archetypeId !== st.arch) return false;
    if(st.nat && (r.p.nationality || cv.nationalityReference) !== st.nat) return false;
    if((min > 60 || max < 99) && !(Number.isFinite(cv.ovr) && cv.ovr >= min && cv.ovr <= max)) return false;
    if(st.status === 'review' && r.m.eligibilityStatus !== 'REVIEW') return false;
    if(st.status === 'local' && !indexes.localMembers.has(r.m.id)) return false;
    if(st.status === 'approved' && cv.ovrStatus !== 'APPROVED') return false;
    if(st.status === 'draft' && cv.ovrStatus === 'APPROVED') return false;
    if(q && !norm([r.p.fullName, r.p.displayName, ...(r.p.aliases ?? []), r.c.name, r.c.shortName, archetypeEntry(cv.archetypeId)?.name, cv.archetypeId].join(' ')).includes(q)) return false;
    return true;
  });
}
const dirSorters = {
  name:r => norm(shortName(r.p)), club:r => norm(r.c.name), pos:r => POS.indexOf(r.cv.primaryPosition), arch:r => r.cv.archetypeId ?? 'ZZ',
  ovr:r => r.cv.ovr ?? -1, pot:r => r.cv.potential ?? -1, height:r => r.cv.f2bHeightCm ?? 0, age:r => r.cv.seasonAge ?? 0, nat:r => norm(countryNames[r.p.nationality || r.cv.nationalityReference] ?? ''),
};
function directoryResults(st, view){
  const list = directoryFilter(st);
  const key = Object.hasOwn(dirSorters, st.sort) ? st.sort : 'ovr', dir = st.dir === 'asc' ? 1 : -1;
  list.sort((a,b) => { const x = dirSorters[key](a), y = dirSorters[key](b); return (x < y ? -1 : x > y ? 1 : 0) * dir || (b.cv.ovr ?? 0) - (a.cv.ovr ?? 0) || shortName(a.p).localeCompare(shortName(b.p), 'ca'); });
  const shown = list.slice(0, ui.dirLimit);
  const count = `<div class="actions" style="justify-content:space-between;margin-bottom:10px"><span class="result-count" style="margin:0" role="status">${list.length} ${list.length === 1 ? 'jugador' : 'jugadors'}${list.length > shown.length ? ` · se’n mostren ${shown.length}` : ''}${st.max && Number(st.max) < 99 ? ` · OVR ${esc(st.min || '—')}–${esc(st.max)}` : ''}</span>${compareIds.length ? link(P.compare(compareIds), `Compara (${compareIds.length})`, 'btn sm accent') : ''}</div>`;
  if(!list.length) return count + empty('⌕', 'Cap jugador coincideix amb els filtres', 'Amplia el rang d’OVR o neteja algun filtre.', '<button class="btn" type="button" data-action="dir-reset">Neteja filtres</button>');
  const more = list.length > shown.length ? `<div class="more-row"><button class="btn" type="button" data-action="dir-more">Mostra’n ${Math.min(60, list.length - shown.length)} més</button></div>` : '';
  if(view === 'cards') return count + `<div class="grid g3">${shown.map(r => `<article class="card tight"><div class="player-cell" style="justify-content:space-between"><div class="player-cell">${crest(r.c, r.m.seasonId, 'md')}<div class="who">${link(P.member(r.m), esc(shortName(r.p)))}<small>${esc(r.c.shortName || r.c.name)} · #${esc(r.m.squadNumber ?? '–')}</small></div></div><span style="display:flex;gap:4px">${ovr(r.cv.ovr)}${ovr(r.cv.potential, 'pot')}</span></div>
      <div class="actions" style="margin-top:10px;justify-content:space-between">${posChips(r.cv)}<span class="small muted">${esc(heightF2B(r.cv.f2bHeightCm))} · ${flag(r.p.nationality || r.cv.nationalityReference)}</span></div>
      <div class="actions" style="margin-top:8px;justify-content:space-between"><span class="small">${r.cv.archetypeId ? link(P.archetype(r.cv.archetypeId), esc(archetypeEntry(r.cv.archetypeId)?.name ?? r.cv.archetypeId), 'link') : '—'}</span>${compareButton(r.m)}</div></article>`).join('')}</div>` + more;
  const th = (k, label, cls='') => `<th scope="col" class="${cls}" aria-sort="${st.sort === k ? (st.dir === 'asc' ? 'ascending' : 'descending') : 'none'}"><button type="button" data-action="dir-sort" data-key="${k}">${label}</button></th>`;
  return count + `<div class="table-wrap"><table class="t"><thead><tr><th scope="col" class="c"><span class="sr-only">Comparador</span>⇄</th>${th('name','Jugador')}${th('club','Equip','hide-m')}${th('pos','Pos.')}${th('arch','Arquetip','hide-m')}${th('ovr','OVR','c')}${th('pot','POT','c')}${th('nat','Nac.','c hide-m')}${th('height','Alçada F2B','r hide-m')}${th('age','Edat','r hide-m')}<th scope="col" class="hide-m">Estat</th></tr></thead><tbody>
    ${shown.map(r => `<tr class="${indexes.localMembers.has(r.m.id) ? 'is-local' : ''}"><td class="c">${compareCheck(r.m)}</td>
      <td><div class="player-cell">${crest(r.c, r.m.seasonId, 'sm')}<div class="who">${link(P.member(r.m), esc(shortName(r.p)))}<small>${esc(r.p.displayName && r.p.displayName !== r.p.fullName ? r.p.fullName : r.c.shortName || r.c.name)}</small></div></div></td>
      <td class="hide-m small">${link(P.team(r.m.teamSeasonId, 'roster'), esc(r.c.shortName || r.c.name), 'link')}</td><td>${posChips(r.cv)}</td>
      <td class="hide-m small">${r.cv.archetypeId ? link(P.archetype(r.cv.archetypeId), esc(archetypeEntry(r.cv.archetypeId)?.name ?? ''), 'link') : '—'}</td>
      <td class="c">${ovr(r.cv.ovr, 'ovr', playerStatus[r.cv.ovrStatus])}</td><td class="c">${ovr(r.cv.potential, 'pot')}</td><td class="c hide-m">${flag(r.p.nationality || r.cv.nationalityReference)}</td>
      <td class="r hide-m">${heightF2B(r.cv.f2bHeightCm)}</td><td class="r hide-m">${esc(r.cv.seasonAge ?? '—')}</td>
      <td class="hide-m">${r.m.eligibilityStatus === 'REVIEW' ? statusTag('DRAFT', 'Elegibilitat') : indexes.localMembers.has(r.m.id) ? statusTag('LOCAL') : statusTag(r.cv.ovrStatus === 'APPROVED' ? 'APPROVED' : 'DRAFT', r.cv.ovrStatus === 'APPROVED' ? 'OVR validat' : 'Proposta')}</td></tr>`).join('')}
    </tbody></table></div>` + more;
}
function updateDirectory(changes){
  const box = $('[data-dir-season]');
  const st = {...dirState(), ...changes};
  if(box?.dataset.dirSeason) st.season = box.dataset.dirSeason;
  const clean = Object.fromEntries(Object.entries(st).filter(([k,v]) => hasData(v) && v !== dirDefaults[k] && !(k === 'season' && box?.dataset.embedded === '1')));
  if(clean.min === '60') delete clean.min;
  const base = box?.dataset.embedded === '1' ? P.season(st.season, 'players') : '/players';
  replaceQuery(base + qs(clean));
  ui.dirLimit = 60;
  const view = ui.dirView ?? (window.innerWidth < 700 ? 'cards' : 'table');
  $('#dirResults').innerHTML = directoryResults({...dirState(), season:st.season}, view);
}

/* ═══ Fitxa de jugador ════════════════════════════════════════════ */
const playerTabs = [['resum','Resum'],['atributs','Atributs'],['conversio','Conversió F2B'],['trajectoria','Trajectòria'],['rendiment','Rendiment i palmarès'],['contractes','Contractes'],['fonts','Fonts'],['editar','Edita la fitxa']];
function currentMembership(p){
  if(!p) return null;
  const list = indexes.playerSeasonsByPlayer.get(p.id) ?? [];
  return route.membershipId ? list.find(r => r.id === route.membershipId) : list.find(r => r.seasonId === PILOT) ?? list[0];
}
function renderPlayer(){
  const p = player(route.playerId);
  if(!p) return empty('◉', 'Jugador no trobat', 'La fitxa sol·licitada no és a la base de dades actual.', link(P.players(), 'Directori de jugadors', 'btn'));
  const m = currentMembership(p);
  if(!m) return empty('◉', 'Participació no trobada', 'Aquest jugador no té cap participació de temporada associada.');
  const c = club(m.clubId), t = team(m.teamSeasonId), cv = m.conversion, e = edition(m.seasonId);
  const active = playerTabs.some(([id]) => id === route.playerTab) ? route.playerTab : 'resum';
  const arch = archetypeEntry(cv.archetypeId);
  const nat = p.nationality || cv.nationalityReference;
  const status = m.eligibilityStatus === 'REVIEW' ? statusTag('DRAFT', 'Elegibilitat en revisió') : statusTag(cv.status);
  const mates = teamStats(t).rows.slice().sort((a,b) => (b.cv.ovr ?? -1) - (a.cv.ovr ?? -1) || shortName(a.p).localeCompare(shortName(b.p), 'ca'));
  const idx = mates.findIndex(r => r.m.id === m.id), prev = mates[idx - 1], next = mates[idx + 1];
  const ring = (label, value, cls, st) => `<div><div class="ring ${cls}" style="--v:${hasData(value) ? value : 0}" role="img" aria-label="${label} ${esc(value ?? 'pendent')}"><div><b>${esc(value ?? '—')}</b><span>${label}</span></div></div><div class="ring-note">${esc(playerStatus[st] ?? '')}</div></div>`;
  const hero = `<section class="profile"><div class="badge-num" aria-label="Dorsal">${esc(m.squadNumber ?? '–')}<small>${esc(cv.primaryPosition ?? '—')}</small></div>
    <div style="min-width:0"><div class="ctx">${link(P.team(t,'roster'), crest(c, m.seasonId, 'sm') + ' ' + esc(c.name), 'club-chip')}<span>${link(P.season(e.id), esc(e.label))}</span>${hasData(nat) ? `<span>${flag(nat)} ${esc(countryNames[nat] ?? nat)}</span>` : ''}${status}</div>
      <h1>${esc(shortName(p))}</h1>${shortName(p) !== p.fullName ? `<p class="full">${esc(p.fullName)}</p>` : ''}
      <div class="role">${positionsOf(cv).map((code, i) => posChip(code, i > 0)).join('') || '<span>Posició pendent</span>'}<span>${esc(posName[cv.primaryPosition] ?? '')}</span>${arch ? '· ' + link(P.archetype(arch.id), esc(arch.id + ' · ' + arch.name)) : ''}</div></div>
    <div class="ratings">${ring('OVR', cv.ovr, '', cv.ovrStatus)}${ring('POT', cv.potential, 'pot', cv.potentialStatus)}</div></section>`;
  const bar_ = `<div class="profile-bar">${tabsNav(playerTabs, active, id => P.player(p.id, id, route.membershipId ? m.id : null), 'Apartats de la fitxa').replace('class="tabs"', 'class="tabs" style="margin:0;flex:1;min-width:0"')}<div class="actions">${compareButton(m)}</div></div>`;
  const views = {resum:playerOverview, atributs:playerAttributes, conversio:playerConversion, trajectoria:playerCareer, rendiment:playerPerformance, contractes:playerContracts, fonts:playerSources, editar:renderCorrectionForm};
  const pager = `<nav class="pager" aria-label="Plantilla">${prev ? link(P.member(prev.m, active), `<small>← Anterior a la plantilla</small><b>${esc(shortName(prev.p))}</b> ${ovr(prev.cv.ovr)}`, 'prev') : '<span></span>'}${next ? link(P.member(next.m, active), `<small>Següent a la plantilla →</small><b>${esc(shortName(next.p))}</b> ${ovr(next.cv.ovr)}`, 'next') : '<span></span>'}</nav>`;
  return hero + bar_ + `<div style="margin-top:16px">${views[active](m, p)}</div>` + pager;
}
function radar(series, size=300){
  const groups = attributeGroups;
  const cx = size / 2, cy = size / 2, R = size / 2 - 42, n = groups.length;
  const pt = (i, v) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n; return [cx + Math.cos(a) * R * v / 100, cy + Math.sin(a) * R * v / 100]; };
  const ring = v => groups.map((_, i) => pt(i, v).join(',')).join(' ');
  return `<svg class="radar" viewBox="0 0 ${size} ${size}" role="img" aria-label="Perfil per grups d’atributs: ${esc(series.map(s => s.label + ' ' + s.values.map((v,i) => groups[i][1] + ' ' + (v == null ? '—' : Math.round(v))).join(', ')).join('; '))}">
    ${[25,50,75,100].map(v => `<polygon class="grid-line" points="${ring(v)}"/>`).join('')}
    ${groups.map((_, i) => { const [x,y] = pt(i, 100); return `<line class="axis" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}"/>`; }).join('')}
    ${series.map(s => `<polygon class="shape" points="${s.values.map((v, i) => pt(i, v ?? 0).join(',')).join(' ')}" fill="${s.color}" stroke="${s.color}"/>`).join('')}
    ${groups.map(([, label], i) => { const [x,y] = pt(i, 122); return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle">${esc(label.split(' ')[0])}</text>`; }).join('')}
  </svg>`;
}
const groupValues = attrs => attributeGroups.map(([prefix]) => groupScore(attrs, prefix));
function playerOverview(m, p){
  const cv = m.conversion, attrs = lab(m), t = team(m.teamSeasonId);
  const notes = [cv.conversionNotes, cv.positionNotes].filter(hasData);
  const appearances = teamLineups(t).filter(l => !l.textOnly && l.players.some(x => x.id === m.id)).map(l => [l.name, l.players.find(x => x.id === m.id).role]);
  const rm = rotationMinutes(t).get(m.id);
  const fit = cv.archetypeId ? fitScore(attrs, cv.archetypeId) : null;
  const sorted = attrs ? Object.entries(attrs).filter(([id]) => id !== 'M2').sort((a,b) => b[1] - a[1]) : [];
  const posAvg = cv.primaryPosition ? groupValues(positionAverages(m.seasonId, cv.primaryPosition)) : null;
  return `<div class="split"><div class="stack">
      ${card('Perfil de joc F2B', notes.length ? `<div class="prose">${notes.map(n => `<p>${esc(n)}</p>`).join('')}</div>` : '<p class="muted">El paper tàctic i les notes de conversió encara estan pendents.</p>', {actions:layer('F2B')})}
      ${card('A l’equip', (appearances.length || rm) ? kv([['Minuts de referència', rm ? `<b>${rm.minutes}′</b> de ${DB.rules.regulationMinutes}${rm.starter ? ' · quintet inicial' : ''}` : null], ...appearances.map(([n, r]) => [n, esc(r)])]) : '<p class="muted" style="margin:0">No forma part dels quintets ni de la rotació de referència.</p>', {actions:link(P.team(t), 'Fitxa de l’equip', 'btn sm')})}
      ${attrs ? card('Punts forts i febles', `<div class="grid g2"><div><div class="eyebrow" style="margin-bottom:6px">Més alts</div>${sorted.slice(0,5).map(([id, v]) => `<div class="attr"><span><small>${esc(id)}</small>${esc(indexes.attrNames.get(id))}</span>${bar(v)}<b>${v}</b></div>`).join('')}</div>
        <div><div class="eyebrow" style="margin-bottom:6px;color:var(--muted)">Més baixos</div>${sorted.slice(-4).reverse().map(([id, v]) => `<div class="attr"><span><small>${esc(id)}</small>${esc(indexes.attrNames.get(id))}</span>${bar(v)}<b>${v}</b></div>`).join('')}</div></div>`, {actions:link(P.member(m, 'atributs'), 'Tots els atributs', 'btn sm')}) : ''}
    </div><div class="stack">
      ${attrs ? card('Perfil per grups', radar([{label:shortName(p), values:groupValues(attrs), color:'#d9622b'}, ...(posAvg ? [{label:'Mitjana ' + posPlural[cv.primaryPosition], values:posAvg, color:'#2d5f8a'}] : [])])
        + `<div class="legend"><span><i style="background:#d9622b"></i>${esc(shortName(p))}</span>${posAvg ? `<span><i style="background:#2d5f8a"></i>Mitjana de ${esc(posPlural[cv.primaryPosition].toLowerCase())} del curs</span>` : ''}</div>`, {desc:'Mitjana de cada grup F2B LAB.'}) : ''}
      ${card('Identitat', kv([['Nom complet', esc(p.fullName)], ['Naixement', hasData(p.dateOfBirth) ? esc(displayDate(p.dateOfBirth)) : null], ['Edat al curs', esc(cv.seasonAge ?? '')], ['Nacionalitat', hasData(p.nationality || cv.nationalityReference) ? flag(p.nationality || cv.nationalityReference) + ' ' + esc(countryNames[p.nationality || cv.nationalityReference] ?? '') : null], ['Rol al futbol', esc(p.detailedFootballRole ?? '')], ['Pertinença', esc(membershipLabels[m.membershipType] ?? m.membershipType ?? '')], ['Alta', m.membershipStart ? esc(displayDate(m.membershipStart)) : null], ['Baixa', m.membershipEnd ? esc(displayDate(m.membershipEnd)) : null]]), {actions:layer('REAL')})}
      ${card('Conversió', kv([['Alçada', `${esc(cv.realHeightCm ?? '—')} cm → <b>${esc(heightF2B(cv.f2bHeightCm))}</b>`], ['Pes', `${esc(cv.realWeightKg ?? '—')} kg → <b>${esc(weightF2B(cv.f2bWeightKg))}</b>`], ['Posicions', posChips(cv)], ['Encaix d’arquetip', fit ? `<b>${fmt1.format(fit.score)}</b>${fit.official ? '' : ' <span class="faint">· proposta</span>'}` : null]]), {actions:link(P.member(m, 'conversio'), 'Detall', 'btn sm')})}
    </div></div>`;
}
function playerAttributes(m){
  const cv = m.conversion, attrs = lab(m);
  if(!attrs) return empty('◇', 'Atributs pendents', 'Aquesta fitxa encara no té atributs F2B LAB registrats.', link(P.member(m, 'editar'), 'Afegeix-los des de l’edició', 'btn'));
  const posAvg = cv.primaryPosition ? positionAverages(m.seasonId, cv.primaryPosition) : null;
  const count = Object.values(attrs).filter(Number.isFinite).length;
  return `<div class="toolbar"><span class="small">${layer('F2B')} ${count} de ${DB.attributeDictionary.length} atributs · ${esc(playerStatus[cv.attributeStatus] ?? 'Pendent')}${cv.attributeNotes ? ' · ' + esc(cv.attributeNotes) : ''}</span>
      ${posAvg ? `<label class="small" style="margin-left:auto;display:flex;align-items:center;gap:6px"><input class="check" type="checkbox" data-bind="attr-avg" ${ui.attrAvg ? 'checked' : ''}> Mostra la mitjana de ${esc(posPlural[cv.primaryPosition].toLowerCase())}</label>` : ''}</div>
    <div class="attr-groups">${attributeGroups.map(([prefix, label]) => { const ids = DB.attributeDictionary.filter(([id]) => id.startsWith(prefix));
      const g = groupScore(attrs, prefix);
      return `<section class="card attr-group"><h3>${esc(label)}<span>${g != null ? Math.round(g) : '—'}</span></h3>${ids.map(([id, name]) => { const v = attrs[id]; const a = posAvg?.[id];
        return `<div class="attr" title="${a != null ? 'Mitjana de la posició: ' + fmt1.format(a) : ''}"><span><small>${esc(id)}</small>${esc(name)}</span>${bar(v ?? 0, 99, ui.attrAvg && a != null ? a : null)}<b>${esc(v ?? '—')}</b></div>`; }).join('')}</section>`; }).join('')}</div>
    ${ui.attrAvg && posAvg ? `<p class="small muted"><span style="display:inline-block;width:2px;height:12px;background:var(--accent);vertical-align:-1px"></span> Marca la mitjana dels jugadors amb la mateixa posició principal al curs. El Potencial (M2) segueix el POT.</p>` : ''}`;
}
function playerConversion(m, p){
  const cv = m.conversion, attrs = lab(m);
  const pos = cv.primaryPosition;
  const fits = pos && attrs ? DB.archetypeCatalog.entries.filter(a => a.position === pos).map(a => ({a, f:fitScore(attrs, a.id)})).filter(x => x.f).sort((x,y) => y.f.score - x.f.score) : [];
  const statusRow = (label, value, st) => [label, `${value} ${st ? statusTag(st) : ''}`];
  return `<div class="grid g2">
      ${card('Conversió física', `<div class="conv"><div class="from"><small>${layer('REAL')} Alçada real</small><b>${esc(cv.realHeightCm ?? '—')} cm</b></div><div class="arrow">+15</div><div class="to"><small>${layer('F2B')} Alçada F2B</small><b>${esc(heightF2B(cv.f2bHeightCm))}</b></div></div>
        <div class="conv"><div class="from"><small>${layer('REAL')} Pes real</small><b>${esc(cv.realWeightKg ?? '—')} kg</b></div><div class="arrow">+7</div><div class="to"><small>${layer('F2B')} Pes F2B</small><b>${esc(weightF2B(cv.f2bWeightKg))}</b></div></div>
        <p class="small muted" style="margin:10px 0 0">La posició s’assigna amb l’alçada real abans de convertir. Estat de les mesures: ${esc(playerStatus[cv.physicalDataStatus] ?? 'Pendent')}.</p>`)}
      ${card('Valoració i rol', kv([statusRow('OVR', ovr(cv.ovr), cv.ovrStatus), statusRow('POT', ovr(cv.potential, 'pot'), cv.potentialStatus), statusRow('Posició principal', pos ? posChip(pos) + ' ' + esc(posName[pos]) : '—', cv.primaryPositionStatus), ['Alternatives', positionsOf(cv).slice(1).map(c => posChip(c, true) + ' ' + esc(posName[c])).join(' ') || '—'], statusRow('Arquetip', cv.archetypeId ? link(P.archetype(cv.archetypeId), esc(cv.archetypeId + ' · ' + archetypeEntry(cv.archetypeId).name), 'link') : '—', cv.archetypeStatus), ['Elegibilitat', m.eligibilityStatus === 'REVIEW' ? statusTag('DRAFT', 'En revisió') : statusTag('APPROVED', 'Elegible')]])
        + (m.eligibilityNotes ? `<p class="note" style="margin-top:10px">${esc(m.eligibilityNotes)}</p>` : '')
        + `<p class="small muted" style="margin:10px 0 0">Les bandes d’OVR del marc de valoració són orientatives i se superposen. F2B no les converteix en categories automàtiques.</p>`)}
    </div>
    <div class="section">${card('Encaix amb els arquetips de ' + esc((posPlural[pos] ?? 'la posició').toLowerCase()), fits.length ? fits.map(({a, f}) => `<div class="fit-row${a.id === cv.archetypeId ? ' current' : ''}"><span>${link(P.archetype(a.id), `<small class="faint" style="font:700 11px var(--mono);margin-right:6px">${esc(a.id)}</small>${esc(a.name)}`)}${a.id === cv.archetypeId ? ' <span class="tag accent">Assignat</span>' : ''}${f.official ? '' : ' <span class="faint small">proposta</span>'}</span>${bar(f.score, 99, null, a.id === cv.archetypeId ? 'accent' : '')}<b>${fmt1.format(f.score)}</b></div>`).join('')
        + `<p class="small muted" style="margin:12px 0 0">Càlcul del catàleg: mitjana dels atributs definitoris (${Math.round(DB.archetypeCatalog.fit.weights.defining * 100)}%), de suport (${Math.round(DB.archetypeCatalog.fit.weights.support * 100)}%) i complementaris (${Math.round(DB.archetypeCatalog.fit.weights.complementary * 100)}%). Les files marcades com a proposta esperen la matriu original. L’encaix orienta l’assignació però no la substitueix.</p>` : '<p class="muted">Calen la posició principal i els atributs per calcular l’encaix.</p>', {desc:'Ordenats per encaix amb els atributs actuals.'})}</div>`;
}
function archiveCell(row, prop, format){
  const t = team(row.teamSeasonId), e = edition(row.editionId ?? t?.seasonId);
  if(prop === 'season' && e) return link(P.season(e.id), esc(e.label), 'link');
  if(prop === 'competition'){ const c = getCompetition(row.competitionId ?? e?.competitionId); if(c) return link(P.competition(c.id), esc(c.name), 'link'); }
  if(['club','from','to'].includes(prop) && format !== 'date'){ const c = club(({club:row.clubId ?? t?.clubId, from:row.fromClubId, to:row.toClubId})[prop]); if(c) return link(prop === 'club' && t ? P.team(t) : P.club(c.id), esc(c.name), 'link'); }
  return esc(format === 'date' ? displayDate(row[prop]) : row[prop] ?? '—');
}
function archiveSection(key, records){
  const [title, message, columns] = archiveSections[key];
  const rows = records[key] ?? [];
  return card(esc(title), rows.length ? `<div class="table-wrap"><table class="t"><thead><tr>${columns.map(([, l]) => `<th scope="col">${esc(l)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${columns.map(([prop, , f]) => `<td>${archiveCell(row, prop, f)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : `<p class="muted" style="margin:0">${esc(message)}</p>`);
}
function playerCareer(m, p){
  const list = indexes.playerSeasonsByPlayer.get(p.id) ?? [];
  const ref = DB.playerHistory?.[p.id] ?? {};
  return `<div class="stack">${card('Participacions registrades', `<div class="table-wrap"><table class="t"><thead><tr><th scope="col">Edició</th><th scope="col">Equip</th><th scope="col">Pos.</th><th scope="col" class="c">OVR</th><th scope="col">Pertinença</th><th scope="col">Alta</th><th scope="col">Baixa</th></tr></thead><tbody>
    ${list.map(r => `<tr${r.id === m.id ? ' style="font-weight:700"' : ''}><td>${link(P.season(r.seasonId), esc(editionTitle(edition(r.seasonId))), 'link')}</td><td>${link(P.member(r), crest(club(r.clubId), r.seasonId, 'sm') + ' ' + esc(club(r.clubId).name), 'club-chip')}</td><td>${posChips(r.conversion)}</td><td class="c">${ovr(r.conversion.ovr)}</td><td class="small">${esc(membershipLabels[r.membershipType] ?? '—')}</td><td>${esc(displayDate(r.membershipStart))}</td><td>${esc(displayDate(r.membershipEnd))}</td></tr>`).join('')}
    </tbody></table></div>`, {desc:'Cada participació té la seva pròpia conversió F2B.', actions:layer('REAL')})}${archiveSection('career', ref)}${archiveSection('transfers', ref)}</div>`;
}
function playerPerformance(m, p){
  const ref = DB.playerHistory?.[p.id] ?? {};
  const values = Object.entries(corrections.statistics).filter(([k]) => m.manualStatistics?.[k] != null);
  return `<div class="stack">${values.length ? card('Totals de temporada · entrada manual', `<div class="metrics">${values.map(([k, l]) => metric(m.manualStatistics[k], l)).join('')}</div>`, {desc:'Introduïts des de l’edició de la fitxa.', actions:link(P.member(m, 'editar'), 'Edita', 'btn sm')}) : ''}${['statistics','honours','awards'].map(k => archiveSection(k, ref)).join('')}</div>`;
}
function playerContracts(m, p){
  const ref = DB.playerHistory?.[p.id] ?? {};
  return `<div class="stack">${['contracts','salaries'].map(k => archiveSection(k, ref)).join('')}<p class="note info">L’escala econòmica F2B és pròpia, europea i ajustada per època (DEC-028). Els imports apareixeran quan s’incorporin.</p></div>`;
}
function playerSources(m, p){
  const cv = m.conversion;
  const ids = [...new Set([m.sourceId, ...(Array.isArray(p.identitySourceIds) ? p.identitySourceIds : [])].filter(Boolean))];
  const links = [...DB.sources.filter(s => ids.includes(s.id)).map(s => [s.name, s.url]), [cv.realHeightCmStatus ? 'Referència anterior de l’alçada' : 'Font de l’alçada', cv.realHeightSource], [cv.realWeightKgStatus ? 'Referència anterior del pes' : 'Font del pes', cv.realWeightSource]].filter(([, u]) => u);
  const notes = [p.notes, m.eligibilityNotes, m.scopeEvidence, m.verificationNotes].filter(hasData);
  return `<div class="grid g2">${card('Fonts i traçabilitat', links.length ? `<ul style="margin:0;padding-left:18px">${links.map(([l, u]) => `<li style="padding:4px 0">${/^https?:\/\//i.test(u) ? `<a class="link" href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(l)} ↗</a>` : esc(l + ' · ' + u)}</li>`).join('')}</ul>` : '<p class="muted">Encara no hi ha fonts associades.</p>')}
    ${card('Dades d’origen', kv([['Rol al futbol', esc(p.detailedFootballRole ?? '')], ['Cama dominant', esc(p.dominantFoot ?? '')], ['Alçada real', hasData(cv.realHeightCm) ? esc(cv.realHeightCm + ' cm') : null], ['Pes real', hasData(cv.realWeightKg) ? esc(cv.realWeightKg + ' kg') : null], ['Identificador de jugador', `<code class="small">${esc(p.id)}</code>`], ['Identificador de participació', `<code class="small">${esc(m.id)}</code>`]]), {actions:layer('REAL')})}</div>
    ${notes.length ? `<div class="section">${card('Notes de documentació', notes.map(n => `<p style="margin:0 0 8px">${esc(n)}</p>`).join(''))}</div>` : ''}`;
}

/* ═══ Edició de la fitxa ══════════════════════════════════════════ */
function correctionValue(field, value){
  if(value === null) return '—';
  return field === 'archetypeId' ? archetypeEntry(value)?.name ?? value : String(value);
}
function renderCorrectionHistory(entries, {showPlayer=false}={}){
  if(!entries.length) return '<p class="muted" style="margin:0">Encara no hi ha correccions registrades.</p>';
  const official = new Set(canonical.map(e => e.id));
  return `<ol class="history">${[...entries].reverse().map(entry => { const m = playerSeason(entry.membershipId), p = player(entry.playerId);
    return `<li><div class="h-head">${showPlayer ? `<b>${m && p ? link(P.player(p.id, 'editar', m.id), esc(shortName(p)) + ' · ' + esc(edition(m.seasonId)?.label ?? ''), 'link') : esc(entry.membershipId)}</b>` : ''}<time datetime="${esc(entry.at)}" class="small muted">${esc(displayDate(entry.at.slice(0,10)))} · ${esc(entry.at.slice(11,16))}</time>${official.has(entry.id) ? '<span class="tag ok">Compartida</span>' : '<span class="tag accent">Local</span>'}</div>
      <p>${esc(entry.reason)}</p><ul>${entry.fields.map(({field, before, after}) => `<li>${esc(corrections.fields[field])}: <del>${esc(correctionValue(field, before))}</del> → <ins>${esc(correctionValue(field, after))}</ins></li>`).join('')}</ul></li>`; }).join('')}</ol>`;
}
function selectOptions(choices, selected){ return '<option value="">— Sense assignar —</option>' + choices.map(([v, l]) => `<option value="${esc(v)}"${selected === v ? ' selected' : ''}>${esc(l)}</option>`).join(''); }
function archetypeOptions(position, selected){ return selectOptions(DB.archetypeCatalog.entries.filter(e => e.position === position).map(e => [e.id, e.id + ' · ' + e.name]), selected); }
function renderCorrectionForm(m){
  const read = field => corrections.read(m, field);
  const before = field => esc(JSON.stringify(read(field)));
  const wrap = (field, control) => `<label class="edit-field"><span class="edit-label" title="${esc(corrections.fields[field])}">${esc(corrections.fields[field])}</span>${control}</label>`;
  const select = (field, options) => wrap(field, `<select class="inline-editor" name="${field}" data-before="${before(field)}">${options}</select>`);
  const number = field => { const meas = Object.hasOwn(corrections.measurements, field); const max = meas || field.startsWith('stats.') ? '' : 'max="99"';
    return wrap(field, `<input class="inline-editor" type="number" inputmode="numeric" name="${field}" data-before="${before(field)}" min="${meas ? 1 : 0}" ${max} step="1" value="${esc(read(field) ?? '')}">`); };
  const grid = (controls, cls='') => `<div class="edit-grid ${cls}">${controls.join('')}</div>`;
  const pos = corrections.positionFields.map(f => select(f, selectOptions(Object.entries(posName), read(f))));
  const history = [...canonical, ...pending].filter(e => e.membershipId === m.id);
  const attrGroupsHtml = attributeGroups.map(([prefix, label]) => { const list = corrections.attributeFields.filter(([id]) => id.startsWith(prefix)); return list.length ? `<div class="attr-sub">${esc(label)}</div>${grid(list.map(([id]) => number('lab.' + id)), 'attrs')}` : ''; }).join('');
  const cv = m.conversion;
  return `<div class="edit-shell"><form class="edit-form" data-correction-member="${esc(m.id)}" novalidate>
      <fieldset><legend>Valoració i rol</legend><p class="hint">L’arquetip ha de pertànyer a la posició principal. El POT ha de ser igual o superior a l’OVR.</p>
        ${grid([...corrections.ratingFields.map(number), ...pos, select('archetypeId', archetypeOptions(read('primaryPosition'), read('archetypeId')))])}</fieldset>
      <fieldset><legend>Mesures físiques</legend><p class="hint">Introdueix la mesura real. La conversió F2B s’aplica en desar (+15 cm, +7 kg).</p>
        ${grid(Object.keys(corrections.measurements).map(number))}
        <div class="preview" style="margin-top:12px" data-preview><div><small>Alçada F2B</small><b data-preview-height>${esc(heightF2B(cv.f2bHeightCm))}</b></div><div><small>Pes F2B</small><b data-preview-weight>${esc(weightF2B(cv.f2bWeightKg))}</b></div></div></fieldset>
      <details><summary>Atributs F2B LAB</summary><div><p class="hint">35 atributs editables. El potencial (M2) segueix el POT.</p>${attrGroupsHtml}</div></details>
      <details><summary>Estadístiques manuals de temporada</summary><div><p class="hint">Totals introduïts a mà per a aquesta participació. Es mostren a Rendiment, separats de les actes F2B.</p>${grid(Object.keys(corrections.statistics).map(id => number('stats.' + id)))}</div></details>
      <fieldset><legend>Motiu i desament</legend>
        <label class="edit-field"><span class="edit-label">Motiu de la correcció (obligatori)</span><textarea name="reason" class="inline-editor" rows="3" maxlength="1000" required placeholder="Ex. La seva creació amb pilota encaixa millor com a base."></textarea></label>
        <div class="save-bar" style="margin-top:12px"><button class="btn accent" type="submit">Desa la correcció</button><button class="btn" type="button" data-action="form-reset">Restableix</button><span class="diff-count" data-diff>Cap canvi pendent</span></div>
        <p class="correction-feedback" role="status" style="margin:10px 0 0"></p></fieldset>
    </form>
    <aside class="edit-side">
      ${card('Com es desen els canvis', `<ol class="small" style="margin:0;padding-left:18px;line-height:1.6"><li>Modifica els camps. Els canvis queden ressaltats.</li><li>Escriu el motiu i prem <b>Desa la correcció</b>.</li><li>La fitxa, la plantilla i els rànquings s’actualitzen a l’instant i es conserven en aquest navegador.</li><li>Exporta el JSON per portar-lo a un altre dispositiu o incorporar-lo al repositori.</li></ol>
        <div class="actions" style="margin-top:12px"><button class="btn sm" type="button" data-action="export" ${pending.length ? '' : 'disabled'}>Exporta (${pending.length})</button><button class="btn sm" type="button" data-action="import">Importa JSON</button></div>${storageFault ? `<p class="note" style="margin-top:10px">${esc(storageFault)}</p>` : ''}`)}
      ${card('Historial de la fitxa', renderCorrectionHistory(history))}
    </aside></div>`;
}
function formDiff(form){
  let n = 0;
  for(const field of Object.keys(corrections.fields)){
    const el = form.elements.namedItem(field); if(!el) continue;
    const value = el.value;
    const after = value === '' ? null : corrections.positionFields.includes(field) || field === 'archetypeId' ? value : Number(value);
    const changed = JSON.parse(el.dataset.before) !== after;
    el.classList.toggle('edited', changed); if(changed) n++;
  }
  const d = form.querySelector('[data-diff]'); if(d) d.textContent = n ? `${n} ${n === 1 ? 'camp modificat' : 'camps modificats'}` : 'Cap canvi pendent';
  const h = form.elements.namedItem('realHeightCm')?.value, w = form.elements.namedItem('realWeightKg')?.value;
  const ph = form.querySelector('[data-preview-height]'), pw = form.querySelector('[data-preview-weight]');
  if(ph) ph.textContent = h ? heightF2B(Number(h) + 15) : '—';
  if(pw) pw.textContent = w ? weightF2B(Number(w) + 7) : '—';
  return n;
}
function syncArchetypeSelect(event){
  const form = event.target.form;
  if(event.target.name !== 'primaryPosition' || !form?.dataset.correctionMember) return;
  const select = form.elements.namedItem('archetypeId');
  const selected = select.value || JSON.parse(select.dataset.before);
  select.innerHTML = archetypeOptions(event.target.value, selected);
}
function submitCorrection(event){
  const form = event.target;
  if(!form.dataset.correctionMember) return;
  event.preventDefault();
  const feedback = form.querySelector('.correction-feedback');
  const fail = message => { feedback.textContent = message; feedback.dataset.state = 'error'; toast(message, 'error'); };
  const m = playerSeason(form.dataset.correctionMember);
  const inputs = new FormData(form);
  const fields = [];
  for(const field of Object.keys(corrections.fields)){
    const value = inputs.get(field);
    const after = value === '' ? null : corrections.positionFields.includes(field) || field === 'archetypeId' ? value : Number(value);
    const before = JSON.parse(form.elements.namedItem(field).dataset.before);
    if(before !== after) fields.push({field, before, after});
  }
  if(!fields.length) return fail('Canvia algun camp abans de desar.');
  const bad = fields.find(({after}) => typeof after === 'number' && !Number.isSafeInteger(after));
  if(bad) return fail(`${corrections.fields[bad.field]}: cal un nombre enter.`);
  const range = fields.find(({after, field}) => typeof after === 'number' && (Object.hasOwn(corrections.measurements, field) ? after <= 0 : after < 0 || (!field.startsWith('stats.') && after > 99)));
  if(range) return fail(`${corrections.fields[range.field]}: ${Object.hasOwn(corrections.measurements, range.field) ? 'ha de ser superior a 0' : range.field.startsWith('stats.') ? 'no pot ser negatiu' : 'ha d’estar entre 0 i 99'}.`);
  const reason = String(inputs.get('reason') ?? '').trim();
  if(!reason){ form.elements.namedItem('reason').focus(); return fail('Escriu el motiu de la correcció.'); }
  try {
    const id = Array.from(crypto.getRandomValues(new Uint8Array(16)), v => v.toString(16).padStart(2,'0')).join('');
    saveCorrections([{id, membershipId:m.id, playerId:m.playerId, at:new Date().toISOString(), reason, fields}]);
    render();
    const fb = $('.correction-feedback');
    if(fb){ fb.textContent = storageFault || `Correcció desada (${fields.length} ${fields.length === 1 ? 'camp' : 'camps'}).`; fb.dataset.state = storageFault ? 'error' : 'ok'; }
    toast(storageFault || 'Correcció desada en aquest navegador.', storageFault ? 'error' : 'ok');
  } catch(error){ fail(error.message); }
}

/* ═══ Comparador ══════════════════════════════════════════════════ */
const cmpColors = ['#d9622b','#2d5f8a','#2f7a4f','#7a4c9c'];
function renderCompare(){
  if(route.compare) { if(route.compare.join() !== compareIds.join()) setCompare(route.compare); }
  const members = compareIds.map(playerSeason).filter(Boolean);
  const head = pageHead('Eines F2B', 'Comparador de jugadors', `Compara fins a ${COMPARE_MAX} participacions: valoració, físic convertit, posició, arquetip i atributs.`, members.length ? `<button class="btn" type="button" data-action="compare-share">Copia l’enllaç</button><button class="btn ghost" type="button" data-action="compare-clear">Buida</button>` : '');
  const picker = `<div class="toolbar"><div class="field grow picker"><span>Afegeix un jugador (${members.length}/${COMPARE_MAX})</span><input type="search" data-bind="compare-pick" placeholder="Escriu un nom o un club" autocomplete="off" ${members.length >= COMPARE_MAX ? 'disabled' : ''} aria-controls="pickResults"><div class="picker-results" id="pickResults" hidden></div></div>
    ${members.length ? `<div class="chips">${members.map((m, i) => `<button class="chip" type="button" data-action="compare-remove" data-ms="${esc(m.id)}"><span class="swatch" style="background:${cmpColors[i]}"></span>${esc(shortName(player(m.playerId)))} ✕</button>`).join('')}</div>` : ''}</div>`;
  if(!members.length) return head + picker + empty('⇄', 'Encara no hi ha jugadors al comparador', 'Afegeix-ne des del cercador d’aquí dalt, des del directori o des de qualsevol fitxa amb el botó Compara.', link(P.players(), 'Obre el directori', 'btn primary'));
  const rows = members.map(memberRow);
  const best = (vals, higher=true) => { const nums = vals.filter(Number.isFinite); if(nums.length < 2) return -1; const target = higher ? Math.max(...nums) : Math.min(...nums); return vals.filter(v => v === target).length === 1 ? vals.indexOf(target) : -1; };
  const line = (label, vals, fmtv = v => esc(v ?? '—'), higher=true) => { const b = best(vals, higher); return `<div class="lbl">${esc(label)}</div>${vals.map((v, i) => `<div class="${i === b ? 'best' : ''}">${fmtv(v)}</div>`).join('')}`; };
  const html = `<div class="cmp-grid" style="--n:${rows.length}">
      <div class="lbl head"></div>${rows.map((r, i) => `<div class="head"><div class="who"><span class="swatch" style="background:${cmpColors[i]};width:24px;height:4px;border-radius:2px"></span>${link(P.member(r.m), esc(shortName(r.p)))}<span class="small muted">${crest(r.c, r.m.seasonId, 'sm')} ${esc(r.c.shortName || r.c.name)} · ${esc(edition(r.m.seasonId).label)}</span></div></div>`).join('')}
      <div class="sec">Valoració</div>
      ${line('OVR', rows.map(r => r.cv.ovr), v => ovr(v))}${line('POT', rows.map(r => r.cv.potential), v => ovr(v, 'pot'))}${line('Marge POT − OVR', rows.map(r => Number.isFinite(r.cv.potential) && Number.isFinite(r.cv.ovr) ? r.cv.potential - r.cv.ovr : null), v => v == null ? '—' : '+' + v)}
      <div class="sec">Rol</div>
      <div class="lbl">Posicions</div>${rows.map(r => `<div>${posChips(r.cv)}</div>`).join('')}
      <div class="lbl">Arquetip</div>${rows.map(r => `<div class="small">${r.cv.archetypeId ? link(P.archetype(r.cv.archetypeId), esc(archetypeEntry(r.cv.archetypeId).name), 'link') : '—'}</div>`).join('')}
      ${line('Encaix d’arquetip', rows.map(r => r.cv.archetypeId ? fitScore(lab(r.m), r.cv.archetypeId)?.score ?? null : null), v => v == null ? '—' : fmt1.format(v))}
      ${line('Minuts de referència', rows.map(r => rotationMinutes(r.t).get(r.m.id)?.minutes ?? null), v => v == null ? '—' : v + '′')}
      <div class="sec">Físic i perfil</div>
      ${line('Alçada F2B', rows.map(r => r.cv.f2bHeightCm), v => esc(heightF2B(v)))}${line('Pes F2B', rows.map(r => r.cv.f2bWeightKg), v => esc(weightF2B(v)))}${line('Edat al curs', rows.map(r => r.cv.seasonAge), v => esc(v ?? '—'), false)}
      <div class="lbl">Nacionalitat</div>${rows.map(r => `<div>${flag(r.p.nationality || r.cv.nationalityReference)} ${esc(countryNames[r.p.nationality || r.cv.nationalityReference] ?? '')}</div>`).join('')}
      <div class="sec">Grups F2B LAB</div>
      ${attributeGroups.map(([prefix, label]) => line(label, rows.map(r => groupScore(lab(r.m), prefix)), v => v == null ? '—' : `${Math.round(v)}`)).join('')}
    </div>`;
  const radarCard = card('Perfil per grups', radar(rows.map((r, i) => ({label:shortName(r.p), values:groupValues(lab(r.m)), color:cmpColors[i]})), 320) + `<div class="legend">${rows.map((r, i) => `<span><i style="background:${cmpColors[i]}"></i>${esc(shortName(r.p))}</span>`).join('')}</div>`);
  const attrsCard = card('Atributs F2B LAB', `<div class="table-wrap"><table class="t"><thead><tr><th scope="col">Atribut</th>${rows.map((r, i) => `<th scope="col" class="r"><span class="swatch" style="background:${cmpColors[i]}"></span>${esc(shortName(r.p))}</th>`).join('')}</tr></thead><tbody>${attributeGroups.map(([prefix, label]) => `<tr class="group-row"><td colspan="${rows.length + 1}">${esc(label)}</td></tr>` + DB.attributeDictionary.filter(([id]) => id.startsWith(prefix)).map(([id, name]) => { const vals = rows.map(r => lab(r.m)?.[id] ?? null); const b = best(vals);
      return `<tr><td><span class="faint" style="font:700 11px var(--mono)">${esc(id)}</span> ${esc(name)}</td>${vals.map((v, i) => `<td class="r${i === b ? '' : ''}" style="${i === b ? 'color:var(--accent);font-weight:800' : ''}">${esc(v ?? '—')}</td>`).join('')}</tr>`; }).join('')).join('')}</tbody></table></div>`, {desc:'El valor més alt de cada fila apareix destacat.'});
  return head + picker + `<div class="split" style="margin-top:4px">${html}${radarCard}</div><div class="section">${attrsCard}</div>`;
}
function pickerResults(q){
  const query = norm(q.trim());
  const box = $('#pickResults'); if(!box) return;
  if(query.length < 2){ box.hidden = true; box.innerHTML = ''; return; }
  const list = seasonRows(null).filter(r => !compareIds.includes(r.m.id) && norm([r.p.fullName, r.p.displayName, r.c.name, r.c.shortName].join(' ')).includes(query)).sort((a,b) => (b.cv.ovr ?? 0) - (a.cv.ovr ?? 0)).slice(0, 8);
  box.innerHTML = list.length ? list.map(r => `<button type="button" data-action="compare-add" data-ms="${esc(r.m.id)}">${crest(r.c, r.m.seasonId, 'sm')}<span style="flex:1"><b>${esc(shortName(r.p))}</b><small>${esc(r.c.name)} · ${esc(positionsOf(r.cv).join('/'))}</small></span>${ovr(r.cv.ovr)}</button>`).join('') : '<div class="search-empty">Cap coincidència.</div>';
  box.hidden = false;
}

/* ═══ Rànquings ═══════════════════════════════════════════════════ */
function renderRankings(){
  const e = edition(route.query.season) ?? edition(PILOT);
  return pageHead('Eines F2B', 'Rànquings F2B', `Lectures de les valoracions de ${esc(editionTitle(e))}. Són dades de conversió F2B, no resultats de partit.`) + rankingsBody(e.id);
}
function rankingsBody(seasonId){
  const rows = seasonRows(seasonId);
  const rated = rows.filter(r => Number.isFinite(r.cv.ovr));
  const byOvr = rated.slice().sort((a,b) => b.cv.ovr - a.cv.ovr || b.cv.potential - a.cv.potential);
  const margin = rated.filter(r => Number.isFinite(r.cv.potential)).sort((a,b) => (b.cv.potential - b.cv.ovr) - (a.cv.potential - a.cv.ovr) || b.cv.potential - a.cv.potential);
  const tall = rows.filter(r => Number.isFinite(r.cv.f2bHeightCm)).sort((a,b) => b.cv.f2bHeightCm - a.cv.f2bHeightCm);
  const young = rated.filter(r => Number.isFinite(r.cv.seasonAge) && r.cv.seasonAge <= 21).sort((a,b) => b.cv.potential - a.cv.potential);
  const bins = []; for(let v = 66; v <= 96; v += 2) bins.push([v, rated.filter(r => r.cv.ovr >= v && r.cv.ovr < v + 2).length]);
  const low = rated.filter(r => r.cv.ovr < 66).length;
  const maxBin = Math.max(low, ...bins.map(([,n]) => n), 1);
  const list = (items, value) => `<ol class="leader-list">${items.map((x, i) => leaderItem(x, i, value(x))).join('')}</ol>`;
  return `<div class="grid g2">
      ${card('Valoració global', list(byOvr.slice(0,12), x => ovr(x.cv.ovr)), {desc:'Els 12 OVR més alts del curs.', actions:link(P.players({sort:'ovr'}), 'Directori', 'btn sm')})}
      <div class="stack">
        ${card('Distribució d’OVR', `<div class="histo" role="img" aria-label="Histograma d’OVR">${low ? link(P.players({max:65}), `<b>${low}</b><i style="height:${(low / maxBin * 100).toFixed(1)}%"></i><small>&lt;66</small>`, '', `title="${low} jugadors per sota de 66"`) : ''}${bins.map(([v, n]) => link(P.players({min:v, max:v + 1}), `<b>${n || ''}</b><i style="height:${(n / maxBin * 100).toFixed(1)}%"></i><small>${v}</small>`, '', `title="${n} jugadors amb OVR ${v}–${v + 1}"`)).join('')}</div>
          <p class="small muted" style="margin:10px 0 0">Franges de dos punts. Toca una barra per veure’n els jugadors.</p>`, {desc:`${rated.length} jugadors valorats.`})}
        ${card('Marge de creixement', list(margin.slice(0,6), x => `<span class="tag accent">+${x.cv.potential - x.cv.ovr}</span>`), {desc:'Diferència entre POT i OVR.'})}
      </div>
    </div>
    <div class="section">${sectionHead('Millors per posició', 'Segons la posició principal de la fitxa.')}<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">${POS.map(code => card(posChip(code) + ' ' + esc(posPlural[code]), list(byOvr.filter(r => r.cv.primaryPosition === code).slice(0,5), x => ovr(x.cv.ovr)), {actions:link(P.players({pos:code}), 'Tots', 'btn sm')})).join('')}</div></div>
    <div class="section grid g2">
      ${card('Líders per atribut', `<label class="field" style="margin-bottom:10px"><span>Atribut F2B LAB</span><select data-bind="rank-attr" data-season="${esc(seasonId)}">${attributeGroups.map(([prefix, label]) => `<optgroup label="${esc(label)}">${DB.attributeDictionary.filter(([id]) => id.startsWith(prefix)).map(([id, name]) => `<option value="${id}" ${ui.rankAttr === id ? 'selected' : ''}>${id} · ${esc(name)}</option>`).join('')}</optgroup>`).join('')}</select></label><div id="rankAttr">${attrLeaders(seasonId, ui.rankAttr)}</div>`)}
      <div class="stack">${card('Joves amb més potencial', list(young.slice(0,6), x => `${ovr(x.cv.potential, 'pot')} <span class="small muted">${x.cv.seasonAge} a.</span>`), {desc:'21 anys o menys al curs, ordenats per POT.'})}
      ${card('Més alts en F2B', list(tall.slice(0,6), x => `<b class="small">${heightF2B(x.cv.f2bHeightCm)}</b>`), {desc:'Alçada convertida.'})}</div>
    </div>`;
}
function attrLeaders(seasonId, id){
  const rows = seasonRows(seasonId).filter(r => Number.isFinite(lab(r.m)?.[id])).sort((a,b) => lab(b.m)[id] - lab(a.m)[id] || (b.cv.ovr ?? 0) - (a.cv.ovr ?? 0)).slice(0, 10);
  return `<ol class="leader-list">${rows.map((x, i) => leaderItem(x, i, `<b>${lab(x.m)[id]}</b>`)).join('')}</ol>`;
}

/* ═══ Arquetips ═══════════════════════════════════════════════════ */
function renderArchetypes(){ return route.archetypeId ? archetypeDetail(route.archetypeId) : archetypeIndex(); }
function archetypeIndex(){
  const pos = POS.includes(route.query.pos) ? route.query.pos : '';
  const count = id => (indexes.membersByArchetype.get(id) ?? []).length;
  return pageHead('Catàleg F2B', 'Arquetips', `${DB.archetypeCatalog.entries.length} arquetips, 15 per posició. Descriuen la funció recurrent i dominant d’un jugador, no una acció aïllada.`)
    + `<div class="chips" style="margin-bottom:16px">${link('/archetypes', 'Totes les posicions', 'chip' + (!pos ? ' active' : ''))}${POS.map(code => link('/archetypes' + qs({pos:code}), esc(posPlural[code]), 'chip' + (pos === code ? ' active' : ''))).join('')}</div>`
    + (pos ? [pos] : POS).map(code => `<section class="section">${sectionHead(posPlural[code], `${DB.archetypeCatalog.entries.filter(e => e.position === code).reduce((a, e) => a + count(e.id), 0)} jugadors assignats al pilot.`)}<div class="arch-grid">${DB.archetypeCatalog.entries.filter(e => e.position === code).map(e => { const pr = archetypeProfile(e.id);
      return link(P.archetype(e.id), `<span class="code">${esc(e.id)}</span><b>${esc(e.name)}</b>${pr ? `<small>${esc(pr.identity)}</small>` : ''}<span class="foot"><span>${esc(pr?.family ?? '')}</span><span>${count(e.id)} ${count(e.id) === 1 ? 'jugador' : 'jugadors'}${DB.archetypeCatalog.fit.rows[e.id] ? ' · fila oficial' : ''}</span></span>`, 'arch-card'); }).join('')}</div></section>`).join('');
}
function archetypeDetail(id){
  const entry = archetypeEntry(id);
  if(!entry) return empty('◇', 'Arquetip desconegut', 'Consulta els arquetips del catàleg.', link('/archetypes', 'Tornar al catàleg', 'btn'));
  const profile = archetypeProfile(id);
  const head = pageHead(`${esc(entry.id)} · ${esc(profile?.family ?? posPlural[entry.position])}`, entry.name, profile ? esc(profile.identity) : '', link('/archetypes' + qs({pos:entry.position}), 'Altres ' + esc(posPlural[entry.position].toLowerCase()), 'btn'));
  if(!profile) return head + empty('◇', 'Fitxa detallada pendent', 'El codi i la denominació ja són al catàleg.');
  const cat = DB.archetypeCatalog, def = archetypeGroups(id), dims = cat.comparison.rows[id] ?? profile.proposal?.dimensions;
  const assigned = (indexes.membersByArchetype.get(id) ?? []).map(memberRow).filter(r => r.p).sort((a,b) => (b.cv.ovr ?? 0) - (a.cv.ovr ?? 0));
  const assignedIds = new Set(assigned.map(r => r.m.id));
  const contrast = profile.references.filter(r => r.kind === 'contrast' && !assignedIds.has(r.membershipId)).map(r => playerSeason(r.membershipId)).filter(Boolean).map(memberRow);
  const peers = cat.entries.filter(e => e.position === entry.position);
  const i = peers.findIndex(e => e.id === id), prev = peers[i - 1], next = peers[i + 1];
  const stages = ['Definitoris','De suport','Complementaris'];
  const playerTable = (rows, kind) => rows.length ? `<div class="table-wrap"><table class="t"><thead><tr><th scope="col">Jugador</th><th scope="col" class="hide-m">Equip</th><th scope="col">Pos.</th><th scope="col" class="c">OVR</th><th scope="col" class="r">Encaix</th></tr></thead><tbody>${rows.map(r => { const f = fitScore(lab(r.m), id);
    return `<tr><td>${link(P.member(r.m), esc(shortName(r.p)), 'link')}</td><td class="hide-m small">${crest(r.c, r.m.seasonId, 'sm')} ${esc(r.c.shortName || r.c.name)}</td><td>${posChips(r.cv)}</td><td class="c">${ovr(r.cv.ovr)}</td><td class="r">${f ? fmt1.format(f.score) : '—'}</td></tr>`; }).join('')}</tbody></table></div>` : `<p class="muted" style="margin:0">${kind}</p>`;
  return head + `<div class="grid g2">
      ${card('Com juga', `<h4 style="margin:0 0 4px">Amb pilota</h4><p style="margin:0 0 12px">${esc(profile.offense)}</p><h4 style="margin:0 0 4px">Sense pilota i en defensa</h4><p style="margin:0">${esc(profile.offBallDefense)}</p>`)}
      ${card('Encaix al quintet', `<p style="margin:0 0 12px">${esc(profile.fit)}</p><h4 style="margin:0 0 4px">Límits</h4><p style="margin:0 0 12px">${esc(profile.limits)}</p><h4 style="margin:0 0 4px">Perfil físic</h4><p style="margin:0">${esc(profile.physical)}</p>`)}
    </div>
    <section class="possession section"><h2>Una possessió característica</h2><p>${esc(profile.possession)}</p></section>
    <div class="section grid g2">
      ${card('Matriu i atributs', `<dl class="dims">${cat.comparison.dimensions.map((label, k) => `<div><dt>${esc(label)}</dt><dd>${esc(dims?.[k] ?? '—')}</dd></div>`).join('')}</dl><p class="small muted">● principal · ◐ secundària · ○ complementària · — no determinant</p>
        <div class="table-wrap"><table class="t"><thead><tr><th scope="col">Grup</th><th scope="col" class="r">Pes</th><th scope="col">Atributs</th></tr></thead><tbody>${def.groups.map((codes, k) => `<tr><td>${stages[k]}</td><td class="r">${Math.round(Object.values(cat.fit.weights)[k] * 100)}%</td><td class="small">${codes.map(code => `<b>${esc(code)}</b> ${esc(indexes.attrNames.get(code))}`).join(' · ')}</td></tr>`).join('')}</tbody></table></div>`, {desc:def.official ? 'Fila registrada al catàleg F2B LAB.' : 'Proposta de calibratge. La fila original està pendent de recuperar.', actions:def.official ? '<span class="tag ok">Oficial</span>' : '<span class="tag warn">Proposta</span>'})}
      ${card('Com assignar-lo', `<p style="margin:0 0 10px">${esc(profile.assignment)}</p>${profile.near.map(peer => `<div class="coach-line" style="grid-template-columns:1fr"><b>${link(P.archetype(peer.id), esc(peer.id + ' · ' + archetypeEntry(peer.id).name), 'link')}</b><span class="small muted">${esc(peer.distinction)}</span></div>`).join('')}`)}
    </div>
    <div class="section grid g2">
      ${card(`Jugadors assignats · ${assigned.length}`, playerTable(assigned, 'Cap jugador del pilot té aquest arquetip assignat.'), {desc:'Encaix calculat amb els atributs de cada fitxa.'})}
      <div class="stack">${contrast.length ? card('Casos de contrast', playerTable(contrast, '')) : ''}
      ${card('Proposta per al motor', `<p style="margin:0 0 10px">${esc(profile.engine)}</p><h4 style="margin:0 0 4px">Indicadors proposats</h4><ul style="margin:0;padding-left:18px">${profile.indicators.map(v => `<li>${esc(v)}</li>`).join('')}</ul>`)}</div>
    </div>
    <nav class="pager">${prev ? link(P.archetype(prev.id), `<small>← ${esc(prev.id)}</small><b>${esc(prev.name)}</b>`, 'prev') : '<span></span>'}${next ? link(P.archetype(next.id), `<small>${esc(next.id)} →</small><b>${esc(next.name)}</b>`, 'next') : '<span></span>'}</nav>`;
}

/* ═══ Cobertura i correccions ═════════════════════════════════════ */
function renderDatabase(){
  const tabs = [['resum','Cobertura'],['revisio','Revisió'],['correccions','Correccions',pending.length || ''],['fonts','Fonts']];
  const active = tabs.some(([id]) => id === route.tab) ? route.tab : 'resum';
  const views = {resum:dbCoverage, revisio:dbReview, correccions:dbCorrections, fonts:dbSources};
  return pageHead('Eines F2B', 'Cobertura i correccions', 'Estat de les dades incorporades, casos pendents de revisió i registre de correccions de jugador.') + tabsNav(tabs, active, P.database, 'Apartats de cobertura') + views[active]();
}
function dbCoverage(){
  const teams = DB.participants;
  const rows = DB.playerSeasons;
  return `<div class="metrics">${metric(DB.competitionCatalog.competitions.length, 'Competicions catalogades')}${metric(DB.seasons.length, 'Edicions amb dades')}${metric(DB.clubs.length, 'Clubs')}${metric(DB.players.length, 'Identitats de jugador')}${metric(rows.length, 'Participacions de jugador')}${metric(DB.fixtures.length, 'Enfrontaments')}</div>
    <div class="section">${sectionHead('Cobertura per equip', 'Què té incorporat cada equip-temporada.')}
      <div class="table-wrap"><div class="cov-row head"><span>Equip</span><span>Jugadors</span><span>Tàctica</span><span>Banqueta</span><span>Escut</span><span>Revisió</span></div>
      ${teams.map(t => { const c = clubOf(t), n = teamMembers(t.id).length, rev = teamMembers(t.id).filter(m => m.eligibilityStatus === 'REVIEW').length;
        return `<div class="cov-row">${link(P.team(t), crest(c, t.seasonId, 'sm') + ' ' + esc(c.shortName || c.name), 'club-chip')}<span>${n}</span><span class="${t.teamProfile || t.tacticalProfile ? 'yes' : 'no'}">${t.teamProfile ? 'Ampliada' : t.tacticalProfile ? 'Sí' : '—'}</span><span class="${t.coachingStaff ? 'yes' : 'no'}">${t.coachingStaff ? 'Sí' : '—'}</span><span class="${crestAsset(c.id, t.seasonId) ? 'yes' : 'no'}">${crestAsset(c.id, t.seasonId) ? 'Sí' : '—'}</span><span>${rev ? link(P.players({club:c.id, status:'review'}), String(rev), 'link') : '0'}</span></div>`; }).join('')}</div></div>
    <div class="section grid g2">
      ${card('Dades incorporades', kv([['Identitat de competició i temporada', '✓'], ['Clubs i participacions', '✓'], ['Jornades i emparellaments', '✓'], ['Plantilles de migcampistes i davanters', '✓'], ['Conversió física, posicions, arquetips, OVR/POT', '✓'], ['Atributs F2B LAB', esc(rows.filter(m => lab(m)).length + ' fitxes')]]), {actions:'<span class="tag ok">Carregades</span>'})}
      ${card('Dades que no es repliquen', kv([['Resultats del futbol', 'No'], ['Classificacions del futbol', 'No'], ['Estadístiques del futbol', 'No'], ['Dates, estadis i àrbitres', 'No']]) + '<p class="small muted" style="margin:10px 0 0">Els resultats i les estadístiques sortiran del motor F2B.</p>', {actions:'<span class="tag">Excloses</span>'})}
    </div>`;
}
function dbReview(){
  const rows = DB.playerSeasons.map(memberRow).filter(r => r.p);
  const review = rows.filter(r => r.m.eligibilityStatus === 'REVIEW');
  const count = (key) => { const map = {}; for(const r of rows){ const v = r.cv[key] ?? 'PENDING'; map[v] = (map[v] ?? 0) + 1; } return map; };
  const statusBlock = (title, key) => { const map = count(key); const total = rows.length;
    return card(title, `<div class="hbars">${Object.entries(map).sort((a,b) => b[1] - a[1]).map(([k, n]) => `<div class="hbar"><span>${esc(playerStatus[k] ?? k)}</span>${bar(n, total)}<b>${n}</b></div>`).join('')}</div>`); };
  return `<div class="grid g3">${statusBlock('Estat de l’OVR', 'ovrStatus')}${statusBlock('Estat de la posició', 'primaryPositionStatus')}${statusBlock('Estat de l’arquetip', 'archetypeStatus')}</div>
    <div class="section">${sectionHead(`Elegibilitat en revisió · ${review.length}`, 'Perfils mixtos entre defensa i migcamp, o casos amb pertinença discutible.')}
      ${review.length ? `<div class="table-wrap"><table class="t"><thead><tr><th scope="col">Jugador</th><th scope="col">Equip</th><th scope="col">Pos.</th><th scope="col">Nota</th></tr></thead><tbody>${review.map(r => `<tr><td>${link(P.member(r.m), esc(shortName(r.p)), 'link')}</td><td class="small">${esc(r.c.name)}</td><td>${posChips(r.cv)}</td><td class="small" style="min-width:260px">${esc(r.m.eligibilityNotes ?? r.m.scopeEvidence ?? '—')}</td></tr>`).join('')}</tbody></table></div>` : empty('✓', 'Cap cas en revisió', '')}</div>`;
}
function dbCorrections(){
  const legacy = legacyBackups();
  return `<div class="grid g2">
      ${card('Correccions d’aquest navegador', `<div class="metrics" style="margin-bottom:12px">${metric(pending.length, 'Locals')}${metric(canonical.length, 'Compartides al repositori')}</div>
        ${storageFault ? `<p class="note">${esc(storageFault)}</p>` : '<p class="small muted" style="margin:0 0 12px">Les correccions locals es conserven en aquest navegador i es recuperen en recarregar l’enciclopèdia.</p>'}
        <div class="actions"><button class="btn primary" type="button" data-action="export" ${pending.length ? '' : 'disabled'}>Exporta correccions</button><button class="btn" type="button" data-action="import">Importa JSON</button>${link(P.players({status:'local'}), 'Jugadors amb canvis locals', 'btn ghost')}</div>
        ${legacy.length ? `<div class="actions" style="margin-top:10px">${legacy.map((key, i) => `<button class="btn sm" type="button" data-action="legacy" data-key="${esc(key)}">Descarrega l’esborrany anterior ${i + 1}</button>`).join('')}</div>` : ''}`)}
      ${card('Incorporar-les a la base comuna', `<p class="small" style="margin:0 0 8px">Un cop revisat el JSON exportat:</p><pre style="white-space:pre-wrap;background:var(--bg);border-radius:8px;padding:10px;font:12px/1.6 var(--mono);margin:0;overflow-x:auto">node scripts/build-encyclopedia.mjs --import-corrections F2B-correccions.json --dry-run
node scripts/build-encyclopedia.mjs --import-corrections F2B-correccions.json
node scripts/build-encyclopedia.mjs --check</pre><p class="small muted" style="margin:8px 0 0">La importació evita duplicats i s’atura si un valor de partida ja ha canviat.</p>`)}
    </div><div class="section">${card('Registre de correccions', renderCorrectionHistory([...canonical, ...pending], {showPlayer:true}))}</div>`;
}
function dbSources(){
  const groups = groupBy(DB.sources, s => s.id.split('-').slice(0,2).join('-'));
  return `<div class="table-wrap"><table class="t"><thead><tr>${sortable('Font')}${sortable('Ús', 'hide-m')}<th scope="col">Enllaç</th></tr></thead><tbody>${DB.sources.map(s => `<tr><td data-v="${esc(s.name)}"><b>${esc(s.name)}</b><div class="faint small"><code>${esc(s.id)}</code></div></td><td class="small hide-m" data-v="${esc(s.scope || s.use || '')}">${esc(s.scope || s.use || '—')}</td><td>${/^https?:\/\//i.test(s.url ?? '') ? `<a class="link" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">Obre ↗</a>` : '—'}</td></tr>`).join('')}</tbody></table></div><p class="small muted">${DB.sources.length} fonts en ${groups.size} famílies.</p>`;
}

/* ═══ Cerca global ════════════════════════════════════════════════ */
let searchItems = [], searchSel = -1;
function searchIndex(q){
  const query = norm(q.trim());
  if(query.length < 2) return [];
  const out = {Jugadors:[], Equips:[], Arquetips:[], Competicions:[], Calendari:[]};
  const match = terms => norm(terms.filter(Boolean).join(' ')).includes(query);
  for(const r of seasonRows(null)) if(match([r.p.fullName, r.p.displayName, ...(r.p.aliases ?? [])])) out.Jugadors.push({title:shortName(r.p), sub:`${r.c.name} · ${edition(r.m.seasonId).label} · ${positionsOf(r.cv).join('/') || '—'}`, icon:crest(r.c, r.m.seasonId, 'sm'), path:P.member(r.m), rank:(norm(shortName(r.p)).startsWith(query) ? 100 : 0) + (r.cv.ovr ?? 0)});
  for(const t of DB.participants){ const c = clubOf(t), e = edition(t.seasonId); if(match([c.name, c.shortName, c.city, ...(c.aliases ?? []), e.label])) out.Equips.push({title:c.name, sub:`Equip · ${editionTitle(e)}`, icon:crest(c, t.seasonId, 'sm'), path:P.team(t)}); }
  for(const a of DB.archetypeCatalog.entries) if(match([a.name, a.id])) out.Arquetips.push({title:a.name, sub:`Arquetip · ${a.id} · ${posName[a.position]}`, icon:`<span class="pos">${esc(a.position)}</span>`, path:P.archetype(a.id)});
  for(const c of DB.competitionCatalog.competitions){ const g = getGroup(c.groupId); if(match([c.name, g.name, ...c.aliases])) out.Competicions.push({title:c.name, sub:`Competició · ${g.name}`, icon:`<span class="crest sm">${esc(g.id.slice(0,3))}</span>`, path:P.competition(c.id)}); }
  const rm = query.match(/^(?:jornada|j|round)\s*(\d+)$/);
  if(rm) for(const r of DB.rounds.filter(x => x.roundNumber === Number(rm[1]))) out.Calendari.push({title:r.label, sub:editionTitle(edition(r.seasonId)), icon:`<span class="crest sm">${r.roundNumber}</span>`, path:P.round(r.id)});
  const pair = DB.fixtures.filter(f => norm(`${club(f.homeClubId).name} ${club(f.awayClubId).name}`).includes(query) || norm(`${club(f.homeClubId).shortName} ${club(f.awayClubId).shortName}`).includes(query)).slice(0, 2);
  for(const f of pair) out.Calendari.push({title:`${club(f.homeClubId).name} – ${club(f.awayClubId).name}`, sub:`${round(f.roundId).label} · ${editionTitle(edition(f.seasonId))}`, icon:'<span class="crest sm">VS</span>', path:P.fixture(f.id)});
  out.Jugadors.sort((a,b) => b.rank - a.rank);
  const limits = {Jugadors:6, Equips:4, Arquetips:3, Competicions:3, Calendari:3};
  return Object.entries(out).filter(([,v]) => v.length).map(([group, items]) => [group, items.slice(0, limits[group])]);
}
function showSearch(q){
  const box = $('#searchResults'), input = $('#globalSearch');
  const groups = searchIndex(q);
  searchItems = groups.flatMap(([, items]) => items); searchSel = -1;
  if(q.trim().length < 2){ box.hidden = true; box.innerHTML = ''; input.setAttribute('aria-expanded','false'); return; }
  let k = 0;
  box.innerHTML = groups.length ? groups.map(([group, items]) => `<div class="search-group">${esc(group)}</div>` + items.map(x => `<a class="search-item" role="option" id="sr-${k}" data-index="${k++}" href="#${esc(x.path)}" data-route="${esc(x.path)}" aria-selected="false">${x.icon}<span><b>${esc(x.title)}</b><small>${esc(x.sub)}</small></span></a>`).join('')).join('') : `<div class="search-empty">Cap resultat per a «${esc(q)}».</div>`;
  box.hidden = false; input.setAttribute('aria-expanded','true');
}
function moveSearch(delta){
  if(!searchItems.length) return;
  searchSel = (searchSel + delta + searchItems.length) % searchItems.length;
  $$('.search-item').forEach(el => el.setAttribute('aria-selected', String(Number(el.dataset.index) === searchSel)));
  const el = $(`#sr-${searchSel}`); el?.scrollIntoView({block:'nearest'});
  $('#globalSearch').setAttribute('aria-activedescendant', el?.id ?? '');
}
function closeSearch(){ $('#searchResults').hidden = true; $('#globalSearch').setAttribute('aria-expanded','false'); }

/* ═══ Render principal ════════════════════════════════════════════ */
function render({focus=false}={}){
  if(route.page === 'rounds'){ navigate(P.season(PILOT, 'calendar'), {replace:true}); return; }
  const pages = {home:renderHome, competitions:renderCompetitions, competition:renderCompetition, seasons:renderSeasons, season:renderSeason, clubs:renderClubs, club:renderClub, team:renderTeam, round:renderRound, fixture:renderFixture, players:renderPlayers, player:renderPlayer, archetypes:renderArchetypes, compare:renderCompare, rankings:renderRankings, database:renderDatabase};
  let html;
  try { html = (pages[route.page] ?? (() => empty('⌂', 'Pàgina no disponible', 'La ruta no existeix en aquesta versió de l’enciclopèdia.', link('/home', 'Inici', 'btn'))))(); }
  catch(error){ console.error(error); html = empty('!', 'No s’ha pogut mostrar la pàgina', error.message, link('/home', 'Inici', 'btn')); }
  const mobileCrumbs = renderCrumbs(crumbs());
  $('#content').innerHTML = mobileCrumbs + html;
  setNav(); updateCompareUI();
  const title = $('#content h1')?.textContent;
  document.title = title ? `${title} · F2B` : 'F2B · Enciclopèdia de bàsquet';
  if(focus){ window.scrollTo({top:0}); $('#content').focus({preventScroll:true}); }
}

/* ═══ Esdeveniments ═══════════════════════════════════════════════ */
function sortTable(button){
  const th = button.closest('th'), table = th.closest('table'), idx = [...th.parentNode.children].indexOf(th);
  const dir = th.getAttribute('aria-sort') === 'descending' ? 'ascending' : 'descending';
  $$('th', table).forEach(x => x.hasAttribute('aria-sort') && x.setAttribute('aria-sort', 'none'));
  th.setAttribute('aria-sort', dir);
  const body = table.tBodies[0];
  const val = tr => { const td = tr.children[idx]; const v = td?.dataset.v ?? td?.textContent ?? ''; const n = Number(v); return v !== '' && Number.isFinite(n) ? n : norm(v); };
  [...body.rows].sort((a,b) => { const x = val(a), y = val(b); return (x < y ? -1 : x > y ? 1 : 0) * (dir === 'ascending' ? 1 : -1); }).forEach(tr => body.append(tr));
}
document.addEventListener('click', event => {
  const action = event.target.closest('[data-action]');
  if(action){
    const d = action.dataset;
    switch(d.action){
      case 'sort-table': sortTable(action); return;
      case 'route': navigate(d.path); return;
      case 'export': exportLocalData(); return;
      case 'import': $('#importFile').click(); return;
      case 'legacy': if(LEGACY_KEYS.includes(d.key)) downloadJson(JSON.parse(localStorage.getItem(d.key)), 'F2B-esborrany-' + d.key + '.json'); return;
      case 'compare-clear': setCompare([]); if(route.page === 'compare') navigate(P.compare(), {replace:true}); return;
      case 'compare-remove': setCompare(compareIds.filter(x => x !== d.ms)); navigate(P.compare(compareIds), {replace:true}); return;
      case 'compare-add': setCompare([...compareIds, d.ms]); navigate(P.compare(compareIds), {replace:true}); setTimeout(() => $('[data-bind="compare-pick"]')?.focus(), 0); return;
      case 'compare-share': { const url = location.href.split('#')[0] + '#' + P.compare(compareIds); (navigator.clipboard?.writeText(url) ?? Promise.reject()).then(() => toast('Enllaç copiat.', 'ok'), () => toast('No s’ha pogut copiar. Enllaç: ' + url, 'error')); return; }
      case 'lineup': { ui.lineup[d.team] = d.lineup; const sec = action.closest('[data-lineup-team]'); $$('[data-action="lineup"]', sec).forEach(b => b.setAttribute('aria-pressed', String(b === action))); $('[data-lineup-view]', sec).innerHTML = lineupView(team(d.team), d.lineup); return; }
      case 'roster-group': ui.roster.group = d.value === '1'; $$('[data-action="roster-group"]').forEach(b => b.setAttribute('aria-pressed', String(b === action))); $('#rosterTable').innerHTML = rosterTable(team(route.teamId)); return;
      case 'team-calendar': ui.calendar[d.team] = d.value; $('#teamView').innerHTML = teamCalendar(team(d.team)); return;
      case 'dir-sort': { const st = dirState(); const dir = st.sort === d.key ? (st.dir === 'asc' ? 'desc' : 'asc') : (['name','club','pos','arch','nat'].includes(d.key) ? 'asc' : 'desc'); updateDirectory({sort:d.key, dir}); return; }
      case 'dir-more': { ui.dirLimit += 60; const view = ui.dirView ?? (window.innerWidth < 700 ? 'cards' : 'table'); const st = dirState(); const box = $('[data-dir-season]'); if(box?.dataset.dirSeason) st.season = box.dataset.dirSeason; $('#dirResults').innerHTML = directoryResults(st, view); return; }
      case 'dir-view': ui.dirView = d.value; $$('[data-action="dir-view"]').forEach(b => b.setAttribute('aria-pressed', String(b === action))); updateDirectory({}); return;
      case 'dir-reset': { const box = $('[data-dir-season]'); const base = box?.dataset.embedded === '1' ? P.season(box.dataset.dirSeason, 'players') : '/players'; navigate(base, {replace:true}); return; }
      case 'form-reset': { const form = action.closest('form'); form.reset(); const sel = form.elements.namedItem('archetypeId'); const pos = form.elements.namedItem('primaryPosition'); sel.innerHTML = archetypeOptions(pos.value, JSON.parse(sel.dataset.before)); formDiff(form); form.querySelector('.correction-feedback').textContent = ''; return; }
    }
  }
  const toggle = event.target.closest('[data-compare-toggle]');
  if(toggle && toggle.tagName === 'BUTTON'){ toggleCompare(toggle.dataset.compareToggle); return; }
  const scroll = event.target.closest('[data-scroll]');
  if(scroll){ event.preventDefault(); if(route.page !== 'home') navigate('/home'); setTimeout(() => document.getElementById(scroll.dataset.scroll)?.scrollIntoView({behavior:'smooth'}), 30); return; }
  const a = event.target.closest('[data-route]');
  if(a && !event.metaKey && !event.ctrlKey && !event.shiftKey && event.button === 0){ event.preventDefault(); closeSearch(); navigate(a.dataset.route); return; }
  if(!event.target.closest('.search')) closeSearch();
  if(!event.target.closest('.picker')) { const pr = $('#pickResults'); if(pr) pr.hidden = true; }
});
document.addEventListener('change', event => {
  const el = event.target;
  if(el.matches('[data-compare-toggle]') && el.type === 'checkbox'){ toggleCompare(el.dataset.compareToggle); return; }
  if(el.form?.dataset.correctionMember){ syncArchetypeSelect(event); formDiff(el.form); return; }
  const bind = el.dataset.bind;
  if(bind === 'dir'){ if(el.type === 'range' || el.type === 'search') return; const key = el.dataset.key; updateDirectory({[key]: el.type === 'checkbox' ? (el.checked ? '1' : '') : el.value, ...(key === 'pos' ? {arch:''} : {})}); if(key === 'pos') render(); return; }
  if(bind === 'roster-sort'){ ui.roster.sort = el.value; $('#rosterTable').innerHTML = rosterTable(team(route.teamId)); return; }
  if(bind === 'calendar-team'){ navigate(P.season(el.dataset.season, 'calendar', qs({team:el.value})), {replace:true}); return; }
  if(bind === 'builder'){ const ids = ui.builder[el.dataset.team].slice(); ids[Number(el.dataset.slot)] = el.value; ui.builder[el.dataset.team] = ids; const sec = el.closest('[data-lineup-team]'); $('[data-lineup-view]', sec).innerHTML = lineupView(team(el.dataset.team), 'builder'); sec.querySelector(`[data-slot="${el.dataset.slot}"]`)?.focus(); return; }
  if(bind === 'attr-avg'){ ui.attrAvg = el.checked; render(); return; }
  if(bind === 'rank-attr'){ ui.rankAttr = el.value; $('#rankAttr').innerHTML = attrLeaders(el.dataset.season, el.value); return; }
});
let inputTimer;
document.addEventListener('input', event => {
  const el = event.target;
  if(el.id === 'globalSearch'){ showSearch(el.value); return; }
  if(el.form?.dataset.correctionMember){ formDiff(el.form); return; }
  const bind = el.dataset.bind;
  if(bind === 'dir' && el.type === 'range'){ const out = $('[data-min-out]'); if(out) out.textContent = el.value === '60' ? 'tots' : el.value; clearTimeout(inputTimer); inputTimer = setTimeout(() => updateDirectory({min:el.value === '60' ? '' : el.value}), 120); return; }
  if(bind === 'dir' && el.type === 'search'){ clearTimeout(inputTimer); inputTimer = setTimeout(() => updateDirectory({q:el.value}), 140); return; }
  if(bind === 'roster-q'){ ui.roster.q = el.value; clearTimeout(inputTimer); inputTimer = setTimeout(() => { $('#rosterTable').innerHTML = rosterTable(team(route.teamId)); }, 120); return; }
  if(bind === 'compare-pick'){ pickerResults(el.value); return; }
});
document.addEventListener('submit', submitCorrection);
document.addEventListener('keydown', event => {
  const input = $('#globalSearch');
  if(event.key === '/' && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)){ event.preventDefault(); input.focus(); input.select(); return; }
  if(event.key === 'Escape'){ closeSearch(); closeMenu(); return; }
  if(document.activeElement === input){
    if(event.key === 'ArrowDown'){ event.preventDefault(); moveSearch(1); }
    else if(event.key === 'ArrowUp'){ event.preventDefault(); moveSearch(-1); }
    else if(event.key === 'Enter'){ const item = searchItems[Math.max(searchSel, 0)]; if(item){ event.preventDefault(); closeSearch(); input.blur(); navigate(item.path); } }
  }
});
$('#importFile').addEventListener('change', async event => {
  const file = event.target.files?.[0]; if(!file) return;
  try { await importLocalData(file); } catch(error){ toast('No s’ha pogut importar: ' + error.message, 'error'); }
  event.target.value = '';
});
$('#menuButton').addEventListener('click', () => $('#sidebar').classList.contains('open') ? closeMenu() : openMenu());
$('#scrim').addEventListener('click', closeMenu);
window.addEventListener('hashchange', () => { parseRoute(); render({focus:true}); });

Promise.resolve().then(loadData).then(() => {
  $('#footVersion').textContent = `${VERSION} · ${DB.playerSeasons.length} participacions · ${DB.fixtures.length} enfrontaments`;
  parseRoute(); render();
}).catch(error => { $('#content').innerHTML = empty('!', 'Error carregant les dades', error.message); });
})();

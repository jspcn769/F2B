export function createPlayerCorrections(db) {
  const format = 'F2B-player-corrections';
  const positions = ['BA', 'ES', 'AL', 'AP', 'P'];
  const fields = {
    primaryPosition: 'Posició principal', secondaryPosition: 'Posició secundària',
    tertiaryPosition: 'Tercera posició', archetypeId: 'Arquetip', ovr: 'OVR', potential: 'POT',
  };
  const positionFields = ['primaryPosition', 'secondaryPosition', 'tertiaryPosition'];
  const statistics = {
    games: 'Partits', starts: 'Titularitats', minutes: 'Minuts', points: 'Punts',
    assists: 'Assistències', rebounds: 'Rebots', steals: 'Robatoris', blocks: 'Taps',
  };
  const ratingFields = ['ovr','potential'];
  const archetypes = new Map(db.archetypeCatalog.entries.map(row => [row.id, row]));
  const attributeFields = db.attributeDictionary.filter(([id]) => id !== 'M2');
  for (const [id, label] of attributeFields) fields['lab.' + id] = label;
  for (const [id, label] of Object.entries(statistics)) fields['stats.' + id] = label;
  const check = (condition, message) => { if (!condition) throw new Error(message); };
  function read(member, field) {
    if (field.startsWith('lab.')) return member.conversion.attributes?.lab?.[field.slice(4)] ?? null;
    if (field.startsWith('stats.')) return member.manualStatistics?.[field.slice(6)] ?? null;
    return member.conversion[field] ?? null;
  }
  function allowed(field, value) {
    if (value === null) return true;
    if (positionFields.includes(field)) return positions.includes(value);
    if (field === 'archetypeId') return archetypes.has(value);
    return Number.isSafeInteger(value) && value >= 0 && (field.startsWith('stats.') || value <= 99);
  }
  function validate(member) {
    const cv = member.conversion;
    const roles = positionFields.map(field => cv[field]).filter(Boolean);
    check(new Set(roles).size === roles.length, 'Les posicions han de ser diferents.');
    check(!cv.secondaryPosition || cv.primaryPosition, 'Assigna una posició principal abans de la secundària.');
    check(!cv.tertiaryPosition || cv.secondaryPosition, 'Assigna una posició secundària abans de la tercera.');
    check(!cv.archetypeId || archetypes.get(cv.archetypeId)?.position === cv.primaryPosition, 'Tria un arquetip de la posició principal.');
    check(cv.ovr == null || cv.potential == null || cv.ovr <= cv.potential, 'El POT ha de ser igual o superior a l’OVR.');
    const stats = member.manualStatistics;
    check(stats?.games == null || stats.starts == null || stats.starts <= stats.games, 'Les titularitats no poden superar els partits.');
  }
  function validateEntry(entry) {
    check(entry && typeof entry.id === 'string' && /^[a-zA-Z0-9-]{8,80}$/.test(entry.id) &&
      typeof entry.at === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(entry.at) && Number.isFinite(Date.parse(entry.at)) &&
      typeof entry.reason === 'string' && entry.reason.trim().length > 0 && entry.reason.length <= 1000 &&
      typeof entry.membershipId === 'string' && typeof entry.playerId === 'string' &&
      Array.isArray(entry.fields) && entry.fields.length > 0, 'Entrada de correcció invàlida. Cal un motiu i almenys un canvi.');
    const seen = new Set();
    for (const item of entry.fields) {
      check(item && Object.hasOwn(fields, item.field) && !seen.has(item.field) && item.before !== item.after &&
        allowed(item.field, item.before) && allowed(item.field, item.after), 'Camp o valor de correcció invàlid.');
      seen.add(item.field);
    }
  }
  function parse(payload) {
    check(payload?.format === format && payload.schemaVersion === 1 && Array.isArray(payload.changes), 'Selecciona un fitxer JSON de correccions F2B.');
    for (const entry of payload.changes) validateEntry(entry);
    return payload.changes;
  }
  function merge(existing, incoming) {
    const result = new Map(existing.map(entry => [entry.id, entry]));
    for (const entry of incoming) {
      const previous = result.get(entry.id);
      check(!previous || JSON.stringify(previous) === JSON.stringify(entry), 'Hi ha dues correccions diferents amb el mateix identificador.');
      if (!previous) result.set(entry.id, entry);
    }
    return [...result.values()];
  }
  function replay(baseMembers, changes, status) {
    const members = new Map(baseMembers.map(member => [member.id, member]));
    const updated = new Set();
    for (const entry of changes) {
      validateEntry(entry);
      let member = members.get(entry.membershipId);
      check(member?.playerId === entry.playerId, 'Participació desconeguda: ' + entry.membershipId);
      if (!updated.has(entry.membershipId)) {
        member = structuredClone(member);
        members.set(entry.membershipId, member);
        updated.add(entry.membershipId);
      }
      for (const {field, before, after} of entry.fields) {
        check(read(member, field) === before, 'Conflicte a ' + member.id + ' · ' + fields[field] + '. El valor de partida ha canviat.');
        const cv = member.conversion;
        if (field.startsWith('lab.')) {
          cv.attributes ??= {};
          cv.attributes.lab ??= {};
          cv.attributes.lab[field.slice(4)] = after;
          cv.attributeStatus = status;
        } else if (field.startsWith('stats.')) {
          member.manualStatistics ??= {};
          member.manualStatistics[field.slice(6)] = after;
        } else {
          cv[field] = after;
          cv[field === 'archetypeId' ? 'archetypeStatus' : field + 'Status'] = after === null ? 'PENDING' : status;
          if (field === 'archetypeId') cv.archetype = after === null ? null : after + ' · ' + archetypes.get(after).name;
        }
      }
      const cv = member.conversion;
      if (cv.attributes?.lab) cv.attributes.lab.M2 = cv.potential ?? null;
      if (entry.fields.some(item => !item.field.startsWith('stats.'))) cv.status = 'IN_REVIEW';
      validate(member);
    }
    return [...members.values()];
  }
  const pack = changes => ({format, schemaVersion:1, changes});
  return {read, fields, positionFields, positions, ratingFields, attributeFields, statistics, parse, merge, replay, pack};
}

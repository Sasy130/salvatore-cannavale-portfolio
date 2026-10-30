(() => {
  'use strict';
  const FG = window.FG;
  if (!FG) return;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = FG.escape;
  const storageKey = 'fuorigioco.matchday.v2';
  const colors = { lime: { name: 'Verde', hex: '#c5f35b', ink: '#172019' }, coral: { name: 'Corallo', hex: '#ff9879', ink: '#172019' }, blue: { name: 'Azzurro', hex: '#8cc6ff', ink: '#172019' }, white: { name: 'Bianco', hex: '#f3f3e9', ink: '#172019' } };
  const roleNames = { GK: 'Portiere', DEF: 'Difensore', MID: 'Centrale', ATT: 'Attaccante' };
  const statusNames = { yes: 'Confermato', maybe: 'Da confermare', no: 'Assente' };
  const formations = { '3': ['1-1', '0-2', '2-0'], '5': ['1-2-1', '2-1-1', '2-2'], '7': ['2-3-1', '3-2-1', '2-2-2', '3-3'] };
  const checks = ['Scarpe adatte al campo', 'Pallone gara pronto', 'Casacche e colori concordati', 'Acqua per tutti', 'Portieri confermati', 'Gruppo avvisato sul ritrovo'];
  const uid = () => typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `p-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const text = (value, max = 80) => typeof value === 'string' ? value.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '').slice(0, max) : '';
  const newPlayer = index => ({ id: uid(), name: '', number: index + 1, role: index === 0 ? 'GK' : 'MID', level: 3, status: 'yes', paid: false });
  const createTeam = (name, color) => ({ name, color, formation: formations[FG.get().field][0], captain: null, players: Array.from({ length: Number(FG.get().field) + 2 }, (_, i) => newPlayer(i)) });
  const hub = { title: 'La partita del venerdì', teams: [createTeam('I Locali', 'lime'), createTeam('Gli Ospiti', 'coral')], meetingPoint: 'Ingresso del club', lead: 15, notes: '', rules: { subs: true, slides: false, penalties: false }, checklist: Array(6).fill(false), score: [0, 0], events: [], mvp: '', elapsed: 0 };
  let match = FG.get(); let saveEnabled = false; let saveTimer; let swapping = false; let swapStart = null; let clockRunning = false; let clockStartedAt = 0; let activeTab = 'squads'; let previousDuration = match.duration;
  function elapsed() { return Math.min(match.duration * 60000, hub.elapsed + (clockRunning ? Date.now() - clockStartedAt : 0)); }
  function namedPlayers() { return hub.teams.flatMap((team, teamIndex) => team.players.map((player, index) => ({ player, team, teamIndex, index })).filter(({ player }) => player.name.trim())); }
  function confirmed() { return namedPlayers().filter(({ player }) => player.status === 'yes'); }
  function allocation() { const c = FG.totals(); return confirmed().map((entry, index) => ({ ...entry, amount: c.allocation(index) })); }
  function getPlayer(id) { for (let teamIndex = 0; teamIndex < hub.teams.length; teamIndex++) { const index = hub.teams[teamIndex].players.findIndex(player => player.id === id); if (index !== -1) return { teamIndex, index, player: hub.teams[teamIndex].players[index] }; } return null; }
  function ensureTeams() {
    const n = Number(match.field);
    hub.teams.forEach(team => {
      while (team.players.length < n + 2) team.players.push(newPlayer(team.players.length));
      if (!formations[match.field].includes(team.formation)) team.formation = formations[match.field][0];
      if (!team.players.some(player => player.id === team.captain && player.name.trim())) team.captain = null;
    });
  }
  function saveSnapshot() { return { schema: 2, savedAt: new Date().toISOString(), match: FG.get(), hub: { ...hub, elapsed: elapsed() } }; }
  function persist() {
    if (!saveEnabled) return;
    try { localStorage.setItem(storageKey, JSON.stringify(saveSnapshot())); $('#draft-status').textContent = 'Bozza salvata solo su questo dispositivo'; }
    catch { saveEnabled = false; $('#save-draft').checked = false; $('#draft-status').textContent = 'Salvataggio non disponibile. La bozza resta in memoria.'; }
  }
  function scheduleSave() { clearTimeout(saveTimer); if (saveEnabled) saveTimer = setTimeout(persist, 350); }
  function restoreDraft(saved) {
    if (!saved || saved.schema !== 2 || !saved.hub || !Array.isArray(saved.hub.teams) || saved.hub.teams.length !== 2) return false;
    const source = saved.hub; const ids = new Set();
    const teams = source.teams.map((team, teamIndex) => {
      const players = Array.isArray(team.players) ? team.players.slice(0, 12).map((p, i) => {
        if (!p || typeof p !== 'object') return newPlayer(i);
        let id = typeof p.id === 'string' && /^[a-zA-Z0-9-]{1,60}$/.test(p.id) && !ids.has(p.id) ? p.id : uid(); ids.add(id);
        return { id, name: text(p.name, 40), number: FG.integer(p.number, 1, 99, i + 1), role: Object.hasOwn(roleNames, p.role) ? p.role : 'MID', level: FG.integer(p.level, 1, 5, 3), status: Object.hasOwn(statusNames, p.status) ? p.status : 'maybe', paid: p.paid === true };
      }) : [];
      return { name: text(team.name, 35) || (teamIndex ? 'Gli Ospiti' : 'I Locali'), color: Object.hasOwn(colors, team.color) ? team.color : teamIndex ? 'coral' : 'lime', formation: text(team.formation, 10), captain: players.some(p => p.id === team.captain) ? team.captain : null, players };
    });
    hub.title = text(source.title, 70) || 'La nostra partita'; hub.teams = teams;
    hub.meetingPoint = text(source.meetingPoint, 120); hub.lead = [15, 20, 30, 45].includes(source.lead) ? source.lead : 15; hub.notes = text(source.notes, 1500);
    ['subs', 'slides', 'penalties'].forEach(key => { hub.rules[key] = source.rules?.[key] === true; });
    hub.checklist = checks.map((_, index) => source.checklist?.[index] === true);
    hub.score = [0, 1].map(index => FG.integer(source.score?.[index], 0, 99));
    hub.events = Array.isArray(source.events) ? source.events.slice(0, 100).filter(event => event && ['goal', 'yellow', 'red', 'note'].includes(event.type)).map(event => ({ id: uid(), type: event.type, team: FG.integer(event.team, 0, 1), player: text(event.player, 40), note: text(event.note, 120), minute: FG.integer(event.minute, 0, 120) })) : [];
    hub.mvp = typeof source.mvp === 'string' && ids.has(source.mvp) ? source.mvp : '';
    FG.restore(saved.match); match = FG.get(); hub.elapsed = FG.integer(source.elapsed, 0, match.duration * 60000); previousDuration = match.duration;
    ensureTeams(); return true;
  }
  let restored = false;
  try { const raw = localStorage.getItem(storageKey); if (raw && raw.length <= 200000) { restored = restoreDraft(JSON.parse(raw)); saveEnabled = restored; } }
  catch { /* Private browsing and malformed drafts fall back to memory only. */ }
  $('#save-draft').checked = saveEnabled;
  if (restored) $('#draft-status').textContent = 'Bozza ripristinata · cronometro in pausa';
  function changed({ teams = false } = {}) { if (teams) renderTeams(); renderDerived(); scheduleSave(); }
  function pitchPositions(formation) {
    const rows = formation.split('-').map(Number).filter(number => number > 0); const positions = [{ x: 50, y: 86 }];
    rows.forEach((count, row) => { const y = rows.length === 1 ? 35 : 65 - row * (47 / (rows.length - 1)); for (let i = 0; i < count; i++) positions.push({ x: (i + 1) / (count + 1) * 100, y }); });
    return positions;
  }
  function shirtMarkup(fill) { return `<svg viewBox="0 0 48 44" aria-hidden="true"><path d="M14 3l10 4 10-4 12 10-7 9-5-4v24H14V18l-5 4-7-9z" fill="${fill}" stroke="#172019" stroke-width="1.3"/><path d="M18 5q6 8 12 0" fill="none" stroke="#172019" stroke-width="1.3"/></svg>`; }
  function pitchMarkup(teamIndex) {
    const team = hub.teams[teamIndex]; const n = Number(match.field); const positions = pitchPositions(team.formation);
    return `<span class="field-center-circle"></span><span class="field-box top-box"></span><span class="field-box bottom-box"></span>${team.players.slice(0, n).map((player, index) => {
      const position = positions[index]; const fill = index === 0 ? '#f1c46b' : colors[team.color].hex;
      return `<button type="button" class="jersey-button ${!player.name.trim() ? 'is-empty' : ''} ${player.status === 'maybe' ? 'maybe' : player.status === 'no' ? 'absent' : ''} ${player.id === team.captain ? 'is-captain' : ''} ${swapStart === player.id ? 'selected-for-swap' : ''}" style="left:${position.x}%;top:${position.y}%" data-edit-player="${player.id}" aria-label="${esc(player.name.trim() || `Aggiungi giocatore ${index + 1}`)}, ${index === 0 ? 'portiere' : roleNames[player.role]}, ${esc(team.name)}${player.id === team.captain ? ', capitano' : ''}"><span class="jersey">${shirtMarkup(fill)}<strong>${player.name.trim() ? player.number : '+'}</strong></span><span class="jersey-caption">${esc(player.name.trim() || 'Aggiungi')}</span><span class="jersey-role">${index === 0 ? 'PORTIERE' : player.id === team.captain ? 'CAPITANO' : roleNames[player.role].toUpperCase()}</span></button>`;
    }).join('')}`;
  }
  function rosterMarkup(teamIndex) {
    const team = hub.teams[teamIndex]; const n = Number(match.field);
    return `<div class="roster-heading"><strong>Convocati</strong><span>Nome · presenza · dettagli</span></div>${team.players.map((player, index) => `${index === n ? '<p class="reserve-divider">PANCHINA / RISERVE</p>' : ''}<div class="roster-row"><button class="roster-number" data-edit-player="${player.id}" aria-label="Modifica dettagli giocatore ${index + 1} di ${esc(team.name)}">${player.number}</button><input data-player-name="${player.id}" value="${esc(player.name)}" maxlength="40" placeholder="${index === 0 ? 'Nome portiere' : index < n ? 'Nome giocatore' : 'Nome riserva'}" aria-label="Nome ${index === 0 ? 'portiere' : index < n ? 'giocatore' : 'riserva'} ${index + 1}, ${esc(team.name)}" autocomplete="off"><select data-player-status="${player.id}" aria-label="Presenza giocatore ${index + 1}, ${esc(team.name)}">${Object.entries(statusNames).map(([key, value]) => `<option value="${key}" ${player.status === key ? 'selected' : ''}>${value}</option>`).join('')}</select><button class="player-more" data-edit-player="${player.id}" aria-label="Ruolo, livello e capitano: giocatore ${index + 1} di ${esc(team.name)}">⋮</button></div>`).join('')}<button class="add-reserve" data-add-reserve="${teamIndex}" ${team.players.length >= 12 ? 'disabled' : ''}>+ Aggiungi riserva${team.players.length >= 12 ? ' · limite raggiunto' : ''}</button>`;
  }
  function renderTeams() {
    $('#teams-grid').innerHTML = hub.teams.map((team, teamIndex) => `<article class="team-card"><div class="team-settings"><div class="team-name-box"><label for="team-name-${teamIndex}">SQUADRA ${teamIndex ? 'OSPITE' : 'DI CASA'}</label><input id="team-name-${teamIndex}" data-team-name="${teamIndex}" value="${esc(team.name)}" maxlength="35" aria-label="Nome squadra ${teamIndex ? 'ospite' : 'di casa'}"></div><label>MAGLIA<select data-team-color="${teamIndex}" aria-label="Colore squadra ${teamIndex ? 'ospite' : 'di casa'}">${Object.entries(colors).map(([key, value]) => `<option value="${key}" ${team.color === key ? 'selected' : ''}>${value.name}</option>`).join('')}</select></label><label>MODULO<select class="formation-select" data-formation="${teamIndex}" aria-label="Modulo squadra ${teamIndex ? 'ospite' : 'di casa'}">${formations[match.field].map(value => `<option ${team.formation === value ? 'selected' : ''}>${value}</option>`).join('')}</select></label></div><div class="team-tactic"><span data-team-count="${teamIndex}"></span><span>1 portiere + ${Number(match.field) - 1} di movimento</span></div><div class="tactic-field" data-pitch="${teamIndex}" data-format="${match.field}" aria-label="Formazione di ${esc(team.name)}">${pitchMarkup(teamIndex)}</div><div class="team-roster">${rosterMarkup(teamIndex)}</div></article>`).join('');
    updateCounts();
  }
  function renderPitch(teamIndex) { $(`[data-pitch="${teamIndex}"]`).innerHTML = pitchMarkup(teamIndex); }
  function updateCounts() {
    hub.teams.forEach((team, index) => {
      const count = team.players.filter(p => p.name.trim() && p.status === 'yes').length;
      const element = $(`[data-team-count="${index}"]`); if (element) element.textContent = `${count} confermati · ${team.players.filter(p => p.name.trim() && p.status === 'maybe').length} in forse`;
    });
  }
  function renderProgress() {
    const required = Number(match.field) * 2; const starters = hub.teams.flatMap(team => team.players.slice(0, Number(match.field))).filter(p => p.name.trim() && p.status === 'yes').length;
    $('#hub-progress').innerHTML = [{ done: true, label: `Calcio a ${match.field} · ${match.duration} min` }, { done: match.time !== null, label: match.time !== null ? FG.timeRange() : 'Orario da scegliere' }, { done: starters === required, label: `${starters}/${required} titolari confermati` }, { done: match.extras.water > 0, label: match.extras.water ? `${match.extras.water} casse d’acqua` : 'Acqua da organizzare' }].map(item => `<div class="${item.done ? 'progress-done' : ''}"><span class="progress-indicator" aria-hidden="true">${item.done ? '✓' : '·'}</span><span>${item.label}</span></div>`).join('');
    $('#hub-match-details').textContent = `${FG.formatDate(match.date, { weekday: 'long', day: 'numeric', month: 'long' })} · ${match.time !== null ? FG.timeRange() : 'Orario da scegliere'} · ${match.kind}`;
  }
  function renderFees() {
    const costs = FG.totals(); const participants = allocation(); const paid = participants.filter(entry => entry.player.paid && entry.amount > 0).reduce((sum, entry) => sum + entry.amount, 0);
    $('#fees-stats').innerHTML = [{ label: 'Totale di esempio', value: FG.money(costs.total) }, { label: `Quota massima · ${match.splitPeople} persone`, value: FG.money(costs.perPerson) }, { label: 'Quote annotate nella demo', value: FG.money(paid) }, { label: 'Ancora da annotare', value: FG.money(costs.total - paid) }].map(item => `<div class="fee-stat"><span>${esc(item.label)}</span><strong>${item.value}</strong></div>`).join('');
    $('#hub-split').value = match.splitPeople;
    $('#fees-help').textContent = participants.length ? `${participants.length} convocati confermati (riserve incluse). La divisione è impostata su ${match.splitPeople} quote.${participants.length !== match.splitPeople ? ' Usa il pulsante per far coincidere quote e confermati.' : ' Gli eventuali centesimi vengono distribuiti per chiudere il totale esatto.'}` : 'Inserisci i nomi nella scheda Squadre e conferma le presenze per tenere il conto delle quote.';
    $('#fees-list').innerHTML = participants.length ? participants.map(entry => `<div class="fee-row ${entry.player.paid && entry.amount ? 'paid' : ''}"><div class="fee-person" style="--shirt:${colors[entry.team.color].hex}"><span aria-hidden="true"></span><div>${esc(entry.player.name)}<small>${esc(entry.team.name)}${entry.index >= Number(match.field) ? ' · riserva' : ''}</small></div></div><strong>${entry.amount ? FG.money(entry.amount) : 'Fuori divisione'}</strong><label><input type="checkbox" data-paid="${entry.player.id}" ${entry.player.paid && entry.amount ? 'checked' : ''} ${!entry.amount ? 'disabled' : ''} aria-label="Segna quota di ${esc(entry.player.name)} nella demo"> Annotata</label></div>`).join('') : '<div class="empty-hub">Prima la squadra, poi la cassa.<br>Aggiungi i convocati nella prima scheda.</div>';
    $('#hub-costs').innerHTML = costs.lines.map(line => `<div><span>${esc(line.label)}</span><strong>${FG.money(line.cents)}</strong></div>`).join('') + `<div><span>Totale</span><strong>${FG.money(costs.total)}</strong></div>`;
  }
  function renderLocker() {
    $('#checklist-count').textContent = `${hub.checklist.filter(Boolean).length}/${checks.length}`;
    $('#match-checklist').innerHTML = checks.map((check, index) => `<label class="checklist-item ${hub.checklist[index] ? 'checked' : ''}"><input type="checkbox" data-checklist="${index}" ${hub.checklist[index] ? 'checked' : ''}><span>${check}</span></label>`).join('');
    const extras = match.extras;
    $('#included-extras').innerHTML = `<strong>Il borsone del match</strong>◉ Pallone gara e luci inclusi nel concept<br>⚑ ${extras.referee ? 'Arbitro selezionato · demo' : 'Arbitro non selezionato'}<br>▥ ${extras.water ? `${extras.water} casse · ${extras.water * 12} bottiglie d’acqua` : 'Acqua non aggiunta agli extra'}<br>♜ ${extras.bibs ? 'Set casacche aggiunto' : 'Casacche da organizzare'}${extras.food ? `<br>✳ ${extras.food} menu terzo tempo` : ''}`;
    $('#match-timeline').innerHTML = match.time === null ? '<p>Scegli un orario per vedere il programma della partita.</p>' : `<div><strong>${FG.clockTime(match.time - hub.lead)}</strong><span>Ritrovo · ${esc(hub.meetingPoint || 'punto da definire')}</span></div><div><strong>${FG.clockTime(match.time - 10)}</strong><span>Riscaldamento</span></div><div><strong>${FG.clockTime(match.time)}</strong><span>Fischio d’inizio</span></div><div><strong>${FG.clockTime(match.time + match.duration)}</strong><span>Fine partita${extras.food ? ' e terzo tempo' : ''}</span></div>`;
  }
  function renderLiveNames() {
    $('#score-home-name').textContent = hub.teams[0].name; $('#score-away-name').textContent = hub.teams[1].name;
    $('#score-home').textContent = hub.score[0]; $('#score-away').textContent = hub.score[1];
    [...$('#event-team').options].forEach((option, index) => { option.textContent = hub.teams[index].name; });
    const teamIndex = Number($('#event-team').value); const previous = $('#event-player').value;
    $('#event-player').innerHTML = '<option value="">Da indicare</option>' + hub.teams[teamIndex].players.filter(player => player.name.trim() && player.status !== 'no').map(player => `<option value="${player.id}">${esc(player.name)}</option>`).join('');
    if ([...$('#event-player').options].some(option => option.value === previous)) $('#event-player').value = previous;
    const mvpPlayers = namedPlayers().filter(entry => entry.player.status !== 'no');
    if (!mvpPlayers.some(entry => entry.player.id === hub.mvp)) hub.mvp = '';
    $('#match-mvp').innerHTML = '<option value="">Scegli il tuo MVP</option>' + mvpPlayers.map(entry => `<option value="${entry.player.id}" ${entry.player.id === hub.mvp ? 'selected' : ''}>${esc(entry.player.name)} · ${esc(entry.team.name)}</option>`).join('');
  }
  const eventNames = { goal: 'Gol', yellow: 'Ammonizione', red: 'Espulsione', note: 'Nota' };
  function renderEvents() {
    $('#match-events').innerHTML = hub.events.length ? [...hub.events].reverse().map(event => `<div class="match-event"><time>${event.minute}’</time><span class="event-icon ${event.type}" aria-hidden="true">${event.type === 'goal' ? '⚽' : event.type === 'note' ? '✎' : '▣'}</span><div class="event-copy"><strong>${eventNames[event.type]}${event.player ? ` · ${esc(event.player)}` : ''}</strong><small>${esc(hub.teams[event.team].name)}${event.note ? ` · ${esc(event.note)}` : ''}</small></div><button data-remove-event="${event.id}" aria-label="Rimuovi ${eventNames[event.type]} ${esc(event.player)}">×</button></div>`).join('') : '<div class="empty-hub">Il tabellino è ancora tutto da scrivere.<br>Avvia il cronometro o aggiungi il primo evento.</div>';
  }
  function renderClock() {
    let ms = elapsed();
    if (clockRunning && ms >= match.duration * 60000) { hub.elapsed = match.duration * 60000; clockRunning = false; persist(); }
    const remaining = Math.max(0, Math.ceil((match.duration * 60000 - ms) / 1000));
    $('#match-clock').textContent = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`;
    $('#clock-state').textContent = remaining === 0 ? 'TEMPO SCADUTO' : clockRunning ? 'SI GIOCA · CRONOMETRO LOCALE' : ms > 0 ? 'PARTITA IN PAUSA' : 'IN ATTESA DEL FISCHIO';
    $('#clock-toggle').textContent = clockRunning ? 'Metti in pausa' : ms > 0 && remaining > 0 ? 'Riprendi' : remaining === 0 ? 'Ricomincia' : 'Avvia cronometro';
    $('.clock-box').classList.toggle('running', clockRunning);
  }
  function renderDerived() { updateCounts(); renderProgress(); renderFees(); renderLocker(); renderLiveNames(); renderClock(); }
  function resetCaptainReferences() { hub.teams.forEach(team => { if (!team.players.some(p => p.id === team.captain)) team.captain = null; }); }
  function uniqueNumbers(team) {
    const used = new Set();
    [...team.players.filter(p => p.name.trim()), ...team.players.filter(p => !p.name.trim())].forEach(player => {
      if (used.has(player.number)) { let number = 1; while (used.has(number)) number++; player.number = number; }
      used.add(player.number);
    });
  }
  function useSlot(id) {
    if (!swapping) { openPlayer(id); return; }
    if (!swapStart) { swapStart = id; renderTeams(); $('#squad-status').textContent = 'Ora scegli una seconda maglia per scambiare i giocatori, anche tra squadre diverse.'; return; }
    const first = getPlayer(swapStart); const second = getPlayer(id);
    if (first && second && id !== swapStart) { hub.teams[first.teamIndex].players[first.index] = second.player; hub.teams[second.teamIndex].players[second.index] = first.player; resetCaptainReferences(); hub.teams.forEach(uniqueNumbers); }
    swapStart = null; swapping = false; $('#swap-mode').setAttribute('aria-pressed', 'false'); changed({ teams: true }); $('#squad-status').textContent = 'Scambio completato. Modifica i ruoli se necessario.';
  }
  $('#teams-grid').addEventListener('click', event => {
    const edit = event.target.closest('[data-edit-player]'); if (edit) { useSlot(edit.dataset.editPlayer); return; }
    const reserve = event.target.closest('[data-add-reserve]'); if (reserve) { const team = hub.teams[Number(reserve.dataset.addReserve)]; if (team.players.length < 12) { team.players.push(newPlayer(team.players.length)); changed({ teams: true }); const input = $(`[data-player-name="${team.players.at(-1).id}"]`); input.focus(); } }
  });
  $('#teams-grid').addEventListener('input', event => {
    const input = event.target;
    if (input.matches('[data-player-name]')) { const entry = getPlayer(input.dataset.playerName); if (entry) { entry.player.name = text(input.value, 40); uniqueNumbers(hub.teams[entry.teamIndex]); hub.teams[entry.teamIndex].players.forEach(p => { const button = $(`.roster-number[data-edit-player="${p.id}"]`); if (button) button.textContent = p.number; }); renderPitch(entry.teamIndex); changed(); } }
    if (input.matches('[data-team-name]')) { hub.teams[Number(input.dataset.teamName)].name = input.value || `Squadra ${Number(input.dataset.teamName) + 1}`; renderDerived(); renderEvents(); scheduleSave(); }
  });
  $('#teams-grid').addEventListener('change', event => {
    const input = event.target;
    if (input.matches('[data-player-status]')) { const entry = getPlayer(input.dataset.playerStatus); if (entry) { entry.player.status = input.value; renderPitch(entry.teamIndex); changed(); } }
    if (input.matches('[data-team-color]')) { const index = Number(input.dataset.teamColor); hub.teams[index].color = input.value; renderPitch(index); changed(); if (hub.teams[0].color === hub.teams[1].color) $('#squad-status').textContent = 'Le squadre hanno lo stesso colore: scegli due maglie diverse per distinguerle meglio.'; }
    if (input.matches('[data-formation]')) { const index = Number(input.dataset.formation); hub.teams[index].formation = input.value; renderPitch(index); changed(); }
  });
  $('#swap-mode').addEventListener('click', () => { swapping = !swapping; swapStart = null; $('#swap-mode').setAttribute('aria-pressed', String(swapping)); renderTeams(); $('#squad-status').textContent = swapping ? 'Seleziona due maglie, una dopo l’altra, per scambiare le posizioni. Funziona anche da tastiera.' : 'Modalità scambio disattivata.'; });
  $('#balance-teams').addEventListener('click', () => {
    const n = Number(match.field); const starters = hub.teams.flatMap(team => team.players.slice(0, n)); const reserves = hub.teams.flatMap(team => team.players.slice(n));
    const pool = [...starters, ...reserves].filter(player => player.name.trim() && player.status === 'yes');
    if (pool.length < n * 2) { $('#squad-status').textContent = `Servono almeno ${n * 2} giocatori con nome e presenza confermata. Ne mancano ${n * 2 - pool.length}.`; return; }
    const keepers = pool.filter(player => player.role === 'GK').slice(0, 2); const selected = [...keepers, ...pool.filter(p => !keepers.some(k => k.id === p.id)).slice(0, n * 2 - keepers.length)];
    const groups = [[], []]; const strength = [0, 0];
    keepers.forEach((player, index) => { groups[index].push(player); strength[index] += player.level; });
    selected.filter(player => !keepers.some(k => k.id === player.id)).sort((a, b) => b.level - a.level).forEach(player => { let index = groups[0].length >= n ? 1 : groups[1].length >= n ? 0 : strength[0] <= strength[1] ? 0 : 1; groups[index].push(player); strength[index] += player.level; });
    const order = { GK: 0, DEF: 1, MID: 2, ATT: 3 }; groups.forEach(group => group.sort((a, b) => order[a.role] - order[b.role]));
    const selectedIds = new Set(selected.map(player => player.id));
    const leftovers = hub.teams.flatMap(team => team.players).filter(player => player.name.trim() && !selectedIds.has(player.id));
    leftovers.forEach(player => { const index = groups[0].length <= groups[1].length ? 0 : 1; groups[index].push(player); });
    groups.forEach((players, index) => { hub.teams[index].players = players; }); ensureTeams(); resetCaptainReferences(); hub.teams.forEach(uniqueNumbers); swapping = false; swapStart = null; $('#swap-mode').setAttribute('aria-pressed', 'false'); changed({ teams: true });
    $('#squad-status').textContent = `Squadre distribuite per livello: ${strength[0]} vs ${strength[1]} punti. ${keepers.length < 2 ? 'Mancano due portieri di ruolo: assegna chi va in porta.' : 'Un portiere di ruolo per squadra.'} Numeri duplicati riassegnati. Puoi rifinire con “Scambia posizioni”.`;
  });
  $('#load-demo').addEventListener('click', () => {
    if (namedPlayers().length) { $('#squad-status').textContent = 'Hai già inserito dei nomi: la demo non li sostituisce. Puoi modificare ciascun giocatore toccando la maglia.'; return; }
    const names = [['Nico', 'Leo', 'Teo', 'Ale', 'Dani', 'Milo', 'Riki', 'Ludo', 'Eli'], ['Tommi', 'Simo', 'Vale', 'Fede', 'Gio', 'Max', 'Luca', 'Emi', 'Robi']];
    hub.teams.forEach((team, ti) => { team.players.forEach((player, index) => { if (index < Number(match.field) + 2) { player.name = names[ti][index] || `Amico ${index + 1}`; player.role = index === 0 ? 'GK' : index % 3 === 0 ? 'ATT' : index % 2 ? 'DEF' : 'MID'; player.level = 1 + (index * 2 + ti) % 5; player.status = index < Number(match.field) ? 'yes' : 'maybe'; } }); team.captain = team.players[1].id; });
    changed({ teams: true }); $('#squad-status').textContent = 'Nomi di fantasia caricati. Prova moduli, dettagli giocatore e squadre equilibrate.';
  });
  const playerDialog = document.createElement('dialog'); playerDialog.className = 'modal player-dialog'; playerDialog.setAttribute('aria-labelledby', 'player-dialog-title'); document.body.append(playerDialog);
  function openPlayer(id) {
    const entry = getPlayer(id); if (!entry) return; const p = entry.player; const team = hub.teams[entry.teamIndex];
    playerDialog.innerHTML = `<button class="close-dialog" aria-label="Chiudi dettagli giocatore">×</button><p class="eyebrow">${esc(team.name)} / GIOCATORE ${entry.index + 1}</p><h2 id="player-dialog-title">LA TUA MAGLIA.</h2><form id="player-form"><div class="player-fields"><label class="player-wide">Nome o soprannome<input name="playerName" value="${esc(p.name)}" placeholder="Es. Nico" maxlength="40" required autocomplete="off"></label><label>Numero di maglia<input name="number" type="number" value="${p.number}" min="1" max="99" required></label><label>Ruolo preferito<select name="role">${Object.entries(roleNames).map(([key, value]) => `<option value="${key}" ${p.role === key ? 'selected' : ''}>${value}</option>`).join('')}</select></label><label>Livello indicativo<select name="level">${['1 · Primi passi', '2 · Amatoriale', '3 · Intermedio', '4 · Esperto', '5 · Fuoriclasse'].map((label, i) => `<option value="${i + 1}" ${p.level === i + 1 ? 'selected' : ''}>${label}</option>`).join('')}</select></label><label>Presenza<select name="status">${Object.entries(statusNames).map(([key, value]) => `<option value="${key}" ${p.status === key ? 'selected' : ''}>${value}</option>`).join('')}</select></label><label class="player-captain player-wide"><input type="checkbox" name="captain" ${team.captain === p.id ? 'checked' : ''}> È il capitano della squadra</label></div><p>Il portiere schierato è la prima maglia sul campo. Per cambiare chi va in porta usa “Scambia posizioni”.</p><button class="button" type="submit">Salva giocatore <span>↗</span></button><button class="player-remove" type="button">Svuota questo posto</button></form>`;
    $('.close-dialog', playerDialog).addEventListener('click', () => playerDialog.close());
    $('#player-form').addEventListener('submit', event => {
      event.preventDefault(); const form = event.currentTarget; const name = $('[name=playerName]', form); const number = $('[name=number]', form);
      name.setCustomValidity(name.value.trim() ? '' : 'Inserisci un nome o soprannome.');
      number.setCustomValidity(team.players.some(other => other.id !== p.id && other.name.trim() && other.number === Number(number.value)) ? 'Questo numero è già usato nella squadra.' : '');
      if (!form.reportValidity()) return;
      p.name = name.value.trim(); p.number = FG.integer(number.value, 1, 99); p.role = $('[name=role]', form).value; p.level = Number($('[name=level]', form).value); p.status = $('[name=status]', form).value;
      if ($('[name=captain]', form).checked) team.captain = p.id; else if (team.captain === p.id) team.captain = null;
      playerDialog.close(); changed({ teams: true }); $(`[data-edit-player="${p.id}"]`).focus({ preventScroll: true });
    });
    $$('input', playerDialog).forEach(input => input.addEventListener('input', () => input.setCustomValidity('')));
    $('.player-remove', playerDialog).addEventListener('click', () => { p.name = ''; p.status = 'yes'; p.paid = false; if (team.captain === p.id) team.captain = null; playerDialog.close(); changed({ teams: true }); $(`[data-edit-player="${p.id}"]`).focus({ preventScroll: true }); });
    playerDialog.showModal();
  }
  playerDialog.addEventListener('click', event => { const r = playerDialog.getBoundingClientRect(); if (event.target === playerDialog && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)) playerDialog.close(); });
  $$('.hub-tabs [role=tab]').forEach((button, index, buttons) => {
    function activate() { activeTab = button.id.replace('tab-', ''); buttons.forEach(item => { const selected = item === button; item.setAttribute('aria-selected', String(selected)); item.tabIndex = selected ? 0 : -1; $('#' + item.getAttribute('aria-controls')).hidden = !selected; }); }
    button.addEventListener('click', activate);
    button.addEventListener('keydown', event => { let next; if (event.key === 'ArrowRight') next = (index + 1) % buttons.length; if (event.key === 'ArrowLeft') next = (index - 1 + buttons.length) % buttons.length; if (event.key === 'Home') next = 0; if (event.key === 'End') next = buttons.length - 1; if (next !== undefined) { event.preventDefault(); buttons[next].click(); buttons[next].focus(); } });
  });
  $('#match-title').value = hub.title;
  $('#match-title').addEventListener('input', event => { hub.title = event.target.value; scheduleSave(); });
  $('#hub-split').addEventListener('change', event => FG.setSplit(event.target.value));
  $('#split-confirmed').addEventListener('click', () => { const count = confirmed().length; if (!count) { $('#fees-help').textContent = 'Aggiungi prima almeno un convocato confermato nella scheda Squadre.'; return; } FG.setSplit(count); });
  $('#fees-list').addEventListener('change', event => { const id = event.target.dataset.paid; const entry = getPlayer(id); if (entry) { entry.player.paid = event.target.checked; renderFees(); $(`[data-paid="${id}"]`)?.focus({ preventScroll: true }); scheduleSave(); } });
  $('#match-checklist').addEventListener('change', event => { if (event.target.dataset.checklist !== undefined) { const index = Number(event.target.dataset.checklist); hub.checklist[index] = event.target.checked; renderLocker(); $(`[data-checklist="${index}"]`).focus({ preventScroll: true }); scheduleSave(); } });
  $('#meeting-point').value = hub.meetingPoint; $('#meeting-lead').value = hub.lead; $('#match-notes').value = hub.notes;
  $('#meeting-point').addEventListener('input', event => { hub.meetingPoint = event.target.value; renderLocker(); scheduleSave(); });
  $('#meeting-lead').addEventListener('change', event => { hub.lead = Number(event.target.value); renderLocker(); scheduleSave(); });
  $('#match-notes').addEventListener('input', event => { hub.notes = event.target.value; scheduleSave(); });
  ['subs', 'slides', 'penalties'].forEach(key => { $(`#rule-${key}`).checked = hub.rules[key]; $(`#rule-${key}`).addEventListener('change', event => { hub.rules[key] = event.target.checked; scheduleSave(); }); });
  $('#clock-toggle').addEventListener('click', () => { if (clockRunning) { hub.elapsed = elapsed(); clockRunning = false; } else { if (elapsed() >= match.duration * 60000) hub.elapsed = 0; clockStartedAt = Date.now(); clockRunning = true; } renderClock(); scheduleSave(); });
  $('#clock-reset').addEventListener('click', () => { hub.elapsed = 0; clockRunning = false; renderClock(); scheduleSave(); });
  setInterval(() => { if (clockRunning) renderClock(); }, 250);
  $$('[data-score-team]').forEach(button => button.addEventListener('click', () => { const team = Number(button.dataset.scoreTeam); hub.score[team] = FG.integer(hub.score[team] + Number(button.dataset.scoreDelta), 0, 99); renderLiveNames(); scheduleSave(); }));
  $('#event-team').addEventListener('change', renderLiveNames);
  $('#event-form').addEventListener('submit', event => {
    event.preventDefault(); if (hub.events.length >= 100) { $('#export-status').textContent = 'Limite di 100 eventi raggiunto. Scarica il report prima di azzerare la cronaca.'; return; }
    const type = $('#event-type').value; const team = Number($('#event-team').value); const p = getPlayer($('#event-player').value);
    hub.events.push({ id: uid(), type, team, player: p?.player.name || '', note: $('#event-note').value.trim(), minute: Math.floor(elapsed() / 60000) });
    if (type === 'goal') hub.score[team] = Math.min(99, hub.score[team] + 1);
    $('#event-note').value = ''; renderLiveNames(); renderEvents(); scheduleSave();
  });
  $('#match-events').addEventListener('click', event => { const button = event.target.closest('[data-remove-event]'); if (!button) return; const index = hub.events.findIndex(item => item.id === button.dataset.removeEvent); if (index < 0) return; const record = hub.events[index]; if (record.type === 'goal') hub.score[record.team] = Math.max(0, hub.score[record.team] - 1); hub.events.splice(index, 1); renderLiveNames(); renderEvents(); scheduleSave(); });
  $('#clear-events').addEventListener('click', () => { hub.events = []; hub.score = [0, 0]; hub.mvp = ''; renderLiveNames(); renderEvents(); scheduleSave(); });
  $('#match-mvp').addEventListener('change', event => { hub.mvp = event.target.value; scheduleSave(); });
  $('#save-draft').addEventListener('change', event => {
    saveEnabled = event.target.checked;
    if (saveEnabled) persist(); else { clearTimeout(saveTimer); try { localStorage.removeItem(storageKey); $('#draft-status').textContent = 'Salvataggio disattivato · dati solo in memoria'; } catch { $('#draft-status').textContent = 'Salvataggio disattivato. Memoria del browser non accessibile.'; } }
  });
  $('#delete-draft').addEventListener('click', () => { try { localStorage.removeItem(storageKey); saveEnabled = false; clearTimeout(saveTimer); $('#save-draft').checked = false; $('#draft-status').textContent = 'Bozza salvata eliminata. I dati visibili restano in memoria.'; } catch { $('#draft-status').textContent = 'Impossibile accedere alle bozze salvate in questo browser.'; } });
  window.addEventListener('beforeunload', persist);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') persist(); });
  function organizerReport() {
    const participants = allocation(); const paid = participants.filter(e => e.player.paid).reduce((sum, e) => sum + e.amount, 0);
    const mvp = getPlayer(hub.mvp)?.player.name || 'Da scegliere';
    return `\nMATCHDAY: ${hub.title || 'La nostra partita'}\nRITROVO: ${match.time !== null ? FG.clockTime(match.time - hub.lead) : `${hub.lead} minuti prima`} · ${hub.meetingPoint || 'Da definire'}\n\n${hub.teams.map(team => `${team.name.toUpperCase()} — modulo ${team.formation} + portiere, maglia ${colors[team.color].name}\n${team.players.map((p, index) => p.name.trim() ? `${index >= Number(match.field) ? '[RISERVA] ' : ''}#${p.number} ${p.name}${p.id === team.captain ? ' (C)' : ''} · ${roleNames[p.role]} · ${statusNames[p.status]} · livello ${p.level}/5` : index < Number(match.field) ? `[POSTO ${index + 1} DA COMPLETARE]` : '').filter(Boolean).join('\n')}`).join('\n\n')}\n\nQUOTE — SOLO ANNOTAZIONI DEMO\n${participants.map(e => `${e.player.name}: ${e.amount ? FG.money(e.amount) : 'Fuori divisione'} · ${e.player.paid && e.amount ? 'Annotata nella demo' : 'Da annotare'}`).join('\n') || 'Nessun convocato confermato'}\nAnnotato: ${FG.money(paid)} · Da annotare: ${FG.money(FG.totals().total - paid)}\nNessun pagamento effettuato o verificato.\n\nCHECKLIST\n${checks.map((check, i) => `${hub.checklist[i] ? '[x]' : '[ ]'} ${check}`).join('\n')}\n\nREGOLE DEL GRUPPO\nCambi liberi: ${hub.rules.subs ? 'sì' : 'no'}\nScivolate: ${hub.rules.slides ? 'sì' : 'no'}\nRigori sul pareggio: ${hub.rules.penalties ? 'sì' : 'no'}\nAccordi da confermare con la struttura e l’arbitro.\n\nNOTE\n${hub.notes || 'Nessuna nota'}\n\nTABELLINO DEMO\n${hub.teams[0].name} ${hub.score[0]} — ${hub.score[1]} ${hub.teams[1].name}\n${hub.events.map(e => `${e.minute}' ${eventNames[e.type]} · ${hub.teams[e.team].name}${e.player ? ' · ' + e.player : ''}${e.note ? ' · ' + e.note : ''}`).join('\n') || 'Nessun evento registrato'}\nMVP: ${mvp}\n\nBozza locale: nessuna sincronizzazione o comunicazione automatica.\n`;
  }
  FG.setReport(organizerReport);
  $('#export-match').addEventListener('click', () => { FG.download(FG.baseReport() + organizerReport(), `fuorigioco-matchday-${match.date}.txt`); $('#export-status').textContent = 'Report dimostrativo scaricato con campo, extra, convocati, quote, note e tabellino.'; });
  $('#copy-match').addEventListener('click', async () => {
    const report = FG.baseReport() + organizerReport();
    try { if (!navigator.clipboard?.writeText) throw new Error('Clipboard not available'); await navigator.clipboard.writeText(report); $('#export-status').textContent = 'Convocazione copiata. Puoi incollarla nella chat del gruppo: il sito non ha inviato alcun messaggio.'; }
    catch { const container = $('#export-status'); container.textContent = 'Copia automatica non disponibile: seleziona e copia il testo qui sotto, oppure scarica il report.'; const area = document.createElement('textarea'); area.className = 'copy-fallback'; area.value = report; area.setAttribute('aria-label', 'Convocazione da copiare manualmente'); area.readOnly = true; container.append(area); area.focus(); area.select(); }
  });
  $('#export-lineup').addEventListener('click', () => {
    const width = 1100; const height = 940;
    const pitches = hub.teams.map((team, ti) => {
      const x = 45 + ti * 535; const y = 165; const w = 490; const h = 650;
      const positions = pitchPositions(team.formation);
      return `<text x="${x}" y="130" fill="#f3f3e9" font-size="27" font-weight="700">${esc(team.name.slice(0, 30))}</text><text x="${x}" y="151" fill="#acbe9c" font-size="12">MODULO ${team.formation} + PORTIERE</text><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#2c472e" stroke="#a7bd88"/><rect x="${x + 16}" y="${y + 16}" width="${w - 32}" height="${h - 32}" fill="none" stroke="#97ae78"/><path d="M${x + 16} ${y + h / 2}h${w - 32}" stroke="#97ae78"/><circle cx="${x + w / 2}" cy="${y + h / 2}" r="65" fill="none" stroke="#97ae78"/><rect x="${x + 140}" y="${y + 16}" width="210" height="95" fill="none" stroke="#97ae78"/><rect x="${x + 140}" y="${y + h - 111}" width="210" height="95" fill="none" stroke="#97ae78"/>${team.players.slice(0, Number(match.field)).map((p, index) => {
        const px = x + positions[index].x / 100 * w; const py = y + positions[index].y / 100 * h; const fill = index === 0 ? '#f1c46b' : colors[team.color].hex;
        return `<g opacity="${p.status === 'no' ? '.4' : p.status === 'maybe' ? '.65' : '1'}"><path d="M${px - 14} ${py - 24}l14 5 14-5 17 13-9 12-7-6v31h-30v-31l-7 6-9-12z" fill="${fill}" stroke="#172019"/><text x="${px}" y="${py + 9}" font-size="19" text-anchor="middle" fill="#172019" font-weight="700">${p.name.trim() ? p.number : '+'}</text><text x="${px}" y="${py + 48}" font-size="16" text-anchor="middle" fill="#f3f3e9">${esc((p.name.trim() || 'Da convocare').slice(0, match.field === '7' ? 12 : 18))}${p.id === team.captain ? ' (C)' : ''}</text></g>`;
      }).join('')}`;
    }).join('');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="1100" height="940" fill="#172019"/><g font-family="Arial,sans-serif"><text x="45" y="55" fill="#c5f35b" font-size="35" font-weight="700">FUORIGIOCO / MATCHDAY</text><text x="45" y="85" fill="#f3f3e9" font-size="16">${esc((hub.title || 'La nostra partita').slice(0, 65))} · ${esc(FG.formatDate(match.date, { day: 'numeric', month: 'long' }))} · ${esc(FG.timeRange())}</text>${pitches}<text x="45" y="858" fill="#c5f35b" font-size="15">${match.field} VS ${match.field} · ${match.duration} MINUTI · RITROVO ${match.time !== null ? FG.clockTime(match.time - hub.lead) : 'DA DEFINIRE'}</text><text x="45" y="887" fill="#b2c4a4" font-size="12">${esc((hub.meetingPoint || 'Punto di ritrovo da definire').slice(0, 120))}</text><text x="45" y="917" fill="#b2c4a4" font-size="11">GRAFICA DIMOSTRATIVA · NON È UNA PRENOTAZIONE · NESSUN CAMPO O SERVIZIO RISERVATO</text></g></svg>`;
    FG.download(svg, `fuorigioco-formazioni-${match.date}.svg`, 'image/svg+xml;charset=utf-8'); $('#export-status').textContent = 'Formazioni scaricate in SVG: una grafica con nomi, moduli, capitani e orario, pronta da condividere.';
  });
  FG.subscribe(next => {
    const fieldChanged = next.field !== match.field; match = next;
    if (match.duration !== previousDuration) { hub.elapsed = Math.min(elapsed(), match.duration * 60000); clockRunning = false; previousDuration = match.duration; }
    if (fieldChanged) { ensureTeams(); swapping = false; swapStart = null; $('#swap-mode').setAttribute('aria-pressed', 'false'); renderTeams(); $('#squad-status').textContent = 'Formato aggiornato. I nomi esistenti sono conservati; i giocatori oltre i titolari passano in panchina.'; }
    renderDerived(); scheduleSave();
  });
  ensureTeams(); renderTeams(); renderDerived(); renderEvents();
})();

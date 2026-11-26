/* League match engine. Loaded by index.html. No DOM. */
const ATTR = ["str","grp","end","spd","flx","tec","exp"];
const ROSTER = [
  {id:"IPE", age:42, h:170, kg:110, str:90, grp:80, end:50, spd:50, flx:40, tec:70, exp:75},
  {id:"MTA", age:45, h:170, kg:60, str:65, grp:75, end:85, spd:80, flx:95, tec:95, exp:100},
  {id:"NDI", age:39, h:160, kg:80, str:85, grp:80, end:65, spd:55, flx:55, tec:85, exp:100},
  {id:"LDZ", age:34, h:160, kg:50, str:65, grp:75, end:90, spd:90, flx:85, tec:70, exp:75},
  {id:"VGE", age:35, h:170, kg:70, str:75, grp:70, end:70, spd:65, flx:60, tec:65, exp:80},
  {id:"NDA", age:27, h:155, kg:45, str:60, grp:85, end:80, spd:90, flx:90, tec:60, exp:70},
  {id:"AMI", age:42, h:160, kg:50, str:65, grp:90, end:75, spd:85, flx:65, tec:65, exp:70},
  {id:"LBY", age:40, h:160, kg:80, str:70, grp:60, end:35, spd:45, flx:40, tec:50, exp:40},
  {id:"KGR", age:37, h:165, kg:60, str:55, grp:55, end:50, spd:60, flx:55, tec:45, exp:40},
  {id:"RDI", age:39, h:175, kg:85, str:90, grp:90, end:60, spd:60, flx:60, tec:80, exp:90}
];
/* off, def, weight sensitivity, height L, fat ranges, seconds, where, kind */
const TECH = {
  double:  {name:"Double leg", off:[25,15,5,25,5,20,5], def:[25,5,5,25,10,20,10], sens:70, L:-0.5, fatA:[12,20], fatD:[10,18], dur:[12,25], where:"stand", kind:"td"},
  sprawl:  {name:"Sprawl counter", off:[25,10,5,20,10,20,10], def:[25,25,5,10,10,15,10], sens:75, L:0.5, fatA:[8,15], fatD:[12,20], dur:[8,20], where:"counter", kind:"td"},
  crotch:  {name:"Crotch lift", off:[35,15,5,10,5,20,10], def:[25,15,5,10,20,15,10], sens:90, L:0.5, fatA:[18,28], fatD:[12,22], dur:[10,25], where:"both", kind:"exp"},
  foot:    {name:"Foot-trap leg lift", off:[30,20,5,5,5,25,10], def:[25,5,5,10,25,20,10], sens:60, L:0.5, fatA:[15,25], fatD:[12,22], dur:[15,30], where:"top", kind:"exp"},
  gut:     {name:"Gut wrench", off:[30,25,5,5,5,25,5], def:[30,10,5,5,20,20,10], sens:65, L:0, fatA:[12,22], fatD:[10,20], dur:[10,25], where:"top", kind:"two"},
  lace:    {name:"Leg lace", off:[15,25,5,10,10,25,10], def:[15,5,5,15,30,20,10], sens:30, L:0.5, fatA:[10,18], fatD:[10,20], dur:[10,25], where:"top", kind:"two"},
  nelson:  {name:"Half nelson", off:[25,25,5,5,5,25,10], def:[25,15,5,5,25,15,10], sens:50, L:1, fatA:[12,22], fatD:[12,22], dur:[15,30], where:"top", kind:"exp"},
  cradle:  {name:"Cradle", off:[20,25,5,5,15,20,10], def:[20,10,5,10,30,15,10], sens:40, L:1, fatA:[12,22], fatD:[12,22], dur:[15,30], where:"top", kind:"exp"},
  reverse: {name:"Reversal", off:[20,15,5,15,15,20,10], def:[25,25,5,10,5,20,10], sens:45, L:0, fatA:[8,16], fatD:[10,18], dur:[8,20], where:"bottom", kind:"rev"},
  lock:    {name:"Body lock", off:[35,25,5,10,0,15,10], def:[30,15,5,15,10,15,10], sens:80, L:-0.5, fatA:[14,24], fatD:[12,20], dur:[12,25], where:"stand", kind:"lock"},
  escape:  {name:"Stand-up escape", off:[15,10,10,20,20,15,10], def:[25,30,5,5,5,20,10], sens:25, L:0, fatA:[8,16], fatD:[5,12], dur:[8,20], where:"bottom", kind:"esc"}
};
const PIN_OFF = [30,25,5,0,5,25,10];
const PIN_DEF = [20,10,10,10,25,15,10];
const REV_CHANCE = {gut:0.45, lace:0.35, foot:0.30};
const PIN_BASE = {nelson:0.75, cradle:0.80, foot:0.65, crotch:0.55};

const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
function avg(w) { return ATTR.reduce((s, k) => s + w[k], 0) / 7; }
function ageM(w) { return 1 + 0.02 * Math.max(0, w.age - 30); }
function dot(w, weights) { return ATTR.reduce((s, k, i) => s + w[k] * weights[i] / 100, 0); }
function clock(sec) {
  sec = Math.max(0, sec | 0);
  return String(Math.floor(sec / 60)) + ":" + String(sec % 60).padStart(2, "0");
}

let G = null;

function rating(att, def, tech) {
  const A = dot(att.w, tech.off);
  const D = dot(def.w, tech.def);
  const W = 25 * Math.log(att.w.kg / def.w.kg) * tech.sens / 100;
  const H = clamp(0.15 * (att.w.h - def.w.h) * tech.L, -5, 5);
  const qA = 1 - 0.55 * att.f / 100;
  const qD = 1 - 0.55 * def.f / 100;
  const Aeff = A * qA + W + H;
  const Deff = D * qD;
  const delta = Aeff - Deff;
  const p = clamp(1 / (1 + Math.exp(-delta / 15)), 0.05, 0.95);
  return {p, delta, Aeff, Deff};
}

function durationOf(att, tech) {
  const Tbase = (tech.dur[0] + tech.dur[1]) / 2;
  const T = Tbase * (1.2 - att.w.spd / 250) * (1.2 - att.w.tec / 250) * (1 + 0.5 * att.f / 100);
  return Math.max(1, Math.round(T));
}
function fatigueOf(att, def, tech, portion) {
  const sens = tech.sens / 100;
  function gain(self, other, range) {
    const base = rand(range[0], range[1]) * portion;
    const E = 1.5 - self.w.end / 100;
    const wf = clamp(Math.pow(other.w.kg / self.w.kg, 0.35 * sens), 0.7, 1.5);
    self.f = clamp(self.f + base * E * ageM(self.w) * wf, 0, 100);
  }
  gain(att, def, tech.fatA);
  gain(def, att, tech.fatD);
}

function recover(side, seconds) {
  const R = (10 + 0.3 * side.w.end) / ageM(side.w);
  const pts = seconds == null ? R : R * 0.10 * (seconds / 10);
  side.f = clamp(side.f - pts, 0, 100);
}

function sideBy(id) { return id === "A" ? G.A : G.B; }
function other(id) { return id === "A" ? "B" : "A"; }
function topId() { return G.pos === "A" ? "A" : G.pos === "B" ? "B" : null; }

function log(line) {
  G.lines.push(line);
  if (G.lines.length > 60) G.lines.shift();
}

function addScore(id, pts, why) {
  if (pts <= 0 || G.over) return;
  sideBy(id).score += pts;
  if (G.period === 3) {
    G.idle = 0;
    log(sideBy(id).w.id + " +" + pts + " (" + why + ").");
    finish("golden point", id);
    return;
  }
  G.idle = 0;
  log(sideBy(id).w.id + " +" + pts + " (" + why + "). Score " + G.A.score + "–" + G.B.score + ".");
  const margin = Math.abs(G.A.score - G.B.score);
  if (margin >= 10 && !G.supDecided) G.pendingSup = true;
}

function finish(reason, winner) {
  G.over = true;
  G.reason = reason;
  G.winner = winner;
  const loser = winner ? other(winner) : null;
  let wp = 0, lp = 0;
  if (winner) {
    const lscore = sideBy(loser).score;
    if (reason === "pin") { wp = 5; lp = 0; }
    else if (reason === "technical superiority") { wp = 4; lp = lscore > 0 ? 1 : 0; }
    else { wp = 3; lp = lscore > 0 ? 1 : 0; }
  }
  G.table = {wp, lp};
  const name = winner ? sideBy(winner).w.id : "Neither";
  log("Match over. " + name + " by " + reason + (winner ? ". League points " + wp + "–" + lp + "." : "."));
}

function tick(seconds) {
  const use = Math.min(seconds, G.clock);
  G.clock -= use;
  G.idle += use;
  return {use, cut: use < seconds};
}

function enforceIdle() {
  if (G.over) return;
  if (G.pos === "N" && G.idle >= 30) {
    const passive = G.A.f === G.B.f
      ? (G.A.w.exp <= G.B.w.exp ? "A" : "B")
      : (G.A.f > G.B.f ? "A" : "B");
    G.pos = other(passive);
    G.idle = 0;
    log("Thirty seconds without a score. " + sideBy(passive).w.id + " is put on the bottom.");
  } else if (G.pos !== "N" && G.idle >= 40) {
    G.pos = "N";
    G.idle = 0;
    log("Forty seconds in par terre without a score. Both wrestlers stand up.");
  }
}

function periodEnd() {
  if (G.period === 1) {
    recover(G.A);
    recover(G.B);
    G.period = 2;
    G.clock = 180;
    G.idle = 0;
    G.pos = G.openTop;
    log("Halftime. Fatigue eases. " + sideBy(G.openTop).w.id + " starts period 2 on top.");
    return;
  }
  if (G.period === 2) {
    if (G.A.score !== G.B.score) {
      finish("decision", G.A.score > G.B.score ? "A" : "B");
      return;
    }
    G.period = 3;
    G.clock = 60;
    G.idle = 0;
    G.pos = "N";
    log("Level after two periods. Sixty-second golden period from standing. First score or pin wins.");
    return;
  }
  const fresher = G.A.f === G.B.f ? null : (G.A.f < G.B.f ? "A" : "B");
  if (fresher) finish("overtime tiebreak on fatigue", fresher);
  else finish("draw", null);
}

function tryPin(attId, tech, delta) {
  const base = PIN_BASE[tech] || 0;
  if (!base) return false;
  const opp = clamp(base + 0.005 * delta, 0.05, 0.95);
  if (Math.random() > opp) {
    log("Exposure does not turn into a pin.");
    return false;
  }
  const att = sideBy(attId), def = sideBy(other(attId));
  const qA = 1 - 0.55 * att.f / 100, qD = 1 - 0.55 * def.f / 100;
  const dp = dot(att.w, PIN_OFF) * qA - dot(def.w, PIN_DEF) * qD + 15 * Math.log(att.w.kg / def.w.kg);
  const pPin = clamp(1 / (1 + Math.exp(-((dp - 15) / 15))), 0.05, 0.95);
  const pSec = Math.pow(pPin, 1 / 3);
  log(att.w.id + " looks for the fall (" + Math.round(pPin * 100) + "% to hold all three seconds).");
  for (let s = 1; s <= 3; s++) {
    if (G.clock <= 0) {
      log("The clock saves " + def.w.id + " before the third second.");
      return false;
    }
    tick(1);
    if (Math.random() > pSec) {
      log("Second " + s + ": " + def.w.id + " bridges out.");
      return false;
    }
    log("Second " + s + " held.");
  }
  finish("pin", attId);
  return true;
}

function maybeReverse(attId, techKey) {
  const chance = REV_CHANCE[techKey];
  if (!chance || Math.random() > chance) return false;
  const defId = other(attId);
  const roll = rating(sideBy(defId), sideBy(attId), TECH.reverse);
  const T = durationOf(sideBy(defId), TECH.reverse);
  const step = tick(T);
  fatigueOf(sideBy(defId), sideBy(attId), TECH.reverse, step.use / T);
  const cut = step.cut;
  if (cut || Math.random() > roll.p) {
    log(sideBy(defId).w.id + " looks for a reversal and cannot finish it.");
    return false;
  }
  G.pos = defId;
  addScore(defId, 1, "reversal");
  return true;
}

function resolve(attId, key) {
  if (G.over || G.pendingSup) return;
  enforceIdle();
  if (G.over) return;
  if (G.clock <= 0) { periodEnd(); return; }
  const tech = TECH[key];
  const defId = other(attId);
  const att = sideBy(attId), def = sideBy(defId);
  const info = rating(att, def, tech);
  const planned = durationOf(att, tech);
  const step = tick(planned);
  fatigueOf(att, def, tech, step.use / planned);
  if (step.cut && step.use < planned) {
    log(att.w.id + " starts " + tech.name.toLowerCase() + " as the whistle goes. No score.");
    if (G.clock <= 0) periodEnd();
   
    return;
  }
  const ok = Math.random() < info.p;
  const pct = Math.round(info.p * 100);
  if (!ok) {
    log(att.w.id + " " + tech.name.toLowerCase() + " fails (" + pct + "%).");
    if (key === "double") {
      const counterKey = Math.random() < 0.5 ? "sprawl" : "crotch";
      const cTech = TECH[counterKey];
      const cInfo = rating(def, att, cTech);
      const cT = durationOf(def, cTech);
      const cStep = tick(cT);
      fatigueOf(def, att, cTech, cStep.use / cT);
      if (!cStep.cut && Math.random() < cInfo.p) {
        G.pos = defId;
        const full = counterKey === "crotch" && Math.random() < clamp(0.5 + 0.008 * cInfo.delta, 0.15, 0.85);
        addScore(defId, full ? 4 : 2, cTech.name.toLowerCase());
        if (full) tryPin(defId, "crotch", cInfo.delta);
      } else {
        log(def.w.id + " cannot counter.");
      }
    } else if (tech.where === "top" || key === "crotch") {
      maybeReverse(attId, key);
    }
  } else if (tech.kind === "td") {
    G.pos = attId;
    addScore(attId, 2, tech.name.toLowerCase());
  } else if (tech.kind === "lock") {
    G.pos = attId;
    G.idle = 0;
    log(att.w.id + " locks up and moves behind (" + pct + "%). No points.");
  } else if (tech.kind === "esc") {
    G.pos = "N";
    G.idle = 0;
    log(att.w.id + " stands up and breaks contact (" + pct + "%).");
  } else if (tech.kind === "rev") {
    G.pos = attId;
    addScore(attId, 1, "reversal");
  } else if (tech.kind === "two") {
    addScore(attId, 2, tech.name.toLowerCase());
    G.pos = attId;
  } else if (tech.kind === "exp") {
    const full = Math.random() < clamp(0.5 + 0.008 * info.delta, 0.15, 0.85);
    G.pos = attId;
    addScore(attId, full ? 4 : 2, tech.name.toLowerCase() + (full ? ", full exposure" : ""));
    if (full) tryPin(attId, key === "foot" ? "foot" : key, info.delta);
  }
  if (!G.over && G.clock <= 0) periodEnd();
 
}

function ride(attId) {
  if (G.over || G.pendingSup) return;
  const seconds = 8;
  const step = tick(seconds);
  const att = sideBy(attId), def = sideBy(other(attId));
  [att, def].forEach((s) => { s.f = clamp(s.f + 1.5 * ageM(s.w), 0, 100); recover(s, step.use); });
  log(att.w.id + " holds position and lets the clock run.");
  enforceIdle();
  if (!G.over && G.clock <= 0) periodEnd();
 
}

function acceptSup(take) {
  G.pendingSup = false;
  G.supDecided = true;
  if (take) {
    finish("technical superiority", G.A.score > G.B.score ? "A" : "B");
  } else {
    log("The lead is kept on the mat. The match continues.");
  }
 
}

function legalFor(id) {
  if (G.pos === "N") return ["double", "lock", "ride"];
  if (G.pos === id) return ["gut", "lace", "foot", "crotch", "nelson", "cradle", "ride"];
  return ["escape", "reverse", "ride"];
}

function aiChoice(id) {
  const keys = legalFor(id).filter((k) => k !== "ride");
  const scored = keys.map((k) => {
    const tech = TECH[k];
    const info = rating(sideBy(id), sideBy(other(id)), tech);
    let value = tech.kind === "exp" ? 3 : tech.kind === "two" || tech.kind === "td" ? 2 : tech.kind === "rev" ? 1 : 0.4;
    if (PIN_BASE[k]) value += 2;
    const energy = (tech.fatA[0] + tech.fatA[1]) / 2;
    const utility = info.p * 0.30 + (value / 4) * 0.20 + (PIN_BASE[k] ? 0.20 : 0) + (1 - energy / 30) * 0.15;
    return {k, utility};
  });
  scored.sort((a, b) => b.utility - a.utility);
  const bestP = Math.min(1, 0.4 + 0.006 * sideBy(id).w.exp);
  if (Math.random() < bestP || scored.length === 1) return scored[0].k;
  const rest = scored.slice(1);
  const sum = rest.reduce((s, r) => s + r.utility, 0);
  let roll = Math.random() * sum;
  for (const r of rest) { roll -= r.utility; if (roll <= 0) return r.k; }
  return rest[rest.length - 1].k;
}

function youId() {
  if (!G || G.you === "none") return null;
  return G.you;
}
function begin(a, b, you, rankOn) {
  if (a.id === b.id) throw new Error("same");
  let openTop = "A";
  if (rankOn) openTop = avg(a) <= avg(b) ? "A" : "B";
  else openTop = Math.random() < 0.5 ? "A" : "B";
  G = {
    A: {w: a, score: 0, f: 0},
    B: {w: b, score: 0, f: 0},
    you,
    period: 1,
    clock: 180,
    idle: 0,
    pos: openTop,
    openTop,
    lines: [],
    over: false,
    pendingSup: false,
    supDecided: false
  };
  log("Period 1. " + sideBy(openTop).w.id + " starts on top in par terre. No points for the start.");
  return G;
}
const FWL = {
  ATTR, ROSTER, TECH, PIN_OFF, PIN_DEF, REV_CHANCE, PIN_BASE,
  clamp, avg, ageM, rating, durationOf, clock,
  get G() { return G; },
  begin, resolve, ride, acceptSup, legalFor, aiChoice, sideBy, other, youId
};

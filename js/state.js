"use strict";

const DEFAULT_STATE = {
  name: "",
  kind: "Человек",
  rank: "Новичок",
  enemyTier: "Статист",
  size: 0,
  armorBonusHead: 0,
  armorBonusTorso: 0,
  armorBonusArms: 0,
  armorBonusLegs: 0,
  parryBonus: 0,
  toughnessBonus: 0,
  paceBonus: 0,
  runStepBonus: 0,
  fear: "",
  notes: "",
  artData: "",
  selectedHindrances: [],
  selectedEdges: [],
  selectedWeapons: [],
  selectedArmor: [],
  traits: {
    agility: "d6",
    smarts: "d6",
    spirit: "d6",
    strength: "d6",
    vigor: "d6",
  },
  skills: DEFAULT_SKILLS.map(([name, die]) => ({ name, die })),
  attacks: [{ name: "Револьвер", skill: "Стрельба d6", damage: "2d6+1", notes: "Дистанция 12/24/48" }],
  abilities: [{ name: "Храбрый", text: "+2 к проверкам Страха." }],
};

let state = loadState();

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadState() {
  try {
    let saved = localStorage.getItem(STORAGE_KEY);
    let migratedFromOldKey = false;
    if (!saved) {
      for (const key of OLD_STORAGE_KEYS) {
        saved = localStorage.getItem(key);
        if (saved) {
          migratedFromOldKey = true;
          break;
        }
      }
    }
    if (!saved) return clone(DEFAULT_STATE);
    const parsed = JSON.parse(saved);
    const next = mergeState(clone(DEFAULT_STATE), parsed);
    if (parsed.paceBonus === undefined && parsed.pace !== undefined) {
      next.paceBonus = Number(parsed.pace || BASE_PACE) - BASE_PACE;
    }
    if (parsed.runStepBonus === undefined && parsed.runDie !== undefined) {
      next.runStepBonus = runStepFromDie(parsed.runDie);
    }
    if (parsed.armorBonusHead === undefined && parsed.armor !== undefined) {
      next.armor = Number(parsed.armor || 0);
    }
    if (parsed.enemyTier === undefined && parsed.wildCard !== undefined) {
      next.enemyTier = parsed.wildCard ? "Дикая карта" : "Статист";
    }
    normalizeLoadedState(next);
    if (migratedFromOldKey) {
      if (parsed.pace === 6 && parsed.paceBonus === undefined) next.paceBonus = 0;
      if (parsed.runDie === "d6" && parsed.runStepBonus === undefined) next.runStepBonus = 0;
    }
    return next;
  } catch {
    return clone(DEFAULT_STATE);
  }
}

function normalizeLoadedState(next) {
  if (next.paceBonus === undefined && next.pace !== undefined) {
    next.paceBonus = Number(next.pace || BASE_PACE) - BASE_PACE;
  }
  if (next.runStepBonus === undefined && next.runDie !== undefined) {
    next.runStepBonus = runStepFromDie(next.runDie);
  }
  delete next.pace;
  delete next.runDie;
  delete next.role;
  delete next.wildCard;
  if (!ENEMY_TIERS.includes(next.enemyTier)) next.enemyTier = "Статист";
  next.paceBonus = Number(next.paceBonus || 0);
  next.runStepBonus = clampRunStep(Number(next.runStepBonus || 0));
  if (next.armor !== undefined) {
    const legacyArmor = Number(next.armor || 0);
    next.armorBonusHead = Number(next.armorBonusHead ?? legacyArmor);
    next.armorBonusTorso = Number(next.armorBonusTorso ?? legacyArmor);
    next.armorBonusArms = Number(next.armorBonusArms ?? legacyArmor);
    next.armorBonusLegs = Number(next.armorBonusLegs ?? legacyArmor);
    delete next.armor;
  }
  next.armorBonusHead = Number(next.armorBonusHead || 0);
  next.armorBonusTorso = Number(next.armorBonusTorso || 0);
  next.armorBonusArms = Number(next.armorBonusArms || 0);
  next.armorBonusLegs = Number(next.armorBonusLegs || 0);
  next.selectedHindrances ||= [];
  next.selectedEdges ||= [];
  next.selectedWeapons ||= [];
  next.selectedArmor ||= [];
  return next;
}

function mergeState(base, saved) {
  for (const [key, value] of Object.entries(saved || {})) {
    if (!(key in base)) continue;
    if (value && typeof value === "object" && !Array.isArray(value) && typeof base[key] === "object") {
      base[key] = { ...base[key], ...value };
    } else {
      base[key] = value;
    }
  }
  return base;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  const status = $("[data-output='saveStatus']");
  if (status) {
    status.textContent = "Сохранено локально";
    status.classList.remove("is-flash");
    void status.offsetWidth;
    status.classList.add("is-flash");
  }
}

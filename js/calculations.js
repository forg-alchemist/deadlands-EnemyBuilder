"use strict";

function skillDie(name) {
  const skill = state.skills.find((item) => item.name.toLowerCase() === name.toLowerCase());
  return skill?.die || "-";
}

function selectedArmorBonus() {
  const sectors = computeArmorSectors();
  return Math.max(...ARMOR_SECTORS.map((sector) => sectors[sector] || 0), 0);
}

function totalArmor() {
  return selectedArmorBonus();
}

function layeredArmorValue(bonuses) {
  if (!bonuses.length) return 0;
  return [...bonuses]
    .sort((a, b) => b - a)
    .reduce((sum, bonus, index) => sum + (index === 0 ? bonus : Math.floor(bonus / 2)), 0);
}

function armorSectorsOf(item) {
  return Array.isArray(item?.sectors) ? item.sectors.filter((sector) => ARMOR_SECTORS.includes(sector)) : [];
}

function computeArmorSectors() {
  const buckets = { head: [], torso: [], arms: [], legs: [] };
  for (const armor of selectedCatalogItems("armor")) {
    for (const sector of armorSectorsOf(armor)) {
      buckets[sector].push(Number(armor.bonus || 0));
    }
  }

  const manualArmor = {
    head: Number(state.armorBonusHead || 0),
    torso: Number(state.armorBonusTorso || 0),
    arms: Number(state.armorBonusArms || 0),
    legs: Number(state.armorBonusLegs || 0),
  };
  const out = {};
  for (const sector of ARMOR_SECTORS) {
    out[sector] = layeredArmorValue(buckets[sector]) + manualArmor[sector];
  }
  return out;
}

function derived() {
  const fighting = skillDie("Драка");
  const parry = 2 + halfDie(fighting) + Number(state.parryBonus || 0);
  const toughness = 2 + halfDie(state.traits.vigor) + Number(state.toughnessBonus || 0);
  const threatScore =
    dieValue(state.traits.vigor) +
    dieValue(skillDie("Драка")) +
    dieValue(skillDie("Стрельба")) +
    totalArmor() * 2 +
    Number(state.size || 0) +
    (ENEMY_TIER_THREAT[state.enemyTier] || 0);

  return {
    parry: Math.max(2, parry),
    toughness: Math.max(1, toughness),
    pace: Math.max(0, BASE_PACE + Number(state.paceBonus || 0)),
    runDie: runDieFromStep(Number(state.runStepBonus || 0)),
    armor: totalArmor(),
    threat: threatScore >= 34 ? "Опасный" : threatScore >= 24 ? "Крепкий" : "Обычный",
  };
}

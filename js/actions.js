"use strict";

function addSkill() {
  state.skills.push({ name: "", die: "d4" });
  saveState();
  render();
}

function addAttack() {
  state.attacks.push({ name: "", skill: "", damage: "", notes: "" });
  saveState();
  render();
}

function addAbility() {
  state.abilities.push({ name: "", text: "" });
  saveState();
  render();
}

function addCatalogItem(type, id) {
  const item = getCatalog(type).find((entry) => entry.id === id);
  if (!item) return;

  const key = selectedStateKey(type);
  state[key].push(item.id);

  if (type === "weapons") {
    state.attacks.push(attackFromWeapon(item));
  }
  if (type === "edges") {
    state.abilities.push({ name: item.name, text: item.effect || "" });
  }

  saveState();
  render();
  renderPickerList(type, $(".picker-search")?.value || "");
}

function attackFromWeapon(item) {
  const ranged = Boolean(item.range && item.range !== "—");
  const skillName = ranged ? "Стрельба" : "Драка";
  const die = skillDie(skillName);
  return {
    name: item.name,
    skill: `${skillName} ${die === "-" ? "d4" : die}`,
    damage: item.damage || "",
    notes: catalogSummary("weapons", item),
  };
}

function removeItem(list, index) {
  state[list].splice(index, 1);
  saveState();
  render();
}

function removeCatalogItem(type, index) {
  state[selectedStateKey(type)].splice(index, 1);
  saveState();
  render();
}

function uploadArt(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const image = new Image();
    image.onload = () => {
      const maxSide = 900;
      const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      state.artData = canvas.toDataURL("image/jpeg", 0.82);
      saveState();
      render();
    };
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function normalizeTraits() {
  for (const [key] of TRAITS) state.traits[key] = state.enemyTier === "Дикая карта" ? "d8" : "d6";
  saveState();
  render();
}

function resetState() {
  state = clone(DEFAULT_STATE);
  saveState();
  render();
}

function applyPreset(id) {
  const preset = PRESETS.find((item) => item.id === id);
  if (!preset) return;
  state = normalizeLoadedState(mergeState(clone(DEFAULT_STATE), preset.patch));
  state.skills = preset.patch.skills.map(([name, die]) => ({ name, die }));
  state.attacks = preset.patch.attacks.map(([name, skill, damage, notes]) => ({ name, skill, damage, notes }));
  state.abilities = preset.patch.abilities.map(([name, text]) => ({ name, text }));
  saveState();
  render();
}

function randomizeEnemy() {
  const preset = PRESETS[Math.floor(Math.random() * PRESETS.length)];
  applyPreset(preset.id);
  const suffixes = ["с пыльной дороги", "из каньона", "с черной меткой", "при деньгах", "на последнем нерве"];
  state.name = `${state.name} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
  saveState();
  render();
}

function exportState() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${slugify(state.name || "deadlands-enemy")}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function importState(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      state = normalizeLoadedState(mergeState(clone(DEFAULT_STATE), JSON.parse(reader.result)));
      saveState();
      render();
    } catch {
      alert("Не получилось прочитать JSON.");
    }
  };
  reader.readAsText(file);
}

async function copyStatblock() {
  const block = buildStatblock();
  try {
    await navigator.clipboard.writeText(block);
    $("[data-output='saveStatus']").textContent = "Статблок скопирован";
  } catch {
    const area = document.createElement("textarea");
    area.value = block;
    document.body.append(area);
    area.select();
    document.execCommand("copy");
    area.remove();
    $("[data-output='saveStatus']").textContent = "Статблок скопирован";
  }
}

"use strict";

const STORAGE_KEY = "deadlands-enemy-builder-v1";
const DICE = ["-", "d4", "d6", "d8", "d10", "d12"];
const TRAITS = [
  ["agility", "Ловкость"],
  ["smarts", "Смекалка"],
  ["spirit", "Характер"],
  ["strength", "Сила"],
  ["vigor", "Выносливость"],
];

const DEFAULT_SKILLS = [
  ["Атлетика", "d6"],
  ["Внимание", "d6"],
  ["Драка", "-"],
  ["Стрельба", "-"],
  ["Скрытность", "-"],
  ["Верховая езда", "-"],
  ["Запугивание", "-"],
  ["Убеждение", "-"],
  ["Выживание", "-"],
  ["Оккультизм", "-"],
];

const DEFAULT_STATE = {
  name: "",
  kind: "Человек",
  rank: "Новичок",
  role: "Массовка",
  wildCard: false,
  size: 0,
  armor: 0,
  parryBonus: 0,
  toughnessBonus: 0,
  pace: 6,
  runDie: "d6",
  fear: "",
  grit: 0,
  bennies: 0,
  notes: "",
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

const PRESETS = [
  {
    id: "bandit",
    label: "Бандит",
    patch: {
      name: "Бандит",
      role: "Стрелок",
      traits: { agility: "d6", smarts: "d4", spirit: "d6", strength: "d6", vigor: "d6" },
      skills: [
        ["Атлетика", "d6"],
        ["Внимание", "d6"],
        ["Драка", "d6"],
        ["Стрельба", "d6"],
        ["Скрытность", "d4"],
        ["Запугивание", "d6"],
      ],
      attacks: [
        ["Револьвер", "Стрельба d6", "2d6+1", "Дистанция 12/24/48"],
        ["Нож", "Драка d6", "Сила+d4", ""],
      ],
      abilities: [["Грязный прием", "Обычно держит действие или прячется за укрытием."]],
    },
  },
  {
    id: "gunslinger",
    label: "Опытный стрелок",
    patch: {
      name: "Опытный стрелок",
      rank: "Закаленный",
      role: "Лидер",
      wildCard: true,
      bennies: 2,
      traits: { agility: "d8", smarts: "d6", spirit: "d8", strength: "d6", vigor: "d6" },
      skills: [
        ["Атлетика", "d6"],
        ["Внимание", "d8"],
        ["Драка", "d6"],
        ["Стрельба", "d10"],
        ["Скрытность", "d6"],
        ["Запугивание", "d8"],
        ["Верховая езда", "d8"],
      ],
      attacks: [
        ["Парные револьверы", "Стрельба d10", "2d6+1", "Может стрелять с двух рук"],
        ["Приклад", "Драка d6", "Сила+d4", ""],
      ],
      abilities: [
        ["Быстрый выхват", "Не получает штраф за выхватывание оружия."],
        ["Командный голос", "Союзники рядом получают +1 к проверкам Характера."],
      ],
    },
  },
  {
    id: "cultist",
    label: "Культист",
    patch: {
      name: "Культист",
      role: "Мистик",
      traits: { agility: "d6", smarts: "d6", spirit: "d8", strength: "d4", vigor: "d6" },
      skills: [
        ["Атлетика", "d4"],
        ["Внимание", "d6"],
        ["Драка", "d4"],
        ["Оккультизм", "d8"],
        ["Убеждение", "d6"],
        ["Запугивание", "d8"],
      ],
      attacks: [["Ритуальный нож", "Драка d4", "Сила+d4", ""]],
      abilities: [
        ["Темная вера", "+2 к сопротивлению сверхъестественному страху."],
        ["Ритуал", "Если ему дать время, сцена становится хуже для героев."],
      ],
    },
  },
  {
    id: "walking_dead",
    label: "Ходячий мертвец",
    patch: {
      name: "Ходячий мертвец",
      kind: "Нежить",
      role: "Громила",
      pace: 4,
      fear: "-2",
      traits: { agility: "d4", smarts: "d4", spirit: "d4", strength: "d8", vigor: "d8" },
      skills: [
        ["Атлетика", "d4"],
        ["Внимание", "d4"],
        ["Драка", "d6"],
        ["Запугивание", "d6"],
      ],
      attacks: [["Когти", "Драка d6", "Сила+d4", ""]],
      abilities: [
        ["Нежить", "+2 к Стойкости, +2 к выходу из Шока, не дышит."],
        ["Слабость: голова", "Выстрел в голову наносит обычный дополнительный урон по нежити."],
      ],
      toughnessBonus: 2,
    },
  },
  {
    id: "automaton",
    label: "Автоматон",
    patch: {
      name: "Автоматон Смита и Робардса",
      kind: "Конструкт",
      rank: "Ветеран",
      role: "Чудовище",
      size: 2,
      armor: 3,
      pace: 5,
      traits: { agility: "d6", smarts: "d4", spirit: "d6", strength: "d10", vigor: "d10" },
      skills: [
        ["Атлетика", "d6"],
        ["Внимание", "d6"],
        ["Драка", "d8"],
        ["Стрельба", "d8"],
        ["Запугивание", "d10"],
      ],
      attacks: [
        ["Кулак из стали", "Драка d8", "Сила+d8", ""],
        ["Встроенный пулемет", "Стрельба d8", "2d8", "Автоматический огонь"],
      ],
      abilities: [
        ["Конструкт", "+2 к выходу из Шока, игнорирует яд и болезни."],
        ["Тяжелая броня", "Обычное оружие часто требует уязвимого места или тяжелого калибра."],
      ],
    },
  },
];

let state = loadState();

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return clone(DEFAULT_STATE);
    return mergeState(clone(DEFAULT_STATE), JSON.parse(saved));
  } catch {
    return clone(DEFAULT_STATE);
  }
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

function dieValue(die) {
  if (!die || die === "-") return 0;
  return Number(die.replace("d", "")) || 0;
}

function halfDie(die) {
  const value = dieValue(die);
  return value ? value / 2 : 0;
}

function skillDie(name) {
  const skill = state.skills.find((item) => item.name.toLowerCase() === name.toLowerCase());
  return skill?.die || "-";
}

function derived() {
  const fighting = skillDie("Драка");
  const parry = 2 + halfDie(fighting) + Number(state.parryBonus || 0);
  const toughness =
    2 +
    halfDie(state.traits.vigor) +
    Number(state.armor || 0) +
    Number(state.size || 0) +
    Number(state.toughnessBonus || 0);
  const threatScore =
    dieValue(state.traits.vigor) +
    dieValue(skillDie("Драка")) +
    dieValue(skillDie("Стрельба")) +
    Number(state.armor || 0) * 2 +
    Number(state.size || 0) +
    (state.wildCard ? 8 : 0);

  return {
    parry: Math.max(2, parry),
    toughness: Math.max(1, toughness),
    pace: Number(state.pace || 6),
    runDie: state.runDie || "d6",
    threat: threatScore >= 34 ? "Опасный" : threatScore >= 24 ? "Крепкий" : "Обычный",
  };
}

function init() {
  renderPresetOptions();
  renderStaticControls();
  bindEvents();
  render();
}

function renderPresetOptions() {
  const select = $("[data-action='preset']");
  PRESETS.forEach((preset) => {
    const option = document.createElement("option");
    option.value = preset.id;
    option.textContent = preset.label;
    select.append(option);
  });
}

function renderStaticControls() {
  const traitRoot = $("[data-traits]");
  traitRoot.innerHTML = TRAITS.map(
    ([key, label]) => `
      <label class="trait-row">
        <span>${label}</span>
        <select data-trait="${key}">
          ${DICE.slice(1).map((die) => `<option value="${die}">${die}</option>`).join("")}
        </select>
      </label>
    `,
  ).join("");
}

function bindEvents() {
  document.addEventListener("input", updateBoundField);

  document.addEventListener("change", (event) => {
    if (event.target.dataset.bind) {
      updateBoundField(event);
      return;
    }

    if (event.target.dataset.trait) {
      state.traits[event.target.dataset.trait] = event.target.value;
      saveState();
      render();
      return;
    }

    if (event.target.dataset.action === "preset") applyPreset(event.target.value);
    if (event.target.dataset.action === "import") importState(event.target.files[0]);
  });

  document.addEventListener("click", (event) => {
    const actionTarget = event.target.closest("[data-action]");
    if (!actionTarget) return;
    const action = actionTarget.dataset.action;
    if (action === "addSkill") addSkill();
    if (action === "addAttack") addAttack();
    if (action === "addAbility") addAbility();
    if (action === "removeSkill") removeItem("skills", Number(actionTarget.dataset.index));
    if (action === "removeAttack") removeItem("attacks", Number(actionTarget.dataset.index));
    if (action === "removeAbility") removeItem("abilities", Number(actionTarget.dataset.index));
    if (action === "normalizeTraits") normalizeTraits();
    if (action === "randomize") randomizeEnemy();
    if (action === "reset") resetState();
    if (action === "copyBlock") copyStatblock();
    if (action === "print") window.print();
    if (action === "export") exportState();
  });
}

function updateBoundField(event) {
    const bind = event.target.dataset.bind;
    if (!bind) return;
    const target = event.target;
    if (target.type === "checkbox") state[bind] = target.checked;
    else if (target.type === "number") state[bind] = Number(target.value || 0);
    else state[bind] = target.value;
    saveState();
    render();
}

function render() {
  bindInputs();
  renderLists();
  renderScores();
  renderStatblock();
}

function bindInputs() {
  $$("[data-bind]").forEach((input) => {
    const key = input.dataset.bind;
    const value = state[key];
    if (input.type === "checkbox") input.checked = Boolean(value);
    else input.value = value ?? "";
  });
  $$("[data-trait]").forEach((select) => {
    select.value = state.traits[select.dataset.trait] || "d6";
  });
}

function renderLists() {
  const skillRoot = $("[data-skills]");
  skillRoot.innerHTML = state.skills.map((skill, index) => `
    <div class="skill-row">
      <label>
        <span>Навык</span>
        <input value="${escapeAttr(skill.name)}" data-list="skills" data-field="name" data-index="${index}" />
      </label>
      <label>
        <span>Кость</span>
        <select data-list="skills" data-field="die" data-index="${index}">
          ${DICE.map((die) => `<option value="${die}" ${skill.die === die ? "selected" : ""}>${die}</option>`).join("")}
        </select>
      </label>
      <button class="icon-button" type="button" data-action="removeSkill" data-index="${index}" title="Удалить">×</button>
    </div>
  `).join("");

  const attackRoot = $("[data-attacks]");
  attackRoot.innerHTML = state.attacks.map((attack, index) => `
    <div class="attack-row">
      <label>
        <span>Атака</span>
        <input value="${escapeAttr(attack.name)}" data-list="attacks" data-field="name" data-index="${index}" />
      </label>
      <label>
        <span>Бросок</span>
        <input value="${escapeAttr(attack.skill)}" data-list="attacks" data-field="skill" data-index="${index}" />
      </label>
      <label>
        <span>Урон / дальность</span>
        <input value="${escapeAttr(attack.damage)}" data-list="attacks" data-field="damage" data-index="${index}" />
      </label>
      <button class="icon-button" type="button" data-action="removeAttack" data-index="${index}" title="Удалить">×</button>
      <label class="wide">
        <span>Заметка</span>
        <input value="${escapeAttr(attack.notes)}" data-list="attacks" data-field="notes" data-index="${index}" />
      </label>
    </div>
  `).join("");

  const abilityRoot = $("[data-abilities]");
  abilityRoot.innerHTML = state.abilities.map((ability, index) => `
    <div class="ability-row">
      <label>
        <span>Название</span>
        <input value="${escapeAttr(ability.name)}" data-list="abilities" data-field="name" data-index="${index}" />
      </label>
      <label>
        <span>Эффект</span>
        <input value="${escapeAttr(ability.text)}" data-list="abilities" data-field="text" data-index="${index}" />
      </label>
      <button class="icon-button" type="button" data-action="removeAbility" data-index="${index}" title="Удалить">×</button>
    </div>
  `).join("");

  $$("[data-list]").forEach((input) => {
    input.addEventListener("input", updateListItem);
    input.addEventListener("change", updateListItem);
  });
}

function updateListItem(event) {
  const { list, field, index } = event.target.dataset;
  state[list][Number(index)][field] = event.target.value;
  saveState();
  renderScores();
  renderStatblock();
}

function renderScores() {
  const values = derived();
  $("[data-output='parry']").textContent = formatNumber(values.parry);
  $("[data-output='toughness']").textContent = formatNumber(values.toughness);
  $("[data-output='pace']").textContent = values.pace;
  $("[data-output='runDie']").textContent = values.runDie;
  $("[data-output='threat']").textContent = values.threat;
}

function renderStatblock() {
  $("[data-output='statblock']").textContent = buildStatblock();
}

function buildStatblock() {
  const values = derived();
  const traitLine = TRAITS.map(([, label], index) => `${shortTrait(label)} ${state.traits[TRAITS[index][0]]}`).join(", ");
  const skills = state.skills
    .filter((skill) => skill.name && skill.die && skill.die !== "-")
    .map((skill) => `${skill.name} ${skill.die}`)
    .join(", ");
  const attacks = state.attacks
    .filter((attack) => attack.name)
    .map((attack) => `- ${attack.name}: ${compactJoin([attack.skill, attack.damage, attack.notes], "; ")}`)
    .join("\n");
  const abilities = state.abilities
    .filter((ability) => ability.name || ability.text)
    .map((ability) => `- ${ability.name}${ability.name && ability.text ? ": " : ""}${ability.text}`)
    .join("\n");
  const armor = Number(state.armor || 0) ? ` (${Number(state.armor)} броня)` : "";
  const fear = state.fear ? `, Страх ${state.fear}` : "";
  const bennies = state.bennies ? `, фишки ${state.bennies}` : "";
  const notes = state.notes ? `\n\nЗаметки: ${state.notes}` : "";

  return `${state.name || "Безымянный враг"}${state.wildCard ? " [Дикая карта]" : ""}
${state.kind}, ${state.rank}, ${state.role}

Параметры: ${traitLine}
Навыки: ${skills || "нет значимых навыков"}

Шаг ${values.pace}, Бег ${values.runDie}, Защита ${formatNumber(values.parry)}, Стойкость ${formatNumber(values.toughness)}${armor}
Размер ${state.size || 0}, Выдержка ${state.grit || 0}${fear}${bennies}

Атаки:
${attacks || "- нет"}

Особенности:
${abilities || "- нет"}${notes}`;
}

function shortTrait(label) {
  return {
    "Ловкость": "Лов",
    "Смекалка": "Смек",
    "Характер": "Хар",
    "Сила": "Сил",
    "Выносливость": "Вын",
  }[label] || label;
}

function compactJoin(parts, separator) {
  return parts.filter(Boolean).join(separator);
}

function formatNumber(value) {
  return Number.isInteger(value) ? String(value) : String(value).replace(".", ",");
}

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

function removeItem(list, index) {
  state[list].splice(index, 1);
  saveState();
  render();
}

function normalizeTraits() {
  for (const [key] of TRAITS) state.traits[key] = state.wildCard ? "d8" : "d6";
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
  state = mergeState(clone(DEFAULT_STATE), preset.patch);
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
      state = mergeState(clone(DEFAULT_STATE), JSON.parse(reader.result));
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

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-zа-я0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "deadlands-enemy";
}

function escapeAttr(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

init();

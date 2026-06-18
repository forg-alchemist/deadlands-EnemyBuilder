"use strict";

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
    if (event.target.dataset.action === "uploadArt") uploadArt(event);
  });

  document.addEventListener("click", (event) => {
    const actionTarget = event.target.closest("[data-action]");
    if (!actionTarget) return;
    const action = actionTarget.dataset.action;
    if (action === "addSkill") addSkill();
    if (action === "addAttack") addAttack();
    if (action === "addAbility") addAbility();
    if (action === "openPicker") openPickerModal(actionTarget.dataset.type);
    if (action === "closePicker") closePickerModal();
    if (action === "addPickerItem") addCatalogItem(actionTarget.dataset.type, actionTarget.dataset.id);
    if (action === "removeSkill") removeItem("skills", Number(actionTarget.dataset.index));
    if (action === "removeAttack") removeItem("attacks", Number(actionTarget.dataset.index));
    if (action === "removeAbility") removeItem("abilities", Number(actionTarget.dataset.index));
    if (action === "removeCatalog") removeCatalogItem(actionTarget.dataset.type, Number(actionTarget.dataset.index));
    if (action === "normalizeTraits") normalizeTraits();
    if (action === "randomize") randomizeEnemy();
    if (action === "reset") resetState();
    if (action === "copyBlock") copyStatblock();
    if (action === "print") window.print();
    if (action === "export") exportState();
  });

  if (typeof bindCatalogPickerEvents === "function") bindCatalogPickerEvents();
}

function updateBoundField(event) {
  const bind = event.target.dataset.bind;
  if (!bind) return;
    const target = event.target;
    if (target.type === "checkbox") state[bind] = target.checked;
    else if (target.type === "number" || target.dataset.valueType === "number") state[bind] = Number(target.value || 0);
    else state[bind] = target.value;
  saveState();
  render();
}

function render() {
  bindInputs();
  renderLists();
  renderCatalogSelections();
  renderPortrait();
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

function renderCatalogSelections() {
  const groups = [
    ["hindrances", "Изъяны"],
    ["edges", "Черты"],
    ["weapons", "Оружие"],
    ["armor", "Броня"],
  ];
  groups.forEach(([type]) => {
    const root = $(`[data-catalog-list="${type}"]`);
    if (!root) return;
    const items = selectedCatalogItems(type);
    root.innerHTML = type === "armor"
      ? renderArmorRows(items)
      : items.length
        ? items.map((item, index) => `
          <div class="selected-row">
            <div>
              <strong>${escapeHtml(catalogTitle(type, item))}</strong>
              <span>${escapeHtml(catalogSummary(type, item))}</span>
            </div>
            <button class="icon-button" type="button" data-action="removeCatalog" data-type="${type}" data-index="${index}" title="Удалить">×</button>
          </div>
        `).join("")
        : `<p class="empty-list">-</p>`;
  });
}

function renderArmorRows(items) {
  if (!items.length) return `<p class="empty-list">-</p>`;
  return `
    <div class="armor-table">
      <div class="armor-row armor-row-header">
        <span>Название</span>
        <span>Секторы</span>
        <span>Броня</span>
        <span>Сила</span>
        <span>Вес</span>
        <span>Цена</span>
        <span></span>
      </div>
      ${items.map((item, index) => `
        <div class="armor-row">
          <span class="armor-cell-name">${escapeHtml(item.name)}</span>
          <span class="armor-cell-sectors">${escapeHtml(formatArmorSectors(item))}</span>
          <span class="armor-cell-bonus">+${Number(item.bonus || 0)}</span>
          <span class="armor-cell-strength">${escapeHtml(item.minStr || "-")}</span>
          <span class="armor-cell-weight">${escapeHtml(item.weight ?? "-")}</span>
          <span class="armor-cell-price">${escapeHtml(item.price || "-")}</span>
          <button class="icon-button" type="button" data-action="removeCatalog" data-type="armor" data-index="${index}" title="Удалить">×</button>
        </div>
      `).join("")}
    </div>
  `;
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
  updateArmorSectorOutputs();
}

function updateArmorSectorOutputs() {
  const sectors = computeArmorSectors();
  $("[data-output='armorHead']").textContent = sectors.head ? `+${sectors.head}` : "0";
  $("[data-output='armorTorso']").textContent = sectors.torso ? `+${sectors.torso}` : "0";
  $("[data-output='armorArms']").textContent = sectors.arms ? `+${sectors.arms}` : "0";
  $("[data-output='armorLegs']").textContent = sectors.legs ? `+${sectors.legs}` : "0";
}

function renderPortrait() {
  const frame = $(".portrait-frame");
  const placeholder = $(".portrait-placeholder");
  if (!frame || !placeholder) return;
  frame.style.backgroundImage = state.artData ? `url("${state.artData}")` : "";
  placeholder.hidden = Boolean(state.artData);
}

function renderStatblock() {
  const statblock = $("[data-output='statblock']");
  if (statblock) statblock.textContent = buildStatblock();
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
  const hindrances = selectedCatalogItems("hindrances").map((item) => `- ${catalogTitle("hindrances", item)}: ${catalogSummary("hindrances", item)}`).join("\n");
  const edges = selectedCatalogItems("edges").map((item) => `- ${catalogTitle("edges", item)}: ${catalogSummary("edges", item)}`).join("\n");
  const weapons = selectedCatalogItems("weapons").map((item) => `- ${catalogTitle("weapons", item)}: ${catalogSummary("weapons", item)}`).join("\n");
  const armorItems = selectedCatalogItems("armor").map((item) => `- ${catalogTitle("armor", item)}: ${catalogSummary("armor", item)}`).join("\n");
  const armorLine = values.armor ? `, Броня до +${values.armor}` : "";
  const fear = state.fear ? `, Страх ${state.fear}` : "";
  const notes = state.notes ? `\n\nЗаметки: ${state.notes}` : "";

  return `${state.name || "Безымянный враг"}${state.enemyTier === "Дикая карта" ? " [Дикая карта]" : ""}
${state.kind}, ${state.rank}, ${state.enemyTier}

Параметры: ${traitLine}
Навыки: ${skills || "нет значимых навыков"}

Шаг ${values.pace}, Бег ${values.runDie}, Защита ${formatNumber(values.parry)}, Стойкость ${formatNumber(values.toughness)}${armorLine}
Размер ${state.size || 0}${fear}

Атаки:
${attacks || "- нет"}

Оружие из каталога:
${weapons || "- нет"}

Броня из каталога:
${armorItems || "- нет"}

Изъяны:
${hindrances || "- нет"}

Черты:
${edges || "- нет"}

Особенности:
${abilities || "- нет"}${notes}`;
}

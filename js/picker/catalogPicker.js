"use strict";

let currentPickerType = null;

function openPickerModal(type) {
  currentPickerType = type;
  const modal = $("#picker-modal");
  const search = $(".picker-search", modal);

  $(".picker-title", modal).textContent = {
    hindrances: "Изъяны",
    edges: "Черты",
    weapons: "Оружие",
    armor: "Броня",
  }[type] || "Каталог";

  search.value = "";
  renderPickerList(type, "");
  modal.hidden = false;
  search.focus();
}

function closePickerModal() {
  const modal = $("#picker-modal");
  if (!modal || modal.hidden) return;
  modal.hidden = true;
  currentPickerType = null;
}

function bindCatalogPickerEvents() {
  const pickerSearch = $(".picker-search");
  if (pickerSearch) {
    pickerSearch.addEventListener("input", () => renderPickerList(currentPickerType, pickerSearch.value));
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closePickerModal();
  });
}

function renderPickerList(type, query = "") {
  const list = $(".picker-list");
  if (!list || !type) return;

  const q = query.trim().toLowerCase();
  const items = getCatalog(type)
    .filter((item) => matchesCatalogQuery(type, item, q))
    .sort((a, b) => catalogSortText(type, a).localeCompare(catalogSortText(type, b), "ru"));

  if (!items.length) {
    list.innerHTML = `<div class="picker-empty">Ничего не найдено</div>`;
    return;
  }

  list.innerHTML = items.map((item) => renderPickerRow(type, item)).join("");
}

function matchesCatalogQuery(type, item, query) {
  if (!query) return true;
  return [
    item.name,
    item.degree,
    item.category,
    item.group,
    item.rank,
    item.requirements,
    catalogSummary(type, item),
  ].filter(Boolean).join(" ").toLowerCase().includes(query);
}

function catalogSortText(type, item) {
  if (type === "weapons") return `${item.group || ""} ${item.name}`;
  if (type === "armor") return `${item.category || ""} ${item.name}`;
  if (type === "edges") return `${item.category || ""} ${item.rank || ""} ${item.name}`;
  return `${item.name} ${item.degree || ""}`;
}

function renderPickerRow(type, item) {
  const rowClass = [
    "picker-item",
    type === "hindrances" && item.degree === "Крупный" ? "picker-item--major" : "",
    type === "hindrances" && item.degree !== "Крупный" ? "picker-item--minor" : "",
  ].filter(Boolean).join(" ");

  return `
    <div class="${rowClass}">
      <div>
        <div class="hindrance-name-row">
          <div class="picker-item-name">${escapeHtml(item.name)}</div>
          ${renderPickerBadge(type, item)}
        </div>
        ${renderPickerMeta(type, item)}
      </div>
      <button class="picker-item-add" type="button" data-action="addPickerItem" data-type="${type}" data-id="${escapeAttr(item.id)}" title="Добавить">+</button>
    </div>
  `;
}

function renderPickerBadge(type, item) {
  if (type === "hindrances") {
    const major = item.degree === "Крупный";
    return `<span class="degree-badge ${major ? "major" : "minor"}">${escapeHtml(item.degree || "")}</span>`;
  }
  if (type === "edges" && item.rank) {
    return `<span class="edge-rank-badge">${escapeHtml(item.rank)}</span>`;
  }
  return "";
}

function renderPickerMeta(type, item) {
  if (type === "hindrances") {
    return `
      ${item.penalty && item.penalty !== "-" ? `<div class="picker-item-penalty">Штраф: ${escapeHtml(item.penalty)}</div>` : ""}
      ${item.bonus && item.bonus !== "-" ? `<div class="picker-item-bonus">Бонус: ${escapeHtml(item.bonus)}</div>` : ""}
      ${item.description ? `<div class="picker-item-desc picker-item-desc--minor">${escapeHtml(item.description)}</div>` : ""}
    `;
  }
  if (type === "edges") {
    return `
      <div class="picker-item-meta">${escapeHtml(compactJoin([item.category, item.requirements], "; "))}</div>
      ${item.effect ? `<div class="picker-item-desc">${escapeHtml(item.effect)}</div>` : ""}
    `;
  }
  if (type === "weapons") {
    return `
      <div class="picker-item-meta">${escapeHtml(item.group || "")}</div>
      <div class="picker-item-desc picker-weapon-stats">${renderWeaponStats(item)}</div>
    `;
  }
  if (type === "armor") {
    return `
      <div class="picker-item-meta">${escapeHtml(item.category || "")}</div>
      <div class="picker-item-desc picker-armor-stats">${renderArmorStats(item)}</div>
    `;
  }
  return "";
}

function renderWeaponStats(item) {
  return [
    ["range", "Дист", item.range],
    ["damage", "Урон", item.damage],
    ["ap", "ББ", item.ap],
    ["magazine", "Обойма", item.magazine],
    ["mode", "Режим", item.mode],
    ["strength", "МС", item.mc],
    ["price", "Цена", item.price],
    ["weight", "Вес", item.weight],
    ["notes", "", item.notes],
  ].filter(([, , value]) => value && value !== "—")
    .map(([mod, label, value]) => `<span class="picker-weapon-stat picker-weapon-stat--${mod}">${escapeHtml(label ? `${label}: ${value}` : value)}</span>`)
    .join("");
}

function renderArmorStats(item) {
  return [
    ["armor", "Броня", `+${item.bonus}`],
    ["sectors", "Секторы", formatArmorSectors(item)],
    ["strength", "МС", item.minStr],
    ["weight", "Вес", item.weight],
    ["price", "Цена", item.price],
  ].filter(([, , value]) => value && value !== "—")
    .map(([mod, label, value]) => `<span class="picker-armor-stat picker-armor-stat--${mod}">${escapeHtml(`${label}: ${value}`)}</span>`)
    .join("");
}

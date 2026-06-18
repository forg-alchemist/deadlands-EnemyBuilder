"use strict";

function selectedCatalogItems(type) {
  const ids = state[selectedStateKey(type)] || [];
  return ids.map((id) => getCatalog(type).find((item) => item.id === id)).filter(Boolean);
}

function selectedStateKey(type) {
  return {
    hindrances: "selectedHindrances",
    edges: "selectedEdges",
    weapons: "selectedWeapons",
    armor: "selectedArmor",
  }[type];
}

function getCatalog(type) {
  return {
    hindrances: window.DEADLANDS_CATALOG_HINDRANCES || [],
    edges: window.DEADLANDS_CATALOG_EDGES || [],
    weapons: window.DEADLANDS_CATALOG_WEAPONS || [],
    armor: window.DEADLANDS_CATALOG_ARMOR || [],
  }[type] || [];
}

function formatArmorSectors(item) {
  const sectors = armorSectorsOf(item);
  return sectors.length ? sectors.map((sector) => ARMOR_SECTOR_NAMES[sector] || sector).join(", ") : "-";
}

function catalogTitle(type, item) {
  if (type === "hindrances") return `${item.name} (${item.degree})`;
  if (type === "edges") return `${item.name} (${item.rank})`;
  if (type === "weapons") return item.name;
  if (type === "armor") return `${item.name} +${item.bonus}`;
  return item.name;
}

function catalogSummary(type, item) {
  if (type === "hindrances") return compactJoin([item.penalty, item.bonus && item.bonus !== "-" ? item.bonus : ""], "; ");
  if (type === "edges") return compactJoin([item.category, item.requirements, item.effect], "; ");
  if (type === "weapons") {
    return compactJoin([
      item.range ? `Дистанция ${item.range}` : "",
      item.damage ? `Урон ${item.damage}` : "",
      item.ap ? `ББ ${item.ap}` : "",
      item.mode ? `Режим ${item.mode}` : "",
      item.magazine ? `Магазин ${item.magazine}` : "",
      item.notes,
    ], "; ");
  }
  if (type === "armor") {
    return compactJoin([
      item.category,
      `секторы: ${formatArmorSectors(item)}`,
      item.minStr ? `мин. Сила ${item.minStr}` : "",
      item.weight ? `вес ${item.weight}` : "",
      item.price,
    ], "; ");
  }
  return "";
}

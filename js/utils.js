"use strict";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function dieValue(die) {
  if (!die || die === "-") return 0;
  return Number(String(die).replace("d", "")) || 0;
}

function halfDie(die) {
  const value = dieValue(die);
  return value ? value / 2 : 0;
}

function clampRunStep(step) {
  return Math.max(RUN_STEP_OPTIONS[0], Math.min(RUN_STEP_OPTIONS[RUN_STEP_OPTIONS.length - 1], step));
}

function runStepFromDie(die) {
  const index = RUN_DICE.indexOf(die);
  const baseIndex = RUN_DICE.indexOf(BASE_RUN_DIE);
  return index === -1 ? 0 : index - baseIndex;
}

function runDieFromStep(step) {
  const baseIndex = RUN_DICE.indexOf(BASE_RUN_DIE);
  const index = Math.max(0, Math.min(RUN_DICE.length - 1, baseIndex + clampRunStep(step)));
  return RUN_DICE[index];
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
  return parts.filter((part) => part !== undefined && part !== null && part !== "" && part !== "—").join(separator);
}

function formatNumber(value) {
  return Number.isInteger(value) ? String(value) : String(value).replace(".", ",");
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

function escapeHtml(value) {
  return escapeAttr(value).replace(/'/g, "&#039;");
}

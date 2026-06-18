"use strict";

const STORAGE_KEY = "deadlands-enemy-builder-v2";
const OLD_STORAGE_KEYS = ["deadlands-enemy-builder-v1"];
const DICE = ["-", "d4", "d6", "d8", "d10", "d12"];
const BASE_PACE = 3;
const BASE_RUN_DIE = "d4";
const RUN_DICE = ["d2", "d4", "d6", "d8", "d10", "d12"];
const RUN_STEP_OPTIONS = [-1, 0, 1, 2, 3, 4];
const ARMOR_SECTORS = ["head", "torso", "arms", "legs"];
const ARMOR_SECTOR_NAMES = { head: "Голова", torso: "Торс", arms: "Руки", legs: "Ноги" };
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

const ENEMY_TIERS = ["Статист", "Опытный", "Капитан", "Дикая карта"];
const ENEMY_TIER_THREAT = { "Статист": 0, "Опытный": 3, "Капитан": 5, "Дикая карта": 8 };

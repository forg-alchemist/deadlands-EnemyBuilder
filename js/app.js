"use strict";

function init() {
  renderPresetOptions();
  renderStaticControls();
  bindEvents();
  render();
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

init();
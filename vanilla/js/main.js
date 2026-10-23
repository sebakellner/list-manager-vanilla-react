import {
  getState,
  addItem,
  toggleItem,
  deleteSelected,
  deleteItem,
  undo,
} from "./state.js";
import { renderList, renderControls } from "./render.js";

function $(selector) {
  return document.querySelector(selector);
}
const listEl = $("#list");
const undoBtn = $("#undo-btn");
const deleteBtn = $("#delete-btn");
const openAddBtn = $("#open-add-btn");
const overlay = $("#overlay");
const form = $("#add-form");
const input = $("#item-input");
const confirmBtn = $("#confirm-btn");
const cancelBtn = $("#cancel-btn");
let isSubmitting = false;

function render() {
  const state = getState();
  renderList(listEl, state.items);
  renderControls({ deleteBtn, undoBtn }, state);
}

function openModal() {
  input.value = "";
  confirmBtn.disabled = true;
  overlay.showModal();
}

function closeModal() {
  overlay.close();
  openAddBtn.focus();
}

function idFrom(event) {
  const li = event.target.closest(".list__item");
  return li ? li.dataset.id : null;
}

function handleItemClick(event) {
  const id = idFrom(event);
  if (id === null) return;
  toggleItem(id);
  render();
}

function handleItemDoubleClick(event) {
  const id = idFrom(event);
  if (id === null) return;
  deleteItem(id);
  render();
}

function handleItemKeyDown(event) {
  if (event.key !== " " && event.key !== "Enter") return;
  const id = idFrom(event);
  if (id === null) return;
  event.preventDefault();
  toggleItem(id);
  render();
  listEl.querySelector(`[data-id="${id}"]`)?.focus();
}

function handleDeleteSelected() {
  deleteSelected();
  render();
}

function handleUndo() {
  undo();
  render();
}

function handleOverlayClick(event) {
  if (event.target === overlay) closeModal();
}

function handleModalCancel(event) {
  event.preventDefault();
  closeModal();
}

function handleInput() {
  confirmBtn.disabled = isSubmitting || input.value.trim() === "";
}

function handleSubmit(event) {
  event.preventDefault();
  if (isSubmitting || !overlay.open) return;

  isSubmitting = true;
  confirmBtn.disabled = true;
  try {
    if (addItem(input.value)) {
      render();
      closeModal();
    }
  } finally {
    isSubmitting = false;
    confirmBtn.disabled = !overlay.open || input.value.trim() === "";
  }
}

listEl.addEventListener("click", handleItemClick);
listEl.addEventListener("dblclick", handleItemDoubleClick);
listEl.addEventListener("keydown", handleItemKeyDown);
deleteBtn.addEventListener("click", handleDeleteSelected);
undoBtn.addEventListener("click", handleUndo);
openAddBtn.addEventListener("click", openModal);
cancelBtn.addEventListener("click", closeModal);
overlay.addEventListener("click", handleOverlayClick);
overlay.addEventListener("cancel", handleModalCancel);
input.addEventListener("input", handleInput);
form.addEventListener("submit", handleSubmit);

render();

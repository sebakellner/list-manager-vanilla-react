import {
  getState,
  addItem,
  toggleItem,
  deleteSelected,
  deleteItem,
  undo,
} from "./state.js";
import { renderList, renderControls } from "./render.js";

const $ = (selector) => document.querySelector(selector);
const listEl = $("#list");
const undoBtn = $("#undo-btn");
const deleteBtn = $("#delete-btn");
const openAddBtn = $("#open-add-btn");
const overlay = $("#overlay");
const form = $("#add-form");
const input = $("#item-input");
const confirmBtn = $("#confirm-btn");
const cancelBtn = $("#cancel-btn");

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

// Lista: clic = seleccionar / deseleccionar, doble clic = eliminar ese item
const idFrom = (event) => {
  const li = event.target.closest(".list__item");
  return li ? Number(li.dataset.id) : null;
};

listEl.addEventListener("click", (event) => {
  const id = idFrom(event);
  if (id === null) return;
  toggleItem(id);
  render();
});

listEl.addEventListener("dblclick", (event) => {
  const id = idFrom(event);
  if (id === null) return;
  deleteItem(id);
  render();
});

listEl.addEventListener("keydown", (event) => {
  if (event.key !== " " && event.key !== "Enter") return;
  const id = idFrom(event);
  if (id === null) return;
  event.preventDefault();
  toggleItem(id);
  render();
  listEl.querySelector(`[data-id="${id}"]`)?.focus();
});

deleteBtn.addEventListener("click", () => {
  deleteSelected();
  render();
});
undoBtn.addEventListener("click", () => {
  undo();
  render();
});

// Modal
openAddBtn.addEventListener("click", openModal);
cancelBtn.addEventListener("click", closeModal);
overlay.addEventListener("click", (event) => {
  if (event.target === overlay) closeModal();
});
overlay.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeModal();
});
input.addEventListener("input", () => {
  confirmBtn.disabled = input.value.trim() === "";
});

form.addEventListener("submit", (event) => {
  event.preventDefault(); // Enter en el input también añade
  if (addItem(input.value)) {
    render();
    closeModal();
  }
});

render();

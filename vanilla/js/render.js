export function renderList(listEl, items) {
  // Conserva los nodos para no interrumpir el doble clic ni perder el foco.
  const existing = new Map(
    Array.from(listEl.children, (li) => [Number(li.dataset.id), li]),
  );

  items.forEach((item, index) => {
    let li = existing.get(item.id);
    if (!li) {
      li = document.createElement("li");
      li.className = "list__item";
      li.dataset.id = item.id;
      li.setAttribute("role", "option");
      li.tabIndex = 0;
    }
    li.setAttribute("aria-selected", String(item.selected));
    if (li.textContent !== item.text) li.textContent = item.text;
    if (listEl.children[index] !== li) {
      listEl.insertBefore(li, listEl.children[index] ?? null);
    }
    existing.delete(item.id);
  });

  existing.forEach((li) => li.remove());
}

export function renderControls(
  { deleteBtn, undoBtn },
  { hasSelection, canUndo },
) {
  deleteBtn.disabled = !hasSelection;
  undoBtn.disabled = !canUndo;
}

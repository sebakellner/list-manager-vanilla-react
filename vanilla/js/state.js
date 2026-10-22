let items = ["Item 1", "Item 2", "Item 3", "Item 4"].map((text, i) => ({
  id: i + 1,
  text,
  selected: false,
}));
let nextId = items.length + 1;
const history = [];

const snapshot = () => history.push(items.map((item) => ({ ...item })));

export const getState = () => ({
  items,
  hasSelection: items.some((item) => item.selected),
  canUndo: history.length > 0,
});

export function addItem(text) {
  const clean = text.trim();
  if (!clean) return false;
  snapshot();
  items = [...items, { id: nextId++, text: clean, selected: false }];
  return true;
}

export function toggleItem(id) {
  items = items.map((item) =>
    item.id === id ? { ...item, selected: !item.selected } : item,
  );
}

export function deleteSelected() {
  if (!items.some((item) => item.selected)) return;
  snapshot();
  items = items.filter((item) => !item.selected);
}

export function deleteItem(id) {
  const nextItems = items.filter((item) => item.id !== id);
  if (nextItems.length !== items.length) {
    snapshot();
    items = nextItems;
  }
}

export function undo() {
  if (history.length) items = history.pop();
}

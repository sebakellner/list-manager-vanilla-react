let items = ["Item 1", "Item 2", "Item 3", "Item 4"].map(
  function createInitialItem(text) {
    return { id: crypto.randomUUID(), text, selected: false };
  },
);
const history = [];

function snapshot() {
  history.push(items.map(function copyItem(item) {
    return { ...item };
  }));
}

function isSelected(item) {
  return item.selected;
}

export function getState() {
  return {
    items,
    hasSelection: items.some(isSelected),
    canUndo: history.length > 0,
  };
}

export function addItem(text) {
  const clean = text.trim();
  if (!clean) return false;
  snapshot();
  items = [...items, { id: crypto.randomUUID(), text: clean, selected: false }];
  return true;
}

export function toggleItem(id) {
  items = items.map(function toggleMatchingItem(item) {
    return item.id === id ? { ...item, selected: !item.selected } : item;
  });
}

export function deleteSelected() {
  if (!items.some(isSelected)) return;
  snapshot();
  items = items.filter(function isUnselected(item) {
    return !item.selected;
  });
}

export function deleteItem(id) {
  const nextItems = items.filter(function isNotDeletedItem(item) {
    return item.id !== id;
  });
  if (nextItems.length !== items.length) {
    snapshot();
    items = nextItems;
  }
}

export function undo() {
  if (history.length) items = history.pop();
}

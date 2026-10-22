import { useRef, useState } from "react";

export interface ListItem {
  id: number;
  text: string;
  selected: boolean;
}

// Misma lógica que vanilla/js/state.js: items + pila de historial para deshacer.
export function useItemList(initialTexts: string[]) {
  const nextId = useRef(initialTexts.length + 1);
  const [items, setItems] = useState<ListItem[]>(() =>
    initialTexts.map((text, i) => ({ id: i + 1, text, selected: false }))
  );
  const [history, setHistory] = useState<ListItem[][]>([]);

  const commit = (nextItems: ListItem[]) => {
    setHistory((h) => [...h, items]);
    setItems(nextItems);
  };

  const addItem = (text: string) => {
    const clean = text.trim();
    if (!clean) return false;
    commit([...items, { id: nextId.current++, text: clean, selected: false }]);
    return true;
  };

  const toggleItem = (id: number) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, selected: !i.selected } : i)));

  const deleteSelected = () => {
    if (items.some((i) => i.selected)) commit(items.filter((i) => !i.selected));
  };

  const deleteItem = (id: number) => {
    const nextItems = items.filter((i) => i.id !== id);
    if (nextItems.length !== items.length) commit(nextItems);
  };

  const undo = () => {
    const previousItems = history.at(-1);
    if (!previousItems) return;
    setItems(previousItems);
    setHistory(history.slice(0, -1));
  };

  return {
    items,
    hasSelection: items.some((i) => i.selected),
    canUndo: history.length > 0,
    addItem,
    toggleItem,
    deleteSelected,
    deleteItem,
    undo,
  };
}

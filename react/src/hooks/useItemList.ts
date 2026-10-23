import { useState } from "react";

export interface ListItem {
  id: string;
  text: string;
  selected: boolean;
}

export function useItemList(initialTexts: string[]) {
  const [items, setItems] = useState<ListItem[]>(() =>
    initialTexts.map((text) => ({ id: crypto.randomUUID(), text, selected: false }))
  );
  const [history, setHistory] = useState<ListItem[][]>([]);

  const commit = (nextItems: ListItem[]) => {
    setHistory((h) => [...h, items]);
    setItems(nextItems);
  };

  const addItem = (text: string): void => {
    const clean = text.trim();
    if (!clean) return;
    commit([...items, { id: crypto.randomUUID(), text: clean, selected: false }]);
  };

  const toggleItem = (id: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, selected: !i.selected } : i)));

  const deleteSelected = () => {
    if (items.some((i) => i.selected)) commit(items.filter((i) => !i.selected));
  };

  const deleteItem = (id: string) => {
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

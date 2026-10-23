import { act, renderHook } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { useItemList } from "../useItemList";

function setup(initialTexts = ["First item", "Second item"]) {
  return renderHook(() => useItemList(initialTexts));
}

describe("useItemList", () => {
  test("should initialize unselected items with unique ids and no history", () => {
    const { result } = setup();

    expect(result.current.items).toEqual([
      { id: 1, text: "First item", selected: false },
      { id: 2, text: "Second item", selected: false },
    ]);
    expect(result.current.hasSelection).toBe(false);
    expect(result.current.canUndo).toBe(false);
  });

  test("should support an empty initial list and undo its first addition", () => {
    const { result } = setup([]);

    expect(result.current.items).toEqual([]);
    expect(result.current.hasSelection).toBe(false);
    expect(result.current.canUndo).toBe(false);

    act(() => {
      result.current.addItem("First item");
    });

    expect(result.current.items).toEqual([
      { id: 1, text: "First item", selected: false },
    ]);

    act(() => {
      result.current.undo();
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.canUndo).toBe(false);
  });

  test("should trim added text, return success, and enable undo", () => {
    const { result } = setup();

    act(() => {
      expect(result.current.addItem("  New item  ")).toBe(true);
    });

    expect(result.current.items).toEqual([
      { id: 1, text: "First item", selected: false },
      { id: 2, text: "Second item", selected: false },
      { id: 3, text: "New item", selected: false },
    ]);
    expect(result.current.hasSelection).toBe(false);
    expect(result.current.canUndo).toBe(true);
  });

  test.each(["", "   ", "\t\n"])(
    "should reject blank input %j without changing items or history",
    (text) => {
      const { result } = setup();
      const initialItems = result.current.items;

      act(() => {
        expect(result.current.addItem(text)).toBe(false);
      });

      expect(result.current.items).toEqual(initialItems);
      expect(result.current.canUndo).toBe(false);

      act(() => {
        result.current.addItem("Valid item");
      });

      expect(result.current.items.at(-1)?.id).toBe(3);
    },
  );

  test("should toggle multiple selections independently without creating history", () => {
    const { result } = setup();

    act(() => {
      result.current.toggleItem(1);
    });

    expect(result.current.items).toEqual([
      { id: 1, text: "First item", selected: true },
      { id: 2, text: "Second item", selected: false },
    ]);
    expect(result.current.hasSelection).toBe(true);

    act(() => {
      result.current.toggleItem(2);
    });
    act(() => {
      result.current.toggleItem(1);
    });

    expect(result.current.items).toEqual([
      { id: 1, text: "First item", selected: false },
      { id: 2, text: "Second item", selected: true },
    ]);
    expect(result.current.hasSelection).toBe(true);

    act(() => {
      result.current.toggleItem(2);
    });

    expect(result.current.hasSelection).toBe(false);
    expect(result.current.canUndo).toBe(false);
  });

  test("should delete selected items and restore their selection when undoing", () => {
    const { result } = setup(["First item", "Second item", "Third item"]);

    act(() => {
      result.current.toggleItem(1);
      result.current.toggleItem(3);
    });
    const selectedItems = result.current.items;

    act(() => {
      result.current.deleteSelected();
    });

    expect(result.current.items).toEqual([
      { id: 2, text: "Second item", selected: false },
    ]);
    expect(result.current.hasSelection).toBe(false);
    expect(result.current.canUndo).toBe(true);

    act(() => {
      result.current.undo();
    });

    expect(result.current.items).toEqual(selectedItems);
    expect(result.current.hasSelection).toBe(true);
    expect(result.current.canUndo).toBe(false);
  });

  test("should delete an individual item without requiring selection", () => {
    const { result } = setup();

    act(() => {
      result.current.deleteItem(1);
    });

    expect(result.current.items).toEqual([
      { id: 2, text: "Second item", selected: false },
    ]);
    expect(result.current.canUndo).toBe(true);
  });

  test.each(["deleteItem", "toggleItem"] as const)(
    "should ignore unknown ids in %s without changing items or history",
    (action) => {
      const { result } = setup();
      const initialItems = result.current.items;

      act(() => {
        result.current[action](999);
      });

      expect(result.current.items).toEqual(initialItems);
      expect(result.current.hasSelection).toBe(false);
      expect(result.current.canUndo).toBe(false);
    },
  );

  test.each(["deleteSelected", "undo"] as const)(
    "should leave the initial state unchanged when %s has nothing to do",
    (action) => {
      const { result } = setup();
      const initialItems = result.current.items;

      act(() => {
        result.current[action]();
      });

      expect(result.current.items).toEqual(initialItems);
      expect(result.current.canUndo).toBe(false);
    },
  );

  test("should undo additions and deletions in reverse order until history is empty", () => {
    const { result } = setup();
    const initialItems = result.current.items;

    act(() => {
      result.current.addItem("New item");
    });
    const itemsAfterAddition = result.current.items;

    act(() => {
      result.current.deleteItem(1);
    });
    act(() => {
      result.current.undo();
    });

    expect(result.current.items).toEqual(itemsAfterAddition);
    expect(result.current.canUndo).toBe(true);

    act(() => {
      result.current.undo();
    });

    expect(result.current.items).toEqual(initialItems);
    expect(result.current.canUndo).toBe(false);
  });

  test("should not add history entries for rejected additions or missing deletions", () => {
    const { result } = setup();
    const initialItems = result.current.items;

    act(() => {
      result.current.addItem("New item");
    });
    act(() => {
      result.current.addItem(" ");
      result.current.deleteItem(999);
      result.current.deleteSelected();
    });
    act(() => {
      result.current.undo();
    });

    expect(result.current.items).toEqual(initialItems);
    expect(result.current.canUndo).toBe(false);
  });

  test("should keep ids increasing after deletion and undo", () => {
    const { result } = setup([]);

    act(() => {
      result.current.addItem("First item");
    });
    act(() => {
      result.current.deleteItem(1);
    });
    act(() => {
      result.current.addItem("Second item");
    });

    expect(result.current.items.at(-1)?.id).toBe(2);

    act(() => {
      result.current.undo();
    });
    act(() => {
      result.current.addItem("Third item");
    });

    expect(result.current.items).toEqual([
      { id: 3, text: "Third item", selected: false },
    ]);
  });
});

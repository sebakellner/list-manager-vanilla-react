import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from "vitest";
import { useItemList } from "../useItemList";

const FIRST_ID = "00000000-0000-4000-8000-000000000001";
const SECOND_ID = "00000000-0000-4000-8000-000000000002";
const THIRD_ID = "00000000-0000-4000-8000-000000000003";
const UNKNOWN_ID = "00000000-0000-4000-8000-000000000999";

function setup(initialTexts = ["First item", "Second item"]) {
  return renderHook(() => useItemList(initialTexts));
}

describe("useItemList", () => {
  beforeEach(() => {
    vi.spyOn(crypto, "randomUUID")
      .mockReturnValueOnce(FIRST_ID)
      .mockReturnValueOnce(SECOND_ID)
      .mockReturnValueOnce(THIRD_ID);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("should initialize unselected items with unique ids and no history", () => {
    const { result } = setup();

    expect(result.current.items).toEqual([
      { id: FIRST_ID, text: "First item", selected: false },
      { id: SECOND_ID, text: "Second item", selected: false },
    ]);
    expect(crypto.randomUUID).toHaveBeenCalledTimes(2);
    expect(result.current.hasSelection).toBe(false);
    expect(result.current.canUndo).toBe(false);
  });

  test("should preserve initial UUIDs across rerenders without generating new ids", () => {
    const { result, rerender } = setup();
    const initialItems = result.current.items;

    rerender();

    expect(result.current.items).toEqual(initialItems);
    expect(crypto.randomUUID).toHaveBeenCalledTimes(2);
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
      { id: FIRST_ID, text: "First item", selected: false },
    ]);

    act(() => {
      result.current.undo();
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.canUndo).toBe(false);
  });

  test("should trim added text, return void, and enable undo", () => {
    const { result } = setup();
    expectTypeOf(result.current.addItem).returns.toBeVoid();

    act(() => {
      expect(result.current.addItem("  New item  ")).toBeUndefined();
    });

    expect(result.current.items).toEqual([
      { id: FIRST_ID, text: "First item", selected: false },
      { id: SECOND_ID, text: "Second item", selected: false },
      { id: THIRD_ID, text: "New item", selected: false },
    ]);
    expect(crypto.randomUUID).toHaveBeenCalledTimes(3);
    expect(result.current.hasSelection).toBe(false);
    expect(result.current.canUndo).toBe(true);
  });

  test.each(["", "   ", "\t\n"])(
    "should reject blank input %j without changing items or history",
    (text) => {
      const { result } = setup();
      const initialItems = result.current.items;

      act(() => {
        expect(result.current.addItem(text)).toBeUndefined();
      });

      expect(result.current.items).toEqual(initialItems);
      expect(result.current.canUndo).toBe(false);
      expect(crypto.randomUUID).toHaveBeenCalledTimes(2);

      act(() => {
        result.current.addItem("Valid item");
      });

      expect(result.current.items.at(-1)?.id).toBe(THIRD_ID);
    },
  );

  test("should toggle multiple selections independently without creating history", () => {
    const { result } = setup();

    act(() => {
      result.current.toggleItem(FIRST_ID);
    });

    expect(result.current.items).toEqual([
      { id: FIRST_ID, text: "First item", selected: true },
      { id: SECOND_ID, text: "Second item", selected: false },
    ]);
    expect(result.current.hasSelection).toBe(true);

    act(() => {
      result.current.toggleItem(SECOND_ID);
    });
    act(() => {
      result.current.toggleItem(FIRST_ID);
    });

    expect(result.current.items).toEqual([
      { id: FIRST_ID, text: "First item", selected: false },
      { id: SECOND_ID, text: "Second item", selected: true },
    ]);
    expect(result.current.hasSelection).toBe(true);

    act(() => {
      result.current.toggleItem(SECOND_ID);
    });

    expect(result.current.hasSelection).toBe(false);
    expect(result.current.canUndo).toBe(false);
  });

  test("should delete selected items and restore their selection when undoing", () => {
    const { result } = setup(["First item", "Second item", "Third item"]);

    act(() => {
      result.current.toggleItem(FIRST_ID);
      result.current.toggleItem(THIRD_ID);
    });
    const selectedItems = result.current.items;

    act(() => {
      result.current.deleteSelected();
    });

    expect(result.current.items).toEqual([
      { id: SECOND_ID, text: "Second item", selected: false },
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
      result.current.deleteItem(FIRST_ID);
    });

    expect(result.current.items).toEqual([
      { id: SECOND_ID, text: "Second item", selected: false },
    ]);
    expect(result.current.canUndo).toBe(true);
  });

  test.each(["deleteItem", "toggleItem"] as const)(
    "should ignore unknown ids in %s without changing items or history",
    (action) => {
      const { result } = setup();
      const initialItems = result.current.items;

      act(() => {
        result.current[action](UNKNOWN_ID);
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
      result.current.deleteItem(FIRST_ID);
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
      result.current.deleteItem(UNKNOWN_ID);
      result.current.deleteSelected();
    });
    act(() => {
      result.current.undo();
    });

    expect(result.current.items).toEqual(initialItems);
    expect(result.current.canUndo).toBe(false);
  });

  test("should generate a fresh UUID after deletion and undo without reusing ids", () => {
    const { result } = setup([]);

    act(() => {
      result.current.addItem("First item");
    });
    act(() => {
      result.current.deleteItem(FIRST_ID);
    });
    act(() => {
      result.current.addItem("Second item");
    });

    expect(result.current.items.at(-1)?.id).toBe(SECOND_ID);

    act(() => {
      result.current.undo();
    });
    act(() => {
      result.current.addItem("Third item");
    });

    expect(result.current.items).toEqual([
      { id: THIRD_ID, text: "Third item", selected: false },
    ]);
    expect(crypto.randomUUID).toHaveBeenCalledTimes(3);
  });
});

import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import Toolbar from "../Toolbar";

function setup({ canUndo = false, hasSelection = false } = {}) {
  const user = userEvent.setup();
  const onUndo = vi.fn();
  const onDelete = vi.fn();
  const onAdd = vi.fn();
  const addRef = createRef<HTMLButtonElement>();

  render(
    <Toolbar
      canUndo={canUndo}
      hasSelection={hasSelection}
      onUndo={onUndo}
      onDelete={onDelete}
      onAdd={onAdd}
      addRef={addRef}
    />,
  );

  return { user, onUndo, onDelete, onAdd, addRef };
}

describe("Toolbar", () => {
  test("should disable actions when undo is unavailable and nothing is selected", () => {
    setup();

    expect(screen.getByRole("button", { name: "Undo last change" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Add" })).toBeEnabled();
  });

  test("should call the enabled action handlers and attach the add-button ref", async () => {
    const { user, onUndo, onDelete, onAdd, addRef } = setup({
      canUndo: true,
      hasSelection: true,
    });

    await user.click(screen.getByRole("button", { name: "Undo last change" }));
    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(onUndo).toHaveBeenCalledOnce();
    expect(onDelete).toHaveBeenCalledOnce();
    expect(onAdd).toHaveBeenCalledOnce();
    expect(addRef.current).toBe(screen.getByRole("button", { name: "Add" }));
  });
});

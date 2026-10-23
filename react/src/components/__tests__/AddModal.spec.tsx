import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import AddModal from "../AddModal";

function setup({ acceptsItem = true } = {}) {
  const user = userEvent.setup();
  const onAdd = vi.fn(() => acceptsItem);
  const onClose = vi.fn();
  render(<AddModal onAdd={onAdd} onClose={onClose} />);

  return { user, onAdd, onClose };
}

describe("AddModal", () => {
  test("should submit the entered text and close when the item is accepted", async () => {
    const { user, onAdd, onClose } = setup();

    await user.type(
      screen.getByRole("textbox", { name: "Add item to list" }),
      "  New item  ",
    );
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(onAdd).toHaveBeenCalledWith("  New item  ");
    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("should keep the modal open when adding is rejected", async () => {
    const { user, onAdd, onClose } = setup({ acceptsItem: false });

    await user.type(
      screen.getByRole("textbox", { name: "Add item to list" }),
      "Duplicate",
    );
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(onAdd).toHaveBeenCalledWith("Duplicate");
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  test("should disable submission for blank input and close on cancel", async () => {
    const { user, onClose } = setup();

    expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  test("should close when the backdrop is clicked", async () => {
    const { user, onClose } = setup();

    await user.click(screen.getByRole("dialog"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  test("should close on the dialog cancel event", () => {
    const { onClose } = setup();
    const dialog = screen.getByRole("dialog");

    // JSDOM does not generate the native cancel event when Escape is pressed.
    fireEvent(dialog, new Event("cancel", { bubbles: false, cancelable: true }));

    expect(onClose).toHaveBeenCalledOnce();
  });
});

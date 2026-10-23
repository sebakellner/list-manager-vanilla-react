import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import AddModal from "../AddModal";

function setup({
  acceptsItem = true,
  addResult,
}: { acceptsItem?: boolean; addResult?: Promise<boolean> } = {}) {
  const user = userEvent.setup();
  const onAdd = vi.fn(() => addResult ?? acceptsItem);
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
    expect(onAdd).toHaveBeenCalledOnce();
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
    expect(screen.getByRole("button", { name: "Add" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(onAdd).toHaveBeenCalledTimes(2);
    expect(onClose).not.toHaveBeenCalled();
  });

  test.each([true, false])(
    "should disable Add and prevent repeated submits until adding resolves to %s",
    async (accepted) => {
      let resolveAddition!: (value: boolean) => void;
      const addResult = new Promise<boolean>((resolve) => {
        resolveAddition = resolve;
      });
      const { user, onAdd, onClose } = setup({ addResult });
      const input = screen.getByRole("textbox");
      const addButton = screen.getByRole("button", { name: "Add" });

      await user.type(input, "New item");
      await user.dblClick(addButton);

      expect(addButton).toBeDisabled();
      expect(addButton).toHaveAttribute("aria-busy", "true");
      expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();
      expect(onAdd).toHaveBeenCalledOnce();
      expect(onClose).not.toHaveBeenCalled();

      await user.click(input);
      await user.keyboard("{Enter}{Enter}");
      const form = input.closest("form");
      if (!form) throw new Error("Add form is not mounted");
      act(() => {
        form.requestSubmit();
      });

      expect(onAdd).toHaveBeenCalledOnce();

      await act(async () => {
        resolveAddition(accepted);
        await addResult;
      });

      if (accepted) {
        expect(onClose).toHaveBeenCalledOnce();
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      } else {
        expect(onClose).not.toHaveBeenCalled();
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(addButton).toBeEnabled();
        expect(addButton).not.toHaveAttribute("aria-busy");
      }
    },
  );

  test("should not close twice when a pending addition finishes after cancellation", async () => {
    let resolveAddition!: (value: boolean) => void;
    const addResult = new Promise<boolean>((resolve) => {
      resolveAddition = resolve;
    });
    const { user, onClose } = setup({ addResult });

    await user.type(screen.getByRole("textbox"), "New item");
    await user.click(screen.getByRole("button", { name: "Add" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledOnce();

    await act(async () => {
      resolveAddition(true);
      await addResult;
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Add", hidden: true })).toBeEnabled();
    });
    expect(onClose).toHaveBeenCalledOnce();
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

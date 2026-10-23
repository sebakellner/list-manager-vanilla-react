import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

async function setup(page: Page) {
  await page.goto("./");

  return {
    list: page.getByRole("listbox"),
    addButton: page.getByRole("main").getByRole("button", { name: "Add", exact: true }),
    deleteButton: page.getByRole("button", { name: "Delete", exact: true }),
    undoButton: page.getByRole("button", { name: "Undo last change", exact: true }),
    dialog: page.getByRole("dialog"),
  };
}

test.describe("App", () => {
  test("should load the app with initial items and disabled destructive actions", async ({ page }) => {
    const { list, addButton, deleteButton, undoButton } = await setup(page);

    await expect(list.getByRole("option")).toHaveCount(4);
    await expect(addButton).toBeEnabled();
    await expect(deleteButton).toBeDisabled();
    await expect(undoButton).toBeDisabled();
  });

  test("should add an item with Enter, delete it, and undo both changes", async ({ page }) => {
    const { list, addButton, deleteButton, undoButton, dialog } = await setup(page);
    const text = "New item";
    const addedItem = list.getByRole("option", { name: text, exact: true });

    await addButton.click();
    const input = dialog.getByRole("textbox");
    await expect(input).toBeFocused();
    await expect(dialog.getByRole("button", { name: "Add", exact: true })).toBeDisabled();
    await input.fill(`  ${text}  `);
    await input.press("Enter");

    await expect(dialog).not.toBeVisible();
    await expect(addButton).toBeFocused();
    await expect(addedItem).toHaveText(text);
    await expect(list.getByRole("option")).toHaveCount(5);

    await addedItem.click();
    await expect(addedItem).toHaveAttribute("aria-selected", "true");
    await deleteButton.click();
    await expect(addedItem).toHaveCount(0);

    await undoButton.click();
    await expect(addedItem).toHaveAttribute("aria-selected", "true");
    await undoButton.click();
    await expect(addedItem).toHaveCount(0);
    await expect(list.getByRole("option")).toHaveCount(4);
    await expect(undoButton).toBeDisabled();
  });

  test("should dismiss the native dialog with Escape and restore focus", async ({ page }) => {
    const { list, addButton, undoButton, dialog } = await setup(page);

    await addButton.click();
    await dialog.getByRole("textbox").fill("Discarded item");
    await dialog.getByRole("textbox").press("Escape");

    await expect(dialog).not.toBeVisible();
    await expect(addButton).toBeFocused();
    await expect(list.getByRole("option")).toHaveCount(4);
    await expect(undoButton).toBeDisabled();
  });

  test("should add only one item on double click and allow adding after reopening", async ({ page }) => {
    const { list, addButton, undoButton, dialog } = await setup(page);
    const text = "Single addition";
    const addedItem = list.getByRole("option", { name: text, exact: true });

    await addButton.click();
    await dialog.getByRole("textbox").fill(text);
    await dialog.getByRole("button", { name: "Add", exact: true }).dblclick();

    await expect(dialog).not.toBeVisible();
    await expect(addedItem).toHaveCount(1);
    await expect(list.getByRole("option")).toHaveCount(5);

    await undoButton.click();
    await expect(addedItem).toHaveCount(0);
    await expect(undoButton).toBeDisabled();

    await addButton.click();
    const input = dialog.getByRole("textbox");
    await expect(input).toHaveValue("");
    await input.fill(text);
    await input.press("Enter");

    await expect(addedItem).toHaveCount(1);
    await expect(list.getByRole("option")).toHaveCount(5);
  });

  test("should preserve keyboard focus and support double-click deletion with string ids", async ({ page }) => {
    const { list, undoButton } = await setup(page);
    const text = await list.getByRole("option").first().innerText();
    const item = list.getByRole("option", { name: text, exact: true });

    await item.focus();
    await item.press("Space");
    await expect(item).toHaveAttribute("aria-selected", "true");
    await expect(item).toBeFocused();

    await item.press("Enter");
    await expect(item).toHaveAttribute("aria-selected", "false");
    await expect(item).toBeFocused();
    await expect(undoButton).toBeDisabled();

    await item.dblclick();
    await expect(item).toHaveCount(0);
    await expect(list.getByRole("option")).toHaveCount(3);

    await undoButton.click();
    await expect(item).toBeVisible();
    await expect(list.getByRole("option")).toHaveCount(4);
    await expect(undoButton).toBeDisabled();
  });
});

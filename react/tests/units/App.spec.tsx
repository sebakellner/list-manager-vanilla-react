import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import App from "../../src/App";

function setup() {
  const user = userEvent.setup();
  render(<App />);

  return { user };
}

describe("App", () => {
  test("should add an item, delete a selection, and undo the deletion", async () => {
    const { user } = setup();

    expect(screen.getAllByRole("option")).toHaveLength(4);

    await user.click(screen.getByRole("button", { name: "Add" }));
    const dialog = screen.getByRole("dialog", { name: "Add item to list" });
    await user.type(
      within(dialog).getByRole("textbox"),
      "New item",
    );
    await user.click(within(dialog).getByRole("button", { name: "Add" }));
    expect(screen.getByRole("option", { name: "New item" })).toBeInTheDocument();

    await user.click(screen.getByRole("option", { name: "New item" }));
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(
      screen.queryByRole("option", { name: "New item" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Undo last change" }));
    expect(screen.getByRole("option", { name: "New item" })).toBeInTheDocument();
  });
});

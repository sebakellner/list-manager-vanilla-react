import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import type { ListItem } from "../../hooks/useItemList";
import ItemList from "../ItemList";

const items: ListItem[] = [
  { id: crypto.randomUUID(), text: "First item", selected: false },
  { id: crypto.randomUUID(), text: "Second item", selected: true },
];

function setup() {
  const user = userEvent.setup();
  const onToggle = vi.fn();
  const onDelete = vi.fn();
  render(<ItemList items={items} onToggle={onToggle} onDelete={onDelete} />);

  return { user, onToggle, onDelete };
}

describe("ItemList", () => {
  test("should render items with their selected state", () => {
    setup();

    const list = screen.getByRole("listbox", { name: "Items" });
    expect(within(list).getAllByRole("option")).toHaveLength(2);
    expect(
      within(list).getByRole("option", { name: "First item" }),
    ).toHaveAttribute("aria-selected", "false");
    expect(
      within(list).getByRole("option", { name: "Second item" }),
    ).toHaveAttribute("aria-selected", "true");
  });

  test("should toggle an item on click or keyboard activation", async () => {
    const { user, onToggle } = setup();

    const firstItem = screen.getByRole("option", { name: "First item" });
    await user.click(firstItem);
    expect(onToggle).toHaveBeenLastCalledWith(items[0]?.id);

    await user.keyboard("{Enter}");
    expect(onToggle).toHaveBeenLastCalledWith(items[0]?.id);

    await user.keyboard(" ");
    expect(onToggle).toHaveBeenCalledTimes(3);
  });

  test("should delete an item on double click", async () => {
    const { user, onDelete } = setup();

    await user.dblClick(screen.getByRole("option", { name: "Second item" }));

    expect(onDelete).toHaveBeenCalledOnce();
    expect(onDelete).toHaveBeenCalledWith(items[1]?.id);
  });
});

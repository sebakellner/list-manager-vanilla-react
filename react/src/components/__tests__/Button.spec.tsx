import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import Button from "../Button";

function setup(props: Partial<ComponentProps<typeof Button>> = {}) {
  const user = userEvent.setup();
  const onClick = vi.fn();
  render(<Button onClick={onClick} {...props}>Save</Button>);

  return { user, onClick, button: screen.getByRole("button", { name: "Save" }) };
}

describe("Button", () => {
  test("should use the default outline style and button type", () => {
    const { button } = setup({ className: "custom" });

    expect(button).toHaveClass("btn", "custom");
    expect(button).not.toHaveClass("btn--outline");
    expect(button).toHaveAttribute("type", "button");
  });

  test("should apply the requested variant and forward clicks", async () => {
    const { user, onClick, button } = setup({ variant: "primary", type: "submit" });

    expect(button).toHaveClass("btn", "btn--primary");
    expect(button).toHaveAttribute("type", "submit");

    await user.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });
});

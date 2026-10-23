import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import Button from "../Button";

function setup(props: Partial<ComponentProps<typeof Button>> = {}) {
  const user = userEvent.setup();
  const onClick = vi.fn();
  const view = render(<Button onClick={onClick} {...props}>Save</Button>);

  return { ...view, user, onClick, button: screen.getByRole("button", { name: "Save" }) };
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

  test("should show loading and block clicks while busy without changing its accessible name", async () => {
    const { user, onClick, button } = setup({ busy: true, disabled: false });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).not.toHaveAttribute("busy");
    expect(button.querySelector(".btn__spinner")).toHaveAttribute("aria-hidden", "true");
    expect(button).toHaveAccessibleName("Save");

    await user.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });

  test("should remove loading and restore clicks when busy finishes", async () => {
    const { user, onClick, button, rerender } = setup({ busy: true });

    rerender(<Button busy={false} onClick={onClick}>Save</Button>);

    expect(button).toBeEnabled();
    expect(button).not.toHaveAttribute("aria-busy");
    expect(button.querySelector(".btn__spinner")).not.toBeInTheDocument();

    await user.click(button);

    expect(onClick).toHaveBeenCalledOnce();
  });

  test("should keep an explicitly disabled button disabled after loading finishes", () => {
    const { button, rerender } = setup({ busy: true, disabled: true });

    rerender(<Button busy={false} disabled>Save</Button>);

    expect(button).toBeDisabled();
    expect(button).not.toHaveAttribute("aria-busy");
  });
});

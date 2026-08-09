import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChatComposer from "../ChatComposer";

function setup(value = "") {
  const onChange = vi.fn();
  const onSubmit = vi.fn();
  render(<ChatComposer value={value} onChange={onChange} onSubmit={onSubmit} />);
  return { onChange, onSubmit };
}

describe("ChatComposer", () => {
  it("does not call onSubmit for empty value", async () => {
    const user = userEvent.setup();
    const { onSubmit } = setup("");
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("does not call onSubmit for whitespace-only value", async () => {
    const user = userEvent.setup();
    const { onSubmit } = setup("   ");
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("calls onSubmit with trimmed value", async () => {
    const user = userEvent.setup();
    const { onSubmit } = setup("  hello  ");
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(onSubmit).toHaveBeenCalledWith("hello");
  });
});

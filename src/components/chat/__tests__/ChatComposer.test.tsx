import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
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

  it("sends on Enter", async () => {
    const user = userEvent.setup();
    const { onSubmit } = setup("hello");
    const input = screen.getByPlaceholderText(/Type a message/);
    await user.click(input);
    await user.keyboard("{Enter}");
    expect(onSubmit).toHaveBeenCalledWith("hello");
  });

  it("inserts a newline on Shift+Enter without submitting", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    function Controlled() {
      const [v, setV] = useState("line1");
      return <ChatComposer value={v} onChange={setV} onSubmit={onSubmit} />;
    }
    render(<Controlled />);
    const input = screen.getByPlaceholderText(/Type a message/);
    await user.click(input);
    await user.keyboard("{Shift>}{Enter}{/Shift}");
    expect(onSubmit).not.toHaveBeenCalled();
    expect((input as HTMLTextAreaElement).value).toContain("\n");
  });

  it("does not submit on Enter for empty value", async () => {
    const user = userEvent.setup();
    const { onSubmit } = setup("");
    const input = screen.getByPlaceholderText(/Type a message/);
    await user.click(input);
    await user.keyboard("{Enter}");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("blocks typing and submit while disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onSubmit = vi.fn();
    render(<ChatComposer value="x" onChange={onChange} onSubmit={onSubmit} disabled />);
    const input = screen.getByPlaceholderText(/Type a message/);
    await user.type(input, " more");
    expect(onChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("has a fixed resizable textarea that does not auto-grow", async () => {
    const { container } = render(<ChatComposer value="a" onChange={() => {}} onSubmit={() => {}} />);
    const input = container.querySelector("textarea") as HTMLTextAreaElement;
    expect(input.className).toContain("resize-y");
    expect(input.className).not.toContain("resize-none");
    expect(input.style.height).toBe("");
  });
});
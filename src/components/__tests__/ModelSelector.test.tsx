import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ModelSelector, { RESEARCH_MODELS, getActiveModel } from "../ModelSelector";

describe("ModelSelector", () => {
  it("exposes an input and output price for every model", () => {
    expect(RESEARCH_MODELS.length).toBeGreaterThan(0);
    for (const m of RESEARCH_MODELS) {
      expect(typeof m.priceIn).toBe("number");
      expect(typeof m.priceOut).toBe("number");
      expect(m.id).toBeTruthy();
    }
  });

  it("renders grouped options with an accessible research-model select", () => {
    const model = RESEARCH_MODELS[1];
    render(<ModelSelector value={model.id} onChange={() => {}} />);
    expect(screen.getByRole("combobox", { name: "Research model" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: model.label })).toBeInTheDocument();
  });

  it("renders a compact inline select without the stacked label/price column", () => {
    render(<ModelSelector value={null} onChange={() => {}} />);
    const select = screen.getByRole("combobox", { name: "Research model" });
    expect(select.className).toContain("h-11");
  });

  it("resolves the active model for the price caption via getActiveModel", () => {
    const active = getActiveModel(null); // null -> Default fallback
    expect(active).not.toBeNull();
    expect(active!.id).toBe("openai/gpt-5.6-luna");
    expect(typeof active!.priceIn).toBe("number");
    expect(typeof active!.priceOut).toBe("number");
  });

  it("shows English category labels", () => {
    render(<ModelSelector value={null} onChange={() => {}} />);
    expect(screen.getByRole("group", { name: "Budget" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Latest" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Reasoning" })).toBeInTheDocument();
  });
});

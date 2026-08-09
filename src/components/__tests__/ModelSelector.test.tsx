import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ModelSelector, { RESEARCH_MODELS } from "../ModelSelector";

describe("ModelSelector", () => {
  it("exposes an input and output price for every model", () => {
    expect(RESEARCH_MODELS.length).toBeGreaterThan(0);
    for (const m of RESEARCH_MODELS) {
      expect(typeof m.priceIn).toBe("number");
      expect(typeof m.priceOut).toBe("number");
      expect(m.id).toBeTruthy();
    }
  });

  it("renders grouped options with a price caption for the current selection", () => {
    const model = RESEARCH_MODELS[1];
    render(<ModelSelector value={model.id} onChange={() => {}} />);
    expect(
      screen.getByText(new RegExp(`\\$${model.priceIn} in`)),
    ).toBeInTheDocument();
    expect(screen.getByRole("option", { name: model.label })).toBeInTheDocument();
  });

  it("renders the price caption for the default (null) selection too", () => {
    render(<ModelSelector value={null} onChange={() => {}} />);
    expect(screen.getByText(/in \/ \$.*out/i)).toBeInTheDocument();
  });
});

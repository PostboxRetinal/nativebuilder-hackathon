import { describe, expect, it } from "vitest";
import { PASSWORD_CHECKS, isPasswordValid } from "../../lib/password";

describe("isPasswordValid", () => {
  it("rejects a short password", () => {
    expect(isPasswordValid("Ab1!def")).toBe(false); // 7 chars
  });

  it("rejects a password without uppercase", () => {
    expect(isPasswordValid("abc1!defg")).toBe(false);
  });

  it("rejects a password without lowercase", () => {
    expect(isPasswordValid("ABCD1!EFG")).toBe(false);
  });

  it("rejects a password without a number", () => {
    expect(isPasswordValid("Abcdef!gh")).toBe(false);
  });

  it("rejects a password without a special character", () => {
    expect(isPasswordValid("Abcdef1gh")).toBe(false);
  });

  it("accepts a valid password", () => {
    expect(isPasswordValid("Abcdef1!g")).toBe(true);
  });

  it("treats every check object consistently", () => {
    const good = "Abcdef1!g";
    for (const check of PASSWORD_CHECKS) {
      expect(check.test(good)).toBe(true);
    }
  });
});

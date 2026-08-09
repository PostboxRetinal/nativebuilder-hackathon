import { afterEach, describe, expect, it, vi } from "vitest";

const store: Record<string, string> = {};

vi.stubGlobal("localStorage", {
  getItem: (k: string) => (k in store ? store[k] : null),
  setItem: (k: string, v: string) => {
    store[k] = v;
  },
});

afterEach(() => {
  Object.keys(store).forEach((k) => delete store[k]);
});

// Import the module in each test so it reads the freshly-stubbed localStorage.
async function pref() {
  return await import("../uiPrefs");
}

describe("uiPrefs sidebar collapse", () => {
  it("returns expanded (false) when no value is stored", async () => {
    const { getSidebarCollapsed } = await pref();
    expect(getSidebarCollapsed()).toBe(false);
  });

  it("round-trips a collapsed value", async () => {
    const { getSidebarCollapsed, setSidebarCollapsed } = await pref();
    setSidebarCollapsed(true);
    expect(getSidebarCollapsed()).toBe(true);
  });

  it("round-trips back to expanded", async () => {
    const { getSidebarCollapsed, setSidebarCollapsed } = await pref();
    setSidebarCollapsed(true);
    setSidebarCollapsed(false);
    expect(getSidebarCollapsed()).toBe(false);
  });

  it("degrades to expanded when localStorage throws on read", async () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("denied");
      },
    });
    const { getSidebarCollapsed, setSidebarCollapsed } = await pref();
    setSidebarCollapsed(true); // must not throw
    expect(getSidebarCollapsed()).toBe(false);
  });
});

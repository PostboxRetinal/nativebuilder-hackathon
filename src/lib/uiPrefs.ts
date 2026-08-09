const KEY = "devvoice.sidebarCollapsed";

// react.dev's own docs wrap localStorage access in try/catch: it can throw in
// private mode / quota. Safe first-paint for a pure Vite SPA (no SSR).
export const getSidebarCollapsed = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};

export const setSidebarCollapsed = (v: boolean): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, v ? "1" : "0");
  } catch {
    /* ignore storage failures */
  }
};

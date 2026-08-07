import '@testing-library/jest-dom/vitest'

// jsdom does not implement Element.prototype.scrollIntoView.
// MessageList calls it in a layout effect, so stub it for every test.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {}
}

function focusAction(selector: string) {
  const target = document.querySelector<HTMLElement>(selector)
    ?? document.getElementById('library-heading');
  target?.focus({ preventScroll: true });
}

/** The next useful home action after the first-practice guide disappears. */
export function focusHomeAction() {
  focusAction('.workspace:not([hidden]) .quick-open, .workspace:not([hidden]) [data-collection]');
}

export function focusPracticeCollection() {
  focusAction('.workspace:not([hidden]) [data-collection]');
}

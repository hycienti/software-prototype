/**
 * Floating tab bar geometry — keep in sync with app/(therapist-tabs)/_layout.tsx
 */
/** Horizontal: (100% - width) / 2 so the bar is centered */
export const THERAPIST_TAB_BAR_LEFT_PCT = '2.5%';
export const THERAPIST_TAB_BAR_WIDTH_PCT = '95%';
export const THERAPIST_TAB_BAR_FLOAT_GAP = 10;
export const THERAPIST_TAB_BAR_HEIGHT = 76;

/** Scrollable content should use this as paddingBottom (plus horizontal padding as needed). */
export function therapistTabBarClearance(safeAreaBottom: number, extra = 20): number {
  const bottomOffset =
    Math.max(safeAreaBottom, THERAPIST_TAB_BAR_FLOAT_GAP) + THERAPIST_TAB_BAR_FLOAT_GAP;
  return bottomOffset + THERAPIST_TAB_BAR_HEIGHT + extra;
}

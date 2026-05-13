/**
 * Reusable Framer Motion animation variants for ResolveHub.
 * All viewport animations use `once: true` so they fire only the first time
 * an element scrolls into view — no re-triggering on scroll-back.
 */

// ─── Variants ────────────────────────────────────────────────────────────────

/** Fade in + slide up — main reveal for text blocks and sections */
export const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Simple fade — for decorative or supplementary elements */
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

/** Fade in + slight scale — for cards and panels */
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.94, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Slide in from the left */
export const slideInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Slide in from the right */
export const slideInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

/**
 * Stagger container — wraps a list of staggered children.
 * Apply to the parent `motion` element.
 * @param {number} staggerDelay - seconds between each child
 */
export const staggerContainer = (staggerDelay = 0.1, delayChildren = 0) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: staggerDelay,
      delayChildren,
    },
  },
});

/**
 * Individual stagger item — child of staggerContainer.
 * Inherits the parent's stagger orchestration.
 */
export const staggerItem = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Shared viewport config — trigger when 20 % of element is visible, once only */
export const defaultViewport = { once: true, amount: 0.2 };

/** Tighter viewport for taller sections (only need 10 % visible to trigger) */
export const looseViewport = { once: true, amount: 0.1 };

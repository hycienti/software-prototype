# Haven Refactoring Plans

This folder contains comprehensive refactoring plans for the Haven app to improve code quality, maintainability, and consistency.

## Documents

### 1. Component Refactoring Plan
**File:** `component-refactoring-plan.md`

This document provides a detailed, screen-by-screen plan to break down all screens into smaller, reusable components. It includes:

- Analysis of each screen's current state
- Components to extract with full TypeScript interfaces
- Functions and hooks to create
- Implementation order (10-week phased approach)
- Best practices and success metrics

**Key Highlights:**
- 15 screens analyzed
- 100+ components to extract
- 30+ utility functions to create
- Organized by feature area (common, breathing, journal, gratitude, therapist, payment)

### 2. Stylesheet Refactoring Plan
**File:** `stylesheet-refactoring-plan.md`

This document outlines the strategy to centralize all styles into a design system. It includes:

- Current state analysis with identified issues
- Complete design system architecture
- Theme tokens (colors, spacing, typography, borders)
- Shadow and gradient presets
- Common style patterns for components
- Screen-by-screen refactoring guide
- Style utility functions

**Key Highlights:**
- Centralized theme with 50+ design tokens
- Reusable style patterns for buttons, cards, inputs, headers
- 10-week phased implementation
- Target: 50-60% reduction in StyleSheet code

## Quick Start

### Reading Order
1. Start with **Component Refactoring Plan** to understand the component extraction strategy
2. Then read **Stylesheet Refactoring Plan** to understand the design system approach
3. Use both plans together when refactoring - extract components first, then refactor their styles

### Implementation Strategy

**Recommended Approach:**
1. **Week 1-2:** Set up design system foundation (theme, shadows, gradients)
2. **Week 3-4:** Extract common components (buttons, cards, headers) with new styles
3. **Week 5-6:** Refactor screens incrementally, one at a time
4. **Week 7-8:** Continue screen refactoring
5. **Week 9-10:** Integration, testing, and cleanup

**Per-Screen Process:**
1. Read the screen's section in Component Refactoring Plan
2. Extract components as outlined
3. Apply styles from Stylesheet Refactoring Plan
4. Test the screen
5. Move to next screen

## Key Principles

Both plans follow these principles:

1. **KISS (Keep It Simple, Stupid):** Simple, clear components and styles
2. **DRY (Don't Repeat Yourself):** Eliminate duplication
3. **Single Responsibility:** Each component/style does one thing well
4. **Composition:** Build complex from simple
5. **Type Safety:** Full TypeScript support
6. **Incremental:** Refactor gradually, test continuously

## Success Metrics

### Component Refactoring
- 30-40% reduction in total lines of code
- 80% of UI elements as reusable components
- Average component size <200 lines
- >70% test coverage

### Stylesheet Refactoring
- 50-60% reduction in StyleSheet code
- 100% use of theme tokens
- Single source of truth for design
- Easy theming support

## Maintenance

These are living documents and should be updated as:
- New screens are added
- Components are extracted
- Design system evolves
- Patterns are identified

## Questions?

Refer to the detailed sections in each document for:
- Specific component interfaces
- Style definitions
- Implementation examples
- Best practices

---

**Last Updated:** January 2026

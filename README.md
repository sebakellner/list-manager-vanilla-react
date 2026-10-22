# Text List Manager

A front-end coding challenge implemented in **Vanilla JavaScript** and
**React + TypeScript**, with the same functionality and shared styles.

Based on the supplied [Adobe XD design](https://xd.adobe.com/view/ea696dd0-8781-4460-8720-36deb2d19b2a-bf3a/specs/).

## Features

- Add entries through a modal, using the Add button or Enter.
- Reject empty or whitespace-only entries and trim surrounding whitespace.
- Select or deselect multiple items.
- Delete selected items, or remove an individual item with a double-click.
- Undo additions and deletions through the full session history.
- Close the modal with Cancel, Escape, or a click outside its content.

Delete is disabled when nothing is selected; Undo is disabled when the history
is empty. Data is kept in memory and resets when the page is reloaded.

## Getting started

### Requirements

- Node.js 24 or later
- pnpm 12.14.0, as specified in the root package

Run all commands from the repository root. Install dependencies for the whole
workspace once:

```bash
pnpm install
```

### Development

| Version | Command | Default URL |
| --- | --- | --- |
| Vanilla | `pnpm dev:vanilla` | http://127.0.0.1:3000/ |
| React | `pnpm dev:react` | http://localhost:5173/ |

Use the URL printed in the terminal if the default port is occupied. Press
Ctrl+C to stop the server. To compare both versions, run each command in a
separate terminal.

The Vanilla server redirects `/` to `/vanilla/` and serves the repository root
so that the shared stylesheet remains accessible. Because Vanilla uses ES
modules, open it through the server rather than `file://`.

### Type checking and build

```bash
pnpm typecheck
pnpm build
```

`typecheck` checks the React application and Vite configuration in strict
TypeScript mode. `build` runs that check and generates the React production
bundle in `react/dist/`, including the shared stylesheet.

Vanilla has no runtime dependencies or build step. For static deployment, keep
the `vanilla/` and `shared/` directories alongside each other.

## Project structure

- [vanilla/](./vanilla/): HTML and JavaScript modules for state, rendering, and events.
- [react/src/](./react/src/): React components and the typed list-state hook.
- [shared/styles.css](./shared/styles.css): shared layout, styles, and CSS design tokens.
- Root package: workspace commands and the Vanilla development server.

## Implementation notes

- **Independent implementations:** Vanilla uses DOM APIs; React uses components
  and a custom hook. They share CSS, not application logic.
- **State and undo:** additions and deletions save a snapshot of the items and
  their selection. Selection changes alone do not create history entries.
  Deleting an unknown ID does not create an entry either.
- **Rendering:** Vanilla reuses list nodes to preserve focus and double-click
  behavior. Text is rendered with `textContent`; React uses its default escaping.
- **React components:** a reusable Button supports outline, primary, and icon
  variants while forwarding native button props and refs.
- **Design:** CSS tokens group colors, typography, spacing, radii, shadows,
  dimensions, and motion durations/easing. Desktop measurements follow XD;
  smaller screens and enlarged text can expand the layout without fixing the
  card height.

## Accessibility considerations

Both versions provide input labels, accessible button names, selection states,
and visible keyboard focus. Items can be reached with Tab and selected with
Space or Enter.

The native `<dialog>` focuses the input, prevents focus from moving into the
background, and restores focus to Add when closed. The input border follows
XD (`#CCCCCC`), while the focus ring uses the primary color. The placeholder
uses the text color for readability. The unfocused input border remains below
the 3:1 non-text contrast threshold.

Focus and hover transitions use short motion tokens without moving or resizing
controls. They are disabled when `prefers-reduced-motion: reduce` is enabled.

Arrow-key navigation for the listbox pattern is not implemented. These
measures are not a claim of full WCAG conformance.

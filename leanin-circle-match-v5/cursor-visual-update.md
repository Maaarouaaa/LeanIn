# Cursor brief — implement this visual direction

Update the three Circle Match routes to match the supplied editorial mockups in `rendered/`.

## Keep the product coherent

Create shared tokens and components for the masthead, progress tracker, condensed display headlines, serif editorial copy, pill/radio controls, fields, buttons, thin rules, result cards, people previews, and modal. Do not build each route as an isolated one-off.

## Routes

- `/match`: responsive preference form with client-side validation and accessible interaction states.
- `/matches`: fetch server-ranked matches and render the feature result plus two complete secondary results. Filters should update the query without discarding saved preferences.
- `/circles/[slug]`: fetch Circle detail data; open the request modal from the primary CTA.

## Persistence

`POST /api/circles/:slug/join-requests` should validate the authenticated member, accept an optional note up to 1000 characters, prevent duplicate active requests, persist the request in the project database, and return the saved request ID and status. Show an inline success state only after the server confirms persistence.

## Accessibility

Use semantic fieldsets and labels, visible focus, non-color selection cues, adjacent validation copy, `aria-live` for async results, focus trapping and restoration for the modal, Escape-to-close, and reduced-motion fallbacks. All text and controls must meet WCAG AA contrast.

## Responsive behavior

At tablet widths, stack hero art and copy while retaining the strong type scale. At mobile widths, convert result cards to a single column, keep filters horizontally scrollable, and make the request actions sticky at the bottom only when they do not obscure content.

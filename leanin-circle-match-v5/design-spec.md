# Lean In Circle Match — Editorial Product Direction

## Visual language

This concept translates the supplied fashion-editorial references into a credible community product rather than copying their layouts literally.

- Butter yellow and ink black provide the primary structure and strongest calls to action.
- Magenta, lavender, and lime identify selection and ranking states.
- Warm paper replaces sterile dashboard white.
- Condensed display typography creates momentum; serif moments introduce warmth and reflection.
- Organic photo masks and oversized outline words add art direction without reducing usability.
- Thin black rules, restrained shadows, and limited radii keep the interface crisp.

## Shared system

- Canvas: 1440 × 1100 desktop route captures
- Primary ink: `#171717`
- Butter yellow: `#FFDA57`
- Warm paper: `#F6F2E9`
- Magenta: `#D45AC7`
- Lavender: `#D3C4F3`
- Lime: `#E9F3AF`
- Plum editorial text: `#5A2947`
- Error: `#B71F32`
- Main product type: Arial/Helvetica
- Display type: Impact/Arial Narrow
- Editorial type: Georgia

All routes use the same masthead, three-step progress model, pill controls, border language, button shapes, and uppercase micro-labels.

## Route 1 — `/match`

The form begins with an art-directed invitation, then moves through two clearly numbered sections. Goal selection is represented by accessible checkbox cards; logistical choices use labeled fields and a radio group. The footer explicitly demonstrates keyboard focus, required error, disabled, and loading states.

## Route 2 — `/matches`

The first recommendation is treated as an editorial feature, with a black stage, large condensed headline, organic image crop, and yellow match ticket. Two complete secondary results retain all decision-critical information while using lavender and lime for ranking distinction.

## Route 3 — `/circles/[slug]`

The detail page balances a strong hero with readable editorial content, meeting facts, topics, member previews, and leader information. The captured state includes the request modal: an intentional soft color wash, optional note, privacy reassurance, character count, and persisted-request confirmation language.

## Interaction and implementation notes

- Every interactive control must use semantic HTML: `fieldset`, `legend`, labeled inputs, and buttons.
- Maintain a minimum 44 px pointer target.
- Focus rings should use 3 px ink or a high-contrast offset ring.
- Selected states use both color and a check/radio indicator.
- Error states place concise text adjacent to the related control and connect it with `aria-describedby`.
- Loading buttons retain their width, include descriptive text, and set `aria-busy="true"`.
- Modal focus is trapped; Escape closes it; focus returns to the request button.
- The join request is written server-side and returns a stable request ID before success is announced.

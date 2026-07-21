# Object Settings mockups

These images accompany
[`ObjectPropertiesWorkbenchRedesign.md`](../ObjectPropertiesWorkbenchRedesign.md).
They are product-direction mockups; existing GDevelop components and theme
tokens remain authoritative.

## Final images

- `object-settings-three-area-overview.png` - the persistent unified object
  list with origin badges, property-source column with multiple behaviors, and
  selected detail.
- `object-settings-three-area-filter.png` - the same main screen while
  filtering properties across the selected object's sources.

The layout keeps all objects unified while marking every row `Scene`, `Global`,
or `Prefab`. It intentionally has no scope tabs or grouping, horizontal source
tabs, Behaviors parent row, behavior accordions, or Apply/Revert bar.

## Generation method

The mockups were generated with the built-in image generation tool using the
`ui-mockup` workflow. The user's annotated main-screen image was the
authoritative composition reference. Its red position annotations were treated
as instructions and removed. A preceding mockup supplied visual-style
consistency.

The final prompts specified:

- A far-left unified searchable object list as the persistent main screen.
- One compact right-aligned `Scene`, `Global`, or `Prefab` badge on every object
  row, using quiet neutral, blue, and amber treatments.
- A middle column with `Filter properties` at its top.
- A flat source list containing `Object`, several independent behaviors,
  `Variables`, `Effects`, and `Add behavior`.
- One selected source's editable form in the remaining right detail area.
- A filtered state with per-source match count and unmatched sources dimmed.
- GDevelop-like dark surfaces, purple selection accents, aligned fields,
  legible exact labels, and practical desktop density.
- No red annotations, scope tabs or grouping, horizontal tabs, accordion
  groups, object picker, modal actions, results table, comparison UI, or extra
  panes.

The generated examples use illustrative content. Implementation must use real
object metadata, behavior instances, icons, labels, values, units,
accessibility semantics, and theme components.

# Map tiles prototype: post-headless Kotlin/JS experiment

> [!IMPORTANT]
> This prototype is a **post-headless, Kotlin/JS-specific experiment**. It is
> not a Milestone 1 dependency, deliverable, compatibility gate, or substitute
> for the JVM headless semantic vertical slice. Work on it may start as an
> isolated spike, but its renderer or browser types must not become the source
> of truth for common source models, normalized IR, event semantics, or runtime
> state.

> [!CAUTION]
> **Feature work is paused until the Phase 1 go criterion is satisfied.** Do not
> add MapTiles authoring features, tile-provider integrations, style editing,
> offline support, terrain, native rendering, or production packaging. The
> reviewed [MapTiles common API audit](maptiles-api-audit.md) freezes existing
> ownership boundaries and promotes no spike API.

This document is an experiment charter in the phase-gate format defined by
[`target-strategy.md`](target-strategy.md). Claims use the evidence markers from
[`README.md`](README.md). A successful spike shows that a browser host can
compose the portable semantic core with a slippy map; it does not establish
general rendering compatibility or commit the port to a production map feature.

## Position in the initiative

**Decision.** Evaluate map tiles only after the Milestone 1 headless gate has
established the shared semantics needed by the experiment. Map functionality is
therefore downstream of, and optional to, the active milestone. Evidence still
needed is a passing Phase 1 corpus report plus the checked-in prototype report
described below.

**Decision.** The first slice targets Kotlin/JS in a browser and delegates map
rendering to **MapLibre GL JS as an explicit host dependency**. MapLibre APIs,
DOM nodes, browser networking, and WebGL handles stay behind the host boundary;
they must not appear in common NIR or target-neutral runtime contracts. A later
renderer choice for another target is independent of this experiment.

**Hypothesis.** Deterministic GDevelop-style event and overlay state can be
composed with a MapLibre-owned camera closely enough to make a useful map-backed
application without making tile retrieval or GPU pixels part of semantic
compatibility. Confirm or reject this with the fixtures, captures, and repeated
runs in this document.

## Initial supported scope

The prototype is deliberately limited to:

1. A browser-hosted Kotlin/JS application.
2. MapLibre GL JS as an explicit rendering-host dependency, invoked through a
   narrow Kotlin/JS adapter.
3. Loading MapLibre style documents and displaying raster tile sources and
   vector tile sources referenced by those documents or by fixture setup.
4. Longitude/latitude positions projected using Web Mercator. Inputs outside
   the projection's documented usable latitude range must produce an explicit,
   fixture-defined clamp or rejection rather than an accidental host result.
5. GDevelop-style events, variables, objects, and UI rendered as HTML/DOM or
   supported GDevelop-view overlays above the map canvas. The map remains the
   rendering host; overlays are not encoded as custom map layers.
6. Deterministic camera commands and overlay logic where practical. Given the
   same seeded inputs and viewport, event order, variable writes, object state,
   requested camera state, and overlay layout inputs should be repeatable.
   Network tile retrieval, server responses, font/glyph availability, WebGL
   rasterization, GPU output, and the precise arrival order of host map events
   remain non-deterministic host behavior and are reported separately.

Supported source protocols, authentication, CORS policy, browser versions, and
the exact MapLibre version are fixture inputs, not implicit promises. The lock
file version and browser/GPU environment must be captured with every result.

### Overlay coordinate and frame conventions

The browser adapter owns three absolute layers in one container: MapLibre at
z-index 0, a transparent GDevelop/Pixi-compatible canvas at z-index 1, and an
optional DOM control layer at z-index 2. Overlay positions and sizes are CSS
pixels measured from the container's top-left (positive x rightward, positive y
downward). The canvas backing store is resized to CSS size multiplied by the
current device-pixel ratio; DPR never changes logical object coordinates.

Longitude/latitude remains the authoritative geo-anchor state. Projection
produces only a transient overlay position, to which a CSS-pixel screen offset
is added. Objects are culled against the viewport after projection and hidden
outside their inclusive minimum/maximum zoom range. Altitude and elevation mode
are retained in the portable anchor, but this first MapLibre adapter projects
them at ground level because terrain/elevation is outside the supported slice.

Each serialized frame is ordered as: MapLibre event delivery, event-sheet
execution, projection and visibility/culling, animation update, then overlay
rendering. Animation-only frames use the last committed event-sheet state and
repeat projection before animation. The transparent canvas has `pointer-events:
none`; a root capture listener hit-tests interactive overlay bounds. It stops a
pointer event only when the overlay handler consumes the hit, so unhandled input
continues to the MapLibre canvas.

Coordinates are normalized to the conventional longitude interval by the
application before becoming authoritative state. Projection uses that exact
longitude and MapLibre's nearest displayed world copy. The adapter does not
rewrite an anchor when crossing the antimeridian: `179` and `-179` remain
distinct stored values, while their screen positions may become adjacent when
world wrapping displays them together. Bounds spanning the antimeridian must
therefore be split or explicitly unwrapped by the caller; the overlay adapter
does not infer wrap direction.

### Animation compatibility modes

The prototype has two deliberately different animation contracts:

* **Portable geo-overlay animation** stores the overlay identity, authoritative
  start and end longitude/latitude, duration, elapsed game time, easing
  identity, current coordinate, and running/cancelled/completed status in common
  state. The runtime samples only the runtime-host game clock—never
  `Date.now`, `performance.now`, `requestAnimationFrame` timestamps, or another
  JavaScript wall clock. A seeded sequence of game-time samples must therefore
  yield the same coordinate updates and semantic trace on every target. Starting
  another animation for an overlay cancels and replaces its active animation;
  animations do not queue or blend.
* **MapLibre host camera animation** delegates `easeTo` and `flyTo` to MapLibre.
  The common command and every parameter are recorded in invocation order, and
  the adapter surfaces move-start, movement, cancellation, and idle callbacks
  through `MapHost`. Camera snapshots at movement and idle are host observations,
  not deterministic semantic frames. No intermediate pixel, callback time, path,
  or frame count is compatible until a pinned conformance experiment proves it.

All camera commands use **replace-active** policy. Before issuing a new jump,
ease, fly, bounds fit, or stop request, the adapter cancels the active host
animation; commands never queue behind or combine with it. Semantic traces
distinguish animation requests, overlay-coordinate updates, observed camera
state, cancellation, and completion. Portable overlay trace records are gating;
MapLibre movement snapshots remain in the non-gating host-observation stream.

## Not `Extensions/TileMap/`

**Confirmed** (static flow rechecked **2026-08-06**; GDevelop and Kotlin
prototype revisions `23f965f5290c176de3666cca9f5ae82ffa70e24a`; inspected
`Extensions/TileMap/`, `Extensions/TileMap/JsExtension.js`,
`Extensions/TileMap/tilemapruntimeobject.ts`, and `Extensions/TileMap/tests/`).
[`Extensions/TileMap/`](../../Extensions/TileMap/) implements
finite tilemaps loaded from Tiled data, including finite map layers, tilesets,
objects, and collision-oriented runtime behavior. Its checked-in examples use
`.tmx` and Tiled JSON files. This is a different domain from continuously
addressed slippy-map raster/vector sources selected by longitude, latitude, and
zoom.

The MapTiles Kotlin code is an **implemented experiment with unproven
conformance**. Checked-in source, fixtures, and tests establish an implementation
and test subjects, but the repository has no dated, revision-pinned execution
report satisfying the roadmap evidence record. See
[`evidence-index.md`](evidence-index.md). It is neither Milestone 1 work nor
evidence of Kotlin/JS runtime compatibility.

**Decision.** The prototype does not port, extend, or claim compatibility with
`Extensions/TileMap/`. It must use distinct names and serialized identities so a
finite Tiled tilemap cannot be mistaken for a MapLibre style or slippy-map
source. Reuse of generic event, object, or host-boundary concepts is permitted
only when it does not merge the two resource models.

## Unsupported in the first slice

The following are explicit rejection boundaries, not implied backlog promises:

* native JVM or Android rendering;
* offline tile downloading, caches, archives, or other tile packaging;
* arbitrary JavaScript events or project-provided JavaScript execution;
* interactive or programmatic style editing beyond selecting/loading a pinned
  fixture style and its declared sources;
* terrain and elevation;
* globe projection or projections other than Web Mercator longitude/latitude;
* custom WebGL layers, direct GL access, or ownership of MapLibre's render loop;
* production export, deployment, credentials, quotas, or service-worker policy;
* pixel-equivalent rendering across browsers, devices, drivers, or runs.

An unsupported input must yield a stable diagnostic before execution when it is
statically discoverable; it must not silently degrade into apparent support.

## Hypotheses

### H1 — host isolation

**Hypothesis.** MapLibre, DOM, and WebGL types can remain inside a Kotlin/JS host
adapter while common event, variable, object, and overlay state uses the same
target-neutral contracts proven by the headless milestone.

* **Experiment:** compile the common modules for JVM and JS after adding the
  adapter, and audit common public APIs plus serialized NIR for browser or
  MapLibre names.
* **Confirming evidence:** both targets compile, the API audit is empty, and the
  existing headless corpus hashes do not change.
* **Rejecting evidence:** the map slice requires target branches in common event
  ordering/state or leaks host handles into common types.

### H2 — deterministic commands and overlays

**Hypothesis.** Seeded input frames can produce identical semantic traces,
requested camera snapshots, overlay state, and diagnostics even though map load
events and rendered pixels vary.

* **Experiment:** replay each deterministic fixture at least 20 times with a
  fixed viewport, DPR, clock, and synthetic inputs; compare canonical outputs
  while recording host events in a non-gating observation stream.
* **Confirming evidence:** all gating hashes are identical across runs.
* **Rejecting evidence:** network/GPU/map-event timing changes an event branch,
  camera command, variable value, object state, or overlay output.

### H3 — useful source coverage

**Hypothesis.** One pinned style-document fixture plus isolated raster and
vector fixtures are sufficient to validate the adapter boundary without style
editing or a general MapLibre binding.

* **Experiment:** run the three source fixtures below against pinned local HTTP
  responses and inspect source/style diagnostics and host call logs.
* **Confirming evidence:** declared sources load, expected host calls occur, and
  unsupported source/style features fail explicitly.
* **Rejecting evidence:** representative raster or vector data needs arbitrary
  JavaScript, custom WebGL layers, or broad exposure of the MapLibre API.

## Representative fixtures

Fixtures must be minimal, checked in or content-addressed, license-reviewed, and
served by a deterministic local HTTP fixture server. Each records provenance,
SHA-256 hashes, MapLibre/npm lock versions, browser version, viewport, DPR,
seeded clock/input frames, expected diagnostics, and canonical output hashes.

| Fixture ID | Purpose | Required observations |
|---|---|---|
| `maptiles-style-raster` | A minimal MapLibre style document with one raster source and layer. | Style/source identities, raster URL template passed to the host, initial and requested camera state, load/error observations, and overlay z-order. |
| `maptiles-style-vector` | A minimal style with one vector source, a small pinned vector tile, and a declared style layer. | Vector source/layer configuration, longitude/latitude camera commands, host source errors, and separation of semantic output from rendered pixels. |
| `maptiles-camera-overlay` | Seeded events update variables, move a logical object/UI marker, and issue camera commands over a map. | Ordered event trace, variable writes, object state, requested versus observed camera snapshots, projected overlay anchor/layout inputs, and stable unsupported-feature diagnostics. |

`maptiles-camera-overlay` is the gate fixture because it tests the architectural
claim: GDevelop-style logic remains deterministic and observable while map
rendering is delegated. `maptiles-style-raster` is the smoke fixture. A malformed
style, an unsupported projection, and a requested custom layer are negative
fixture variants, not silently skipped cases.

## Observable outputs and evidence record

Every run produces a machine-readable report that separates semantic assertions
from host observations:

1. fixture and dependency hashes plus full environment metadata;
2. decoder/resolution diagnostics with normalized source locations;
3. ordered event trace, variable writes, logical object state, and overlay state;
4. ordered **requested camera** commands and canonical target snapshots
   (`longitude`, `latitude`, `zoom`, `bearing`, and `pitch` where supported);
5. **observed camera** snapshots and MapLibre load/error/event callbacks in a
   non-gating host-observation stream;
6. overlay anchor and layout inputs in CSS pixels for the pinned viewport;
7. configured style, source, and layer identities plus an ordered host-adapter
   call log with secrets removed;
8. network request/response status and content hashes from the local fixture
   server, without treating arrival timing as deterministic; and
9. an optional screenshot for human review, clearly labeled non-gating and
   never used as evidence of pixel equivalence.

**Decision.** Trace parity, state parity, diagnostic fidelity, determinism, and
host conformance use the named metrics in `target-strategy.md`. Pixel hashes,
tile completion time, frame timing, and host callback order are observations
only. Any normalization applied to a canonical field must be documented in the
report schema rather than introduced after a mismatch.

Evidence is recorded with the following markers:

* **Confirmed** only for a repository trace or repeatable report that includes
  command, inputs, environment, output, date, and full repository revision.
* **Inference** links that confirmed evidence and explains the conclusion.
* **Hypothesis** names the experiment that can confirm or reject it.
* **Decision** names this charter or a later accepted ADR and lists validation
  still outstanding.

Until those reports exist, this document records scope and hypotheses—not
confirmation that MapLibre integration works.

## Deliverables

The API-audit deliverable is recorded in
[`maptiles-api-audit.md`](maptiles-api-audit.md). It is a static boundary review,
not a passing conformance result.

1. An isolated Kotlin/JS browser entry point and narrow MapLibre host adapter.
2. The three fixture families, deterministic local fixture server, provenance,
   licenses, hashes, and negative cases.
3. A versioned machine-readable report schema separating canonical semantic
   output from non-gating host observations.
4. A repeat command that runs every fixture at least 20 times and emits the
   named metric summary.
5. A host-boundary/API audit and comparison showing no changes to the accepted
   JVM headless traces or common semantic contracts.
6. A dated evidence report with the full repository revision, dependency lock
   state, browser/OS/GPU details, commands, outputs, discrepancies, and decision.

## Compatibility metrics

* **Decode coverage:** 100% of the supported fixture style/source declarations;
  all negative variants produce their expected diagnostic.
* **Trace and state parity:** exact checked-in event trace, variable, object,
  overlay, and requested-camera assertions for every executed fixture.
* **Determinism:** identical canonical output hashes across at least 20 repeated
  runs per fixture with the same seeded inputs.
* **Host conformance:** 100% of adapter contract tests for lifecycle, camera,
  style/source configuration, overlay placement, errors, and disposal.
* **Boundary integrity:** zero MapLibre, DOM, WebGL, or browser networking types
  in common public APIs and NIR; zero changes to accepted headless trace hashes.
* **Visual reporting:** screenshots and environment metadata are captured, but
  no pixel-parity percentage is claimed or used as a gate.

## Stop/go criterion

* **Go to a broader, still Kotlin/JS-only evaluation:** all three hypotheses are
  confirmed by reviewed, reproducible evidence; every compatibility metric
  above passes; raster and vector fixtures work through the narrow adapter; and
  non-deterministic host observations cannot affect canonical semantics.
* **Stop and revise the boundary:** MapLibre/DOM/WebGL types leak into common
  APIs or NIR, existing headless hashes change, host callback or network timing
  changes canonical state, supported source types require arbitrary JavaScript
  or custom GL access, or unsupported features cannot be rejected explicitly.
* **Stop rather than promote:** the spike renders a compelling demo but lacks
  pinned fixtures, reproducible reports, environment capture, or the 20-run
  determinism result. Visual success alone is not evidence for architectural
  adoption.

A **go** result authorizes only the next bounded Kotlin/JS investigation. Native
rendering, offline delivery, style authoring, production export, and visual
fidelity each require their own hypothesis, fixtures, evidence, and phase gate.

# MapLibre Kotlin/JS host conformance

These adapter checks are deliberately separate from common `MapHost` contract
tests. They run against a controllable MapLibre test double (or, once browser
automation exists, a checked-in fixed style and local fixture tiles). Live tile
servers, timing, and imagery are never test oracles.

Each adapter release must check:

1. **Listener cleanup:** record every `on(type, callback)`, dispose twice, and
   assert one matching `off` for every registration, one `remove`, no callback
   after disposal, and terminal `DISPOSED` lifecycle.
2. **Projection conversion:** make the JS double return fixed `{x,y}` and
   `{lng,lat}` values; assert exact `ScreenCoordinate`/`GeoCoordinate` conversion,
   argument order, and no world-projection claim.
3. **Camera command mapping:** assert `Jump`, `Ease`, `Fly`, `FitBounds`, and
   `StopAnimation` call only the corresponding MapLibre command; compare center,
   zoom, bearing, pitch, duration, padding, southwest/northeast order, replacement
   cancellation, and monotonically increasing trace sequence.
4. **Resize:** in `READY`, assert one `resize()` forwarding call and success; in
   every other lifecycle, assert `INVALID_LIFECYCLE` without touching the map.
5. **Error translation:** inject unsupported WebGL, constructor/style errors,
   source errors, generic MapLibre errors, and invalid lifecycle calls; assert the
   stable `MapLibreDiagnosticCode`, `MapHostResult.Failure` code/message, optional
   source ID, diagnostic order, and cleanup after initialization failure.

A browser suite must load all style JSON, glyphs, sprites, and tiles from local
fixtures with fixed viewport and pixel ratio. Pixel output may supplement these
semantic assertions but cannot replace them.

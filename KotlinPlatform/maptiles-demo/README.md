# Map tiles Kotlin/JS demo

This standalone browser sample is a small authoring surface for versioned map documents. It supports
style URL and camera configuration, click-to-create geo-anchored markers, marker selection/editing,
zoom visibility, camera flight, marker animation, layer visibility, and JSON import/export.

No token or tile-provider URL is checked in. The initial map uses an empty MapLibre style. Paste a
style URL that you are permitted to use and copy the provider's required attribution into the adjacent
field; MapLibre's attribution control displays it. URLs that are described as TileJSON but are not full
MapLibre style documents must first be wrapped in a compatible style document.

The checked-in [`demo-document.json`](src/jsMain/resources/demo-document.json) selects a marker on
load and combines camera flight, marker animation, marker label/icon markup, and UI state when **Load
& run sample** is pressed. Supported operation names are `select`, `flyTo`, and `animateMarker`.

Run the development server from `KotlinPlatform`:

```sh
./gradlew :maptiles-demo:jsBrowserDevelopmentRun
```

Use `:maptiles-demo:jsBrowserDistribution` to produce a deployable bundle.

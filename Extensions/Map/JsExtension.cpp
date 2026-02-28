/**
 * GDevelop - Map Extension
 * Copyright (c) 2024 GDevelop Community
 * This project is released under the MIT License.
 */

#include "GDCore/Extensions/PlatformExtension.h"

#if defined(GD_IDE_ONLY)
#include "MapObject.h"
#include "MapMarkerBehavior.h"
#include "GDCore/Extensions/Metadata/MultipleInstructionMetadata.h"
#include "GDCore/Project/BehaviorsSharedData.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Tools/Localization.h"

void DeclareMapExtension(gd::PlatformExtension& extension);

/**
 * JavaScript extension declaration for the Map extension.
 */
class MapJsExtension : public gd::PlatformExtension {
 public:
  MapJsExtension() {
    DeclareMapExtension(*this);

    // Mark the extension as a JavaScript extension
    GetObjectMetadata("Map::Map")
        .SetIncludeFile("Extensions/Map/mapruntimeobject.js")
        .AddIncludeFile("Extensions/Map/mapruntimeobject-pixi-renderer.js");

    GetBehaviorMetadata("Map::MapMarker")
        .SetIncludeFile("Extensions/Map/mapmarkerbehavior.js");

    GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
  };
};

#if defined(EMSCRIPTEN)
extern "C" gd::PlatformExtension* CreateGDJSMapExtension() {
  return new MapJsExtension;
}
#else
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" gd::PlatformExtension* GD_EXTENSION_API CreateGDJSMapExtension() {
  return new MapJsExtension;
}
#endif

#else
// When not in IDE mode (e.g., for Emscripten builds), provide a minimal stub
class MapJsExtension : public gd::PlatformExtension {
 public:
  MapJsExtension() {
    SetExtensionInformation(
        "Map",
        "Map",
        "Add a map (minimap/worldmap) to your game with automatic object tracking.",
        "GDevelop Community",
        "Open source (MIT License)");
  }
};

#if defined(EMSCRIPTEN)
extern "C" gd::PlatformExtension* CreateGDJSMapExtension() {
  return new MapJsExtension;
}
#endif
#endif

# This is the CMake file used to build the C++ extensions. 
# For more information, see the README.md file.

cmake_minimum_required(VERSION 3.5)
cmake_policy(SET CMP0011 NEW)

project(GD-Extensions)
include(CMakeUtils.txt) # Functions to factor common tasks done in CMakeLists.txt of extensions

# Add all the CMakeLists (for non pure JS extensions):
add_subdirectory(AnchorBehavior)
add_subdirectory(DestroyOutsideBehavior)
add_subdirectory(DraggableBehavior)
add_subdirectory(Inventory)
add_subdirectory(LinkedObjects)
add_subdirectory(ParticleSystem)
add_subdirectory(PanelSpriteObject)
add_subdirectory(PathfindingBehavior)
add_subdirectory(PhysicsBehavior)
add_subdirectory(PlatformBehavior)
add_subdirectory(PrimitiveDrawing)
add_subdirectory(Shopify)
add_subdirectory(SystemInfo)
add_subdirectory(TextEntryObject)
add_subdirectory(TextObject)
add_subdirectory(TiledSpriteObject)
add_subdirectory(TopDownMovementBehavior)

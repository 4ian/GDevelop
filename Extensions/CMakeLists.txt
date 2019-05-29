#This is the CMake file used to build the C++ extensions.
#For more information, see the README.md file.

cmake_minimum_required(VERSION 2.6)
cmake_policy(SET CMP0011 NEW)

project(GD-Extensions)
include(CMakeUtils.txt) #Functions to factor common tasks done in CMakeLists.txt of extensions

#Add all the CMakeLists (for non pure JS extensions):
ADD_SUBDIRECTORY(AnchorBehavior)
ADD_SUBDIRECTORY(DestroyOutsideBehavior)
ADD_SUBDIRECTORY(DraggableBehavior)
ADD_SUBDIRECTORY(Inventory)
ADD_SUBDIRECTORY(LinkedObjects)
ADD_SUBDIRECTORY(ParticleSystem)
ADD_SUBDIRECTORY(PanelSpriteObject)
ADD_SUBDIRECTORY(PathfindingBehavior)
ADD_SUBDIRECTORY(PhysicsBehavior)
ADD_SUBDIRECTORY(PlatformBehavior)
ADD_SUBDIRECTORY(PrimitiveDrawing)
ADD_SUBDIRECTORY(Shopify)
ADD_SUBDIRECTORY(SkeletonObject)
ADD_SUBDIRECTORY(SystemInfo)
ADD_SUBDIRECTORY(TextEntryObject)
ADD_SUBDIRECTORY(TextObject)
ADD_SUBDIRECTORY(TiledSpriteObject)
ADD_SUBDIRECTORY(TopDownMovementBehavior)

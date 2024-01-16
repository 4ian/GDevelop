# This is the CMake file used to build the C++ extensions. 
# For more information, see the README.md file.

cmake_minimum_required(VERSION 3.5)

project(GD-Extensions)
include(CMakeUtils.txt) # Functions to factor common tasks done in CMakeLists.txt of extensions

# List of non pure JS extensions
set(
	GD_EXTENSIONS
	3D
	AnchorBehavior
	DestroyOutsideBehavior
	DraggableBehavior
	Inventory
	LinkedObjects
	PanelSpriteObject
	ParticleSystem
	PathfindingBehavior
	PhysicsBehavior
	PlatformBehavior
	PrimitiveDrawing
	Shopify
	SystemInfo
	TextEntryObject
	TextObject
	TiledSpriteObject
	Spine
	TopDownMovementBehavior)

# Automatically add all listed extensions
foreach(extension ${GD_EXTENSIONS})
	add_subdirectory(${extension})
endforeach()

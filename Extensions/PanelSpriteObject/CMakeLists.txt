cmake_minimum_required(VERSION 3.5)

project(PanelSpriteObject)
gd_add_extension_includes()

# Defines
#
gd_add_extension_definitions(PanelSpriteObject)

# The targets
#
include_directories(.)
file(
	GLOB
	source_files
	*.cpp
	*.h)
gd_add_clang_utils(PanelSpriteObject "${source_files}")
gd_add_extension_target(PanelSpriteObject "${source_files}")

# Linker files for the IDE extension
#
gd_extension_link_libraries(PanelSpriteObject)

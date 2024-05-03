cmake_minimum_required(VERSION 3.5)

project(DraggableBehavior)
gd_add_extension_includes()

# Defines
#
gd_add_extension_definitions(DraggableBehavior)

# The targets
#
include_directories(.)
file(
	GLOB
	source_files
	*.cpp
	*.h)
gd_add_clang_utils(DraggableBehavior "${source_files}")
gd_add_extension_target(DraggableBehavior "${source_files}")

# Linker files for the IDE extension
#
gd_extension_link_libraries(DraggableBehavior)

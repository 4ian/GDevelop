cmake_minimum_required(VERSION 3.5)

project(PrimitiveDrawing)
gd_add_extension_includes()

# Defines
#
gd_add_extension_definitions(PrimitiveDrawing)

# The targets
#
include_directories(.)
file(
	GLOB
	source_files
	*.cpp
	*.h)
gd_add_clang_utils(PrimitiveDrawing "${source_files}")
gd_add_extension_target(PrimitiveDrawing "${source_files}")

# Linker files for the IDE extension
#
gd_extension_link_libraries(PrimitiveDrawing)

cmake_minimum_required(VERSION 3.5)

project(Shopify)
gd_add_extension_includes()

# Defines
#
gd_add_extension_definitions(Shopify)

# The targets
#
include_directories(.)
file(
	GLOB
	source_files
	*.cpp
	*.h)
gd_add_extension_target(
	Shopify
	"${source_files}"
	"JsPlatform")
gd_add_clang_utils(Shopify "${source_files}")

# Linker files for the IDE extension
#
gd_extension_link_libraries(Shopify)

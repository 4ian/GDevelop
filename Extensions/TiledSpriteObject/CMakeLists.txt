cmake_minimum_required(VERSION 2.6)
cmake_policy(SET CMP0015 NEW)

project(TiledSpriteObject)

include_directories(${sfml_include_dir})
include_directories(${GDCORE_include_dir})
include_directories(${GDCpp_include_dir})
IF(WIN32) #Special case for wxWidgets on Windows
	include_directories(${wxwidgets_include_dir})
ELSEIF (NOT EMSCRIPTEN)
	find_package(wxWidgets COMPONENTS core base adv net ribbon stc aui propgrid richtext html xrc REQUIRED)
	include( "${wxWidgets_USE_FILE}" )
	include_directories(${GTK_INCLUDE_DIRS})
	link_directories(${GTK_LIBRARY_DIRS})
ENDIF(WIN32)

#Defines
###
gd_add_extension_definitions(TiledSpriteObject)

#The targets
###
include_directories(.)
file(GLOB_RECURSE source_files *)

gd_add_extension_target(TiledSpriteObject "${source_files}")
gdcpp_add_runtime_extension_target(TiledSpriteObject_Runtime "${source_files}")

#Linker files for the IDE extension
###
gd_extension_link_libraries(TiledSpriteObject)

#Linker files for the GD C++ Runtime extension
###
gdcpp_runtime_extension_link_libraries(TiledSpriteObject_Runtime)

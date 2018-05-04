cmake_minimum_required(VERSION 2.6)
cmake_policy(SET CMP0015 NEW)

project(TextObject)
gd_add_extension_includes()

#Defines
###
gd_add_extension_definitions(TextObject)

#The targets
###
include_directories(.)
file(GLOB source_files *.cpp *.h)
file(GLOB gui_only_files Dialogs/*.cpp Dialogs/*.h)

IF(NO_GUI)
	SET(ide_source_files "${source_files}")
ELSE()
	SET(ide_source_files "${source_files};${gui_only_files}")
ENDIF()


gd_add_clang_utils(TextObject "${ide_source_files}")
gd_add_extension_target(TextObject "${ide_source_files}")
gdcpp_add_runtime_extension_target(TextObject_Runtime "${source_files}")

#Linker files for the IDE extension
###
gd_extension_link_libraries(TextObject)

#Linker files for the GD C++ Runtime extension
###
gdcpp_runtime_extension_link_libraries(TextObject_Runtime)

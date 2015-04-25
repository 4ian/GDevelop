cmake_minimum_required(VERSION 2.6)
cmake_policy(SET CMP0015 NEW)

project(CommonDialogs)
gd_add_extension_includes()

#Defines
###
gd_add_extension_definitions(CommonDialogs)

#The targets
###
include_directories(.)
IF(WIN32)
	file(GLOB source_files *)
ELSE()
	include_directories(nwidgets dlib-17.49)
	file(GLOB source_files * nwidgets/nsource.cpp dlib-17.49/dlib/all/source.cpp)
ENDIF()

gd_add_extension_target(CommonDialogs "${source_files}")
gdcpp_add_runtime_extension_target(CommonDialogs_Runtime "${source_files}")

#Linker files for the IDE extension
###
gd_extension_link_libraries(CommonDialogs)

#Linker files for the GD C++ Runtime extension
###
gdcpp_runtime_extension_link_libraries(CommonDialogs_Runtime)

cmake_minimum_required(VERSION 2.6)
cmake_policy(SET CMP0015 NEW)

project(LinkedObjects)

include_directories(${sfml_include_dir})
include_directories(${GDCORE_include_dir})
include_directories(${GDCpp_include_dir})
IF(WIN32) #Special case for wxWidgets on Windows
	include_directories(${wxwidgets_include_dir})
ELSE()
	find_package(wxWidgets COMPONENTS core base adv net ribbon stc aui propgrid richtext html xrc REQUIRED)
	include( "${wxWidgets_USE_FILE}" )
	include_directories(${GTK_INCLUDE_DIRS})
	link_directories(${GTK_LIBRARY_DIRS})
ENDIF(WIN32)

#Defines
###
gd_add_extension_definitions(LinkedObjects)

#The targets
###
include_directories(.)
file(GLOB source_files *)

gd_add_extension_target(LinkedObjects "${source_files}")
gdcpp_add_runtime_extension_target(LinkedObjects_Runtime "${source_files}")

#Linker files for the IDE extension
###
gd_extension_link_libraries(LinkedObjects)


#Linker files for the GD C++ Runtime extension
###
gdcpp_runtime_extension_link_libraries(LinkedObjects_Runtime)

#Tests for the GD C++ Runtime extension
###
if(BUILD_TESTS)
	file(
	    GLOB_RECURSE
	    test_source_files
	    tests/*
	)
	add_executable(LinkedObjects_Runtime_tests ${test_source_files})
	target_link_libraries(LinkedObjects_Runtime_tests GDCpp_Runtime)
	target_link_libraries(LinkedObjects_Runtime_tests LinkedObjects_Runtime)
	target_link_libraries(LinkedObjects_Runtime_tests sfml-audio sfml-graphics sfml-window sfml-network sfml-system)
	IF (NOT APPLE)
		target_link_libraries(LinkedObjects_Runtime_tests GLU GL)
	ENDIF()
endif()

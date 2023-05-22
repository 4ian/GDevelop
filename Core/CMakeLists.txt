cmake_minimum_required(VERSION 3.5)

project(GDCore)

set(CMAKE_C_USE_RESPONSE_FILE_FOR_OBJECTS 1) # Force use response file: useful for Ninja build system on Windows.
set(CMAKE_CXX_USE_RESPONSE_FILE_FOR_OBJECTS 1)
set(CMAKE_C_USE_RESPONSE_FILE_FOR_INCLUDES 1)
set(CMAKE_CXX_USE_RESPONSE_FILE_FOR_INCLUDES 1)

# Define common directories:
set(GDCORE_include_dir ${GD_base_dir}/Core PARENT_SCOPE)
set(GDCORE_lib_dir ${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME} PARENT_SCOPE)

# Dependencies on external libraries:
#

# Defines
#
add_definitions(-DGD_IDE_ONLY)
if(EMSCRIPTEN)
	add_definitions(-DEMSCRIPTEN)
endif()
if("${CMAKE_BUILD_TYPE}" MATCHES "Debug")
	add_definitions(-DDEBUG)
else()
	add_definitions(-DRELEASE)
endif()

if(WIN32)
	add_definitions(-DWINDOWS)
	add_definitions("-DGD_CORE_API=__declspec(dllexport)")
	add_definitions(-D__GNUWIN32__)
else()
	if(APPLE)
		add_definitions(-DMACOS)
	else()
		add_definitions(-DLINUX)
	endif()
	add_definitions(-DGD_API=)
	add_definitions(-DGD_CORE_API=)
endif()

# The target
#
include_directories(.)
file(
	GLOB_RECURSE
	source_files
	GDCore/*)

file(
	GLOB_RECURSE
	formatted_source_files
	tests/*
	GDCore/Events/*
	GDCore/Extensions/*
	GDCore/IDE/*
	GDCore/Project/*
	GDCore/Serialization/*
	GDCore/Tools/*)
list(
	REMOVE_ITEM
	formatted_source_files
	"${CMAKE_CURRENT_SOURCE_DIR}/GDCore/IDE/Dialogs/GDCoreDialogs.cpp"
	"${CMAKE_CURRENT_SOURCE_DIR}/GDCore/IDE/Dialogs/GDCoreDialogs.h"
	"${CMAKE_CURRENT_SOURCE_DIR}/GDCore/IDE/Dialogs/GDCoreDialogs_dialogs_bitmaps.cpp")
gd_add_clang_utils(GDCore "${formatted_source_files}")

if(EMSCRIPTEN)
	# Emscripten treats all libraries as static libraries
	add_library(GDCore STATIC ${source_files})
else()
	add_library(GDCore SHARED ${source_files})
endif()
if(EMSCRIPTEN)
	set_target_properties(GDCore PROPERTIES SUFFIX ".bc")
elseif(WIN32)
	set_target_properties(GDCore PROPERTIES PREFIX "")
else()
	set_target_properties(GDCore PROPERTIES PREFIX "lib")
endif()
set(LIBRARY_OUTPUT_PATH ${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME})
set(ARCHIVE_OUTPUT_PATH ${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME})
set(RUNTIME_OUTPUT_PATH ${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME})

# Tests
#
if(BUILD_TESTS)
	file(
		GLOB_RECURSE
		test_source_files
		tests/*)

	add_executable(GDCore_tests ${test_source_files})
	set_target_properties(GDCore_tests PROPERTIES BUILD_WITH_INSTALL_RPATH FALSE) # Allow finding dependencies directly from build path on Mac OS X.
	target_link_libraries(GDCore_tests GDCore)
	target_link_libraries(GDCore_tests ${CMAKE_DL_LIBS})
endif()

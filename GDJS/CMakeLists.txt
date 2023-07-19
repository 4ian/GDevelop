cmake_minimum_required(VERSION 3.5)

project(GDJS)
# Dependencies on external libraries:
#
include_directories(${GDCORE_include_dir})

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
	add_definitions("-DGD_API=__declspec(dllexport)")
	add_definitions("-DGD_CORE_API=__declspec(dllimport)")
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
	GLOB
	f1
	GDJS/*
	GDJS/IDE/*
	GDJS/IDE/mongoose/*)
file(
	GLOB_RECURSE
	f2
	GDJS/Extensions/*
	GDJS/Events/*)
set(source_files ${f1} ${f2})
if(NOT EMSCRIPTEN)
	file(
		GLOB_RECURSE
		f3
		GDJS/IDE/Dialogs/*)
	set(source_files ${source_files} ${f3})
endif()

file(
	GLOB_RECURSE
	formatted_source_files
	GDJS/Events/*
	GDJS/Extensions/*
	GDJS/IDE/*)
gd_add_clang_utils(GDJS "${formatted_source_files}")

if(EMSCRIPTEN)
	# Emscripten treats all libraries as static libraries
	add_library(GDJS STATIC ${source_files})
else()
	add_library(GDJS SHARED ${source_files})
endif()
if(EMSCRIPTEN)
	set_target_properties(GDJS PROPERTIES SUFFIX ".bc")
elseif(WIN32)
	set_target_properties(GDJS PROPERTIES PREFIX "")
else()
	set_target_properties(GDJS PROPERTIES PREFIX "lib")
endif()
set_target_properties(GDJS PROPERTIES MACOS_RPATH "..")
set(LIBRARY_OUTPUT_PATH ${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/JsPlatform)
set(ARCHIVE_OUTPUT_PATH ${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/JsPlatform)
set(RUNTIME_OUTPUT_PATH ${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/JsPlatform)

# Linker files
#
if(NOT EMSCRIPTEN)
	target_link_libraries(GDJS GDCore)
endif()

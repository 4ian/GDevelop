# This is the CMake file used to build GDevelop.
# For more information, see the README.md file.

cmake_minimum_required(VERSION 3.5)
cmake_policy(SET CMP0011 NEW)

# Add utility functions
include(scripts/CMakeClangUtils.txt) # To add clang-format and clang-tidy support to a target

# Macro for defining an option
macro(gd_set_option var default type docstring)
	if(NOT DEFINED ${var})
		set(${var} ${default})
	endif()
	set(${var} ${${var}} CACHE ${type} ${docstring} FORCE)
endmacro()
gd_set_option(BUILD_CORE TRUE BOOL "TRUE to build GDevelop Core library")
gd_set_option(BUILD_GDJS TRUE BOOL "TRUE to build GDevelop JS Platform")
gd_set_option(BUILD_EXTENSIONS TRUE BOOL "TRUE to build the extensions")
gd_set_option(BUILD_TESTS TRUE BOOL "TRUE to build the tests")

# Disable deprecated code
set(NO_GUI TRUE CACHE BOOL "" FORCE) # Force disable old GUI related code.

# Setting up installation directory, for Linux (has to be done before "project" command).
if(NOT WIN32)
	if(NOT APPLE)
		gd_set_option(GD_INSTALL_PREFIX "/opt/gdevelop/" STRING "The directory where GDevelop should be installed")
	else()
		gd_set_option(GD_INSTALL_PREFIX "." STRING "The directory where GDevelop should be installed")
	endif()

	# As we embed SFML, prevent it to be installed system-wide
	set(CMAKE_INSTALL_PREFIX "${GD_INSTALL_PREFIX}/useless")
endif()

project(GDevelop)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)
if(NOT WIN32 AND NOT APPLE AND NOT BUILD_TESTS)
	set(CMAKE_SKIP_BUILD_RPATH TRUE) # Avoid errors when packaging for linux.
endif()
if(APPLE)
	set(CMAKE_MACOSX_RPATH 1)
	set(CMAKE_INSTALL_RPATH_USE_LINK_PATH FALSE)
	set(CMAKE_INSTALL_RPATH ".")
	set(CMAKE_BUILD_WITH_INSTALL_RPATH TRUE)
	set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -D_WCHAR_H_CPLUSPLUS_98_CONFORMANCE_")
	set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wno-potentially-evaluated-expression")
endif()
# Sanity checks
if("${CMAKE_BUILD_TYPE}" STREQUAL "")
	message("CMAKE_BUILD_TYPE is empty, assuming build type is Release")
	set(CMAKE_BUILD_TYPE Release)
endif()

if("${CMAKE_BUILD_TYPE}" STREQUAL "Release" AND NOT WIN32 AND CMAKE_COMPILER_IS_GNUCXX)
	set(CMAKE_SHARED_LINKER_FLAGS "-s") # Force stripping to avoid errors when packaging for linux.
endif()

#Activate C++11
include(CheckCXXCompilerFlag)
CHECK_CXX_COMPILER_FLAG("-std=gnu++11" COMPILER_SUPPORTS_CXX11)
if(COMPILER_SUPPORTS_CXX11)
	set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=gnu++11")
else()
	CHECK_CXX_COMPILER_FLAG("-std=gnu++0x" COMPILER_SUPPORTS_CXX0X)
	if(COMPILER_SUPPORTS_CXX0X)
		set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=gnu++0x")
	else()
		message(FATAL_ERROR "The compiler ${CMAKE_CXX_COMPILER} has no C++11 support (with GNU extensions). Please use a different C++ compiler.")
	endif()
endif()

# Mark some warnings as errors
if(CMAKE_CXX_COMPILER_ID STREQUAL "Clang")
	# Activate as much warnings as possible to avoid errors like
	# uninitialized variables or other hard to debug bugs.
	set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wall")
	set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wno-unknown-warning-option")
	set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wno-reorder-ctor -Wno-reorder -Wno-pessimizing-move -Wno-unused-variable -Wno-unused-private-field")

	# Make as much warnings considered as errors as possible (only one for now).
	set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Werror=return-stack-address")
endif()

# Define common directories:
set(GD_base_dir ${CMAKE_CURRENT_SOURCE_DIR})

# Add all the CMakeLists:
add_subdirectory(ExtLibs)
if(BUILD_CORE)
	add_subdirectory(Core)
endif()
if(BUILD_GDJS)
	add_subdirectory(GDJS)
endif()
if(EMSCRIPTEN)
	add_subdirectory(GDevelop.js)
endif()
if(BUILD_EXTENSIONS)
	add_subdirectory(Extensions)
endif()

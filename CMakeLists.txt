#This is the CMake file used to build GDevelop.
#For more information, see the Readme.md file.

cmake_minimum_required(VERSION 2.6)
cmake_policy(SET CMP0011 NEW)

# Macro for defining an option
macro(gd_set_option var default type docstring)
    if(NOT DEFINED ${var})
        set(${var} ${default})
    endif()
    set(${var} ${${var}} CACHE ${type} ${docstring} FORCE)
endmacro()
gd_set_option(BUILD_CORE TRUE BOOL "TRUE to build GDevelop Core library, FALSE to use the already compiled binaries")
gd_set_option(BUILD_GDCPP TRUE BOOL "TRUE to build GDevelop C++ Platform")
gd_set_option(BUILD_GDJS TRUE BOOL "TRUE to build GDevelop JS Platform")
gd_set_option(BUILD_IDE TRUE BOOL "TRUE to build the IDE")
gd_set_option(BUILD_EXTENSIONS TRUE BOOL "TRUE to build the extensions")
gd_set_option(BUILD_TESTS FALSE BOOL "TRUE to build the tests")
gd_set_option(NO_GUI FALSE BOOL "TRUE to build without wxWidgets GUI")

#Setting up installation directory, for Linux (has to be done before "project" command).
IF(NOT WIN32)
	if (NOT APPLE)
	gd_set_option(GD_INSTALL_PREFIX "/opt/gdevelop/" STRING "The directory where GDevelop should be installed")
	ELSE()
	gd_set_option(GD_INSTALL_PREFIX "." STRING "The directory where GDevelop should be installed")
	ENDIF()

	#As we embed SFML, prevent it to be installed system-wide
	set(CMAKE_INSTALL_PREFIX "${GD_INSTALL_PREFIX}/useless")
ENDIF()

project(GDevelop)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)
IF(NOT WIN32 AND NOT APPLE AND NOT BUILD_TESTS)
	SET(CMAKE_SKIP_BUILD_RPATH  TRUE) #Avoid errors when packaging for linux.
ENDIF()
IF(APPLE)
	set(CMAKE_MACOSX_RPATH 1)
	set(CMAKE_INSTALL_RPATH_USE_LINK_PATH FALSE)
	set(CMAKE_INSTALL_RPATH ".")
	set(CMAKE_BUILD_WITH_INSTALL_RPATH TRUE)
	set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -D_WCHAR_H_CPLUSPLUS_98_CONFORMANCE_")
	set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wno-potentially-evaluated-expression")
ENDIF()

#Sanity checks
IF ("${CMAKE_BUILD_TYPE}" STREQUAL "")
	message( "CMAKE_BUILD_TYPE is empty, assuming build type is Release" )
	set(CMAKE_BUILD_TYPE Release)
ENDIF()
IF (EMSCRIPTEN)
	set(NO_GUI TRUE CACHE BOOL "" FORCE) #Force disable gui when compiling with emscripten.
	set(BUILD_GDCPP FALSE CACHE BOOL "" FORCE) #Force disable GDC++ when compiling with emscripten.
	set(BUILD_IDE FALSE CACHE BOOL "" FORCE) #Force disable IDE when compiling with emscripten.
ENDIF()

IF("${CMAKE_BUILD_TYPE}" STREQUAL "Release" AND NOT WIN32 AND CMAKE_COMPILER_IS_GNUCXX)
	SET(CMAKE_SHARED_LINKER_FLAGS "-s") #Force stripping to avoid errors when packaging for linux.
ENDIF()

#Activate C++11
include(CheckCXXCompilerFlag)
CHECK_CXX_COMPILER_FLAG("-std=gnu++11" COMPILER_SUPPORTS_CXX11)
CHECK_CXX_COMPILER_FLAG("-std=gnu++0x" COMPILER_SUPPORTS_CXX0X)
if(COMPILER_SUPPORTS_CXX11)
	set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=gnu++11")
elseif(COMPILER_SUPPORTS_CXX0X)
	set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=gnu++0x")
else()
    message(FATAL_ERROR "The compiler ${CMAKE_CXX_COMPILER} has no C++11 support (with GNU extensions). Please use a different C++ compiler.")
endif()

#Define common directories:
set(GD_base_dir ${CMAKE_CURRENT_SOURCE_DIR})

#Add all the CMakeLists:
ADD_SUBDIRECTORY(ExtLibs)
IF(EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/Core/CMakeLists.txt" AND BUILD_CORE)
	ADD_SUBDIRECTORY(Core)
ENDIF()
IF(EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/GDJS/CMakeLists.txt" AND BUILD_GDJS)
	ADD_SUBDIRECTORY(GDJS)
ENDIF()
IF(EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/GDCpp/CMakeLists.txt"  AND BUILD_GDCPP)
	ADD_SUBDIRECTORY(GDCpp)
ENDIF()
IF(EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/IDE/CMakeLists.txt"  AND BUILD_IDE)
	ADD_SUBDIRECTORY(IDE)
ENDIF()
IF(EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/GDevelop.js/CMakeLists.txt" AND EMSCRIPTEN)
	ADD_SUBDIRECTORY(GDevelop.js)
ENDIF()
IF(EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/Extensions/CMakeLists.txt"  AND BUILD_EXTENSIONS)
	ADD_SUBDIRECTORY(Extensions)
ENDIF()

cmake_minimum_required(VERSION 2.6)
cmake_policy(SET CMP0015 NEW)

project(GDCore)

SET(CMAKE_C_USE_RESPONSE_FILE_FOR_OBJECTS 1) #Force use response file: useful for Ninja build system on Windows.
SET(CMAKE_CXX_USE_RESPONSE_FILE_FOR_OBJECTS 1)
SET(CMAKE_C_USE_RESPONSE_FILE_FOR_INCLUDES 1)
SET(CMAKE_CXX_USE_RESPONSE_FILE_FOR_INCLUDES 1)

#Define common directories:
set(GDCORE_include_dir ${GD_base_dir}/Core PARENT_SCOPE)
set(GDCORE_lib_dir ${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME} PARENT_SCOPE)

#Dependencies on external libraries:
###

#Defines
###
add_definitions( -DGD_IDE_ONLY )
IF (EMSCRIPTEN)
	add_definitions( -DEMSCRIPTEN )
ENDIF()
IF(CMAKE_BUILD_TYPE MATCHES "Debug")
	add_definitions( -DDEBUG )
ELSE()
	add_definitions( -DRELEASE )
ENDIF()

IF(WIN32)
	add_definitions( -DWINDOWS )
	add_definitions( "-DGD_CORE_API=__declspec(dllexport)" )
	add_definitions( -D__GNUWIN32__ )
ELSE()
    IF(APPLE)
    add_definitions( -DMACOS )
    ELSE()
	add_definitions( -DLINUX )
	ENDIF()
	add_definitions( -DGD_API= )
	add_definitions( -DGD_CORE_API= )
ENDIF(WIN32)

#The target
###
include_directories(.)
file(GLOB_RECURSE source_files GDCore/*)

file(GLOB_RECURSE formatted_source_files tests/* GDCore/Events/* GDCore/Extensions/* GDCore/IDE/* GDCore/Project/* GDCore/Serialization/* GDCore/Tools/*)
list(REMOVE_ITEM formatted_source_files "${CMAKE_CURRENT_SOURCE_DIR}/GDCore/IDE/Dialogs/GDCoreDialogs.cpp" "${CMAKE_CURRENT_SOURCE_DIR}/GDCore/IDE/Dialogs/GDCoreDialogs.h" "${CMAKE_CURRENT_SOURCE_DIR}/GDCore/IDE/Dialogs/GDCoreDialogs_dialogs_bitmaps.cpp")
gd_add_clang_utils(GDCore "${formatted_source_files}")

IF(EMSCRIPTEN)
	# Emscripten treats all libraries as static libraries
	add_library(GDCore STATIC ${source_files})
ELSE()
	add_library(GDCore SHARED ${source_files})
ENDIF()
IF(EMSCRIPTEN)
	set_target_properties(GDCore PROPERTIES SUFFIX ".bc")
ELSEIF(WIN32)
	set_target_properties(GDCore PROPERTIES PREFIX "")
ELSE()
	set_target_properties(GDCore PROPERTIES PREFIX "lib")
ENDIF()
set(LIBRARY_OUTPUT_PATH ${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME})
set(ARCHIVE_OUTPUT_PATH ${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME})
set(RUNTIME_OUTPUT_PATH ${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME})

#Tests
###
if(BUILD_TESTS)
	file(
	    GLOB_RECURSE
	    test_source_files
	    tests/*
	)

	add_executable(GDCore_tests ${test_source_files})
	set_target_properties(GDCore_tests PROPERTIES BUILD_WITH_INSTALL_RPATH FALSE) #Allow finding dependencies directly from build path on Mac OS X.
	target_link_libraries(GDCore_tests GDCore)
	target_link_libraries(GDCore_tests ${CMAKE_DL_LIBS})
endif()

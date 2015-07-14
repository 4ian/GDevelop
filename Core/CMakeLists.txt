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
include_directories(${sfml_include_dir})
IF(WIN32) #Special case for wxWidgets on Windows
	include_directories(${wxwidgets_include_dir})
ELSEIF (NOT EMSCRIPTEN AND NOT NO_GUI)
	find_package(wxWidgets COMPONENTS core base adv net ribbon stc aui propgrid richtext html xrc REQUIRED)
	include( "${wxWidgets_USE_FILE}" )
	include_directories(${GTK_INCLUDE_DIRS})
	link_directories(${GTK_LIBRARY_DIRS})
ENDIF(WIN32)

#Defines
###
add_definitions( -DGD_IDE_ONLY )
IF (EMSCRIPTEN)
	add_definitions( -DEMSCRIPTEN )
ENDIF()
IF (NO_GUI)
	add_definitions( -DGD_NO_WX_GUI )
ENDIF()
IF(CMAKE_BUILD_TYPE MATCHES "Debug")
	add_definitions( -DDEBUG )
	IF(WIN32)
		add_definitions( -D__WXDEBUG__ )
	ENDIF(WIN32)
ELSE()
	add_definitions( -DRELEASE )
ENDIF()

IF(WIN32)
	add_definitions( -DWINDOWS )
	add_definitions( "-DGD_CORE_API=__declspec(dllexport)" )

	add_definitions( -D__GNUWIN32__ )
	add_definitions( -D__WXMSW__ )
	add_definitions( -DwxUSE_UNICODE=1 )
	add_definitions( -DWXUSINGDLL )
ELSE()
    IF(APPLE)
    add_definitions( -DMACOS )
    ELSE()
	add_definitions( -DLINUX )
	ENDIF()
	add_definitions( -DGD_API= )
	add_definitions( -DGD_CORE_API= )
	IF (NOT NO_GUI)
		add_definitions(${GTK_CFLAGS_OTHER})
	ENDIF()
ENDIF(WIN32)

#The target
###
include_directories(.)
file(GLOB_RECURSE source_files GDCore/*)

IF(NO_GUI)
	list(REMOVE_ITEM source_files "${CMAKE_CURRENT_SOURCE_DIR}/GDCore/IDE/Dialogs/GDCoreDialogs.cpp" "${CMAKE_CURRENT_SOURCE_DIR}/GDCore/IDE/Dialogs/GDCoreDialogs.h" "${CMAKE_CURRENT_SOURCE_DIR}/GDCore/IDE/Dialogs/GDCoreDialogs_dialogs_bitmaps.cpp")
ENDIF()

add_library(GDCore SHARED ${source_files})
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

#Linker files
###
IF(EMSCRIPTEN)
	#Nothing.
ELSE()
	target_link_libraries(GDCore ${sfml_LIBRARIES})
	target_link_libraries(GDCore ${wxWidgets_LIBRARIES})
	target_link_libraries(GDCore ${GTK_LIBRARIES})
ENDIF()

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
	target_link_libraries(GDCore_tests ${sfml_LIBRARIES})
	target_link_libraries(GDCore_tests ${wxWidgets_LIBRARIES})
	target_link_libraries(GDCore_tests ${GTK_LIBRARIES})
endif()

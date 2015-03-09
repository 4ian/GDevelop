cmake_minimum_required(VERSION 2.6)
cmake_policy(SET CMP0015 NEW)

project(GDCore)

SET(CMAKE_C_USE_RESPONSE_FILE_FOR_OBJECTS 1) #Force use response file: useful for Ninja build system on Windows.
SET(CMAKE_CXX_USE_RESPONSE_FILE_FOR_OBJECTS 1)
SET(CMAKE_C_USE_RESPONSE_FILE_FOR_INCLUDES 1)
SET(CMAKE_CXX_USE_RESPONSE_FILE_FOR_INCLUDES 1)

#Sanity checks
IF ("${CMAKE_BUILD_TYPE}" STREQUAL "")
  	message( "CMAKE_BUILD_TYPE is empty, assuming build type is Release" )
	set(CMAKE_BUILD_TYPE Release)
ENDIF()
if(CMAKE_COMPILER_IS_GNUCXX)
	IF ("${CMAKE_BUILD_TYPE}" STREQUAL "Release")
    	set(CMAKE_EXE_LINKER_FLAGS "-s")  ## Strip binary
    ENDIF()
endif()
if(EMSCRIPTEN) #When compiling for the web, ensure we get no warning when using our own external libraries.
	SET( CMAKE_CXX_FLAGS  "${CMAKE_CXX_FLAGS} -Wno-warn-absolute-paths --bind" )
ENDIF()

#Common directories:
###
set(GD_base_dir ${CMAKE_CURRENT_SOURCE_DIR}/..)
IF(WIN32) #Special case for wxWidgets on Windows
	set(wxwidgets_include_dir ${GD_base_dir}/ExtLibs/wxwidgets/include)
	IF(CMAKE_BUILD_TYPE MATCHES DEBUG)
		set(wxwidgets_include_dir ${wxwidgets_include_dir} ${GD_base_dir}/ExtLibs/wxwidgets/lib/gcc_dll/mswud)
	ELSE()
		set(wxwidgets_include_dir ${wxwidgets_include_dir} ${GD_base_dir}/ExtLibs/wxwidgets/lib/gcc_dll/mswu)
	ENDIF(CMAKE_BUILD_TYPE MATCHES DEBUG)
	set(wxwidgets_lib_dir ${GD_base_dir}/ExtLibs/wxwidgets/lib/gcc_dll)
ENDIF(WIN32)

#Dependencies on external libraries:
###
include_directories(${sfml_include_dir})
IF(WIN32) #Special case for wxWidgets on Windows
	include_directories(${wxwidgets_include_dir})
ELSEIF (NOT NO_GUI)
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
IF(CMAKE_BUILD_TYPE MATCHES DEBUG)
	add_definitions( -DDEBUG )
	IF(WIN32)
		add_definitions( __WXDEBUG__ )
	ENDIF(WIN32)
ELSEIF ("${CMAKE_BUILD_TYPE}" STREQUAL "Release")
	add_definitions( -DRELEASE )
ELSE()
	add_definitions( -DDEV )
ENDIF(CMAKE_BUILD_TYPE MATCHES DEBUG)

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
ENDIF()
IF(WIN32)
	set_target_properties(GDCore PROPERTIES PREFIX "")
ELSE()
	set_target_properties(GDCore PROPERTIES PREFIX "lib")
ENDIF(WIN32)
set(LIBRARY_OUTPUT_PATH ${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME})
set(ARCHIVE_OUTPUT_PATH ${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME})
set(RUNTIME_OUTPUT_PATH ${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME})

#Linker files
###
IF(EMSCRIPTEN)
	#Nothing.
ELSE()
	target_link_libraries(GDCore sfml-audio sfml-graphics sfml-window sfml-network sfml-system)
	IF(WIN32)
		IF(CMAKE_BUILD_TYPE MATCHES DEBUG)
			target_link_libraries(GDCore ${wxwidgets_lib_dir}/libwxmsw30ud_xrc.a ${wxwidgets_lib_dir}/libwxmsw30ud_stc.a ${wxwidgets_lib_dir}/libwxmsw30ud_richtext.a ${wxwidgets_lib_dir}/libwxmsw30ud_propgrid.a ${wxwidgets_lib_dir}/libwxmsw30ud_ribbon.a ${wxwidgets_lib_dir}/libwxmsw30ud_aui.a ${wxwidgets_lib_dir}/libwxmsw30ud_adv.a ${wxwidgets_lib_dir}/libwxmsw30ud_html.a ${wxwidgets_lib_dir}/libwxmsw30ud_core.a ${wxwidgets_lib_dir}/libwxbase30ud_xml.a ${wxwidgets_lib_dir}/libwxbase30ud_net.a ${wxwidgets_lib_dir}/libwxexpatd.a ${wxwidgets_lib_dir}/libwxbase30ud.a ${wxwidgets_lib_dir}/libwxpngd.a ${wxwidgets_lib_dir}/libwxjpegd.a ${wxwidgets_lib_dir}/libwxzlibd.a ${wxwidgets_lib_dir}/libwxtiffd.a)
		ELSE()
			target_link_libraries(GDCore ${wxwidgets_lib_dir}/libwxmsw30u_xrc.a ${wxwidgets_lib_dir}/libwxmsw30u_stc.a ${wxwidgets_lib_dir}/libwxmsw30u_richtext.a ${wxwidgets_lib_dir}/libwxmsw30u_propgrid.a ${wxwidgets_lib_dir}/libwxmsw30u_ribbon.a ${wxwidgets_lib_dir}/libwxmsw30u_aui.a ${wxwidgets_lib_dir}/libwxmsw30u_adv.a ${wxwidgets_lib_dir}/libwxmsw30u_html.a ${wxwidgets_lib_dir}/libwxmsw30u_core.a ${wxwidgets_lib_dir}/libwxbase30u_xml.a ${wxwidgets_lib_dir}/libwxbase30u_net.a ${wxwidgets_lib_dir}/libwxexpat.a ${wxwidgets_lib_dir}/libwxbase30u.a ${wxwidgets_lib_dir}/libwxpng.a ${wxwidgets_lib_dir}/libwxjpeg.a ${wxwidgets_lib_dir}/libwxzlib.a ${wxwidgets_lib_dir}/libwxtiff.a)
		ENDIF(CMAKE_BUILD_TYPE MATCHES DEBUG)

		target_link_libraries(GDCore ws2_32 user32 opengl32 glu32 psapi)
	ELSE ()
		target_link_libraries(GDCore ${wxWidgets_LIBRARIES})
		target_link_libraries(GDCore ${GTK_LIBRARIES})
	ENDIF()
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
	target_link_libraries(GDCore_tests GDCore)
	target_link_libraries(GDCore_tests sfml-audio sfml-graphics sfml-window sfml-network sfml-system)
	IF (NOT APPLE)
		target_link_libraries(GDCore_tests GLU GL)
	ENDIF()
	target_link_libraries(GDCore_tests ${wxWidgets_LIBRARIES})
	target_link_libraries(GDCore_tests ${GTK_LIBRARIES})
endif()

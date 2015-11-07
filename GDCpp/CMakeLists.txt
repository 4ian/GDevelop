cmake_minimum_required(VERSION 2.6)
cmake_policy(SET CMP0015 NEW)

project(GDCpp)

#Define common directories:
set(GDCpp_include_dir ${GD_base_dir}/GDCpp PARENT_SCOPE)
set(GDCpp_lib_dir ${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME} PARENT_SCOPE)
set(GDCpp_Runtime_lib_dir ${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/CppPlatform/Runtime PARENT_SCOPE)

#Dependencies on external libraries:
###
include_directories(${sfml_include_dir})
include_directories(${GDCORE_include_dir})
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
set(GDCpp_extra_definitions "${GDCpp_extra_definitions} GD_IDE_ONLY=1;")
IF (EMSCRIPTEN) #When compiling for the web, we do not want any GUI related feature.
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
	set(GDCpp_extra_definitions "${GDCpp_extra_definitions} GD_CORE_API=__declspec(dllimport);")
	set(GDCpp_extra_definitions "${GDCpp_extra_definitions} GD_API=__declspec(dllexport);")
	set(GDCpp_Runtime_extra_definitions "${GDCpp_Runtime_extra_definitions} GD_CORE_API=__declspec(dllexport);")
	set(GDCpp_Runtime_extra_definitions "${GDCpp_Runtime_extra_definitions} GD_API=__declspec(dllexport);")
	set(GDCpp_Runtime_exe_extra_definitions "${GDCpp_Runtime_exe_extra_definitions} GD_CORE_API=__declspec(dllimport);")
	set(GDCpp_Runtime_exe_extra_definitions "${GDCpp_Runtime_exe_extra_definitions} GD_API=__declspec(dllimport);")

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


#The targets
###
include_directories(.)

file(GLOB source_gdcpp GDCpp/*)
file(GLOB_RECURSE source_gdcpp_builtin GDCpp/Extensions/*)
file(GLOB_RECURSE source_gdcpp_events GDCpp/Events/*)
file(GLOB source_gdcpp_ide GDCpp/IDE/*)
file(GLOB_RECURSE source_gdcpp_ide_dialogs GDCpp/IDE/Dialogs/*)
file(GLOB_RECURSE source_gdcpp_platfdef GDCpp/Project/*)
file(GLOB_RECURSE source_gdcpp_serialization GDCpp/Serialization/*)
file(GLOB_RECURSE source_gdcpp_tinyxml GDCpp/TinyXml/*)
file(GLOB_RECURSE source_gdcpp_tools GDCpp/Tools/*)
file(GLOB_RECURSE source_gdcpp_utf8 GDCpp/Utf8/*)

set(source_files ${source_gdcpp} ${source_gdcpp_builtin} ${source_gdcpp_events} ${source_gdcpp_ide} ${source_gdcpp_platfdef} ${source_gdcpp_serialization} ${source_gdcpp_tinyxml} ${source_gdcpp_tools} ${source_gdcpp_utf8})
set(ide_source_files ${source_gdcpp} ${source_gdcpp_builtin} ${source_gdcpp_events} ${source_gdcpp_ide} ${source_gdcpp_platfdef} ${source_gdcpp_serialization} ${source_gdcpp_tinyxml} ${source_gdcpp_tools} ${source_gdcpp_utf8})
IF (NOT NO_GUI)
	list(APPEND ide_source_files ${source_gdcpp_ide_dialogs})
ENDIF()

file(GLOB_RECURSE exe_source_files Runtime/*)

add_library(GDCpp SHARED ${ide_source_files})
set_target_properties(GDCpp PROPERTIES COMPILE_DEFINITIONS "${GDCpp_extra_definitions}")
set_target_properties(GDCpp PROPERTIES RUNTIME_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/")
set_target_properties(GDCpp PROPERTIES ARCHIVE_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/")
set_target_properties(GDCpp PROPERTIES LIBRARY_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/")

IF(EMSCRIPTEN)
	set_target_properties(GDCpp PROPERTIES SUFFIX ".bc")
ELSE()
	add_library(GDCpp_Runtime SHARED ${source_files})
	add_executable(GDCpp_Runtime_exe WIN32 ${exe_source_files})
	set_target_properties(GDCpp_Runtime PROPERTIES COMPILE_DEFINITIONS "${GDCpp_Runtime_extra_definitions}")
	set_target_properties(GDCpp_Runtime_exe PROPERTIES COMPILE_DEFINITIONS "${GDCpp_Runtime_exe_extra_definitions}")
	set_target_properties(GDCpp_Runtime PROPERTIES RUNTIME_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/CppPlatform/Runtime")
	set_target_properties(GDCpp_Runtime PROPERTIES ARCHIVE_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/CppPlatform/Runtime")
	set_target_properties(GDCpp_Runtime PROPERTIES LIBRARY_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/CppPlatform/Runtime")
	set_target_properties(GDCpp_Runtime PROPERTIES RUNTIME_OUTPUT_NAME "GDCpp")
	set_target_properties(GDCpp_Runtime PROPERTIES ARCHIVE_OUTPUT_NAME "GDCpp")
	set_target_properties(GDCpp_Runtime PROPERTIES LIBRARY_OUTPUT_NAME "GDCpp")
	set_target_properties(GDCpp_Runtime_exe PROPERTIES RUNTIME_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/CppPlatform/Runtime")
	IF(WIN32)
		set_target_properties(GDCpp_Runtime_exe PROPERTIES RUNTIME_OUTPUT_NAME "PlayWin")
		set_target_properties(GDCpp PROPERTIES PREFIX "")
		set_target_properties(GDCpp_Runtime PROPERTIES PREFIX "")
	ELSE()
		set_target_properties(GDCpp_Runtime_exe PROPERTIES RUNTIME_OUTPUT_NAME "ExeLinux")
		set_target_properties(GDCpp PROPERTIES PREFIX "lib")
		set_target_properties(GDCpp_Runtime PROPERTIES PREFIX "lib")
	ENDIF(WIN32)
ENDIF()

#Linker files for GDCpp
###
IF(EMSCRIPTEN)
	#Nothing.
ELSE()
	target_link_libraries(GDCpp GDCore)
	target_link_libraries(GDCpp ${sfml_LIBRARIES})
	target_link_libraries(GDCpp ${wxWidgets_LIBRARIES})
	target_link_libraries(GDCpp ${GTK_LIBRARIES})
ENDIF()

#Linker files for Runtime
###
IF(EMSCRIPTEN)
	#Nothing.
ELSE()
	target_link_libraries(GDCpp_Runtime_exe GDCpp_Runtime)
	target_link_libraries(GDCpp_Runtime ${sfml_LIBRARIES})
	target_link_libraries(GDCpp_Runtime_exe ${sfml_LIBRARIES})
ENDIF()

#Post build tasks
###
IF(EMSCRIPTEN)
	#Nothing.
ELSE()
	IF(WIN32)
		add_custom_command(TARGET GDCpp
			POST_BUILD
			COMMAND "${GD_base_dir}/GDCpp/scripts/CopyHeadersToGD.bat" "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/CppPlatform")
	ELSE()
		add_custom_command(TARGET GDCpp
			POST_BUILD
			COMMAND sh "CopyHeadersToGD.sh" ${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/CppPlatform/
			WORKING_DIRECTORY ${GD_base_dir}/GDCpp/scripts)
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
	add_executable(GDCpp_tests ${test_source_files})
	set_target_properties(GDCpp_tests PROPERTIES COMPILE_DEFINITIONS "${GDCpp_Runtime_exe_extra_definitions}")
	set_target_properties(GDCpp_tests PROPERTIES BUILD_WITH_INSTALL_RPATH FALSE) #Allow finding dependencies directly from build path on Mac OS X.
	target_link_libraries(GDCpp_tests GDCpp_Runtime)
	target_link_libraries(GDCpp_tests ${sfml_LIBRARIES})
endif()

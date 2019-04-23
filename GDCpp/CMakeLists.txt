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

#Defines
###
set(GDCpp_extra_definitions "${GDCpp_extra_definitions} GD_IDE_ONLY=1;")
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
	set(GDCpp_extra_definitions "${GDCpp_extra_definitions} GD_CORE_API=__declspec(dllimport);")
	set(GDCpp_extra_definitions "${GDCpp_extra_definitions} GD_API=__declspec(dllexport);")
	set(GDCpp_Runtime_extra_definitions "${GDCpp_Runtime_extra_definitions} GD_CORE_API=__declspec(dllexport);")
	set(GDCpp_Runtime_extra_definitions "${GDCpp_Runtime_extra_definitions} GD_API=__declspec(dllexport);")
	set(GDCpp_Runtime_exe_extra_definitions "${GDCpp_Runtime_exe_extra_definitions} GD_CORE_API=__declspec(dllimport);")
	set(GDCpp_Runtime_exe_extra_definitions "${GDCpp_Runtime_exe_extra_definitions} GD_API=__declspec(dllimport);")

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


#The targets
###
include_directories(.)

file(GLOB_RECURSE source_gdcpp_builtin GDCpp/Extensions/*)
file(GLOB_RECURSE source_gdcpp_events GDCpp/Events/*)
file(GLOB source_gdcpp_ide GDCpp/IDE/*)
file(GLOB_RECURSE source_gdcpp_ide_dialogs GDCpp/IDE/Dialogs/*)
file(GLOB_RECURSE source_gdcpp_runtime GDCpp/Runtime/*)

set(source_files ${source_gdcpp_builtin} ${source_gdcpp_runtime})
set(ide_source_files ${source_files} ${source_gdcpp_events} ${source_gdcpp_ide})

file(GLOB_RECURSE formatted_gdcpp_source_files tests/*.cpp GDCpp/Events/* GDCpp/Extensions/* GDCpp/IDE/*.cpp)
list(REMOVE_ITEM formatted_gdcpp_source_files "${CMAKE_CURRENT_SOURCE_DIR}/GDCpp/IDE/Dialogs/GDCppDialogs.cpp" "${CMAKE_CURRENT_SOURCE_DIR}/GDCpp/IDE/Dialogs/GDCppDialogs.h" "${CMAKE_CURRENT_SOURCE_DIR}/GDCpp/IDE/Dialogs/GDCppDialogs_dialogs_bitmaps.cpp")
file(GLOB formatted_gdcpp_runtime_source_files GDCpp/Runtime/*.cpp GDCpp/Runtime/*.h GDCpp/Runtime/Tools/*.cpp GDCpp/Runtime/Tools/*.h GDCpp/Runtime/Serialization/*.cpp GDCpp/Runtime/Serialization/*.h GDCpp/Runtime/Project/*.cpp GDCpp/Runtime/Project/*.h)
set(formatted_source_files ${formatted_gdcpp_source_files} ${formatted_gdcpp_runtime_source_files})
gd_add_clang_utils(GDCpp "${formatted_source_files}")

file(GLOB exe_source_files Runtime/*)

add_library(GDCpp SHARED ${ide_source_files})
set_target_properties(GDCpp PROPERTIES COMPILE_DEFINITIONS "${GDCpp_extra_definitions}")
set_target_properties(GDCpp PROPERTIES RUNTIME_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/")
set_target_properties(GDCpp PROPERTIES ARCHIVE_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/")
set_target_properties(GDCpp PROPERTIES LIBRARY_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/")

IF(EMSCRIPTEN)
	set_target_properties(GDCpp PROPERTIES SUFFIX ".bc")
ELSE()
	add_library(GDCpp_Runtime SHARED ${source_files})
	add_dependencies(GDCpp_Runtime GDVersion)
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
		add_custom_target(GDCpp_IDE_Headers
			ALL
			COMMAND "${GD_base_dir}/GDCpp/scripts/CopyHeadersToGD.bat" "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/CppPlatform")
	ELSE()
		add_custom_target(GDCpp_IDE_Headers
			ALL
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

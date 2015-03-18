cmake_minimum_required(VERSION 2.6)
cmake_policy(SET CMP0015 NEW)

project(DraggableAutomatism)

include_directories(${sfml_include_dir})
include_directories(${GDCORE_include_dir})
include_directories(${GDCpp_include_dir})
IF(WIN32) #Special case for wxWidgets on Windows
	include_directories(${wxwidgets_include_dir})
ELSEIF (NOT EMSCRIPTEN)
	find_package(wxWidgets COMPONENTS core base adv net ribbon stc aui propgrid richtext html xrc REQUIRED)
	include( "${wxWidgets_USE_FILE}" )
	include_directories(${GTK_INCLUDE_DIRS})
	link_directories(${GTK_LIBRARY_DIRS})
ENDIF(WIN32)

#Defines
###
set(DraggableAutomatism_extra_definitions "${DraggableAutomatism_extra_definitions} GD_IDE_ONLY=1;")
IF (EMSCRIPTEN) #When compiling for the web, we do not want any GUI related feature.
	add_definitions( -DGD_NO_WX_GUI )
	add_definitions( -DEMSCRIPTEN )
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
	add_definitions( "-DGD_CORE_API=__declspec(dllimport)" )
	add_definitions( "-DGD_API=__declspec(dllimport)" )
	add_definitions( "-DGD_EXTENSION_API=__declspec(dllexport)" )

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
	add_definitions( -DGD_EXTENSION_API= )
	add_definitions(${GTK_CFLAGS_OTHER})
ENDIF(WIN32)


#The targets
###
include_directories(.)
file(GLOB source_files *)

add_library(DraggableAutomatism SHARED ${source_files})
set_target_properties(DraggableAutomatism PROPERTIES PREFIX "")
set_target_properties(DraggableAutomatism PROPERTIES COMPILE_DEFINITIONS "${DraggableAutomatism_extra_definitions}")
set_target_properties(DraggableAutomatism PROPERTIES RUNTIME_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/CppPlatform/Extensions")
set_target_properties(DraggableAutomatism PROPERTIES ARCHIVE_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/CppPlatform/Extensions")
set_target_properties(DraggableAutomatism PROPERTIES LIBRARY_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/CppPlatform/Extensions")
IF(NOT EMSCRIPTEN)
	add_library(DraggableAutomatism_Runtime SHARED ${source_files})
	set_target_properties(DraggableAutomatism_Runtime PROPERTIES COMPILE_DEFINITIONS "${DraggableAutomatism_Runtime_extra_definitions}")
	set_target_properties(DraggableAutomatism_Runtime PROPERTIES RUNTIME_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/CppPlatform/Extensions/Runtime")
	set_target_properties(DraggableAutomatism_Runtime PROPERTIES ARCHIVE_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/CppPlatform/Extensions/Runtime")
	set_target_properties(DraggableAutomatism_Runtime PROPERTIES LIBRARY_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/CppPlatform/Extensions/Runtime")
	set_target_properties(DraggableAutomatism_Runtime PROPERTIES RUNTIME_OUTPUT_NAME "DraggableAutomatism")
	set_target_properties(DraggableAutomatism_Runtime PROPERTIES LIBRARY_OUTPUT_NAME "DraggableAutomatism")
	set_target_properties(DraggableAutomatism_Runtime PROPERTIES ARCHIVE_OUTPUT_NAME "DraggableAutomatism")
	set_target_properties(DraggableAutomatism_Runtime PROPERTIES PREFIX "")
ENDIF()
IF(WIN32)
	set_target_properties(DraggableAutomatism PROPERTIES SUFFIX ".xgdwe")
	set_target_properties(DraggableAutomatism_Runtime PROPERTIES SUFFIX ".xgdw")
ELSEIF(EMSCRIPTEN)
	set_target_properties(DraggableAutomatism PROPERTIES SUFFIX ".bc")
ELSE()
	set_target_properties(DraggableAutomatism PROPERTIES SUFFIX ".xgde")
	set_target_properties(DraggableAutomatism_Runtime PROPERTIES SUFFIX ".xgd")
ENDIF(WIN32)

#Linker files for the IDE extension
###
gd_extension_link_libraries(DraggableAutomatism)

#Linker files for the GD C++ Runtime extension
###
gdcpp_runtime_extension_link_libraries(DraggableAutomatism_Runtime)

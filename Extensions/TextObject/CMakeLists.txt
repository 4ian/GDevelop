cmake_minimum_required(VERSION 2.6)
cmake_policy(SET CMP0015 NEW)

project(TextObject)

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
set(TextObject_extra_definitions "${TextObject_extra_definitions} GD_IDE_ONLY=1;")
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

gd_add_extension_target(TextObject "${source_files}")
gdcpp_add_runtime_extension_target(TextObject_Runtime "${source_files}")

#Linker files for the IDE extension
###
gd_extension_link_libraries(TextObject)

#Linker files for the GD C++ Runtime extension
###
gdcpp_runtime_extension_link_libraries(TextObject_Runtime)

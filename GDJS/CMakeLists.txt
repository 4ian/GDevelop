cmake_minimum_required(VERSION 2.6)
cmake_policy(SET CMP0015 NEW)
# Use new policy for `FindOpenGL` to prefer GLVND by default when available on linux (use `cmake --help-policy CMP0072` for details).
cmake_policy(SET CMP0072 NEW)

project(GDJS)
#Dependencies on external libraries:
###
include_directories(${GDCORE_include_dir})

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
	add_definitions( "-DGD_API=__declspec(dllexport)" )
	add_definitions( "-DGD_CORE_API=__declspec( dllimport )" )
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
file(GLOB f1 GDJS/* GDJS/IDE/* GDJS/IDE/mongoose/*)
file(GLOB_RECURSE f2 GDJS/Extensions/* GDJS/Events/*)
set(source_files ${f1} ${f2})
IF(NOT EMSCRIPTEN)
file(GLOB_RECURSE f3 GDJS/IDE/Dialogs/*)
set(source_files ${source_files} ${f3})
ENDIF()

file(GLOB_RECURSE formatted_source_files GDJS/Events/* GDJS/Extensions/* GDJS/IDE/*)
list(REMOVE_ITEM formatted_source_files "${CMAKE_CURRENT_SOURCE_DIR}/GDJS/IDE/Dialogs/GDJSDialogs.cpp" "${CMAKE_CURRENT_SOURCE_DIR}/GDJS/IDE/Dialogs/GDJSDialogs.h" "${CMAKE_CURRENT_SOURCE_DIR}/GDJS/IDE/Dialogs/GDJSDialogsBitmaps.cpp")
list(REMOVE_ITEM formatted_source_files "${CMAKE_CURRENT_SOURCE_DIR}/GDJS/IDE/mongoose/mongoose.c" "${CMAKE_CURRENT_SOURCE_DIR}/GDJS/IDE/mongoose/mongoose.h")
gd_add_clang_utils(GDJS "${formatted_source_files}")


IF(EMSCRIPTEN)
	# Emscripten treats all libraries as static libraries
	add_library(GDJS STATIC ${source_files})
ELSE()
	add_library(GDJS SHARED ${source_files})
ENDIF()
IF(EMSCRIPTEN)
	set_target_properties(GDJS PROPERTIES SUFFIX ".bc")
ELSEIF(WIN32)
	set_target_properties(GDJS PROPERTIES PREFIX "")
ELSE()
	set_target_properties(GDJS PROPERTIES PREFIX "lib")
ENDIF()
set_target_properties(GDJS PROPERTIES MACOS_RPATH "..")
set(LIBRARY_OUTPUT_PATH ${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/JsPlatform)
set(ARCHIVE_OUTPUT_PATH ${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/JsPlatform)
set(RUNTIME_OUTPUT_PATH ${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/JsPlatform)

#Linker files
###
IF(EMSCRIPTEN)
	#Nothing.
ELSE()
	target_link_libraries(GDJS GDCore)
ENDIF()

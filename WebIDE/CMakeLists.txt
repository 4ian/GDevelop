cmake_minimum_required(VERSION 2.6)
cmake_policy(SET CMP0015 NEW)

project(WebIDE)

#Sanity checks
IF ("${CMAKE_BUILD_TYPE}" STREQUAL "")
  	message( "CMAKE_BUILD_TYPE is empty, assuming build type is Release" )
	set(CMAKE_BUILD_TYPE Release)
ENDIF()
if(NOT EMSCRIPTEN)
	error("You're trying to compile the WebIDE without emscripten.")
endif()
SET( CMAKE_CXX_FLAGS  "${CMAKE_CXX_FLAGS} -Wno-warn-absolute-paths --bind" )

#Common directories:
###
set(GD_base_dir ${CMAKE_CURRENT_SOURCE_DIR}/..)
set(GDCORE_include_dir ${GD_base_dir}/Core)
set(GDCORE_lib_dir ${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME})
set(GDCpp_include_dir ${GD_base_dir}/GDCpp)
set(GDCpp_lib_dir ${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME})
set(GDJS_include_dir ${GD_base_dir}/GDJS)
set(GDJS_lib_dir ${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/JsPlatform)
set(boost_include_dir ${GD_base_dir}/ExtLibs/boost)
set(sfml_include_dir ${GD_base_dir}/ExtLibs/SFML/include)

#Dependencies on external libraries:
###
include_directories(${boost_include_dir})
include_directories(${sfml_include_dir})
include_directories(${GDCORE_include_dir})
include_directories(${GDCpp_include_dir})
include_directories(${GDJS_include_dir})
IF(NOT TARGET GDCore) #Ensure that the build will work even when GDCore is not in the target list.
link_directories(${GDCORE_lib_dir})
ENDIF()
IF(NOT TARGET GDCpp) #Ensure that the build will work even when GDCpp is not in the target list.
link_directories(${GDCpp_lib_dir})
ENDIF()
IF(NOT TARGET GDJS) #Ensure that the build will work even when GDJS is not in the target list.
link_directories(${GDJS_lib_dir})
ENDIF()

#Defines
###
add_definitions( -DGD_IDE_ONLY )
add_definitions( -DGD_NO_WX_GUI ) #When compiling for the web, we do not want any GUI related feature.
IF(CMAKE_BUILD_TYPE MATCHES DEBUG)
	add_definitions( -DDEBUG )
	IF(WIN32)
		add_definitions( __WXDEBUG__ )
	ENDIF(WIN32)
ELSEIF ("${CMAKE_BUILD_TYPE}" STREQUAL "Release")
	add_definitions( -DRELEASE )
	add_definitions( -DBOOST_DISABLE_ASSERTS )
ELSE()
	add_definitions( -DDEV )
	add_definitions( -DBOOST_DISABLE_ASSERTS )
ENDIF(CMAKE_BUILD_TYPE MATCHES DEBUG)

add_definitions( -Dlinux )
add_definitions( -DLINUX )
add_definitions( -DGD_API= )
add_definitions( -DGD_CORE_API= )

#The target
###
include_directories(.)
file(
        GLOB_RECURSE
        source_files
        WebIDE/*
)

add_library(
        GD
        SHARED
        ${source_files}
)
set_target_properties(GD PROPERTIES SUFFIX ".raw.js")
set(LIBRARY_OUTPUT_PATH ${GD_base_dir}/Binaries/Output/WebIDE/${CMAKE_BUILD_TYPE})
set(ARCHIVE_OUTPUT_PATH ${GD_base_dir}/Binaries/Output/WebIDE/${CMAKE_BUILD_TYPE})
set(RUNTIME_OUTPUT_PATH ${GD_base_dir}/Binaries/Output/WebIDE/${CMAKE_BUILD_TYPE})

#Linker files
###

target_link_libraries(GD GDCore)
target_link_libraries(GD GDJS)
target_link_libraries(GD PlatformAutomatism)
target_link_libraries(GD DestroyOutsideAutomatism)
target_link_libraries(GD TiledSpriteObject)
target_link_libraries(GD DraggableAutomatism)
target_link_libraries(GD TopDownMovementAutomatism)
cmake_minimum_required(VERSION 2.6)
cmake_policy(SET CMP0015 NEW)

project(GDCpp_Runtime_exe)

#Sanity checks and options
IF ("${CMAKE_BUILD_TYPE}" STREQUAL "")
  message( "CMAKE_BUILD_TYPE is empty, assuming build type is Release" )
	set(CMAKE_BUILD_TYPE Release)
ENDIF()
if(CMAKE_COMPILER_IS_GNUCXX)
	IF ("${CMAKE_BUILD_TYPE}" STREQUAL "Release")
    	set(CMAKE_EXE_LINKER_FLAGS "-s")  ## Strip binary
    ENDIF()
endif()

#Common directories:
###
set(GD_base_dir ${CMAKE_CURRENT_SOURCE_DIR}/../..)
set(GDCpp_include_dir ${GD_base_dir}/GDCpp)
set(GDCpp_lib_dir ${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}/CppPlatform/Runtime)
set(boost_include_dir ${GD_base_dir}/ExtLibs/boost)
set(sfml_include_dir ${GD_base_dir}/ExtLibs/SFML/include)
IF(WIN32) 
	IF(CMAKE_BUILD_TYPE MATCHES DEBUG) 
		set(sfml_lib_dir ${GD_base_dir}/ExtLibs/SFML/build-mingw-debug/lib)
	ELSE()
		set(sfml_lib_dir ${GD_base_dir}/ExtLibs/SFML/build-mingw-release/lib)
	ENDIF()
ELSE()	
	set(sfml_lib_dir ${GD_base_dir}/ExtLibs/SFML/build-linux/lib)
ENDIF()

#Dependencies on external libraries:
###
include_directories(${boost_include_dir})
include_directories(${sfml_include_dir})
link_directories(${sfml_lib_dir})
include_directories(${GDCpp_include_dir})
link_directories(${GDCpp_lib_dir})

#Defines
###
IF(CMAKE_BUILD_TYPE MATCHES DEBUG) 
	add_definitions( -DDEBUG )
ELSEIF ("${CMAKE_BUILD_TYPE}" STREQUAL "Release")
	add_definitions( -DRELEASE )
	add_definitions( -DBOOST_DISABLE_ASSERTS )
ELSE()
	add_definitions( -DDEV )
	add_definitions( -DBOOST_DISABLE_ASSERTS )
ENDIF(CMAKE_BUILD_TYPE MATCHES DEBUG) 

IF(WIN32)
	add_definitions( -DWINDOWS )
	add_definitions( "-DGD_CORE_API=__declspec(dllimport)" )
	add_definitions( "-DGD_API=__declspec(dllimport)" )
ELSE()
	add_definitions( -DLINUX )
	add_definitions( -DGD_API= )
	add_definitions( -DGD_CORE_API= )
ENDIF(WIN32)


#The targets
###
include_directories(.)
file(GLOB_RECURSE source_files *)

IF(WIN32)
add_executable(GDCpp_Runtime_exe WIN32 ${source_files})
ELSE()
add_executable(GDCpp_Runtime_exe ${source_files})
ENDIF(WIN32)
set_target_properties(GDCpp_Runtime_exe PROPERTIES RUNTIME_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}/CppPlatform/Runtime")
set_target_properties(GDCpp_Runtime_exe PROPERTIES RUNTIME_OUTPUT_NAME "PlayWin")

#Linker files for Runtime
###
target_link_libraries(GDCpp_Runtime_exe GDCpp_Runtime sfml-audio sfml-graphics sfml-window sfml-network sfml-system)
IF(WIN32)
	target_link_libraries(GDCpp_Runtime_exe ws2_32 user32 opengl32 glu32)
ELSE()
	target_link_libraries(GDCpp_Runtime_exe GL GLU)
ENDIF(WIN32)
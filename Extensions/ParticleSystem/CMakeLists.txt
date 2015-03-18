cmake_minimum_required(VERSION 2.6)
cmake_policy(SET CMP0015 NEW)

project(ParticleSystem)

include_directories(${sfml_include_dir})
include_directories(${GDCORE_include_dir})
include_directories(${GDCpp_include_dir})
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/SPARK/include)
IF(WIN32) #Special case for wxWidgets on Windows
	include_directories(${wxwidgets_include_dir})
ELSE()
	find_package(wxWidgets COMPONENTS core base adv net ribbon stc aui propgrid richtext html xrc REQUIRED)
	include( "${wxWidgets_USE_FILE}" )
	include_directories(${GTK_INCLUDE_DIRS})
	link_directories(${GTK_LIBRARY_DIRS})
ENDIF(WIN32)

#Defines
###
set(ParticleSystem_extra_definitions "${ParticleSystem_extra_definitions} GD_IDE_ONLY=1;")
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
file(GLOB source_files * "SPARK/src/SPK_All.cpp" "SPARK/src/SPK_GL_All.cpp") #Also compiles the SPARK particle engine files.

add_library(ParticleSystem SHARED ${source_files})
add_library(ParticleSystem_Runtime SHARED ${source_files})
set_target_properties(ParticleSystem PROPERTIES COMPILE_DEFINITIONS "${ParticleSystem_extra_definitions}")
set_target_properties(ParticleSystem_Runtime PROPERTIES COMPILE_DEFINITIONS "${ParticleSystem_Runtime_extra_definitions}")
set_target_properties(ParticleSystem PROPERTIES RUNTIME_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/CppPlatform/Extensions")
set_target_properties(ParticleSystem PROPERTIES ARCHIVE_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/CppPlatform/Extensions")
set_target_properties(ParticleSystem PROPERTIES LIBRARY_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/CppPlatform/Extensions")
set_target_properties(ParticleSystem_Runtime PROPERTIES RUNTIME_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/CppPlatform/Extensions/Runtime")
set_target_properties(ParticleSystem_Runtime PROPERTIES ARCHIVE_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/CppPlatform/Extensions/Runtime")
set_target_properties(ParticleSystem_Runtime PROPERTIES LIBRARY_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/CppPlatform/Extensions/Runtime")
set_target_properties(ParticleSystem_Runtime PROPERTIES RUNTIME_OUTPUT_NAME "ParticleSystem")
set_target_properties(ParticleSystem_Runtime PROPERTIES LIBRARY_OUTPUT_NAME "ParticleSystem")
set_target_properties(ParticleSystem_Runtime PROPERTIES ARCHIVE_OUTPUT_NAME "ParticleSystem")
set_target_properties(ParticleSystem PROPERTIES PREFIX "")
set_target_properties(ParticleSystem_Runtime PROPERTIES PREFIX "")
IF(WIN32)
	set_target_properties(ParticleSystem PROPERTIES SUFFIX ".xgdwe")
	set_target_properties(ParticleSystem_Runtime PROPERTIES SUFFIX ".xgdw")
ELSE()
	set_target_properties(ParticleSystem PROPERTIES SUFFIX ".xgde")
	set_target_properties(ParticleSystem_Runtime PROPERTIES SUFFIX ".xgd")
ENDIF(WIN32)
set_target_properties(ParticleSystem_Runtime PROPERTIES RUNTIME_OUTPUT_NAME "ParticleSystem")

#Linker files for the IDE extension
###
gd_extension_link_libraries(ParticleSystem)

#Linker files for the GD C++ Runtime extension
###
gdcpp_runtime_extension_link_libraries(ParticleSystem_Runtime)

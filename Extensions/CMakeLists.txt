#This is the CMake file used to build the extensions.
#For more information, see the Readme.md file.

cmake_minimum_required(VERSION 2.6)
cmake_policy(SET CMP0011 NEW)

project(GD-Extensions)

#Functions to factor common tasks done in CMakeLists.txt of extensions:

#Add common defines for a target that will be a GD extension
function(gd_add_extension_definitions target_name)

	#Define used in GD to check the build type
	IF(CMAKE_BUILD_TYPE MATCHES DEBUG)
		add_definitions( -DDEBUG )
	ELSEIF (CMAKE_BUILD_TYPE} MATCHES "Release")
		add_definitions( -DRELEASE )
	ELSE()
		add_definitions( -DDEV )
	ENDIF()

	set(${target_name}_extra_definitions "${${target_name}_extra_definitions} GD_IDE_ONLY=1;" PARENT_SCOPE)

	IF (NO_GUI) #Are we compiling without any GUI feature?
		add_definitions( -DGD_NO_WX_GUI )
	ENDIF()

	#Defne used in GD to identify the environment
	IF (EMSCRIPTEN)
		add_definitions( -DEMSCRIPTEN )
	ELSEIF(WIN32)
		add_definitions( -DWINDOWS )
    ELSEIF(APPLE)
    	add_definitions( -DMACOS )
    ELSE()
		add_definitions( -DLINUX )
	ENDIF()

	IF(WIN32) #Windows specific defines
		add_definitions( "-DGD_CORE_API=__declspec(dllimport)" )
		add_definitions( "-DGD_API=__declspec(dllimport)" )
		add_definitions( "-DGD_EXTENSION_API=__declspec(dllexport)" )

		add_definitions( -D__GNUWIN32__ ) #wxWidgets Windows specific defines
		add_definitions( -D__WXMSW__ )
		add_definitions( -DwxUSE_UNICODE=1 )
		add_definitions( -DWXUSINGDLL )
	ELSE()

		add_definitions( -DGD_API= )
		add_definitions( -DGD_CORE_API= )
		add_definitions( -DGD_EXTENSION_API= )
		add_definitions(${GTK_CFLAGS_OTHER})
	ENDIF(WIN32)
endfunction()

#Add a GD extension target, that will produce the final library file.
function(gd_add_extension_target target_name source_files)
	IF(target_name STREQUAL "")
		MESSAGE(ERROR "You called gd_add_extension_target without specifying a target name")
	ENDIF()

	add_library(${target_name} SHARED ${source_files})
	set_target_properties(${target_name} PROPERTIES PREFIX "")
	set_target_properties(${target_name} PROPERTIES COMPILE_DEFINITIONS "${${target_name}_extra_definitions}")
	set_target_properties(${target_name} PROPERTIES RUNTIME_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/CppPlatform/Extensions")
	set_target_properties(${target_name} PROPERTIES ARCHIVE_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/CppPlatform/Extensions")
	set_target_properties(${target_name} PROPERTIES LIBRARY_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/CppPlatform/Extensions")
	IF(WIN32) #GD extensions have special suffix in their filenames.
		set_target_properties(${target_name} PROPERTIES SUFFIX ".xgdwe")
	ELSEIF(EMSCRIPTEN)
		set_target_properties(${target_name} PROPERTIES SUFFIX ".bc")
	ELSE()
		set_target_properties(${target_name} PROPERTIES SUFFIX ".xgde")
	ENDIF()
endfunction()

#Add a GDC++ runtime extension target, that will produce the final library file for runtime.
function(gdcpp_add_runtime_extension_target gdcpp_runtime_target_name source_files)
	IF(gdcpp_runtime_target_name STREQUAL "")
		MESSAGE(ERROR "You called gdcpp_add_runtime_extension_target without specifying a target name")
	ENDIF()

	IF(NOT EMSCRIPTEN) #Also add a GDC++ extension target
		set(${gdcpp_runtime_target_name} "${target_name}_Runtime")
		add_library(${gdcpp_runtime_target_name} SHARED ${source_files})
		set_target_properties(${gdcpp_runtime_target_name} PROPERTIES COMPILE_DEFINITIONS "${${gdcpp_runtime_target_name}_extra_definitions}")
		set_target_properties(${gdcpp_runtime_target_name} PROPERTIES RUNTIME_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/CppPlatform/Extensions/Runtime")
		set_target_properties(${gdcpp_runtime_target_name} PROPERTIES ARCHIVE_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/CppPlatform/Extensions/Runtime")
		set_target_properties(${gdcpp_runtime_target_name} PROPERTIES LIBRARY_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/CppPlatform/Extensions/Runtime")
		set_target_properties(${gdcpp_runtime_target_name} PROPERTIES RUNTIME_OUTPUT_NAME "${target_name}")
		set_target_properties(${gdcpp_runtime_target_name} PROPERTIES LIBRARY_OUTPUT_NAME "${target_name}")
		set_target_properties(${gdcpp_runtime_target_name} PROPERTIES ARCHIVE_OUTPUT_NAME "${target_name}")
		set_target_properties(${gdcpp_runtime_target_name} PROPERTIES PREFIX "")
		IF(WIN32) #GD extensions have special suffix in their filenames.
			set_target_properties(${gdcpp_runtime_target_name} PROPERTIES SUFFIX ".xgdw")
		ELSE()
			set_target_properties(${gdcpp_runtime_target_name} PROPERTIES SUFFIX ".xgd")
		ENDIF()
	ENDIF()
endfunction()

#Link default libraries with a target that is a GD extension
function(gd_extension_link_libraries target_name)
	IF(EMSCRIPTEN)
		#Nothing.
	ELSE()
		target_link_libraries(${target_name} GDCore)
		target_link_libraries(${target_name} GDCpp)
		target_link_libraries(${target_name} sfml-audio sfml-graphics sfml-window sfml-network sfml-system)
		target_link_libraries(${target_name} ${wxWidgets_LIBRARIES}) #Add wxWidgets libraries if needed.
		target_link_libraries(${target_name} ${GTK_LIBRARIES}) #Add GTK libraries if needed (Linux only).
	ENDIF()
endfunction()

#Link default libraries with a target that is a GDC++ Runtime extension
function(gdcpp_runtime_extension_link_libraries target_name)
	IF(EMSCRIPTEN)
		#Nothing.
	ELSE()
		target_link_libraries(${target_name} GDCpp_Runtime)
		target_link_libraries(${target_name} sfml-audio sfml-graphics sfml-window sfml-network sfml-system)
		IF(WIN32)
			target_link_libraries(${target_name} ws2_32 user32 opengl32 glu32)
		ENDIF(WIN32)
	ENDIF()
endfunction()

#Add all the CMakeLists:
IF (NOT EMSCRIPTEN) #Only add some extensions when compiling with emscripten.
	ADD_SUBDIRECTORY(AdvancedXML)
	ADD_SUBDIRECTORY(AES)
	ADD_SUBDIRECTORY(Box3DObject)
	IF (NOT APPLE)
		ADD_SUBDIRECTORY(CommonDialogs)
	ENDIF()
ENDIF()
ADD_SUBDIRECTORY(DestroyOutsideAutomatism)
ADD_SUBDIRECTORY(DraggableAutomatism)
IF (NOT EMSCRIPTEN)
	ADD_SUBDIRECTORY(Function)
	ADD_SUBDIRECTORY(Light)
	ADD_SUBDIRECTORY(LinkedObjects)
	ADD_SUBDIRECTORY(Network)
	ADD_SUBDIRECTORY(ParticleSystem)
	ADD_SUBDIRECTORY(PanelSpriteObject)
	ADD_SUBDIRECTORY(PathAutomatism)
	ADD_SUBDIRECTORY(PathfindingAutomatism)
	ADD_SUBDIRECTORY(PhysicsAutomatism)
ENDIF()
ADD_SUBDIRECTORY(PlatformAutomatism)
IF (NOT EMSCRIPTEN)
	ADD_SUBDIRECTORY(PrimitiveDrawing)
	ADD_SUBDIRECTORY(SoundObject)
	ADD_SUBDIRECTORY(TextEntryObject)
ENDIF()
	ADD_SUBDIRECTORY(TextObject)
IF (NOT EMSCRIPTEN)
    ADD_SUBDIRECTORY(TileMapObject)
ENDIF()
ADD_SUBDIRECTORY(TiledSpriteObject)
IF (NOT EMSCRIPTEN)
	ADD_SUBDIRECTORY(TimedEvent)
ENDIF()
ADD_SUBDIRECTORY(TopDownMovementAutomatism)

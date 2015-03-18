#This is the CMake file used to build the extensions.
#For more information, see the Readme.md file.

cmake_minimum_required(VERSION 2.6)
cmake_policy(SET CMP0011 NEW)

project(GD-Extensions)

#Sanity checks
IF ("${CMAKE_BUILD_TYPE}" STREQUAL "")
  message( "CMAKE_BUILD_TYPE is empty, assuming build type is Release" )
	set(CMAKE_BUILD_TYPE Release)
ENDIF()

#Define macro to factor common tasks done in CMakeLists.txt of extensions:

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

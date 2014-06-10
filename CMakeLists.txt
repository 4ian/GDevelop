#This is the CMake file used to build Game Develop.
#For more information, see the Readme.txt file.

cmake_minimum_required(VERSION 2.6)
cmake_policy(SET CMP0011 NEW)

project(GameDevelop)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)
IF(NOT WIN32)
	SET(CMAKE_SKIP_BUILD_RPATH  FALSE) #Avoid errors when packaging for linux.
ENDIF()

#Sanity checks
IF ("${CMAKE_BUILD_TYPE}" STREQUAL "")
	message( "CMAKE_BUILD_TYPE is empty, assuming build type is Release" )
	set(CMAKE_BUILD_TYPE Release)
	IF(NOT WIN32)
		SET(CMAKE_SHARED_LINKER_FLAGS "-s") #Force stripping to avoid errors when packaging for linux.
	ENDIF()
ENDIF()

#Add all the CMakeLists:
IF(EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/Core/CMakeLists.txt")
	ADD_SUBDIRECTORY(Core)
ENDIF()
IF(EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/GDJS/CMakeLists.txt")
	ADD_SUBDIRECTORY(GDJS)
ENDIF()
IF (NOT EMSCRIPTEN) #Disable GDCpp and the IDE when compiling with emscripten
	IF(EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/GDCpp/CMakeLists.txt")
		ADD_SUBDIRECTORY(GDCpp)
	ENDIF()
	IF(EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/IDE/CMakeLists.txt")
		ADD_SUBDIRECTORY(IDE)
	ENDIF()
ENDIF()
IF(EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/Extensions/CMakeLists.txt")
	ADD_SUBDIRECTORY(Extensions)
ENDIF()
IF (EMSCRIPTEN)
	IF(EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/WebIDE/CMakeLists.txt")
		ADD_SUBDIRECTORY(WebIDE)
	ENDIF()
ENDIF()
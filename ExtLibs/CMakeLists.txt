# Clone SFML from its official directory using Git. Only
# do it if not already cloned to avoid triggering a whole
# recompilation every time CMake is run.
find_package(Git)
if(GIT_FOUND)
	if (NOT EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/SFML/readme.txt")
		message( "Cloning SFML in ExtLibs/SFML with Git..." )
		execute_process(
			COMMAND ${GIT_EXECUTABLE} clone "https://www.github.com/SFML/SFML.git" SFML
			WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/
			OUTPUT_QUIET)

		message( "Resetting SFML source code to version 2.4.1..." )
		execute_process(
			COMMAND ${GIT_EXECUTABLE} reset --hard 2.4.1
			WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/SFML
			OUTPUT_QUIET)

		message( "Applying the patches..." )
		file(GLOB SFML_PATCHES
			LIST_DIRECTORIES FALSE
			${CMAKE_CURRENT_SOURCE_DIR}/SFML-patches/*.patch)

		if(SFML_PATCHES)
			list(SORT SFML_PATCHES)

			foreach(SFML_PATCH ${SFML_PATCHES})
				message( "Applying patch: ${SFML_PATCH}..." )
				execute_process(
					COMMAND ${GIT_EXECUTABLE} apply ${SFML_PATCH} --ignore-whitespace
					WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/SFML
					OUTPUT_QUIET)
			endforeach()
		endif()
	else()
		message( "SFML already downloaded." )
	endif()
else()
	message( "Git not found, make sure you have SFML >= 2.4 in ExtLibs/SFML and you applied the needed patches (from ExtLibs/SFML-patches)!" )
endif()

#SFML:
IF(NOT EMSCRIPTEN) #Don't build SFML binaries when compiling with emscripten (but keep include files!)
	add_subdirectory(SFML)
	set(sfml_lib_dir ${CMAKE_BINARY_DIR}/ExtLibs/SFML/lib PARENT_SCOPE)
	set(sfml_LIBRARIES sfml-audio sfml-graphics sfml-window sfml-network sfml-system)
	IF(WIN32)
		set(sfml_LIBRARIES "${sfml_LIBRARIES}" ws2_32 user32 opengl32 glu32 psapi)
	ELSEIF(NOT APPLE)
		set(sfml_LIBRARIES "${sfml_LIBRARIES}" GLU GL)
	ENDIF()
	set(sfml_LIBRARIES "${sfml_LIBRARIES}" PARENT_SCOPE)
ENDIF()
set(sfml_include_dir ${CMAKE_CURRENT_SOURCE_DIR}/SFML/include PARENT_SCOPE)


#Boost:
IF(NOT EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/boost")
	message( "Downloading Boost... (can take a bit of time, be patient)" )
	execute_process(COMMAND curl -o boost.7z http://www.compilgames.net/code/GameDevelopSDK/boost_1_55_0.7z -\# WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/ )
	message( "Extracting Boost in ExtLibs/boost... (can take a bit of time, be patient)" )
	execute_process(COMMAND 7za x -y boost.7z WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/)
	file(RENAME boost_1_55_0 boost)
ENDIF()
set(boost_include_dir ${CMAKE_CURRENT_SOURCE_DIR}/boost PARENT_SCOPE)

#SFML:
IF(NOT NO_GUI)
	IF(NOT EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/SFML")
		message( "Downloading SFML... (can take a bit of time, be patient)" )
		execute_process(COMMAND curl -o SFML.7z http://www.compilgames.net/code/GameDevelopSDK/SFML.7z -\# WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/ )
		message( "Extracting SFML in ExtLibs/SFML... (can take a bit of time, be patient)" )
		execute_process(COMMAND 7za x -y SFML.7z WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/)
	ENDIF()

	ADD_SUBDIRECTORY(SFML)
	set(sfml_include_dir ${CMAKE_CURRENT_SOURCE_DIR}/SFML/include PARENT_SCOPE)
	set(sfml_lib_dir ${CMAKE_BINARY_DIR}/ExtLibs/SFML/lib PARENT_SCOPE)
ENDIF()

#Precompiled wxWidgets on Windows:
IF(NOT NO_GUI AND NOT WIN32)
	IF(NOT EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/wxwidgets")
		message( "Downloading precompiled version of wxWidgets... (can take a bit of time, be patient)" )
		execute_process(COMMAND curl -o wxwidgets.7z http://www.compilgames.net/code/GameDevelopSDK/wxwidgets.7z -\# WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/ )
		message( "Extracting wxWidgets in ExtLibs/wxWidgets... (can take a bit of time, be patient)" )
		execute_process(COMMAND 7za x -y wxwidgets.7z WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/)
	ENDIF()
ENDIF()

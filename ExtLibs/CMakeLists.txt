
#Boost:
IF(NOT EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/boost")
	message( "Downloading and extracting boost in ExtLibs/boost" )
	execute_process(COMMAND curl -o boost.7z http://www.compilgames.net/code/GameDevelopSDK/boost_1_55_0.7z -\# WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/ )
	execute_process(COMMAND 7za x -y boost.7z WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/)
	file(RENAME boost_1_55_0 boost)
ENDIF()
set(boost_include_dir ${CMAKE_CURRENT_SOURCE_DIR}/boost PARENT_SCOPE)

#SFML:
IF(NOT NO_GUI)
	IF(NOT EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/SFML")
		message( "Downloading and extracting SFML in ExtLibs/SFML" )
		execute_process(COMMAND curl -o SFML.7z http://www.compilgames.net/code/GameDevelopSDK/SFML.7z -\# WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/ )
		execute_process(COMMAND 7za x -y SFML.7z WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/)
	ENDIF()

	ADD_SUBDIRECTORY(SFML)
	set(sfml_include_dir ${CMAKE_CURRENT_SOURCE_DIR}/SFML/include PARENT_SCOPE)
	set(sfml_lib_dir ${CMAKE_BINARY_DIR}/ExtLibs/SFML/lib PARENT_SCOPE)
ENDIF()

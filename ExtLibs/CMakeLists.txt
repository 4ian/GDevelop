
#Boost:
IF(NOT EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/boost")
	IF(NOT WIN32) #Download and extract Boost if needed
		message( "Downloading and extracting boost in ExtLibs/boost" )
		execute_process(COMMAND curl -o boost.7z http://www.compilgames.net/code/GameDevelopSDK/boost_1_55_0.7z -\# WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/ )
		execute_process(COMMAND 7za x -y boost.7z WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/)
		execute_process(COMMAND mv boost_1_55_0 boost WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/)
	ELSE()
		message( SEND_ERROR "Boost was not extracted in ExtLibs/boost. Refer to the documentation to get the download link (http://4ian.github.io/GD-Documentation)." )
	ENDIF()
ENDIF()
set(boost_include_dir ${CMAKE_CURRENT_SOURCE_DIR}/boost PARENT_SCOPE)

#SFML:
IF(NOT EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/SFML")
	IF(NOT WIN32) #Download and extract Boost if needed
		message( "Downloading and extracting SFML in ExtLibs/SFML" )
		execute_process(COMMAND curl -o SFML.7z http://www.compilgames.net/code/GameDevelopSDK/SFML.7z -\# WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/ )
		execute_process(COMMAND 7za x -y SFML.7z WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/)
	ELSE()
		message( SEND_ERROR "SFML was not extracted in ExtLibs/SFML. Refer to the documentation to get the download link (http://4ian.github.io/GD-Documentation)." )
	ENDIF()
ENDIF()
ADD_SUBDIRECTORY(SFML)

set(sfml_include_dir ${CMAKE_CURRENT_SOURCE_DIR}/SFML/include PARENT_SCOPE)
set(sfml_lib_dir ${CMAKE_BINARY_DIR}/ExtLibs/SFML/lib PARENT_SCOPE)

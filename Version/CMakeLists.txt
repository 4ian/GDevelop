cmake_minimum_required(VERSION 2.6)
cmake_policy(SET CMP0015 NEW)

project(GDVersion)

add_custom_target(GDVersion
	ALL
	COMMAND ${CMAKE_COMMAND} -P ${PROJECT_SOURCE_DIR}/GenerateVersion.cmake ${PROJECT_SOURCE_DIR}/../Core/GDCore/Tools/
)

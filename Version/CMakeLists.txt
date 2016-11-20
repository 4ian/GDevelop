cmake_minimum_required(VERSION 2.6)
cmake_policy(SET CMP0015 NEW)

project(GDVersion)

if(FULL_VERSION_NUMBER)
	set(GENERATE_VERSION_SCRIPT ${PROJECT_SOURCE_DIR}/GenerateVersionFull.cmake)
else()
	set(GENERATE_VERSION_SCRIPT ${PROJECT_SOURCE_DIR}/GenerateVersionLazy.cmake)
endif()

add_custom_target(GDVersion
	ALL
	COMMAND ${CMAKE_COMMAND} -P ${GENERATE_VERSION_SCRIPT} ${PROJECT_SOURCE_DIR}/../Core/GDCore/Tools/
)

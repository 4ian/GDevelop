find_package(Git)

if(GIT_FOUND)
	EXECUTE_PROCESS(
       		COMMAND ${GIT_EXECUTABLE} describe --tags
       		OUTPUT_VARIABLE GD_VERSION_STR
       		RESULT_VARIABLE GIT_DESCRIBE_RESULT
       		ERROR_VARIABLE GIT_DESCRIBE_ERROR
       		OUTPUT_STRIP_TRAILING_WHITESPACE
   	)

	set(VERSIONPRIV_PATH "${CMAKE_ARGV3}/VersionPriv.h")
	set(ORIGINAL_CONTENT " ")

	if(EXISTS "${VERSIONPRIV_PATH}")
		file(READ "${VERSIONPRIV_PATH}" ORIGINAL_CONTENT)
	endif()

	if("${GD_VERSION_STR}" STREQUAL "")
		message(STATUS "No tags found to determine the version of GDevelop!")
		set(GD_VERSION_STR "0.0.0-0-unknown")
	endif()

	if(NOT ("${ORIGINAL_CONTENT}" STREQUAL "#define GD_VERSION_STRING \"${GD_VERSION_STR}\"\n#define GD_DATE_STRING __DATE__"))
		# Write only the version file if different from the previous one
		message(STATUS "Updating VersionPriv.h header to version ${GD_VERSION_STR}.")
		file(WRITE
			"${VERSIONPRIV_PATH}"
			"#define GD_VERSION_STRING \"${GD_VERSION_STR}\"\n#define GD_DATE_STRING __DATE__")
	else()
		message(STATUS "VersionPriv.h already up-to-date.")
	endif()
else()
	file(WRITE
		"${VERSIONPRIV_PATH}"
		"#define GD_VERSION_STRING \"0.0.0-0-unknown\"\n#define GD_DATE_STRING __DATE__")
endif()

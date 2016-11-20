find_package(Git)

message(WARNING "You're not using the full version number. It's not suitable for public releases and builds!")

if(GIT_FOUND)
	EXECUTE_PROCESS(
       		COMMAND ${GIT_EXECUTABLE} describe --tags --abbrev=0 # Only get the lastest tag's name
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
		set(GD_VERSION_STR "0.0.0")
	endif()

	# Generate the version RC macro
	string(REGEX REPLACE
		"([0-9]*)\\.([0-9]*)\\.([0-9]*)"
		"\\1,\\2,\\3,0"
		GD_VERSION_RC
		"${GD_VERSION_STR}")

	string(REGEX REPLACE
		"([0-9]*)\\.([0-9]*)\\.([0-9]*)"
		"\\1, \\2, \\3, 0"
		GD_VERSION_RC_STR
		"${GD_VERSION_STR}")

	set(NEW_CONTENT "#define GD_VERSION_STRING \"${GD_VERSION_STR}\"\n#define GD_VERSION_RC ${GD_VERSION_RC}\n#define GD_VERSION_RC_STRING \"${GD_VERSION_RC_STR}\\0\"\n#define GD_DATE_STRING __DATE__")

	if(NOT ("${ORIGINAL_CONTENT}" STREQUAL "${NEW_CONTENT}"))
		# Write only the version file if different from the previous one
		message(STATUS "Updating VersionPriv.h header to version ${GD_VERSION_STR}.")
		file(WRITE
			"${VERSIONPRIV_PATH}"
			"${NEW_CONTENT}")
	else()
		message(STATUS "VersionPriv.h already up-to-date.")
	endif()
else()
	file(WRITE
		"${VERSIONPRIV_PATH}"
	"#define GD_VERSION_STRING \"0.0.0-0-unknown\"\n#define GD_VERSION_RC 0, 0, 0, 0\n#define GD_VERSION_RC_STRING \"0, 0, 0, 0\\0\"\n#define GD_DATE_STRING __DATE__")
endif()

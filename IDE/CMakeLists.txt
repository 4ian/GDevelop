cmake_minimum_required(VERSION 2.6)
cmake_policy(SET CMP0015 NEW)

project(GDIDE)

gd_set_option(NO_UPDATE_CHECKER FALSE BOOL "TRUE to remove the integrated update dialog and checker (when building packages as GDevelop is automatically updated by its repository.")

#Dependencies on external libraries:
###
include_directories(${sfml_include_dir})
include_directories(${GDCORE_include_dir})
include_directories(${GDCpp_include_dir})
IF(WIN32) #Special case for wxWidgets on Windows
	include_directories(${wxwidgets_include_dir})
ELSE(NOT EMSCRIPTEN AND NOT NO_GUI)
	find_package(wxWidgets COMPONENTS core base adv net ribbon stc aui propgrid richtext html xrc REQUIRED)
	include( "${wxWidgets_USE_FILE}" )
	include_directories(${GTK_INCLUDE_DIRS})
	link_directories(${GTK_LIBRARY_DIRS})
ENDIF(WIN32)

#Defines
###
add_definitions( -DGD_IDE_ONLY )
IF(CMAKE_BUILD_TYPE MATCHES "Debug")
	add_definitions( -DDEBUG )
	IF(WIN32)
		add_definitions( -D__WXDEBUG__ )
	ENDIF(WIN32)
ELSE ()
	add_definitions( -DRELEASE )
ENDIF()

IF(WIN32)
	add_definitions( -DWINDOWS )
	add_definitions( "-DGD_CORE_API=__declspec(dllimport)" )
	add_definitions( "-DGD_API=__declspec(dllimport)" )
	add_definitions( -D__GNUWIN32__ )
	add_definitions( -D__WXMSW__ )
	add_definitions( -DwxUSE_UNICODE=1 )
	add_definitions( -DWXUSINGDLL )
ELSE()
    IF(APPLE)
    add_definitions( -DMACOS )
    ELSE()
	add_definitions( -DLINUX )
	ENDIF()
	add_definitions( -DGD_API= )
	add_definitions( -DGD_CORE_API= )
	add_definitions(${GTK_CFLAGS_OTHER})
ENDIF(WIN32)

IF(NO_UPDATE_CHECKER)
	add_definitions( -DGD_NO_UPDATE_CHECKER)
ENDIF(NO_UPDATE_CHECKER)


#The targets
###
include_directories(.)
include_directories(wxstedit/include)
file(GLOB source_files * Dialogs/* wxstedit/src/*)
file(GLOB exe_source_files Launcher/MainWin.cpp Launcher/launcherresource.rc)
file(GLOB osx_launcher_source_files Launcher/MainOSX.cpp)

IF(WIN32)
	add_library(GDIDE SHARED ${source_files})
	add_executable(GDIDE_exe WIN32 ${exe_source_files})
	add_executable(GDIDE_dev_exe ${exe_source_files})
ELSEIF(APPLE)
	add_executable(GDIDE ${source_files})
	add_executable(GDIDE_launcher ${osx_launcher_source_files})
	target_link_libraries(GDIDE_launcher "-sectcreate __TEXT __info_plist ${GD_base_dir}/Binaries/Packaging/macos-bundle-skeleton/Contents/Info.plist" )
ELSE()
	add_executable(GDIDE ${source_files})
ENDIF(WIN32)
set_target_properties(GDIDE PROPERTIES PREFIX "")
set_target_properties(GDIDE PROPERTIES RUNTIME_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}")
set_target_properties(GDIDE PROPERTIES ARCHIVE_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}")
set_target_properties(GDIDE PROPERTIES LIBRARY_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}")
set_target_properties(GDIDE PROPERTIES MACOS_RPATH ".")
IF(APPLE)
	set_target_properties(GDIDE_launcher PROPERTIES RUNTIME_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/")
	set_target_properties(GDIDE_launcher PROPERTIES RUNTIME_OUTPUT_NAME "GDIDE_launcher")
ENDIF()
IF(WIN32)
	set_target_properties(GDIDE_exe PROPERTIES RUNTIME_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/")
	set_target_properties(GDIDE_dev_exe PROPERTIES RUNTIME_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/")
	set_target_properties(GDIDE_exe PROPERTIES RUNTIME_OUTPUT_NAME "GDIDE")
	set_target_properties(GDIDE_dev_exe PROPERTIES RUNTIME_OUTPUT_NAME "GDIDE_dev")
ENDIF()

#Linker files for GDIDE
###
target_link_libraries(GDIDE GDCore)
target_link_libraries(GDIDE GDCpp)
target_link_libraries(GDIDE ${sfml_LIBRARIES})
target_link_libraries(GDIDE ${wxWidgets_LIBRARIES}) #Add wxWidgets libraries if needed.
target_link_libraries(GDIDE ${GTK_LIBRARIES}) #Add GTK libraries if needed (Linux only).
IF(WIN32)
	target_link_libraries(GDIDE_exe ${sfml_LIBRARIES})
	target_link_libraries(GDIDE_dev_exe ${sfml_LIBRARIES})
ENDIF(WIN32)

#Pre build tasks
###
IF(NOT WIN32 AND NOT EMSCRIPTEN AND NOT APPLE)
	execute_process(COMMAND sh cleanLinuxLibraries.sh ${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/
		WORKING_DIRECTORY ${GD_base_dir}/IDE/scripts)
ENDIF()

#Post build tasks
###
IF(EMSCRIPTEN)
	#Nothing.
ELSE()

	IF(WIN32)
        add_custom_command(TARGET GDIDE
			POST_BUILD
			COMMAND "${GD_base_dir}/IDE/scripts/copyWindowsLibraries.bat" "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}" "${CMAKE_BINARY_DIR}/ExtLibs/"
			WORKING_DIRECTORY ${GD_base_dir}/IDE/scripts)
    ELSE()
        #Extra files (icons, examples, game templates, translations...) are stored in the Release_Windows
        #output directory, and need to be copied.
		add_custom_command(TARGET GDIDE
			POST_BUILD
			COMMAND sh "CopyResourcesFromWindowsRelease.sh" ${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}
			WORKING_DIRECTORY ${GD_base_dir}/scripts)

		IF (APPLE)
			add_custom_command(TARGET GDIDE
				POST_BUILD
				COMMAND sh "copyMacOSLibraries.sh" ${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/ ${CMAKE_BINARY_DIR}/ExtLibs/SFML/lib ${GD_base_dir}/ExtLibs/SFML
				WORKING_DIRECTORY ${GD_base_dir}/IDE/scripts)
		ELSE()
			add_custom_command(TARGET GDIDE
				POST_BUILD
				COMMAND sh "copyLinuxLibraries.sh" ${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/ ${CMAKE_BINARY_DIR}/ExtLibs/SFML/lib
				WORKING_DIRECTORY ${GD_base_dir}/IDE/scripts)
		ENDIF()
	ENDIF()
ENDIF()

#Installation (Linux only)
###
IF(NOT WIN32 AND NOT APPLE)
	install(DIRECTORY ${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/ DESTINATION "${GD_INSTALL_PREFIX}")
	install(FILES ${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/GDIDE DESTINATION "${GD_INSTALL_PREFIX}" PERMISSIONS OWNER_EXECUTE OWNER_WRITE OWNER_READ GROUP_EXECUTE GROUP_READ WORLD_EXECUTE WORLD_READ )

	install(FILES ${GD_base_dir}/Binaries/Packaging/linux-extra-files/usr/share/applications/gdevelop.desktop DESTINATION /usr/share/applications/ PERMISSIONS OWNER_EXECUTE OWNER_WRITE OWNER_READ GROUP_EXECUTE GROUP_READ WORLD_EXECUTE WORLD_READ )
	install(DIRECTORY ${GD_base_dir}/Binaries/Packaging/linux-extra-files/usr/share/icons/ DESTINATION /usr/share/icons/)
	install(DIRECTORY ${GD_base_dir}/Binaries/Packaging/linux-extra-files/usr/share/mime/ DESTINATION /usr/share/mime/)
	install(FILES ${GD_base_dir}/Binaries/Packaging/linux-extra-files/usr/bin/gdevelop DESTINATION /usr/bin/ PERMISSIONS OWNER_EXECUTE OWNER_WRITE OWNER_READ GROUP_EXECUTE GROUP_READ WORLD_EXECUTE WORLD_READ )
ENDIF()

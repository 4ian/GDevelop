cmake_minimum_required(VERSION 2.6)
cmake_policy(SET CMP0015 NEW)

project(GDCpp)

#Sanity checks and options
IF ("${CMAKE_BUILD_TYPE}" STREQUAL "")
  	message( "CMAKE_BUILD_TYPE is empty, assuming build type is Release" )
	set(CMAKE_BUILD_TYPE Release)
ENDIF()
if(CMAKE_COMPILER_IS_GNUCXX)
	IF ("${CMAKE_BUILD_TYPE}" STREQUAL "Release")
    	set(CMAKE_EXE_LINKER_FLAGS "-s")  ## Strip binary
    ENDIF()
endif()
if(EMSCRIPTEN) #When compiling for the web, ensure we get no warning when using our own external libraries.
	SET( CMAKE_CXX_FLAGS  "${CMAKE_CXX_FLAGS} --bind -Wno-warn-absolute-paths" )
ENDIF()

#Common directories:
###
set(GD_base_dir ${CMAKE_CURRENT_SOURCE_DIR}/..)
set(GDCORE_include_dir ${GD_base_dir}/Core)
set(GDCORE_lib_dir ${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME})
set(boost_include_dir ${GD_base_dir}/ExtLibs/boost)
set(sfml_include_dir ${GD_base_dir}/ExtLibs/SFML/include)
IF(WIN32)
	IF(CMAKE_BUILD_TYPE MATCHES DEBUG)
		set(sfml_lib_dir ${GD_base_dir}/ExtLibs/SFML/build-mingw-debug/lib)
	ELSE()
		set(sfml_lib_dir ${GD_base_dir}/ExtLibs/SFML/build-mingw-release/lib)
	ENDIF()
ELSE()
	set(sfml_lib_dir ${GD_base_dir}/ExtLibs/SFML/build-linux/lib)
ENDIF()
IF(WIN32) #Special case for wxWidgets on Windows
	set(wxwidgets_include_dir ${GD_base_dir}/ExtLibs/wxwidgets/include)
	IF(CMAKE_BUILD_TYPE MATCHES DEBUG)
		set(wxwidgets_include_dir ${wxwidgets_include_dir} ${GD_base_dir}/ExtLibs/wxwidgets/lib/gcc_dll/mswud)
	ELSE()
		set(wxwidgets_include_dir ${wxwidgets_include_dir} ${GD_base_dir}/ExtLibs/wxwidgets/lib/gcc_dll/mswu)
	ENDIF(CMAKE_BUILD_TYPE MATCHES DEBUG)
	set(wxwidgets_lib_dir ${GD_base_dir}/ExtLibs/wxwidgets/lib/gcc_dll)
ENDIF(WIN32)

#Dependencies on external libraries:
###
include_directories(${boost_include_dir})
include_directories(${sfml_include_dir})
include_directories(${GDCORE_include_dir})
IF(WIN32) #Special case for wxWidgets on Windows
	include_directories(${wxwidgets_include_dir})
ELSEIF (NOT EMSCRIPTEN)
	find_package(wxWidgets COMPONENTS core base ribbon webview stc aui propgrid richtext html xrc REQUIRED)
	include( "${wxWidgets_USE_FILE}" )
	find_package(PkgConfig REQUIRED)
	pkg_check_modules(GTK3 REQUIRED gtk+-3.0)
	include_directories(${GTK3_INCLUDE_DIRS})
	link_directories(${GTK3_LIBRARY_DIRS})
ENDIF(WIN32)

#Defines
###
set(GDCpp_extra_definitions "${GDCpp_extra_definitions} GD_IDE_ONLY=1;")
IF (EMSCRIPTEN) #When compiling for the web, we do not want any GUI related feature.
	add_definitions( -DGD_NO_WX_GUI )
	add_definitions( -DEMSCRIPTEN )
ENDIF()
IF(CMAKE_BUILD_TYPE MATCHES DEBUG)
	add_definitions( -DDEBUG )
	IF(WIN32)
		add_definitions( __WXDEBUG__ )
	ENDIF(WIN32)
ELSEIF ("${CMAKE_BUILD_TYPE}" STREQUAL "Release")
	add_definitions( -DRELEASE )
	add_definitions( -DBOOST_DISABLE_ASSERTS )
ELSE()
	add_definitions( -DDEV )
	add_definitions( -DBOOST_DISABLE_ASSERTS )
ENDIF(CMAKE_BUILD_TYPE MATCHES DEBUG)

IF(WIN32)
	add_definitions( -DWINDOWS )
	set(GDCpp_extra_definitions "${GDCpp_extra_definitions} GD_CORE_API=__declspec(dllimport);")
	set(GDCpp_extra_definitions "${GDCpp_extra_definitions} GD_API=__declspec(dllexport);")
	set(GDCpp_Runtime_extra_definitions "${GDCpp_Runtime_extra_definitions} GD_CORE_API=__declspec(dllexport);")
	set(GDCpp_Runtime_extra_definitions "${GDCpp_Runtime_extra_definitions} GD_API=__declspec(dllexport);")
	set(GDCpp_Runtime_exe_extra_definitions "${GDCpp_Runtime_exe_extra_definitions} GD_CORE_API=__declspec(dllimport);")
	set(GDCpp_Runtime_exe_extra_definitions "${GDCpp_Runtime_exe_extra_definitions} GD_API=__declspec(dllimport);")

	add_definitions( -D__GNUWIN32__ )
	add_definitions( -D__WXMSW__ )
	add_definitions( -DwxUSE_UNICODE=1 )
	add_definitions( -DWXUSINGDLL )
ELSE()
	add_definitions( -Dlinux )
	add_definitions( -DLINUX )
	add_definitions( -DGD_API= )
	add_definitions( -DGD_CORE_API= )
	add_definitions(${GTK3_CFLAGS_OTHER})
ENDIF(WIN32)


#The targets
###
include_directories(.)
file(GLOB_RECURSE source_files GDCpp/*)
file(GLOB_RECURSE exe_source_files Runtime/*)

add_library(GDCpp SHARED ${source_files})
set_target_properties(GDCpp PROPERTIES COMPILE_DEFINITIONS "${GDCpp_extra_definitions}")
set_target_properties(GDCpp PROPERTIES RUNTIME_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/")
set_target_properties(GDCpp PROPERTIES ARCHIVE_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/")
set_target_properties(GDCpp PROPERTIES LIBRARY_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/")

IF(EMSCRIPTEN)
	set_target_properties(GDCpp PROPERTIES SUFFIX ".bc")
ELSE() #Runtime targets are only generated for linux and windows.
	add_library(GDCpp_Runtime SHARED ${source_files})
	add_executable(GDCpp_Runtime_exe WIN32 ${exe_source_files})
	set_target_properties(GDCpp_Runtime PROPERTIES COMPILE_DEFINITIONS "${GDCpp_Runtime_extra_definitions}")
	set_target_properties(GDCpp_Runtime_exe PROPERTIES COMPILE_DEFINITIONS "${GDCpp_Runtime_exe_extra_definitions}")
	set_target_properties(GDCpp_Runtime PROPERTIES RUNTIME_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/CppPlatform/Runtime")
	set_target_properties(GDCpp_Runtime PROPERTIES ARCHIVE_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/CppPlatform/Runtime")
	set_target_properties(GDCpp_Runtime PROPERTIES LIBRARY_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/CppPlatform/Runtime")
	set_target_properties(GDCpp_Runtime PROPERTIES RUNTIME_OUTPUT_NAME "GDCpp")
	set_target_properties(GDCpp_Runtime PROPERTIES ARCHIVE_OUTPUT_NAME "GDCpp")
	set_target_properties(GDCpp_Runtime PROPERTIES LIBRARY_OUTPUT_NAME "GDCpp")
	set_target_properties(GDCpp_Runtime_exe PROPERTIES RUNTIME_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/CppPlatform/Runtime")
	IF(WIN32)
		set_target_properties(GDCpp_Runtime_exe PROPERTIES RUNTIME_OUTPUT_NAME "PlayWin")
		set_target_properties(GDCpp PROPERTIES PREFIX "")
		set_target_properties(GDCpp_Runtime PROPERTIES PREFIX "")
	ELSE()
		set_target_properties(GDCpp_Runtime_exe PROPERTIES RUNTIME_OUTPUT_NAME "ExeLinux")
		set_target_properties(GDCpp PROPERTIES PREFIX "lib")
		set_target_properties(GDCpp_Runtime PROPERTIES PREFIX "lib")
	ENDIF(WIN32)
ENDIF()

#Linker files for GDCpp
###
IF(EMSCRIPTEN)
	#Nothing.
ELSE()
	target_link_libraries(GDCpp GDCore)
	IF(WIN32)
		target_link_libraries(GDCpp ${sfml_lib_dir}/libsfml-audio.a ${sfml_lib_dir}/libsfml-graphics.a ${sfml_lib_dir}/libsfml-window.a ${sfml_lib_dir}/libsfml-network.a ${sfml_lib_dir}/libsfml-system.a)
		IF(CMAKE_BUILD_TYPE MATCHES DEBUG)
			target_link_libraries(GDCpp ${wxwidgets_lib_dir}/libwxmsw30ud_xrc.a ${wxwidgets_lib_dir}/libwxmsw30ud_stc.a ${wxwidgets_lib_dir}/libwxmsw30ud_richtext.a ${wxwidgets_lib_dir}/libwxmsw30ud_propgrid.a ${wxwidgets_lib_dir}/libwxmsw30ud_ribbon.a ${wxwidgets_lib_dir}/libwxmsw30ud_aui.a ${wxwidgets_lib_dir}/libwxmsw30ud_adv.a ${wxwidgets_lib_dir}/libwxmsw30ud_html.a ${wxwidgets_lib_dir}/libwxmsw30ud_core.a ${wxwidgets_lib_dir}/libwxbase30ud_xml.a ${wxwidgets_lib_dir}/libwxbase30ud_net.a ${wxwidgets_lib_dir}/libwxexpatd.a ${wxwidgets_lib_dir}/libwxbase30ud.a ${wxwidgets_lib_dir}/libwxpngd.a ${wxwidgets_lib_dir}/libwxjpegd.a ${wxwidgets_lib_dir}/libwxzlibd.a ${wxwidgets_lib_dir}/libwxtiffd.a)
		ELSE()
			target_link_libraries(GDCpp ${wxwidgets_lib_dir}/libwxmsw30u_xrc.a ${wxwidgets_lib_dir}/libwxmsw30u_stc.a ${wxwidgets_lib_dir}/libwxmsw30u_richtext.a ${wxwidgets_lib_dir}/libwxmsw30u_propgrid.a ${wxwidgets_lib_dir}/libwxmsw30u_ribbon.a ${wxwidgets_lib_dir}/libwxmsw30u_aui.a ${wxwidgets_lib_dir}/libwxmsw30u_adv.a ${wxwidgets_lib_dir}/libwxmsw30u_html.a ${wxwidgets_lib_dir}/libwxmsw30u_core.a ${wxwidgets_lib_dir}/libwxbase30u_xml.a ${wxwidgets_lib_dir}/libwxbase30u_net.a ${wxwidgets_lib_dir}/libwxexpat.a ${wxwidgets_lib_dir}/libwxbase30u.a ${wxwidgets_lib_dir}/libwxpng.a ${wxwidgets_lib_dir}/libwxjpeg.a ${wxwidgets_lib_dir}/libwxzlib.a ${wxwidgets_lib_dir}/libwxtiff.a)
		ENDIF(CMAKE_BUILD_TYPE MATCHES DEBUG)

		target_link_libraries(GDCpp ws2_32 user32 opengl32 glu32)
	ELSE()
		target_link_libraries(GDCpp ${sfml_lib_dir}/libsfml-audio.so ${sfml_lib_dir}/libsfml-graphics.so ${sfml_lib_dir}/libsfml-window.so ${sfml_lib_dir}/libsfml-network.so ${sfml_lib_dir}/libsfml-system.so)
		target_link_libraries(GDCpp ${wxWidgets_LIBRARIES})
		target_link_libraries(GDCpp ${GTK3_LIBRARIES})
	ENDIF(WIN32)
ENDIF()

#Linker files for Runtime
###
IF(EMSCRIPTEN)
	#Nothing.
ELSE()
	target_link_libraries(GDCpp_Runtime_exe GDCpp_Runtime)
	IF(WIN32)
		target_link_libraries(GDCpp_Runtime ${sfml_lib_dir}/libsfml-audio.a ${sfml_lib_dir}/libsfml-graphics.a ${sfml_lib_dir}/libsfml-window.a ${sfml_lib_dir}/libsfml-network.a ${sfml_lib_dir}/libsfml-system.a)
		target_link_libraries(GDCpp_Runtime_exe ${sfml_lib_dir}/libsfml-audio.a ${sfml_lib_dir}/libsfml-graphics.a ${sfml_lib_dir}/libsfml-window.a ${sfml_lib_dir}/libsfml-network.a ${sfml_lib_dir}/libsfml-system.a)
		target_link_libraries(GDCpp_Runtime ws2_32 user32 opengl32 glu32)
		target_link_libraries(GDCpp_Runtime_exe ws2_32 user32 opengl32 glu32)
	ELSE()
		target_link_libraries(GDCpp_Runtime ${sfml_lib_dir}/libsfml-audio.so ${sfml_lib_dir}/libsfml-graphics.so ${sfml_lib_dir}/libsfml-window.so ${sfml_lib_dir}/libsfml-network.so ${sfml_lib_dir}/libsfml-system.so)
		target_link_libraries(GDCpp_Runtime_exe ${sfml_lib_dir}/libsfml-audio.so ${sfml_lib_dir}/libsfml-graphics.so ${sfml_lib_dir}/libsfml-window.so ${sfml_lib_dir}/libsfml-network.so ${sfml_lib_dir}/libsfml-system.so)
		target_link_libraries(GDCpp_Runtime_exe GLU GL)
	ENDIF(WIN32)
ENDIF()
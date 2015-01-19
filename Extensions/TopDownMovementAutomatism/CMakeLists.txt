cmake_minimum_required(VERSION 2.6)
cmake_policy(SET CMP0015 NEW)

project(TopDownMovementAutomatism)

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
set(GD_base_dir ${CMAKE_CURRENT_SOURCE_DIR}/../..)
set(GDCORE_include_dir ${GD_base_dir}/Core)
set(GDCORE_lib_dir ${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME})
set(GDCpp_include_dir ${GD_base_dir}/GDCpp)
set(GDCpp_lib_dir ${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME})
set(GDCpp_Runtime_lib_dir ${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/CppPlatform/Runtime)

IF(WIN32) #Special case for wxWidgets on Windows
	set(wxwidgets_include_dir ${GD_base_dir}/ExtLibs/wxwidgets/include)
	IF(CMAKE_BUILD_TYPE MATCHES DEBUG)
		set(wxwidgets_include_dir ${wxwidgets_include_dir} ${GD_base_dir}/ExtLibs/wxwidgets/lib/gcc_dll/mswud)
	ELSE()
		set(wxwidgets_include_dir ${wxwidgets_include_dir} ${GD_base_dir}/ExtLibs/wxwidgets/lib/gcc_dll/mswu)
	ENDIF(CMAKE_BUILD_TYPE MATCHES DEBUG)
	set(wxwidgets_lib_dir ${GD_base_dir}/ExtLibs/wxwidgets/lib/gcc_dll)
ENDIF(WIN32)


include_directories(${sfml_include_dir})
include_directories(${GDCORE_include_dir})
include_directories(${GDCpp_include_dir})
IF(WIN32) #Special case for wxWidgets on Windows
	include_directories(${wxwidgets_include_dir})
ELSEIF (NOT EMSCRIPTEN)
	find_package(wxWidgets COMPONENTS core base adv net ribbon stc aui propgrid richtext html xrc REQUIRED)
	include( "${wxWidgets_USE_FILE}" )
	include_directories(${GTK_INCLUDE_DIRS})
	link_directories(${GTK_LIBRARY_DIRS})
ENDIF(WIN32)
IF(NOT TARGET GDCore) #Ensure that the build will work even when GDCore is not in the target list.
link_directories(${GDCORE_lib_dir})
ENDIF()
IF(NOT TARGET GDCpp) #Ensure that the build will work even when GDC++ is not in the target list.
link_directories(${GDCpp_lib_dir})
ENDIF()
IF(NOT TARGET GDCpp_Runtime)
	add_library(GDCpp_Runtime SHARED IMPORTED)
	IF(WIN32)
		set_property(TARGET GDCpp_Runtime PROPERTY IMPORTED_LOCATION ${GDCpp_Runtime_lib_dir}/GDCpp.dll)
	 	set_property(TARGET GDCpp_Runtime PROPERTY IMPORTED_IMPLIB ${GDCpp_Runtime_lib_dir}/libGDCpp.dll.a)
	ELSE()
		set_property(TARGET GDCpp_Runtime PROPERTY IMPORTED_LOCATION ${GDCpp_Runtime_lib_dir}/libGDCpp.so)
	 	#set_property(TARGET GDCpp_Runtime PROPERTY IMPORTED_IMPLIB ${GDCpp_Runtime_lib_dir}/libGDCpp.so.a)
	ENDIF(WIN32)
ENDIF()

#Defines
###
set(TopDownMovementAutomatism_extra_definitions "${TopDownMovementAutomatism_extra_definitions} GD_IDE_ONLY=1;")
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
ELSE()
	add_definitions( -DDEV )
ENDIF(CMAKE_BUILD_TYPE MATCHES DEBUG)

IF(WIN32)
	add_definitions( -DWINDOWS )
	add_definitions( "-DGD_CORE_API=__declspec(dllimport)" )
	add_definitions( "-DGD_API=__declspec(dllimport)" )
	add_definitions( "-DGD_EXTENSION_API=__declspec(dllexport)" )

	add_definitions( -D__GNUWIN32__ )
	add_definitions( -D__WXMSW__ )
	add_definitions( -DwxUSE_UNICODE=1 )
	add_definitions( -DWXUSINGDLL )
ELSE()
	add_definitions( -DLINUX )
	add_definitions( -DGD_API= )
	add_definitions( -DGD_CORE_API= )
	add_definitions( -DGD_EXTENSION_API= )
	add_definitions(${GTK_CFLAGS_OTHER})
ENDIF(WIN32)


#The targets
###
include_directories(.)
file(GLOB source_files *)

add_library(TopDownMovementAutomatism SHARED ${source_files})
set_target_properties(TopDownMovementAutomatism PROPERTIES PREFIX "")
set_target_properties(TopDownMovementAutomatism PROPERTIES COMPILE_DEFINITIONS "${TopDownMovementAutomatism_extra_definitions}")
set_target_properties(TopDownMovementAutomatism PROPERTIES RUNTIME_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/CppPlatform/Extensions")
set_target_properties(TopDownMovementAutomatism PROPERTIES ARCHIVE_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/CppPlatform/Extensions")
set_target_properties(TopDownMovementAutomatism PROPERTIES LIBRARY_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/CppPlatform/Extensions")
IF(NOT EMSCRIPTEN)
	add_library(TopDownMovementAutomatism_Runtime SHARED ${source_files})
	set_target_properties(TopDownMovementAutomatism_Runtime PROPERTIES COMPILE_DEFINITIONS "${TopDownMovementAutomatism_Runtime_extra_definitions}")
	set_target_properties(TopDownMovementAutomatism_Runtime PROPERTIES RUNTIME_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/CppPlatform/Extensions/Runtime")
	set_target_properties(TopDownMovementAutomatism_Runtime PROPERTIES ARCHIVE_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/CppPlatform/Extensions/Runtime")
	set_target_properties(TopDownMovementAutomatism_Runtime PROPERTIES LIBRARY_OUTPUT_DIRECTORY "${GD_base_dir}/Binaries/Output/${CMAKE_BUILD_TYPE}_${CMAKE_SYSTEM_NAME}/CppPlatform/Extensions/Runtime")
	set_target_properties(TopDownMovementAutomatism_Runtime PROPERTIES RUNTIME_OUTPUT_NAME "TopDownMovementAutomatism")
	set_target_properties(TopDownMovementAutomatism_Runtime PROPERTIES LIBRARY_OUTPUT_NAME "TopDownMovementAutomatism")
	set_target_properties(TopDownMovementAutomatism_Runtime PROPERTIES ARCHIVE_OUTPUT_NAME "TopDownMovementAutomatism")
	set_target_properties(TopDownMovementAutomatism_Runtime PROPERTIES PREFIX "")
ENDIF()
IF(WIN32)
	set_target_properties(TopDownMovementAutomatism PROPERTIES SUFFIX ".xgdwe")
	set_target_properties(TopDownMovementAutomatism_Runtime PROPERTIES SUFFIX ".xgdw")
ELSEIF(EMSCRIPTEN)
	set_target_properties(DraggableAutomatism PROPERTIES SUFFIX ".bc")
ELSE()
	set_target_properties(TopDownMovementAutomatism PROPERTIES SUFFIX ".xgdle")
	set_target_properties(TopDownMovementAutomatism_Runtime PROPERTIES SUFFIX ".xgdl")
ENDIF(WIN32)

#Linker files for the IDE extension
###
IF(EMSCRIPTEN)
	#Nothing.
ELSE()
	target_link_libraries(TopDownMovementAutomatism GDCore)
	target_link_libraries(TopDownMovementAutomatism GDCpp)
	IF(WIN32)
		target_link_libraries(TopDownMovementAutomatism sfml-audio sfml-graphics sfml-window sfml-network sfml-system)
		IF(CMAKE_BUILD_TYPE MATCHES DEBUG)
			target_link_libraries(TopDownMovementAutomatism ${wxwidgets_lib_dir}/libwxmsw30ud_xrc.a ${wxwidgets_lib_dir}/libwxmsw30ud_stc.a ${wxwidgets_lib_dir}/libwxmsw30ud_richtext.a ${wxwidgets_lib_dir}/libwxmsw30ud_propgrid.a ${wxwidgets_lib_dir}/libwxmsw30ud_ribbon.a ${wxwidgets_lib_dir}/libwxmsw30ud_aui.a ${wxwidgets_lib_dir}/libwxmsw30ud_adv.a ${wxwidgets_lib_dir}/libwxmsw30ud_html.a ${wxwidgets_lib_dir}/libwxmsw30ud_core.a ${wxwidgets_lib_dir}/libwxbase30ud_xml.a ${wxwidgets_lib_dir}/libwxbase30ud_net.a ${wxwidgets_lib_dir}/libwxexpatd.a ${wxwidgets_lib_dir}/libwxbase30ud.a ${wxwidgets_lib_dir}/libwxpngd.a ${wxwidgets_lib_dir}/libwxjpegd.a ${wxwidgets_lib_dir}/libwxzlibd.a ${wxwidgets_lib_dir}/libwxtiffd.a)
		ELSE()
			target_link_libraries(TopDownMovementAutomatism ${wxwidgets_lib_dir}/libwxmsw30u_xrc.a ${wxwidgets_lib_dir}/libwxmsw30u_stc.a ${wxwidgets_lib_dir}/libwxmsw30u_richtext.a ${wxwidgets_lib_dir}/libwxmsw30u_propgrid.a ${wxwidgets_lib_dir}/libwxmsw30u_ribbon.a ${wxwidgets_lib_dir}/libwxmsw30u_aui.a ${wxwidgets_lib_dir}/libwxmsw30u_adv.a ${wxwidgets_lib_dir}/libwxmsw30u_html.a ${wxwidgets_lib_dir}/libwxmsw30u_core.a ${wxwidgets_lib_dir}/libwxbase30u_xml.a ${wxwidgets_lib_dir}/libwxbase30u_net.a ${wxwidgets_lib_dir}/libwxexpat.a ${wxwidgets_lib_dir}/libwxbase30u.a ${wxwidgets_lib_dir}/libwxpng.a ${wxwidgets_lib_dir}/libwxjpeg.a ${wxwidgets_lib_dir}/libwxzlib.a ${wxwidgets_lib_dir}/libwxtiff.a)
		ENDIF(CMAKE_BUILD_TYPE MATCHES DEBUG)

		target_link_libraries(TopDownMovementAutomatism ws2_32 user32 opengl32 glu32)
	ELSE()
		target_link_libraries(TopDownMovementAutomatism sfml-audio sfml-graphics sfml-window sfml-network sfml-system)
		target_link_libraries(TopDownMovementAutomatism ${wxWidgets_LIBRARIES})
		target_link_libraries(TopDownMovementAutomatism ${GTK_LIBRARIES})
	ENDIF(WIN32)
ENDIF()

#Linker files for the GD C++ Runtime extension
###
IF(EMSCRIPTEN)
	#Nothing.
ELSE()
	target_link_libraries(TopDownMovementAutomatism_Runtime GDCpp_Runtime)
	IF(WIN32)
		target_link_libraries(TopDownMovementAutomatism_Runtime sfml-audio sfml-graphics sfml-window sfml-network sfml-system)
		target_link_libraries(TopDownMovementAutomatism_Runtime ws2_32 user32 opengl32 glu32)
	ELSE()
		target_link_libraries(TopDownMovementAutomatism_Runtime sfml-audio sfml-graphics sfml-window sfml-network sfml-system)
	ENDIF(WIN32)
ENDIF()

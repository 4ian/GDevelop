cmake_minimum_required(VERSION 2.6)
cmake_policy(SET CMP0015 NEW)

project(TileMapObject)

gd_add_extension_includes()

#Defines
###
gd_add_extension_definitions(TileMapObject)
add_definitions(-DUSE_MINIZ)

#The targets
###
include_directories(.)
set(source_files
	Extension.cpp
	TileMapObject.cpp
	RuntimeTileMapObject.cpp
	TileMapTools.cpp
	TileMapProxies.cpp
	TileMap.cpp
	TileSet.cpp
	)

if (NO_GUI)
	set(gdide_source_files
		${source_files})
else()
	file(GLOB_RECURSE gdide_tmx_source_files IDE/TMXImport/*)
	set(gdide_source_files
		${source_files}
		${gdide_tmx_source_files}
		IDE/Dialogs/TileMapObjectEditor.cpp
		IDE/Dialogs/TileMapObjectEditorCommands.cpp
		IDE/Dialogs/TileSetConfigurationEditor.cpp
		IDE/Dialogs/TileMapConfigurationEditor.cpp
		IDE/Dialogs/TileMapImporterDialog.cpp
		IDE/Dialogs/TileEditor.cpp
		IDE/Dialogs/TileSetPanel.cpp
		IDE/Dialogs/TileMapPanel.cpp
		IDE/Dialogs/TileMapDialogs.cpp
		IDE/Dialogs/TileMapDialogs.xrc
		IDE/Dialogs/TileMapDialogs_wxsmith_bitmaps.cpp)
endif()

gd_add_extension_target(TileMapObject "${gdide_source_files}")
gdcpp_add_runtime_extension_target(TileMapObject_Runtime "${source_files}")

#Linker files for the IDE extension
###
gd_extension_link_libraries(TileMapObject)

#Linker files for the GD C++ Runtime extension
###
gdcpp_runtime_extension_link_libraries(TileMapObject_Runtime)

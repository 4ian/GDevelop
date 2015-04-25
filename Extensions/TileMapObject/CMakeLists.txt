cmake_minimum_required(VERSION 2.6)
cmake_policy(SET CMP0015 NEW)

project(TileMapObject)

gd_add_extension_includes()

#Defines
###
gd_add_extension_definitions(TileMapObject)

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

set(gdide_source_files
	${source_files}
	TileMapObjectEditor.cpp
	TileMapObjectEditorCommands.cpp
	TileSetConfigurationEditor.cpp
	TileMapConfigurationEditor.cpp
	TileEditor.cpp
	TileSetPanel.cpp
	TileMapPanel.cpp
	TileMapDialogs.cpp
	TileMapDialogs.xrc
	TileMapDialogs_wxsmith_bitmaps.cpp)


gd_add_extension_target(TileMapObject "${gdide_source_files}")
gdcpp_add_runtime_extension_target(TileMapObject_Runtime "${source_files}")

#Linker files for the IDE extension
###
gd_extension_link_libraries(TileMapObject)

#Linker files for the GD C++ Runtime extension
###
gdcpp_runtime_extension_link_libraries(TileMapObject_Runtime)

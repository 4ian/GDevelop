cmake_minimum_required(VERSION 2.6)
cmake_policy(SET CMP0015 NEW)

project(FacebookInstantGames)
gd_add_extension_includes()

#Defines
###
gd_add_extension_definitions(FacebookInstantGames)

#The targets
###
include_directories(.)
file(GLOB source_files *.cpp *.h)

gd_add_extension_target(FacebookInstantGames "${source_files}" "JsPlatform")
gd_add_clang_utils(FacebookInstantGames "${source_files}")

#Linker files for the IDE extension
###
gd_extension_link_libraries(FacebookInstantGames)

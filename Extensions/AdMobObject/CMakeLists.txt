cmake_minimum_required(VERSION 2.6)
cmake_policy(SET CMP0015 NEW)

project(AdMobObject)
gd_add_extension_includes()

#Defines
###
gd_add_extension_definitions(AdMobObject)

#The targets
###
include_directories(.)
file(GLOB source_files *)

gd_add_extension_target(AdMobObject "${source_files}" "JsPlatform")

#Linker files for the IDE extension
###
gd_extension_link_libraries(AdMobObject)

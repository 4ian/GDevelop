cmake_minimum_required(VERSION 2.6)
cmake_policy(SET CMP0015 NEW)

project(SpineObject)
gd_add_extension_includes()

#Defines
###
gd_add_extension_definitions(SpineObject)

#The targets
###
include_directories(.)
file(GLOB source_files *.cpp *.h)
gd_add_clang_utils(SpineObject "${source_files}")
gd_add_extension_target(SpineObject "${source_files}")

#Linker files for the IDE extension
###
gd_extension_link_libraries(SpineObject)

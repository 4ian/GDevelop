cmake_minimum_required(VERSION 2.6)
cmake_policy(SET CMP0015 NEW)

project(Light)
gd_add_extension_includes()

#Defines
###
gd_add_extension_definitions(Light)

#The targets
###
include_directories(.)
file(GLOB source_files *.cpp *.h)
gd_add_clang_utils(Light "${source_files}")

gd_add_extension_target(Light "${source_files}")
gdcpp_add_runtime_extension_target(Light_Runtime "${source_files}")

#Linker files for the IDE extension
###
gd_extension_link_libraries(Light)

#Linker files for the GD C++ Runtime extension
###
gdcpp_runtime_extension_link_libraries(Light_Runtime)

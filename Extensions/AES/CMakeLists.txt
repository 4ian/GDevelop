cmake_minimum_required(VERSION 2.6)
cmake_policy(SET CMP0015 NEW)

project(AES)

gd_add_extension_includes()

#Defines
###
gd_add_extension_definitions(AES)

#The targets
###
include_directories(.)
file(GLOB_RECURSE source_files *.cpp *.h)
gd_add_clang_utils(AES "${source_files}")

gd_add_extension_target(AES "${source_files}")
gdcpp_add_runtime_extension_target(AES_Runtime "${source_files}")

#Linker files for the IDE extension
###
gd_extension_link_libraries(AES)

#Linker files for the GD C++ Runtime extension
###
gdcpp_runtime_extension_link_libraries(AES_Runtime)

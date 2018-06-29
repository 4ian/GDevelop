cmake_minimum_required(VERSION 2.6)
cmake_policy(SET CMP0015 NEW)

project(LinkedObjects)
gd_add_extension_includes()

#Defines
###
gd_add_extension_definitions(LinkedObjects)

#The targets
###
include_directories(.)
file(GLOB source_files *.cpp *.h)
gd_add_clang_utils(LinkedObjects "${source_files}")

gd_add_extension_target(LinkedObjects "${source_files}")
gdcpp_add_runtime_extension_target(LinkedObjects_Runtime "${source_files}")

#Linker files for the IDE extension
###
gd_extension_link_libraries(LinkedObjects)


#Linker files for the GD C++ Runtime extension
###
gdcpp_runtime_extension_link_libraries(LinkedObjects_Runtime)

#Tests for the GD C++ Runtime extension
###
file(GLOB_RECURSE test_source_files tests/*)
gdcpp_add_tests_extension_target(LinkedObjects_Runtime_tests "${test_source_files}")

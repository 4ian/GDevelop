cmake_minimum_required(VERSION 2.6)
cmake_policy(SET CMP0015 NEW)

project(AdvancedXML)
gd_add_extension_includes()

#Defines
###
gd_add_extension_definitions(AdvancedXML)

#The targets
###
include_directories(src)
file(GLOB_RECURSE source_files src/*)

gd_add_extension_target(AdvancedXML "${source_files}")
gdcpp_add_runtime_extension_target(AdvancedXML_Runtime "${source_files}")

#Linker files for the IDE extension
###
gd_extension_link_libraries(AdvancedXML)

#Linker files for the GD C++ Runtime extension
###
gdcpp_runtime_extension_link_libraries(AdvancedXML_Runtime)

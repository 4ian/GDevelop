cmake_minimum_required(VERSION 2.6)
cmake_policy(SET CMP0015 NEW)

project(DestroyOutsideAutomatism)
gd_add_extension_includes()

#Defines
###
gd_add_extension_definitions(DestroyOutsideAutomatism)

#The targets
###
include_directories(.)
file(GLOB source_files *)

gd_add_extension_target(DestroyOutsideAutomatism "${source_files}")
gdcpp_add_runtime_extension_target(DestroyOutsideAutomatism_Runtime "${source_files}")

#Linker files for the IDE extension
###
gd_extension_link_libraries(DestroyOutsideAutomatism GDCore)

#Linker files for the GD C++ Runtime extension
###
gdcpp_runtime_extension_link_libraries(DestroyOutsideAutomatism_Runtime)

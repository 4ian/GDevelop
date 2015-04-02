cmake_minimum_required(VERSION 2.6)
cmake_policy(SET CMP0015 NEW)

project(ParticleSystem)

gd_add_extension_includes()

#Defines
###
gd_add_extension_definitions(ParticleSystem)

#The targets
###
include_directories(./SPARK/include)
include_directories(.)
file(GLOB source_files * "SPARK/src/SPK_All.cpp" "SPARK/src/SPK_GL_All.cpp") #Also compiles the SPARK particle engine files.

gd_add_extension_target(ParticleSystem "${source_files}")
gdcpp_add_runtime_extension_target(ParticleSystem_Runtime "${source_files}")

#Linker files for the IDE extension
###
gd_extension_link_libraries(ParticleSystem)

#Linker files for the GD C++ Runtime extension
###
gdcpp_runtime_extension_link_libraries(ParticleSystem_Runtime)

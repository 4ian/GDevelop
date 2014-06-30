#
# This is a CMake makefile.  You can find the cmake utility and
# information about it at http://www.cmake.org
#

SET(CMAKE_ALLOW_LOOSE_LOOP_CONSTRUCTS true)
cmake_minimum_required(VERSION 2.4)
if(COMMAND cmake_policy) 
   cmake_policy(SET CMP0003 NEW) 
endif()

# create a variable called target_name and set it to the string "htmlify"
set (target_name htmlify)

PROJECT(${target_name})

# add all the cpp files we want to compile to this list.  This tells
# cmake that they are part of our target (which is the executable named htmlify)
ADD_EXECUTABLE(${target_name} 
htmlify.cpp
to_xml.cpp
)

# add the folder containing the dlib folder to the include path
INCLUDE_DIRECTORIES(../..)

# There is a CMakeLists.txt file in the dlib source folder that tells cmake
# how to build the dlib library.  Tell cmake about that file.
add_subdirectory(../../dlib dlib_build)

# Tell cmake to link our target executable to the non-gui version of the dlib
# library.  
TARGET_LINK_LIBRARIES(${target_name} dlib )




INSTALL(TARGETS ${target_name}
	RUNTIME DESTINATION bin
	)


#set default build type to Release
include(../../dlib/release_build_by_default)


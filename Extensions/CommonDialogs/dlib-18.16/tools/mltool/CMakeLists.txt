#
# This is a CMake makefile.  You can find the cmake utility and
# information about it at http://www.cmake.org
#

cmake_minimum_required(VERSION 2.8.4)

# create a variable called target_name and set it to the string "mltool"
set (target_name mltool)

PROJECT(${target_name})

# add all the cpp files we want to compile to this list.  This tells
# cmake that they are part of our target (which is the executable named mltool)
ADD_EXECUTABLE(${target_name} 
   src/main.cpp
   src/regression.cpp
   src/regression.h
   src/common.h
   src/option_range.h
   src/option_range.cpp
)



# Tell cmake to link our target executable to dlib.
include(../../dlib/cmake)
TARGET_LINK_LIBRARIES(${target_name} dlib )


INSTALL(TARGETS ${target_name}
	RUNTIME DESTINATION bin
	)


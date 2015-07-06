#
# This is a CMake makefile.  You can find the cmake utility and
# information about it at http://www.cmake.org
#

# create a variable called target_name and set it to the string "test"
set (target_name gui)

PROJECT(${target_name})

# add all the cpp files we want to compile to this list.  This tells
# cmake that they are part of our target (which is the executable named test)
ADD_EXECUTABLE(${target_name} main.cpp )

# Add the folder containing the dlib folder to the include path
INCLUDE_DIRECTORIES(../../..)

# Tell cmake to link our target executable to dlib.
TARGET_LINK_LIBRARIES(${target_name} dlib )


#
# This is a CMake makefile.  You can find the cmake utility and
# information about it at http://www.cmake.org
#

# setting this makes CMake allow normal looking IF ELSE statements
SET(CMAKE_ALLOW_LOOSE_LOOP_CONSTRUCTS true)
cmake_minimum_required(VERSION 2.4)
if(COMMAND cmake_policy)
   cmake_policy(SET CMP0003 NEW)
endif(COMMAND cmake_policy)

# This variable contains a list of all the tests we are building
# into the regression test suite.
set (tests
   blas_bindings_gemm.cpp
   blas_bindings_gemv.cpp
   blas_bindings_ger.cpp
   blas_bindings_dot.cpp
   vector.cpp
   )

# create a variable called target_name and set it to the string "test"
set (target_name test)

PROJECT(${target_name})

# add all the cpp files we want to compile to this list.  This tells
# cmake that they are part of our target (which is the executable named test)
ADD_EXECUTABLE(${target_name} ../main.cpp ../tester.cpp ${tests})

# add the folder containing the dlib folder to the include path
INCLUDE_DIRECTORIES(../../..)

ADD_DEFINITIONS(-DDLIB_TEST_BLAS_BINDINGS)
# There is a CMakeLists.txt file in the dlib source folder that tells cmake
# how to build the dlib library.  Tell cmake about that file.
add_subdirectory(../.. dlib_build)

# Tell cmake to link our target executable to dlib
TARGET_LINK_LIBRARIES(${target_name} dlib )


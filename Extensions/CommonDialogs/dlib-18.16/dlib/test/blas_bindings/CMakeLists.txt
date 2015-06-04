#
# This is a CMake makefile.  You can find the cmake utility and
# information about it at http://www.cmake.org
#

cmake_minimum_required(VERSION 2.6)

# This variable contains a list of all the tests we are building
# into the regression test suite.
set (tests
   blas_bindings_gemm.cpp
   blas_bindings_gemv.cpp
   blas_bindings_ger.cpp
   blas_bindings_dot.cpp
   blas_bindings_scal_axpy.cpp
   vector.cpp
   )

# create a variable called target_name and set it to the string "test"
set (target_name test)

PROJECT(${target_name})

# add all the cpp files we want to compile to this list.  This tells
# cmake that they are part of our target (which is the executable named test)
ADD_EXECUTABLE(${target_name} ../main.cpp ../tester.cpp ${tests})

ADD_DEFINITIONS(-DDLIB_TEST_BLAS_BINDINGS)

# Tell cmake to link our target executable to dlib
include(../../cmake)
TARGET_LINK_LIBRARIES(${target_name} dlib )


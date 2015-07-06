
cmake_minimum_required(VERSION 2.8.4)

PROJECT(mex_functions)

include(cmake_mex_wrapper)

include(../cmake)

# Compile the example_mex_function.cpp file and link it to dlib.  Note
# that you can give a list of things to link to here.  E.g. 
#    add_mex_function(some_other_mex_function pthread dlib fftw) 
add_mex_function(example_mex_function dlib)
add_mex_function(example_mex_callback dlib)


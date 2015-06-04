This folder contains a set of tools which make it easy to create MATLAB mex
functions.  To understand how they work, you should read the
example_mex_function.cpp and example_mex_callback.cpp examples.

To compile them, you can use CMake.  In particular, from this folder execute
these commands:

   mkdir build
   cd build
   cmake ..
   cmake --build . --config release --target install

That should build the mex files on any platform.

Note that on windows you will probably need to tell CMake to use a 64bit
version of visual studio.  You can do this by using a command like:
   cmake -G "Visual Studio 10 Win64" ..
instead of
   cmake ..


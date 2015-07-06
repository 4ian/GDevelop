 
                           dlib C++ library

This project is a modern C++ library with a focus on portability 
and program correctness. It strives to be easy to use right and 
hard to use wrong. Thus, it comes with extensive documentation and 
thorough debugging modes. The library provides a platform abstraction 
layer for common tasks such as interfacing with network services, 
handling threads, or creating graphical user interfaces. Additionally, 
the library implements many useful algorithms such as data compression 
routines, linked lists, binary search trees, linear algebra and matrix 
utilities, machine learning algorithms, XML and text parsing, and many 
other general utilities.

Documentation:  
  There should be HTML documentation accompanying this library.  But
  if there isn't you can download it from http://dlib.net

Installation:
  To use this library all you have to do is extract the library 
  somewhere, make sure the folder *containing* the dlib folder is in 
  your include path, and finally add dlib/all/source.cpp to your 
  project.

  An example makefile that uses this library can be found here: 
  dlib/test/makefile. It is the makefile used to build the regression 
  test suite for this library. There is also a CMake makefile that 
  builds the regression test suite at dlib/test/CMakeLists.txt and 
  another CMake makefile that builds all the example programs in
  the examples folder.

  For further information see the accompanying HTML documentation or
  visit http://dlib.net

The license for this library can be found in LICENSE.txt.  But the
long and short of the license is that you can use this code however
you like, even in closed source commercial software.

Version: 18.16
Date:    Wed Jun  3 20:15:45 EDT 2015
Mercurial Revision ID: 42a25c606cf9

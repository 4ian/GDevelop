**********************************
A* Algorithm by Justin Heyes-Jones
**********************************

***********
Description
***********

This implementation is intended to be simple to read yet fairly
efficient. To build it you can compile, with any recent C++ compiler,
the following files :

For 8-puzzle solver

	8puzzle.cpp
	stlastar.h
	optionally fsa.h

Command line 

	8puzzle with no arguments runs with one of the boards in the cpp file, you can
	select the one you want changing the conditional compiliation instructions. Or if you
	prefer pass in a board on the command line using digits for the tile positions, where
	zero is the space. The board runs from left to right, each row at a time:
	
		8puzzle 013824765

For path finder 

	findpath.cpp
	stlastar.h
	optionally fsa.h

	pathfind has no arguments. You can edit the simple map in pathfind.cpp and the start 
	and goal co-ordinates to experiement with the pathfinder.

Fixed size allocator notes: As mentioned briefly in the tutorial you can enable and disable the
faster memory allocation. This allocates a fixed size block of memory, so you have to specify this size
with the astar constructor. You need to enlarge it if you hit an out of memory assert during the
search.

Compilation notes:

Microsoft Visual C++ : Confirmed working with version 8.0.50727 with some deprecation warnings
I'm going to leave the deprecation warnings in so that it still works cleanly with GCC. 
TODO Make a non-deprecated compliant version using compiler checking

GCC notes : Compiled using version 3.4.5 (MingW)

Please let me know if it doesn't work for you and I will try to help. I cannot help if you are using
an old compiler such as Turbo C++, since I update the code to meet Ansi Standard C++ as required.

At least in as far as the Microsoft and GCC compilers adhere to Ansi and add breaking changes.

History:

Updated 1th February 2009
**********************************

Fixed Manhattan distance bug. Should use absolute values.

Got rid of sprintfs, use cout instead.

Updated 3rd August 2006
**********************************

Fixed memory leak
Fixed special case handling for finding better path to a closed node
Fixed bug with comparing the start node with a new node by pointer instead of value
Changed code to use Manhattan distance heuristic with pathfind.cpp as it is more correct


Updated 27th September 2005
**********************************

Thanks to Gyan singh for pointing out the code no longer compiles under GCC.

Well, that was the case. I've removed a Gnu offending conio.h include, and added lots more typename
keywords, which seem to be required now when making an iterator using a template type.

If anyone knows what the breaking change to the compiler was for, let me know.

Updated 6th September 2005
**********************************

	Finally set the path to fsa.h correctly, sorry about that.
	8puzzle.cpp now defaults to using a demo puzzle that solves in a short time.
	Added typename keyword to comply with latest ISO standards. 

Updated November 26th 2001
**********************************

	Fixed a bug. When a node is deleted from the Open list I did sort_heap when make_heap
	is needed to keep the heap structure valid. This causes the search to go awry under some
	conditions. Thanks to Mike Ryynanen for tracking this down.

justinhj@hotmail.com

http://www.geocities.com/jheyesjones/astar.html

or

http://www.heyes-jones.com/astar.html

A* Algorithm Implementation using STL is
Copyright (C)2001-2005 Justin Heyes-Jones

Permission is given by the author to freely redistribute and 
include this code in any program as long as this credit is 
given where due.
 
  COVERED CODE IS PROVIDED UNDER THIS LICENSE ON AN "AS IS" BASIS, 
  WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESSED OR IMPLIED, 
  INCLUDING, WITHOUT LIMITATION, WARRANTIES THAT THE COVERED CODE 
  IS FREE OF DEFECTS, MERCHANTABLE, FIT FOR A PARTICULAR PURPOSE
  OR NON-INFRINGING. THE ENTIRE RISK AS TO THE QUALITY AND 
  PERFORMANCE OF THE COVERED CODE IS WITH YOU. SHOULD ANY COVERED 
  CODE PROVE DEFECTIVE IN ANY RESPECT, YOU (NOT THE INITIAL 
  DEVELOPER OR ANY OTHER CONTRIBUTOR) ASSUME THE COST OF ANY 
  NECESSARY SERVICING, REPAIR OR CORRECTION. THIS DISCLAIMER OF 
  WARRANTY CONSTITUTES AN ESSENTIAL PART OF THIS LICENSE. NO USE 
  OF ANY COVERED CODE IS AUTHORIZED HEREUNDER EXCEPT UNDER
  THIS DISCLAIMER.
 
  Use at your own risk!





















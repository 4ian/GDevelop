#
# This is a CMake makefile.  You can find the cmake utility and
# information about it at http://www.cmake.org
#

# setting this makes CMake allow normal looking IF ELSE statements
SET(CMAKE_ALLOW_LOOSE_LOOP_CONSTRUCTS true)
cmake_minimum_required(VERSION 2.4)
if(COMMAND cmake_policy) 
   cmake_policy(SET CMP0003 NEW) 
endif()


# make macros that can add #define directives to the entire project.  Not just 
# to the dlib library itself.  I.e. to dlib and to any projects that depend
# on dlib.
MACRO ( add_global_define def_name )
   if (NOT CMAKE_CXX_FLAGS MATCHES "-D${def_name}")
      set (CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -D${def_name}" 
         CACHE STRING "Flags used by the compiler during all C++ builds." 
         FORCE)
   endif ()
ENDMACRO()
MACRO ( remove_global_define def_name )
   if (CMAKE_CXX_FLAGS MATCHES " -D${def_name}")
      string (REGEX REPLACE " -D${def_name}" "" temp_var ${CMAKE_CXX_FLAGS}) 
      set (CMAKE_CXX_FLAGS "${temp_var}" 
         CACHE STRING "Flags used by the compiler during all C++ builds." 
         FORCE)
   endif ()
ENDMACRO()


# Make sure ENABLE_ASSERTS is defined for debug builds
if (NOT CMAKE_CXX_FLAGS_DEBUG MATCHES "-DENABLE_ASSERTS")
   set (CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS_DEBUG} -DENABLE_ASSERTS" 
      CACHE STRING "Flags used by the compiler during C++ debug builds." 
      FORCE)
endif ()

set (DLIB_ISO_CPP_ONLY_STR 
"Enable this if you don't want to compile any non-ISO C++ code (i.e. you don't use any of the API Wrappers)" )
set (DLIB_NO_GUI_SUPPORT_STR 
"Enable this if you don't want to compile any of the dlib GUI code" )
set (DLIB_ENABLE_STACK_TRACE_STR 
"Enable this if you want to turn on the DLIB_STACK_TRACE macros" )
set (DLIB_ENABLE_ASSERTS_STR 
"Enable this if you want to turn on the DLIB_ASSERT macro" )

OPTION(DLIB_ISO_CPP_ONLY ${DLIB_ISO_CPP_ONLY_STR} OFF)
OPTION(DLIB_NO_GUI_SUPPORT ${DLIB_NO_GUI_SUPPORT_STR} OFF)
OPTION(DLIB_ENABLE_STACK_TRACE ${DLIB_ENABLE_STACK_TRACE_STR} OFF)
OPTION(DLIB_ENABLE_ASSERTS ${DLIB_ENABLE_ASSERTS_STR} OFF)


add_library(dlib all/source.cpp )


IF (NOT DLIB_ISO_CPP_ONLY)
   # we want to link to the right stuff depending on our platform.  
   IF (WIN32 AND NOT CYGWIN) ###############################################################################
      if (DLIB_NO_GUI_SUPPORT)
         set (dlib_needed_libraries ws2_32)
      else()
         set (dlib_needed_libraries ws2_32 comctl32 gdi32 imm32)
      endif()
   ELSEIF(APPLE) ############################################################################
      FIND_LIBRARY(pthreadlib pthread)
      set (dlib_needed_libraries ${pthreadlib})

      if (NOT DLIB_NO_GUI_SUPPORT)
         FIND_LIBRARY(xlib X11)
         # make sure X11 is in the include path
         FIND_PATH(xlib_path Xlib.h
            PATHS 
            /Developer/SDKs/MacOSX10.4u.sdk/usr/X11R6/include
            PATH_SUFFIXES X11
            )
         if (xlib AND xlib_path)
            GET_FILENAME_COMPONENT(x11_path ${xlib_path} PATH CACHE)
            INCLUDE_DIRECTORIES(${x11_path})
            set(dlib_needed_libraries ${dlib_needed_libraries} ${xlib} )
         else()
            message(" ***********************************************************************************")
            message(" ****** DLIB GUI SUPPORT DISABLED BECAUSE X11 DEVELOPMENT LIBRARIES NOT FOUND ******")
            message(" ****** Make sure libx11-dev is installed if you want GUI support             ******")
            message(" ***********************************************************************************")
            set(DLIB_NO_GUI_SUPPORT ON CACHE STRING ${DLIB_NO_GUI_SUPPORT_STR} FORCE )
         endif()
      endif()

      MARK_AS_ADVANCED(pthreadlib xlib xlib_path x11_path)
   ELSE () ##################################################################################
      FIND_LIBRARY(pthreadlib pthread)
      set (dlib_needed_libraries ${pthreadlib})

      # link to the nsl library if it exists.  this is something you need sometimes 
      FIND_LIBRARY(nsllib nsl)
      if (nsllib)
         set (dlib_needed_libraries ${dlib_needed_libraries} ${nsllib})
      endif ()

      # link to the socket library if it exists.  this is something you need on solaris
      FIND_LIBRARY(socketlib socket)
      if (socketlib)
         set (dlib_needed_libraries ${dlib_needed_libraries} ${socketlib})
      endif ()

      if (NOT DLIB_NO_GUI_SUPPORT)
         INCLUDE(FindX11)
         if (X11_FOUND)
            INCLUDE_DIRECTORIES(${X11_INCLUDE_DIR})
            set (dlib_needed_libraries ${dlib_needed_libraries} ${X11_LIBRARIES})
         else()
            message(" ***********************************************************************************")
            message(" ****** DLIB GUI SUPPORT DISABLED BECAUSE X11 DEVELOPMENT LIBRARIES NOT FOUND ******")
            message(" ****** Make sure libx11-dev is installed if you want GUI support             ******")
            message(" ***********************************************************************************")
            set(DLIB_NO_GUI_SUPPORT ON CACHE STRING ${DLIB_NO_GUI_SUPPORT_STR} FORCE )
         endif()
      endif()

      MARK_AS_ADVANCED(nsllib pthreadlib socketlib)
   ENDIF () ##### end of if NOT DLIB_ISO_CPP_ONLY ##########################################################



   # try to find libpng 
   SET(ZLIB_FIND_QUIETLY ON)
   SET(PNG_FIND_QUIETLY ON)
   INCLUDE(FindPNG)
   if (PNG_FOUND)
      INCLUDE_DIRECTORIES(${PNG_PNG_INCLUDE_DIR})
      set (dlib_needed_libraries ${dlib_needed_libraries} ${PNG_LIBRARY})
      add_global_define(DLIB_PNG_SUPPORT)
   endif()


   TARGET_LINK_LIBRARIES(dlib ${dlib_needed_libraries} )

ENDIF ()


#test for some things that really should be true about the compiler
INCLUDE(TestForSTDNamespace)
INCLUDE(TestForANSIStreamHeaders)


if (DLIB_ISO_CPP_ONLY)
   add_global_define(DLIB_ISO_CPP_ONLY)
else()
   remove_global_define(DLIB_ISO_CPP_ONLY)
endif()


if (DLIB_NO_GUI_SUPPORT)
   add_global_define(DLIB_NO_GUI_SUPPORT)
else()
   remove_global_define(DLIB_NO_GUI_SUPPORT)
endif()

if (DLIB_ENABLE_STACK_TRACE)
   add_global_define(DLIB_ENABLE_STACK_TRACE)
else()
   remove_global_define(DLIB_ENABLE_STACK_TRACE)
endif()


if (DLIB_ENABLE_ASSERTS)
   add_global_define(ENABLE_ASSERTS)
else()
   remove_global_define(ENABLE_ASSERTS)
endif()


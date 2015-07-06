#
# This is a CMake makefile.  You can find the cmake utility and
# information about it at http://www.cmake.org
#

# setting this makes CMake allow normal looking if else statements
SET(CMAKE_ALLOW_LOOSE_LOOP_CONSTRUCTS true)

cmake_minimum_required(VERSION 2.4)

set(CMAKE_LEGACY_CYGWIN_WIN32 0) # Remove when CMake >= 2.8.4 is required
# Suppress cmake warnings about changes in new versions.
if(COMMAND cmake_policy) 
   cmake_policy(SET CMP0003 NEW) 
   if (POLICY CMP0054)
      cmake_policy(SET CMP0054 NEW)
   endif()
endif()


# make macros that can add #define directives to the entire project.  Not just 
# to the dlib library itself.  I.e. to dlib and to any projects that depend
# on dlib.
macro ( add_global_define def_name )
   if (NOT CMAKE_CXX_FLAGS MATCHES "-D${def_name}")
      set (CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -D${def_name}" 
         CACHE STRING "Flags used by the compiler during all C++ builds." 
         FORCE)
   endif ()
endmacro()
macro ( remove_global_define def_name )
   if (CMAKE_CXX_FLAGS MATCHES " -D${def_name}")
      string (REGEX REPLACE " -D${def_name}" "" temp_var ${CMAKE_CXX_FLAGS}) 
      set (CMAKE_CXX_FLAGS "${temp_var}" 
         CACHE STRING "Flags used by the compiler during all C++ builds." 
         FORCE)
   endif ()
endmacro()


# Make sure ENABLE_ASSERTS is defined for debug builds
if (NOT CMAKE_CXX_FLAGS_DEBUG MATCHES "-DENABLE_ASSERTS")
   set (CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS_DEBUG} -DENABLE_ASSERTS" 
      CACHE STRING "Flags used by the compiler during C++ debug builds." 
      FORCE)
endif ()


# Don't try to call add_library(dlib) and setup dlib's stuff if it has already
# been done by some other part of the current cmake project.  We do this
# because it avoids getting warnings/errors about cmake policy CMP0002.  This
# happens when a project tries to call add_subdirectory() on dlib more than
# once.  This most often happens when the top level of a project depends on two
# or more other things which both depend on dlib. 
if (NOT TARGET dlib)

   set (DLIB_ISO_CPP_ONLY_STR 
   "Enable this if you don't want to compile any non-ISO C++ code (i.e. you don't use any of the API Wrappers)" )
   set (DLIB_NO_GUI_SUPPORT_STR 
   "Enable this if you don't want to compile any of the dlib GUI code" )
   set (DLIB_ENABLE_STACK_TRACE_STR 
   "Enable this if you want to turn on the DLIB_STACK_TRACE macros" )
   set (DLIB_ENABLE_ASSERTS_STR 
   "Enable this if you want to turn on the DLIB_ASSERT macro" )
   set (DLIB_USE_BLAS_STR
   "Disable this if you don't want to use a BLAS library" )
   set (DLIB_USE_LAPACK_STR
   "Disable this if you don't want to use a LAPACK library" )
   set (DLIB_LINK_WITH_LIBPNG_STR
   "Disable this if you don't want to link against libpng" )
   set (DLIB_LINK_WITH_LIBJPEG_STR
   "Disable this if you don't want to link against libjpeg" )
   set (DLIB_LINK_WITH_SQLITE3_STR
   "Disable this if you don't want to link against sqlite3" )
   #set (DLIB_LINK_WITH_FFTW_STR "Disable this if you don't want to link against fftw" )

   option(DLIB_ISO_CPP_ONLY ${DLIB_ISO_CPP_ONLY_STR} OFF)
   option(DLIB_NO_GUI_SUPPORT ${DLIB_NO_GUI_SUPPORT_STR} OFF)
   option(DLIB_ENABLE_STACK_TRACE ${DLIB_ENABLE_STACK_TRACE_STR} OFF)
   option(DLIB_ENABLE_ASSERTS ${DLIB_ENABLE_ASSERTS_STR} OFF)
   option(DLIB_USE_BLAS ${DLIB_USE_BLAS_STR} ON)
   option(DLIB_USE_LAPACK ${DLIB_USE_LAPACK_STR} ON)
   option(DLIB_LINK_WITH_LIBPNG ${DLIB_LINK_WITH_LIBPNG_STR} ON)
   option(DLIB_LINK_WITH_LIBJPEG ${DLIB_LINK_WITH_LIBJPEG_STR} ON)
   option(DLIB_LINK_WITH_SQLITE3 ${DLIB_LINK_WITH_SQLITE3_STR} ON)
   #option(DLIB_LINK_WITH_FFTW ${DLIB_LINK_WITH_FFTW_STR} ON)

   set(source_files 
         base64/base64_kernel_1.cpp
         bigint/bigint_kernel_1.cpp
         bigint/bigint_kernel_2.cpp
         bit_stream/bit_stream_kernel_1.cpp
         entropy_decoder/entropy_decoder_kernel_1.cpp
         entropy_decoder/entropy_decoder_kernel_2.cpp
         entropy_encoder/entropy_encoder_kernel_1.cpp
         entropy_encoder/entropy_encoder_kernel_2.cpp
         md5/md5_kernel_1.cpp
         tokenizer/tokenizer_kernel_1.cpp
         unicode/unicode.cpp
         data_io/image_dataset_metadata.cpp)

   if (DLIB_ISO_CPP_ONLY)
      add_library(dlib STATIC ${source_files} )
   else()

      set(source_files ${source_files}
         sockets/sockets_kernel_1.cpp
         bsp/bsp.cpp
         dir_nav/dir_nav_kernel_1.cpp
         dir_nav/dir_nav_kernel_2.cpp
         dir_nav/dir_nav_extensions.cpp
         linker/linker_kernel_1.cpp
         logger/extra_logger_headers.cpp
         logger/logger_kernel_1.cpp
         logger/logger_config_file.cpp
         misc_api/misc_api_kernel_1.cpp
         misc_api/misc_api_kernel_2.cpp
         sockets/sockets_extensions.cpp
         sockets/sockets_kernel_2.cpp
         sockstreambuf/sockstreambuf.cpp
         sockstreambuf/sockstreambuf_unbuffered.cpp
         server/server_kernel.cpp
         server/server_iostream.cpp
         server/server_http.cpp
         threads/multithreaded_object_extension.cpp
         threads/threaded_object_extension.cpp
         threads/threads_kernel_1.cpp
         threads/threads_kernel_2.cpp
         threads/threads_kernel_shared.cpp
         threads/thread_pool_extension.cpp
         timer/timer.cpp
         stack_trace.cpp
         )

      # we want to link to the right stuff depending on our platform.  
      if (WIN32 AND NOT CYGWIN) ###############################################################################
         if (DLIB_NO_GUI_SUPPORT)
            set (dlib_needed_libraries ws2_32 winmm)
         else()
            set (dlib_needed_libraries ws2_32 winmm comctl32 gdi32 imm32)
         endif()
      elseif(APPLE) ############################################################################
         find_library(pthreadlib pthread)
         set (dlib_needed_libraries ${pthreadlib})

         if (NOT DLIB_NO_GUI_SUPPORT)
            find_library(xlib X11)
            # make sure X11 is in the include path
            find_path(xlib_path Xlib.h
               PATHS 
               /Developer/SDKs/MacOSX10.4u.sdk/usr/X11R6/include
               PATH_SUFFIXES X11
               )
            if (xlib AND xlib_path)
               get_filename_component(x11_path ${xlib_path} PATH CACHE)
               include_directories(${x11_path})
               set(dlib_needed_libraries ${dlib_needed_libraries} ${xlib} )
            else()
               message(" *****************************************************************************")
               message(" *** DLIB GUI SUPPORT DISABLED BECAUSE X11 DEVELOPMENT LIBRARIES NOT FOUND ***")
               message(" *** Make sure XQuartz is installed if you want GUI support.               ***")
               message(" *** You can download XQuartz from: http://xquartz.macosforge.org/landing/ ***")
               message(" *****************************************************************************")
               set(DLIB_NO_GUI_SUPPORT ON CACHE STRING ${DLIB_NO_GUI_SUPPORT_STR} FORCE )
            endif()
         endif()

         mark_as_advanced(pthreadlib xlib xlib_path x11_path)
      else () ##################################################################################
         find_library(pthreadlib pthread)
         set (dlib_needed_libraries ${pthreadlib})

         # link to the nsl library if it exists.  this is something you need sometimes 
         find_library(nsllib nsl)
         if (nsllib)
            set (dlib_needed_libraries ${dlib_needed_libraries} ${nsllib})
         endif ()

         # link to the socket library if it exists.  this is something you need on solaris
         find_library(socketlib socket)
         if (socketlib)
            set (dlib_needed_libraries ${dlib_needed_libraries} ${socketlib})
         endif ()

         if (NOT DLIB_NO_GUI_SUPPORT)
            include(FindX11)
            if (X11_FOUND)
               include_directories(${X11_INCLUDE_DIR})
               set (dlib_needed_libraries ${dlib_needed_libraries} ${X11_LIBRARIES})
            else()
               message(" *****************************************************************************")
               message(" *** DLIB GUI SUPPORT DISABLED BECAUSE X11 DEVELOPMENT LIBRARIES NOT FOUND ***")
               message(" *** Make sure libx11-dev is installed if you want GUI support.            ***")
               message(" *** On Ubuntu run: sudo apt-get install libx11-dev                        ***")
               message(" *****************************************************************************")
               set(DLIB_NO_GUI_SUPPORT ON CACHE STRING ${DLIB_NO_GUI_SUPPORT_STR} FORCE )
            endif()
         endif()

         mark_as_advanced(nsllib pthreadlib socketlib)
      endif () ##################################################################################

      if (NOT DLIB_NO_GUI_SUPPORT)
         set(source_files ${source_files}
            gui_widgets/fonts.cpp
            gui_widgets/widgets.cpp
            gui_widgets/drawable.cpp
            gui_widgets/canvas_drawing.cpp
            gui_widgets/style.cpp
            gui_widgets/base_widgets.cpp
            gui_core/gui_core_kernel_1.cpp
            gui_core/gui_core_kernel_2.cpp
            )
      endif()

      INCLUDE (CheckFunctionExists)

      if (DLIB_LINK_WITH_LIBPNG)
         # try to find libpng 
         find_package(PNG QUIET)
         # Make sure there isn't something wrong with the version of LIBPNG
         # installed on this system.  
         if (PNG_FOUND)
            set(CMAKE_REQUIRED_LIBRARIES ${PNG_LIBRARY})
            CHECK_FUNCTION_EXISTS(png_create_read_struct LIBPNG_IS_GOOD)
         endif()
         if (PNG_FOUND AND LIBPNG_IS_GOOD)
            include_directories(${PNG_INCLUDE_DIR})
            set (dlib_needed_libraries ${dlib_needed_libraries} ${PNG_LIBRARY})
         else()
            # If we can't find libpng then statically compile it in.
            include_directories(external/libpng external/zlib)
            set(source_files ${source_files}
               external/libpng/png.c
               external/libpng/pngerror.c
               external/libpng/pngget.c
               external/libpng/pngmem.c
               external/libpng/pngpread.c
               external/libpng/pngread.c
               external/libpng/pngrio.c
               external/libpng/pngrtran.c
               external/libpng/pngrutil.c
               external/libpng/pngset.c
               external/libpng/pngtrans.c
               external/libpng/pngwio.c
               external/libpng/pngwrite.c
               external/libpng/pngwtran.c
               external/libpng/pngwutil.c
               external/zlib/adler32.c
               external/zlib/compress.c
               external/zlib/crc32.c
               external/zlib/deflate.c
               external/zlib/gzclose.c
               external/zlib/gzlib.c
               external/zlib/gzread.c
               external/zlib/gzwrite.c
               external/zlib/infback.c
               external/zlib/inffast.c
               external/zlib/inflate.c
               external/zlib/inftrees.c
               external/zlib/trees.c
               external/zlib/uncompr.c
               external/zlib/zutil.c
               )
         endif()
         set(source_files ${source_files}
            image_loader/png_loader.cpp
            image_saver/save_png.cpp
            )
      endif()

      if (DLIB_LINK_WITH_LIBJPEG)
         # try to find libjpeg 
         find_package(JPEG QUIET)
         # Make sure there isn't something wrong with the version of libjpeg 
         # installed on this system.  Also don't use the installed libjpeg
         # if this is an APPLE system because apparently it's broken (as of 2015/01/01).
         if (JPEG_FOUND)
            set(CMAKE_REQUIRED_LIBRARIES ${JPEG_LIBRARY})
            CHECK_FUNCTION_EXISTS(jpeg_read_header LIBJPEG_IS_GOOD)
         endif()
         if (JPEG_FOUND AND LIBJPEG_IS_GOOD AND NOT APPLE)
            include_directories(${JPEG_INCLUDE_DIR})
            set (dlib_needed_libraries ${dlib_needed_libraries} ${JPEG_LIBRARY})
         else()
            # If we can't find libjpeg then statically compile it in.
            add_definitions(-DDLIB_JPEG_STATIC)
            set(source_files ${source_files}
                  external/libjpeg/jcomapi.cpp
                  external/libjpeg/jdapimin.cpp
                  external/libjpeg/jdapistd.cpp
                  external/libjpeg/jdatasrc.cpp
                  external/libjpeg/jdcoefct.cpp
                  external/libjpeg/jdcolor.cpp
                  external/libjpeg/jddctmgr.cpp
                  external/libjpeg/jdhuff.cpp
                  external/libjpeg/jdinput.cpp
                  external/libjpeg/jdmainct.cpp
                  external/libjpeg/jdmarker.cpp
                  external/libjpeg/jdmaster.cpp
                  external/libjpeg/jdmerge.cpp
                  external/libjpeg/jdphuff.cpp
                  external/libjpeg/jdpostct.cpp
                  external/libjpeg/jdsample.cpp
                  external/libjpeg/jerror.cpp
                  external/libjpeg/jidctflt.cpp
                  external/libjpeg/jidctfst.cpp
                  external/libjpeg/jidctint.cpp
                  external/libjpeg/jidctred.cpp
                  external/libjpeg/jmemmgr.cpp
                  external/libjpeg/jmemnobs.cpp
                  external/libjpeg/jquant1.cpp
                  external/libjpeg/jquant2.cpp
                  external/libjpeg/jutils.cpp  
                  external/libjpeg/jcapimin.cpp
                  external/libjpeg/jdatadst.cpp
                  external/libjpeg/jcparam.cpp
                  external/libjpeg/jcapistd.cpp
                  external/libjpeg/jcmarker.cpp
                  external/libjpeg/jcinit.cpp
                  external/libjpeg/jcmaster.cpp
                  external/libjpeg/jcdctmgr.cpp
                  external/libjpeg/jccoefct.cpp  
                  external/libjpeg/jccolor.cpp  
                  external/libjpeg/jchuff.cpp  
                  external/libjpeg/jcmainct.cpp  
                  external/libjpeg/jcphuff.cpp  
                  external/libjpeg/jcprepct.cpp  
                  external/libjpeg/jcsample.cpp
                  external/libjpeg/jfdctint.cpp
                  external/libjpeg/jfdctflt.cpp
                  external/libjpeg/jfdctfst.cpp
                  )
         endif()
         set(source_files ${source_files}
            image_loader/jpeg_loader.cpp
            image_saver/save_jpeg.cpp
            )
      endif()


      if (DLIB_USE_BLAS OR DLIB_USE_LAPACK)
         # Try to find BLAS and LAPACK 
         include(cmake_find_blas.txt)

         if (DLIB_USE_BLAS)
            if (blas_found)
               set (dlib_needed_libraries ${dlib_needed_libraries} ${blas_libraries})
            else()
               set(DLIB_USE_BLAS OFF CACHE STRING ${DLIB_USE_BLAS_STR} FORCE )
            endif()
         endif()

         if (DLIB_USE_LAPACK)
            if (lapack_found)
               set (dlib_needed_libraries ${dlib_needed_libraries} ${lapack_libraries})
            else()
               set(DLIB_USE_LAPACK OFF CACHE STRING ${DLIB_USE_LAPACK_STR} FORCE )
            endif()
         endif()
      endif()



      if (DLIB_LINK_WITH_SQLITE3)
         find_library(sqlite sqlite3)
         # make sure sqlite3.h is in the include path
         find_path(sqlite_path sqlite3.h)
         if (sqlite AND sqlite_path)
            get_filename_component(sqlite_path2 ${sqlite_path} PATH CACHE)
            include_directories(${sqlite_path2})
            set(dlib_needed_libraries ${dlib_needed_libraries} ${sqlite} )
         else()
            set(DLIB_LINK_WITH_SQLITE3 OFF CACHE STRING ${DLIB_LINK_WITH_SQLITE3_STR} FORCE )
         endif()
         mark_as_advanced(sqlite sqlite_path sqlite_path2)
      endif()



      if (DLIB_LINK_WITH_FFTW)
         find_library(fftw fftw3)
         # make sure fftw3.h is in the include path
         find_path(fftw_path fftw3.h)
         if (fftw AND fftw_path)
            include_directories(${fftw_path})
            set(dlib_needed_libraries ${dlib_needed_libraries} ${fftw} )
         else()
            set(DLIB_LINK_WITH_FFTW OFF CACHE STRING ${DLIB_LINK_WITH_SQLITE3_STR} FORCE )
         endif()
         mark_as_advanced(fftw fftw_path)
      endif()


      add_library(dlib STATIC ${source_files} )
      target_link_libraries(dlib ${dlib_needed_libraries} )

   endif ()  ##### end of if NOT DLIB_ISO_CPP_ONLY ##########################################################


   #test for some things that really should be true about the compiler
   include(TestForSTDNamespace)
   include(TestForANSIStreamHeaders)


   if (DLIB_LINK_WITH_LIBPNG AND NOT DLIB_ISO_CPP_ONLY)
      add_global_define(DLIB_PNG_SUPPORT)
   else()
      remove_global_define(DLIB_PNG_SUPPORT)
   endif()

   if (DLIB_LINK_WITH_LIBJPEG AND NOT DLIB_ISO_CPP_ONLY)
      add_global_define(DLIB_JPEG_SUPPORT)
   else()
      remove_global_define(DLIB_JPEG_SUPPORT)
   endif()

   if (DLIB_LINK_WITH_FFTW AND NOT DLIB_ISO_CPP_ONLY)
      add_global_define(DLIB_USE_FFTW)
   else()
      remove_global_define(DLIB_USE_FFTW)
   endif()


   if (DLIB_USE_BLAS AND blas_found)
      add_global_define(DLIB_USE_BLAS)
   else()
      remove_global_define(DLIB_USE_BLAS)
   endif()

   if (DLIB_USE_LAPACK AND lapack_found)
      add_global_define(DLIB_USE_LAPACK)
   else()
      remove_global_define(DLIB_USE_LAPACK)
   endif()


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


endif()

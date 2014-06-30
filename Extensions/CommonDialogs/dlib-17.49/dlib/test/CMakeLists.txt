#
# This is a CMake makefile.  You can find the cmake utility and
# information about it at http://www.cmake.org
#

cmake_minimum_required(VERSION 2.6)

# This variable contains a list of all the tests we are building
# into the regression test suite.
set (tests
   example.cpp
   any.cpp
   any_function.cpp
   array2d.cpp
   array.cpp
   assignment_learning.cpp
   base64.cpp
   bayes_nets.cpp
   bigint.cpp
   binary_search_tree_kernel_1a.cpp
   binary_search_tree_kernel_2a.cpp
   binary_search_tree_mm1.cpp
   binary_search_tree_mm2.cpp
   bridge.cpp
   bsp.cpp
   byte_orderer.cpp
   clustering.cpp
   cmd_line_parser.cpp
   cmd_line_parser_wchar_t.cpp
   compress_stream.cpp
   conditioning_class_c.cpp
   conditioning_class.cpp
   config_reader.cpp
   crc32.cpp
   create_iris_datafile.cpp
   data_io.cpp
   directed_graph.cpp
   discriminant_pca.cpp
   disjoint_subsets.cpp
   ekm_and_lisf.cpp
   empirical_kernel_map.cpp
   entropy_coder.cpp
   entropy_encoder_model.cpp
   example_args.cpp
   filtering.cpp
   find_max_factor_graph_nmplp.cpp
   find_max_factor_graph_viterbi.cpp
   geometry.cpp
   graph.cpp
   graph_cuts.cpp
   graph_labeler.cpp
   hash.cpp
   hash_map.cpp
   hash_set.cpp
   hash_table.cpp
   hog_image.cpp
   image.cpp
   is_same_object.cpp
   kcentroid.cpp
   kernel_matrix.cpp
   kmeans.cpp
   least_squares.cpp
   linear_manifold_regularizer.cpp
   lz77_buffer.cpp
   map.cpp
   matrix2.cpp
   matrix3.cpp
   matrix4.cpp
   matrix_chol.cpp
   matrix.cpp
   matrix_eig.cpp
   matrix_lu.cpp
   matrix_qr.cpp
   max_cost_assignment.cpp
   max_sum_submatrix.cpp
   md5.cpp
   member_function_pointer.cpp
   metaprogramming.cpp
   multithreaded_object.cpp
   object_detector.cpp
   oca.cpp
   one_vs_all_trainer.cpp
   one_vs_one_trainer.cpp
   optimization.cpp
   optimization_test_functions.cpp
   opt_qp_solver.cpp
   parse.cpp
   pipe.cpp
   pixel.cpp
   probabilistic.cpp
   pyramid_down.cpp
   queue.cpp
   rand.cpp
   read_write_mutex.cpp
   reference_counter.cpp
   rls.cpp
   sammon.cpp
   scan_image.cpp
   sequence.cpp
   sequence_labeler.cpp
   serialize.cpp
   set.cpp
   sldf.cpp
   sliding_buffer.cpp
   smart_pointers.cpp
   sockets2.cpp
   sockets.cpp
   sockstreambuf.cpp
   sparse_vector.cpp
   stack.cpp
   static_map.cpp
   static_set.cpp
   statistics.cpp
   std_vector_c.cpp
   string.cpp
   svm_c_linear.cpp
   svm.cpp
   svm_multiclass_linear.cpp
   svm_struct.cpp
   symmetric_matrix_cache.cpp
   thread_pool.cpp
   threads.cpp
   timer.cpp
   tokenizer.cpp
   trust_region.cpp
   tuple.cpp
   type_safe_union.cpp
   )

# create a variable called target_name and set it to the string "test"
set (target_name test)

PROJECT(${target_name})

# add all the cpp files we want to compile to this list.  This tells
# cmake that they are part of our target (which is the executable named test)
ADD_EXECUTABLE(${target_name} main.cpp tester.cpp ${tests})

# add the folder containing the dlib folder to the include path
INCLUDE_DIRECTORIES(../..)

# Turn on all warnings when using gcc.
if (CMAKE_COMPILER_IS_GNUCXX)
   add_definitions("-W -Wall")
endif()

# There is a CMakeLists.txt file in the dlib source folder that tells cmake
# how to build the dlib library.  Tell cmake about that file.
add_subdirectory(.. dlib_build)

if (NOT DLIB_NO_GUI_SUPPORT)
   add_subdirectory(gui)
endif()

# Tell cmake to link our target executable to the non-gui version of the dlib
# library.  
TARGET_LINK_LIBRARIES(${target_name} dlib )

# make the default build be in "Release" mode
include(../release_build_by_default)


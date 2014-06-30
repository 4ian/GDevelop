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


#set default build type to Release
include(../dlib/release_build_by_default)



PROJECT(examples)

# add the folder containing the dlib folder to the include path
INCLUDE_DIRECTORIES(..)


# There is a CMakeLists.txt file in the dlib source folder that tells cmake
# how to build the dlib library.  Tell cmake about that file.
add_subdirectory(../dlib dlib_build)


MACRO(add_example name)
   ADD_EXECUTABLE(${name} ${name}.cpp)
   TARGET_LINK_LIBRARIES(${name} dlib )
ENDMACRO()


#here we apply our macros 
add_example(assignment_learning_ex)
add_example(bayes_net_ex)
add_example(bayes_net_from_disk_ex)
add_example(bayes_net_gui_ex)
add_example(bridge_ex)
add_example(bsp_ex)
add_example(compress_stream_ex)
add_example(config_reader_ex)
add_example(custom_trainer_ex)
add_example(dir_nav_ex)
add_example(empirical_kernel_map_ex)
add_example(file_to_code_ex)
add_example(graph_labeling_ex)
add_example(gui_api_ex)
add_example(image_ex)
add_example(kcentroid_ex)
add_example(kkmeans_ex)
add_example(krls_ex)
add_example(krls_filter_ex)
add_example(krr_classification_ex)
add_example(krr_regression_ex)
add_example(least_squares_ex)
add_example(linear_manifold_regularizer_ex)
add_example(logger_ex)
add_example(logger_ex_2)
add_example(matrix_ex)
add_example(matrix_expressions_ex)
add_example(member_function_pointer_ex)
add_example(mlp_ex)
add_example(model_selection_ex)
add_example(multiclass_classification_ex)
add_example(multithreaded_object_ex)
add_example(object_detector_advanced_ex)
add_example(object_detector_ex)
add_example(optimization_ex)
add_example(pipe_ex)
add_example(pipe_ex_2)
add_example(quantum_computing_ex)
add_example(queue_ex)
add_example(rank_features_ex)
add_example(rvm_ex)
add_example(rvm_regression_ex)
add_example(sequence_labeler_ex)
add_example(server_http_ex)
add_example(sockets_ex)
add_example(sockets_ex_2)
add_example(sockstreambuf_ex)
add_example(std_allocator_ex)
add_example(surf_ex)
add_example(svm_ex)
add_example(svm_pegasos_ex)
add_example(svm_sparse_ex)
add_example(svr_ex)
add_example(threaded_object_ex)
add_example(thread_function_ex)
add_example(thread_pool_ex)
add_example(threads_ex)
add_example(timer_ex)
add_example(train_object_detector)
add_example(using_custom_kernels_ex)
add_example(xml_parser_ex)

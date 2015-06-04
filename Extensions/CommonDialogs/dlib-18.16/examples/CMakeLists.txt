#
# This is a CMake makefile.  You can find the cmake utility and
# information about it at http://www.cmake.org
#


cmake_minimum_required(VERSION 2.8.4)

PROJECT(examples)

include(../dlib/cmake)

# Tell CMake to compile a program.  We do this with the ADD_EXECUTABLE()
# statement which takes the name of the output executable and then a list of
# .cpp files to compile.  Here each example consists of only one .cpp file but
# in general you will make programs that const of many .cpp files.
ADD_EXECUTABLE(assignment_learning_ex assignment_learning_ex.cpp)
# Then we tell it to link with dlib.
TARGET_LINK_LIBRARIES(assignment_learning_ex dlib)




# Since there are a lot of examples I'm going to use a macro to simply this
# CMakeLists.txt file.  However, usually you will create only one executable in
# your cmake projects and use the syntax shown above.
MACRO(add_example name)
   ADD_EXECUTABLE(${name} ${name}.cpp)
   TARGET_LINK_LIBRARIES(${name} dlib )
ENDMACRO()


#here we apply our macros 
add_example(3d_point_cloud_ex)
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
add_example(face_detection_ex)
add_example(face_landmark_detection_ex)
add_example(fhog_ex)
add_example(fhog_object_detector_ex)
add_example(file_to_code_ex)
add_example(graph_labeling_ex)
add_example(gui_api_ex)
add_example(hough_transform_ex)
add_example(image_ex)
add_example(integrate_function_adapt_simp_ex)
add_example(iosockstream_ex)
add_example(kcentroid_ex)
add_example(kkmeans_ex)
add_example(krls_ex)
add_example(krls_filter_ex)
add_example(krr_classification_ex)
add_example(krr_regression_ex)
add_example(learning_to_track_ex)
add_example(least_squares_ex)
add_example(linear_manifold_regularizer_ex)
add_example(logger_custom_output_ex)
add_example(logger_ex)
add_example(logger_ex_2)
add_example(matrix_ex)
add_example(matrix_expressions_ex)
add_example(max_cost_assignment_ex)
add_example(member_function_pointer_ex)
add_example(mlp_ex)
add_example(model_selection_ex)
add_example(mpc_ex)
add_example(multiclass_classification_ex)
add_example(multithreaded_object_ex)
add_example(object_detector_advanced_ex)
add_example(object_detector_ex)
add_example(one_class_classifiers_ex)
add_example(optimization_ex)
add_example(parallel_for_ex)
add_example(pipe_ex)
add_example(pipe_ex_2)
add_example(quantum_computing_ex)
add_example(queue_ex)
add_example(rank_features_ex)
add_example(running_stats_ex)
add_example(rvm_ex)
add_example(rvm_regression_ex)
add_example(sequence_labeler_ex)
add_example(sequence_segmenter_ex)
add_example(server_http_ex)
add_example(server_iostream_ex)
add_example(sockets_ex)
add_example(sockstreambuf_ex)
add_example(std_allocator_ex)
add_example(surf_ex)
add_example(svm_c_ex)
add_example(svm_ex)
add_example(svm_pegasos_ex)
add_example(svm_rank_ex)
add_example(svm_sparse_ex)
add_example(svm_struct_ex)
add_example(svr_ex)
add_example(thread_function_ex)
add_example(thread_pool_ex)
add_example(threaded_object_ex)
add_example(threads_ex)
add_example(timer_ex)
add_example(train_object_detector)
add_example(train_shape_predictor_ex)
add_example(using_custom_kernels_ex)
add_example(video_tracking_ex)
add_example(xml_parser_ex)


find_package(OpenCV)
if (OpenCV_FOUND)
   include_directories(${OpenCV_INCLUDE_DIRS})

   ADD_EXECUTABLE(webcam_face_pose_ex webcam_face_pose_ex.cpp)
   TARGET_LINK_LIBRARIES(webcam_face_pose_ex dlib ${OpenCV_LIBS} )
endif()


if (DLIB_LINK_WITH_SQLITE3)
   add_example(sqlite_ex)
endif()



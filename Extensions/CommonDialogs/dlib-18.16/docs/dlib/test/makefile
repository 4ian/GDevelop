# This is the makefile used to build the dlib C++ library's regression test suite
# on Debian Linux using the gcc compiler.

# this is the name of the output executable
TARGET = dtest 

# these are the compile time flags passed to gcc
CFLAGS = -ggdb  -DDEBUG -DDLIB_NO_GUI_SUPPORT  -I ../..  -Wall

# These are the link time flags passed to gcc
LFLAGS = -lpthread   -lnsl 

# The name of the compiler.  If you only have one version of
# gcc installed then you probably want to change this to just g++ 
CC = nice g++

####################################################
####################################################
#  Here we list all the cpp files we want to compile

SRC = main.cpp
SRC += tester.cpp
SRC += ../all/source.cpp 

SRC += example.cpp
SRC += example_args.cpp

SRC += active_learning.cpp
SRC += any.cpp
SRC += any_function.cpp
SRC += array2d.cpp
SRC += array.cpp
SRC += assignment_learning.cpp
SRC += base64.cpp
SRC += bayes_nets.cpp
SRC += bigint.cpp
SRC += binary_search_tree_kernel_1a.cpp
SRC += binary_search_tree_kernel_2a.cpp
SRC += binary_search_tree_mm1.cpp
SRC += binary_search_tree_mm2.cpp
SRC += bridge.cpp
SRC += bsp.cpp
SRC += byte_orderer.cpp
SRC += cca.cpp
SRC += clustering.cpp
SRC += cmd_line_parser.cpp
SRC += cmd_line_parser_wchar_t.cpp
SRC += compress_stream.cpp
SRC += conditioning_class_c.cpp
SRC += conditioning_class.cpp
SRC += config_reader.cpp
SRC += crc32.cpp
SRC += create_iris_datafile.cpp
SRC += data_io.cpp
SRC += directed_graph.cpp
SRC += discriminant_pca.cpp
SRC += disjoint_subsets.cpp
SRC += ekm_and_lisf.cpp
SRC += empirical_kernel_map.cpp
SRC += entropy_coder.cpp
SRC += entropy_encoder_model.cpp
SRC += face.cpp
SRC += fft.cpp
SRC += fhog.cpp
SRC += filtering.cpp
SRC += find_max_factor_graph_nmplp.cpp
SRC += find_max_factor_graph_viterbi.cpp
SRC += geometry.cpp
SRC += graph.cpp
SRC += graph_cuts.cpp
SRC += graph_labeler.cpp
SRC += hash.cpp
SRC += hash_map.cpp
SRC += hash_set.cpp
SRC += hash_table.cpp
SRC += hog_image.cpp
SRC += image.cpp
SRC += iosockstream.cpp
SRC += is_same_object.cpp
SRC += kcentroid.cpp
SRC += kernel_matrix.cpp
SRC += kmeans.cpp
SRC += learning_to_track.cpp
SRC += least_squares.cpp
SRC += linear_manifold_regularizer.cpp
SRC += lspi.cpp
SRC += lz77_buffer.cpp
SRC += map.cpp
SRC += matrix2.cpp
SRC += matrix3.cpp
SRC += matrix4.cpp
SRC += matrix_chol.cpp
SRC += matrix.cpp
SRC += matrix_eig.cpp
SRC += matrix_lu.cpp
SRC += matrix_qr.cpp
SRC += max_cost_assignment.cpp
SRC += max_sum_submatrix.cpp
SRC += md5.cpp
SRC += member_function_pointer.cpp
SRC += metaprogramming.cpp
SRC += mpc.cpp
SRC += multithreaded_object.cpp
SRC += numerical_integration.cpp
SRC += object_detector.cpp
SRC += oca.cpp
SRC += one_vs_all_trainer.cpp
SRC += one_vs_one_trainer.cpp
SRC += optimization.cpp
SRC += optimization_test_functions.cpp
SRC += opt_qp_solver.cpp
SRC += parallel_for.cpp
SRC += parse.cpp
SRC += pipe.cpp
SRC += pixel.cpp
SRC += probabilistic.cpp
SRC += pyramid_down.cpp
SRC += queue.cpp
SRC += rand.cpp
SRC += ranking.cpp
SRC += read_write_mutex.cpp
SRC += reference_counter.cpp
SRC += rls.cpp
SRC += sammon.cpp
SRC += scan_image.cpp
SRC += sequence.cpp
SRC += sequence_labeler.cpp
SRC += sequence_segmenter.cpp
SRC += serialize.cpp
SRC += set.cpp
SRC += sldf.cpp
SRC += sliding_buffer.cpp
SRC += smart_pointers.cpp
SRC += sockets2.cpp
SRC += sockets.cpp
SRC += sockstreambuf.cpp
SRC += sparse_vector.cpp
SRC += stack.cpp
SRC += static_map.cpp
SRC += static_set.cpp
SRC += statistics.cpp
SRC += std_vector_c.cpp
SRC += string.cpp
SRC += svm_c_linear.cpp
SRC += svm_c_linear_dcd.cpp
SRC += svm.cpp
SRC += svm_multiclass_linear.cpp
SRC += svm_struct.cpp
SRC += svr_linear_trainer.cpp
SRC += symmetric_matrix_cache.cpp
SRC += thread_pool.cpp
SRC += threads.cpp
SRC += timer.cpp
SRC += tokenizer.cpp
SRC += trust_region.cpp
SRC += tuple.cpp
SRC += type_safe_union.cpp
SRC += vectorstream.cpp


####################################################

TMP = $(SRC:.cpp=.o)
OBJ = $(TMP:.c=.o)

$(TARGET): $(OBJ) 
	@echo Linking $@
	@$(CC) $(OBJ) $(LFLAGS) -o $@
	@echo Build Complete

.cpp.o: $<
	@echo Compiling $<
	@$(CC) -c $(CFLAGS) $< -o $@

clean:
	@rm -f $(OBJ) $(TARGET)
	@echo All object files and binaries removed

dep: 
	@echo Running makedepend
	@makedepend -- $(CFLAGS) -- $(SRC) 2> /dev/null 
	@echo Completed makedepend

###############################################################################
##########  Stuff from makedepend                                         #####
##########  type make dep at the command line to rebuild the dependencies #####
##########  Also, DON'T edit the contents of this file beyond this line.  #####
###############################################################################


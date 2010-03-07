# This is the makefile used to build the dlib C++ library's regression test suite
# on Debian Linux using the gcc compiler.

# this is the name of the output executable
TARGET = test 

# these are the compile time flags passed to gcc
CFLAGS = -ggdb  -DDEBUG -DDLIB_NO_GUI_SUPPORT  -I ../..  -Wall

# These are the link time flags passed to gcc
LFLAGS = -lpthread   -lnsl 

# The name of the compiler.  If you only have one version of
# gcc installed then you probably want to change this to just g++ 
CC = nice g++-3.3

####################################################
####################################################
#  Here we list all the cpp files we want to compile

SRC = main.cpp
SRC += tester.cpp
SRC += ../all/source.cpp 

SRC += example.cpp
SRC += example_args.cpp

SRC += array2d.cpp
SRC += array.cpp
SRC += base64.cpp
SRC += bayes_nets.cpp
SRC += bigint.cpp
SRC += binary_search_tree_kernel_1a.cpp
SRC += binary_search_tree_kernel_2a.cpp
SRC += binary_search_tree_mm1.cpp
SRC += binary_search_tree_mm2.cpp
SRC += cmd_line_parser.cpp
SRC += cmd_line_parser_wchar_t.cpp
SRC += compress_stream.cpp
SRC += conditioning_class.cpp
SRC += conditioning_class_c.cpp
SRC += config_reader.cpp
SRC += directed_graph.cpp
SRC += graph.cpp
SRC += geometry.cpp
SRC += entropy_coder.cpp
SRC += entropy_encoder_model.cpp
SRC += hash_map.cpp
SRC += hash_set.cpp
SRC += hash_table.cpp
SRC += image.cpp
SRC += lz77_buffer.cpp
SRC += map.cpp
SRC += matrix.cpp
SRC += md5.cpp
SRC += member_function_pointer.cpp
SRC += metaprogramming.cpp
SRC += multithreaded_object.cpp
SRC += optimization.cpp
SRC += pipe.cpp
SRC += pixel.cpp
SRC += queue.cpp
SRC += rand.cpp
SRC += reference_counter.cpp
SRC += sequence.cpp
SRC += serialize.cpp
SRC += set.cpp
SRC += sliding_buffer.cpp
SRC += smart_pointers.cpp
SRC += sockets.cpp
SRC += sockstreambuf.cpp
SRC += stack.cpp
SRC += static_map.cpp
SRC += static_set.cpp
SRC += string.cpp
SRC += svm.cpp
SRC += threads.cpp
SRC += timer.cpp
SRC += tokenizer.cpp
SRC += tuple.cpp


####################################################

TMP = $(SRC:.cpp=.o)
OBJ = $(TMP:.c=.o)

$(TARGET): $(OBJ) 
	@echo Linking $@
	@$(CC) $(LFLAGS) $(OBJ) -o $@
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



CMAKE_MINIMUM_REQUIRED(VERSION 2.8.4)


include(../../dlib/add_python_module)

# Tell cmake to compile all these cpp files into a dlib python module.
set(python_srcs
   src/dlib.cpp
   src/matrix.cpp
   src/vector.cpp
   src/svm_c_trainer.cpp
   src/svm_rank_trainer.cpp
   src/decision_functions.cpp
   src/other.cpp
   src/basic.cpp
   src/cca.cpp
   src/sequence_segmenter.cpp
   src/svm_struct.cpp
   src/image.cpp
   src/rectangles.cpp
   src/object_detection.cpp
   src/shape_predictor.cpp
   src/correlation_tracker.cpp
)

# Only add the GUI module if requested
if(NOT ${DLIB_NO_GUI_SUPPORT})
   list(APPEND python_srcs src/gui.cpp)
endif(NOT ${DLIB_NO_GUI_SUPPORT})

add_python_module(dlib ${python_srcs})

# When you run "make install" we will copy the compiled dlib.so (or dlib.pyd) 
# library file to the python_examples folder.
install_dlib_to(../../python_examples)

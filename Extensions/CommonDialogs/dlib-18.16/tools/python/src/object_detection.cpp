// Copyright (C) 2015 Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.

#include <dlib/python.h>
#include <dlib/matrix.h>
#include <boost/python/args.hpp>
#include <dlib/geometry.h>
#include <dlib/image_processing/frontal_face_detector.h>
#include "simple_object_detector.h"
#include "simple_object_detector_py.h"
#include "conversion.h"

using namespace dlib;
using namespace std;
using namespace boost::python;

// ----------------------------------------------------------------------------------------

string print_simple_test_results(const simple_test_results& r)
{
    std::ostringstream sout;
    sout << "precision: "<<r.precision << ", recall: "<< r.recall << ", average precision: " << r.average_precision;
    return sout.str();
}

// ----------------------------------------------------------------------------------------

inline simple_object_detector_py train_simple_object_detector_on_images_py (
    const boost::python::list& pyimages,
    const boost::python::list& pyboxes,
    const simple_object_detector_training_options& options
)
{
    const unsigned long num_images = len(pyimages);
    if (num_images != len(pyboxes))
        throw dlib::error("The length of the boxes list must match the length of the images list.");

    // We never have any ignore boxes for this version of the API.
    std::vector<std::vector<rectangle> > ignore(num_images), boxes(num_images);
    dlib::array<array2d<rgb_pixel> > images(num_images);
    images_and_nested_params_to_dlib(pyimages, pyboxes, images, boxes);

    return train_simple_object_detector_on_images("", images, boxes, ignore, options);
}

inline simple_test_results test_simple_object_detector_with_images_py (
        const boost::python::list& pyimages,
        const boost::python::list& pyboxes,
        simple_object_detector& detector,
        const unsigned int upsampling_amount
)
{
    const unsigned long num_images = len(pyimages);
    if (num_images != len(pyboxes))
        throw dlib::error("The length of the boxes list must match the length of the images list.");

    // We never have any ignore boxes for this version of the API.
    std::vector<std::vector<rectangle> > ignore(num_images), boxes(num_images);
    dlib::array<array2d<rgb_pixel> > images(num_images);
    images_and_nested_params_to_dlib(pyimages, pyboxes, images, boxes);

    return test_simple_object_detector_with_images(images, upsampling_amount, boxes, ignore, detector);
}

// ----------------------------------------------------------------------------------------

inline simple_test_results test_simple_object_detector_py_with_images_py (
        const boost::python::list& pyimages,
        const boost::python::list& pyboxes,
        simple_object_detector_py& detector,
        const int upsampling_amount
)
{
    // Allow users to pass an upsampling amount ELSE use the one cached on the object
    // Anything less than 0 is ignored and the cached value is used.
    unsigned int final_upsampling_amount = 0;
    if (upsampling_amount >= 0)
        final_upsampling_amount = upsampling_amount;
    else
        final_upsampling_amount = detector.upsampling_amount;

    return test_simple_object_detector_with_images_py(pyimages, pyboxes, detector.detector, final_upsampling_amount);
}

// ----------------------------------------------------------------------------------------

inline void find_candidate_object_locations_py (
    object pyimage,
    boost::python::list& pyboxes,
    boost::python::tuple pykvals,
    unsigned long min_size,
    unsigned long max_merging_iterations
)
{
    // Copy the data into dlib based objects
    array2d<rgb_pixel> image;
    if (is_gray_python_image(pyimage))
        assign_image(image, numpy_gray_image(pyimage));
    else if (is_rgb_python_image(pyimage))
        assign_image(image, numpy_rgb_image(pyimage));
    else
        throw dlib::error("Unsupported image type, must be 8bit gray or RGB image.");

    if (boost::python::len(pykvals) != 3)
        throw dlib::error("kvals must be a tuple with three elements for start, end, num.");

    double start = extract<double>(pykvals[0]);
    double end   = extract<double>(pykvals[1]);
    long num     = extract<long>(pykvals[2]);
    matrix_range_exp<double> kvals = linspace(start, end, num);

    std::vector<rectangle> rects;
    const long count = len(pyboxes);
    // Copy any rectangles in the input pyboxes into rects so that any rectangles will be
    // properly deduped in the resulting output.
    for (long i = 0; i < count; ++i)
        rects.push_back(extract<rectangle>(pyboxes[i]));
    // Find candidate objects
    find_candidate_object_locations(image, rects, kvals, min_size, max_merging_iterations);

    // Collect boxes containing candidate objects
    std::vector<rectangle>::iterator iter;
    for (iter = rects.begin(); iter != rects.end(); ++iter)
        pyboxes.append(*iter);
}

// ----------------------------------------------------------------------------------------

void bind_object_detection()
{
    using boost::python::arg;
    {
    typedef simple_object_detector_training_options type;
    class_<type>("simple_object_detector_training_options",
        "This object is a container for the options to the train_simple_object_detector() routine.")
        .add_property("be_verbose", &type::be_verbose,
                                    &type::be_verbose,
"If true, train_simple_object_detector() will print out a lot of information to the screen while training.")
        .add_property("add_left_right_image_flips", &type::add_left_right_image_flips,
                                                    &type::add_left_right_image_flips,
"if true, train_simple_object_detector() will assume the objects are \n\
left/right symmetric and add in left right flips of the training \n\
images.  This doubles the size of the training dataset.")
        .add_property("detection_window_size", &type::detection_window_size,
                                               &type::detection_window_size,
                                               "The sliding window used will have about this many pixels inside it.")
        .add_property("C", &type::C,
                           &type::C,
"C is the usual SVM C regularization parameter.  So it is passed to \n\
structural_object_detection_trainer::set_c().  Larger values of C \n\
will encourage the trainer to fit the data better but might lead to \n\
overfitting.  Therefore, you must determine the proper setting of \n\
this parameter experimentally.")
        .add_property("epsilon", &type::epsilon,
                                 &type::epsilon,
"epsilon is the stopping epsilon.  Smaller values make the trainer's \n\
solver more accurate but might take longer to train.")
        .add_property("num_threads", &type::num_threads,
                                     &type::num_threads,
"train_simple_object_detector() will use this many threads of \n\
execution.  Set this to the number of CPU cores on your machine to \n\
obtain the fastest training speed.");
    }
    {
    typedef simple_test_results type;
    class_<type>("simple_test_results")
        .add_property("precision", &type::precision)
        .add_property("recall", &type::recall)
        .add_property("average_precision", &type::average_precision)
        .def("__str__", &::print_simple_test_results);
    }

    // Here, kvals is actually the result of linspace(start, end, num) and it is different from kvals used
    // in find_candidate_object_locations(). See dlib/image_transforms/segment_image_abstract.h for more details.
    def("find_candidate_object_locations", find_candidate_object_locations_py,
            (arg("image"), arg("rects"), arg("kvals")=boost::python::make_tuple(50, 200, 3),
             arg("min_size")=20, arg("max_merging_iterations")=50),
"Returns found candidate objects\n\
requires\n\
    - image == an image object which is a numpy ndarray\n\
    - len(kvals) == 3\n\
    - kvals should be a tuple that specifies the range of k values to use.  In\n\
      particular, it should take the form (start, end, num) where num > 0. \n\
ensures\n\
    - This function takes an input image and generates a set of candidate\n\
      rectangles which are expected to bound any objects in the image.  It does\n\
      this by running a version of the segment_image() routine on the image and\n\
      then reports rectangles containing each of the segments as well as rectangles\n\
      containing unions of adjacent segments.  The basic idea is described in the\n\
      paper: \n\
          Segmentation as Selective Search for Object Recognition by Koen E. A. van de Sande, et al.\n\
      Note that this function deviates from what is described in the paper slightly. \n\
      See the code for details.\n\
    - The basic segmentation is performed kvals[2] times, each time with the k parameter\n\
      (see segment_image() and the Felzenszwalb paper for details on k) set to a different\n\
      value from the range of numbers linearly spaced between kvals[0] to kvals[1].\n\
    - When doing the basic segmentations prior to any box merging, we discard all\n\
      rectangles that have an area < min_size.  Therefore, all outputs and\n\
      subsequent merged rectangles are built out of rectangles that contain at\n\
      least min_size pixels.  Note that setting min_size to a smaller value than\n\
      you might otherwise be interested in using can be useful since it allows a\n\
      larger number of possible merged boxes to be created.\n\
    - There are max_merging_iterations rounds of neighboring blob merging.\n\
      Therefore, this parameter has some effect on the number of output rectangles\n\
      you get, with larger values of the parameter giving more output rectangles.\n\
    - This function appends the output rectangles into #rects.  This means that any\n\
      rectangles in rects before this function was called will still be in there\n\
      after it terminates.  Note further that #rects will not contain any duplicate\n\
      rectangles.  That is, for all valid i and j where i != j it will be true\n\
      that:\n\
        - #rects[i] != rects[j]");

    def("get_frontal_face_detector", get_frontal_face_detector,
        "Returns the default face detector");

    def("train_simple_object_detector", train_simple_object_detector,
        (arg("dataset_filename"), arg("detector_output_filename"), arg("options")),
"requires \n\
    - options.C > 0 \n\
ensures \n\
    - Uses the structural_object_detection_trainer to train a \n\
      simple_object_detector based on the labeled images in the XML file \n\
      dataset_filename.  This function assumes the file dataset_filename is in the \n\
      XML format produced by dlib's save_image_dataset_metadata() routine. \n\
    - This function will apply a reasonable set of default parameters and \n\
      preprocessing techniques to the training procedure for simple_object_detector \n\
      objects.  So the point of this function is to provide you with a very easy \n\
      way to train a basic object detector.   \n\
    - The trained object detector is serialized to the file detector_output_filename.");

    def("train_simple_object_detector", train_simple_object_detector_on_images_py,
        (arg("images"), arg("boxes"), arg("options")),
"requires \n\
    - options.C > 0 \n\
    - len(images) == len(boxes) \n\
    - images should be a list of numpy matrices that represent images, either RGB or grayscale. \n\
    - boxes should be a list of lists of dlib.rectangle object. \n\
ensures \n\
    - Uses the structural_object_detection_trainer to train a \n\
      simple_object_detector based on the labeled images and bounding boxes.  \n\
    - This function will apply a reasonable set of default parameters and \n\
      preprocessing techniques to the training procedure for simple_object_detector \n\
      objects.  So the point of this function is to provide you with a very easy \n\
      way to train a basic object detector.   \n\
    - The trained object detector is returned.");

    def("test_simple_object_detector", test_simple_object_detector,
            // Please see test_simple_object_detector for the reason upsampling_amount is -1
            (arg("dataset_filename"), arg("detector_filename"), arg("upsampling_amount")=-1),
            "requires \n\
                - Optionally, take the number of times to upsample the testing images (upsampling_amount >= 0). \n\
             ensures \n\
                - Loads an image dataset from dataset_filename.  We assume dataset_filename is \n\
                  a file using the XML format written by save_image_dataset_metadata(). \n\
                - Loads a simple_object_detector from the file detector_filename.  This means \n\
                  detector_filename should be a file produced by the train_simple_object_detector()  \n\
                  routine. \n\
                - This function tests the detector against the dataset and returns the \n\
                  precision, recall, and average precision of the detector.  In fact, The \n\
                  return value of this function is identical to that of dlib's \n\
                  test_object_detection_function() routine.  Therefore, see the documentation \n\
                  for test_object_detection_function() for a detailed definition of these \n\
                  metrics. "
        );

    def("test_simple_object_detector", test_simple_object_detector_with_images_py,
            (arg("images"), arg("boxes"), arg("detector"), arg("upsampling_amount")=0),
            "requires \n\
               - len(images) == len(boxes) \n\
               - images should be a list of numpy matrices that represent images, either RGB or grayscale. \n\
               - boxes should be a list of lists of dlib.rectangle object. \n\
               - Optionally, take the number of times to upsample the testing images (upsampling_amount >= 0). \n\
             ensures \n\
               - Loads a simple_object_detector from the file detector_filename.  This means \n\
                 detector_filename should be a file produced by the train_simple_object_detector() \n\
                 routine. \n\
               - This function tests the detector against the dataset and returns the \n\
                 precision, recall, and average precision of the detector.  In fact, The \n\
                 return value of this function is identical to that of dlib's \n\
                 test_object_detection_function() routine.  Therefore, see the documentation \n\
                 for test_object_detection_function() for a detailed definition of these \n\
                 metrics. "
    );

    def("test_simple_object_detector", test_simple_object_detector_py_with_images_py,
            // Please see test_simple_object_detector_py_with_images_py for the reason upsampling_amount is -1
            (arg("images"), arg("boxes"), arg("detector"), arg("upsampling_amount")=-1),
            "requires \n\
               - len(images) == len(boxes) \n\
               - images should be a list of numpy matrices that represent images, either RGB or grayscale. \n\
               - boxes should be a list of lists of dlib.rectangle object. \n\
             ensures \n\
               - Loads a simple_object_detector from the file detector_filename.  This means \n\
                 detector_filename should be a file produced by the train_simple_object_detector() \n\
                 routine. \n\
               - This function tests the detector against the dataset and returns the \n\
                 precision, recall, and average precision of the detector.  In fact, The \n\
                 return value of this function is identical to that of dlib's \n\
                 test_object_detection_function() routine.  Therefore, see the documentation \n\
                 for test_object_detection_function() for a detailed definition of these \n\
                 metrics. "
    );
    {
    typedef simple_object_detector type;
    class_<type>("fhog_object_detector",
        "This object represents a sliding window histogram-of-oriented-gradients based object detector.")
        .def("__init__", make_constructor(&load_object_from_file<type>),  
"Loads an object detector from a file that contains the output of the \n\
train_simple_object_detector() routine or a serialized C++ object of type\n\
object_detector<scan_fhog_pyramid<pyramid_down<6>>>.")
        .def("__call__", run_detector_with_upscale2, (arg("image"), arg("upsample_num_times")=0),
"requires \n\
    - image is a numpy ndarray containing either an 8bit grayscale or RGB \n\
      image. \n\
    - upsample_num_times >= 0 \n\
ensures \n\
    - This function runs the object detector on the input image and returns \n\
      a list of detections.   \n\
    - Upsamples the image upsample_num_times before running the basic \n\
      detector.  If you don't know how many times you want to upsample then \n\
      don't provide a value for upsample_num_times and an appropriate \n\
      default will be used.")
        .def("run", run_rect_detector, (arg("image"), arg("upsample_num_times")=0),
"requires \n\
    - image is a numpy ndarray containing either an 8bit grayscale or RGB \n\
      image. \n\
    - upsample_num_times >= 0 \n\
ensures \n\
    - This function runs the object detector on the input image and returns \n\
      a tuple of (list of detections, list of scores, list of weight_indices).   \n\
    - Upsamples the image upsample_num_times before running the basic \n\
      detector.  If you don't know how many times you want to upsample then \n\
      don't provide a value for upsample_num_times and an appropriate \n\
      default will be used.")
        .def("save", save_simple_object_detector, (arg("detector_output_filename")), "Save a simple_object_detector to the provided path.")
        .def_pickle(serialize_pickle<type>());
    }
    {
    typedef simple_object_detector_py type;
    class_<type>("simple_object_detector",
        "This object represents a sliding window histogram-of-oriented-gradients based object detector.")
        .def("__init__", make_constructor(&load_object_from_file<type>),
"Loads a simple_object_detector from a file that contains the output of the \n\
train_simple_object_detector() routine.")
        .def("__call__", &type::run_detector1, (arg("image"), arg("upsample_num_times")),
"requires \n\
    - image is a numpy ndarray containing either an 8bit grayscale or RGB \n\
      image. \n\
    - upsample_num_times >= 0 \n\
ensures \n\
    - This function runs the object detector on the input image and returns \n\
      a list of detections.   \n\
    - Upsamples the image upsample_num_times before running the basic \n\
      detector.  If you don't know how many times you want to upsample then \n\
      don't provide a value for upsample_num_times and an appropriate \n\
      default will be used.")
        .def("__call__", &type::run_detector2, (arg("image")),
"requires \n\
    - image is a numpy ndarray containing either an 8bit grayscale or RGB \n\
      image. \n\
ensures \n\
    - This function runs the object detector on the input image and returns \n\
      a list of detections.")
        .def("save", save_simple_object_detector_py, (arg("detector_output_filename")), "Save a simple_object_detector to the provided path.")
        .def_pickle(serialize_pickle<type>());
    }
}

// ----------------------------------------------------------------------------------------

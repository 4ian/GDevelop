// Copyright (C) 2014  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.

#include <dlib/python.h>
#include <dlib/geometry.h>
#include <boost/python/args.hpp>
#include <dlib/image_processing.h>

using namespace dlib;
using namespace std;
using namespace boost::python;

// ----------------------------------------------------------------------------------------

void start_track (
    correlation_tracker& tracker,
    object img,
    const drectangle& bounding_box
)
{
    if (is_gray_python_image(img))
    {
        tracker.start_track(numpy_gray_image(img), bounding_box);
    }
    else if (is_rgb_python_image(img))
    {
        tracker.start_track(numpy_rgb_image(img), bounding_box);
    }
    else
    {
        throw dlib::error("Unsupported image type, must be 8bit gray or RGB image.");
    }
}

void start_track_rec (
    correlation_tracker& tracker,
    object img,
    const rectangle& bounding_box
)
{
    drectangle dbounding_box(bounding_box);
    start_track(tracker, img, dbounding_box);
}

double update (
    correlation_tracker& tracker,
    object img
)
{
    if (is_gray_python_image(img))
    {
        return tracker.update(numpy_gray_image(img));
    }
    else if (is_rgb_python_image(img))
    {
        return tracker.update(numpy_rgb_image(img));
    }
    else
    {
        throw dlib::error("Unsupported image type, must be 8bit gray or RGB image.");
    }
}

double update_guess (
    correlation_tracker& tracker,
    object img,
    const drectangle& bounding_box
)
{
    if (is_gray_python_image(img))
    {
        return tracker.update(numpy_gray_image(img), bounding_box);
    }
    else if (is_rgb_python_image(img))
    {
        return tracker.update(numpy_rgb_image(img), bounding_box);
    }
    else
    {
        throw dlib::error("Unsupported image type, must be 8bit gray or RGB image.");
    }
}

double update_guess_rec (
    correlation_tracker& tracker,
    object img,
    const rectangle& bounding_box
)
{
    drectangle dbounding_box(bounding_box);
    return update_guess(tracker, img, dbounding_box);
}

drectangle get_position (const correlation_tracker& tracker) { return tracker.get_position(); }

// ----------------------------------------------------------------------------------------

void bind_correlation_tracker()
{
    using boost::python::arg;
    {
    typedef correlation_tracker type;
    class_<type>("correlation_tracker", "This is a tool for tracking moving objects in a video stream.  You give it \n\
            the bounding box of an object in the first frame and it attempts to track the \n\
            object in the box from frame to frame.  \n\
            This tool is an implementation of the method described in the following paper: \n\
                Danelljan, Martin, et al. 'Accurate scale estimation for robust visual \n\
                tracking.' Proceedings of the British Machine Vision Conference BMVC. 2014.")
        .def("start_track", &::start_track, (arg("image"), arg("bounding_box")), "\
            requires \n\
                - image is a numpy ndarray containing either an 8bit grayscale or RGB image. \n\
                - bounding_box.is_empty() == false \n\
            ensures \n\
                - This object will start tracking the thing inside the bounding box in the \n\
                  given image.  That is, if you call update() with subsequent video frames \n\
                  then it will try to keep track of the position of the object inside bounding_box. \n\
                - #get_position() == bounding_box")
        .def("start_track", &::start_track_rec, (arg("image"), arg("bounding_box")), "\
            requires \n\
                - image is a numpy ndarray containing either an 8bit grayscale or RGB image. \n\
                - bounding_box.is_empty() == false \n\
            ensures \n\
                - This object will start tracking the thing inside the bounding box in the \n\
                  given image.  That is, if you call update() with subsequent video frames \n\
                  then it will try to keep track of the position of the object inside bounding_box. \n\
                - #get_position() == bounding_box")
        .def("update", &::update, arg("image"), "\
            requires \n\
                - image is a numpy ndarray containing either an 8bit grayscale or RGB image. \n\
                - get_position().is_empty() == false \n\
                  (i.e. you must have started tracking by calling start_track()) \n\
            ensures \n\
                - performs: return update(img, get_position())")
        .def("update", &::update_guess, (arg("image"), arg("guess")), "\
            requires \n\
                - image is a numpy ndarray containing either an 8bit grayscale or RGB image. \n\
                - get_position().is_empty() == false \n\
                  (i.e. you must have started tracking by calling start_track()) \n\
            ensures \n\
                - When searching for the object in img, we search in the area around the \n\
                  provided guess. \n\
                - #get_position() == the new predicted location of the object in img.  This \n\
                  location will be a copy of guess that has been translated and scaled \n\
                  appropriately based on the content of img so that it, hopefully, bounds \n\
                  the object in img. \n\
                - Returns the peak to side-lobe ratio.  This is a number that measures how \n\
                  confident the tracker is that the object is inside #get_position(). \n\
                  Larger values indicate higher confidence.")
        .def("update", &::update_guess_rec, (arg("image"), arg("guess")), "\
            requires \n\
                - image is a numpy ndarray containing either an 8bit grayscale or RGB image. \n\
                - get_position().is_empty() == false \n\
                  (i.e. you must have started tracking by calling start_track()) \n\
            ensures \n\
                - When searching for the object in img, we search in the area around the \n\
                  provided guess. \n\
                - #get_position() == the new predicted location of the object in img.  This \n\
                  location will be a copy of guess that has been translated and scaled \n\
                  appropriately based on the content of img so that it, hopefully, bounds \n\
                  the object in img. \n\
                - Returns the peak to side-lobe ratio.  This is a number that measures how \n\
                  confident the tracker is that the object is inside #get_position(). \n\
                  Larger values indicate higher confidence.")
        .def("get_position", &::get_position, "returns the predicted position of the object under track.");
    }
}

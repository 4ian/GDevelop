#ifndef DLIB_NO_GUI_SUPPORT

#include <dlib/python.h>
#include <boost/python/args.hpp>
#include <dlib/geometry.h>
#include <dlib/image_processing/frontal_face_detector.h>
#include <dlib/image_processing/render_face_detections.h>
#include <dlib/gui_widgets.h>
#include "simple_object_detector_py.h"

using namespace dlib;
using namespace std;
using namespace boost::python;

// ----------------------------------------------------------------------------------------

void image_window_set_image_fhog_detector (
    image_window& win,
    const simple_object_detector& det
)
{
    win.set_image(draw_fhog(det));
}

void image_window_set_image_simple_detector_py (
    image_window& win,
    const simple_object_detector_py& det
)
{
    win.set_image(draw_fhog(det.detector));
}

// ----------------------------------------------------------------------------------------

void image_window_set_image (
    image_window& win,
    object img
)
{
    if (is_gray_python_image(img))
        return win.set_image(numpy_gray_image(img));
    else if (is_rgb_python_image(img))
        return win.set_image(numpy_rgb_image(img));
    else
        throw dlib::error("Unsupported image type, must be 8bit gray or RGB image.");
}

void add_overlay_rect (
    image_window& win,
    const rectangle& rect,
    const rgb_pixel& color
)
{
    win.add_overlay(rect, color);
}

void add_overlay_drect (
    image_window& win,
    const drectangle& drect,
    const rgb_pixel& color
)
{
    rectangle rect(drect.left(), drect.top(), drect.right(), drect.bottom());
    win.add_overlay(rect, color);
}

void add_overlay_parts (
    image_window& win,
    const full_object_detection& detection,
    const rgb_pixel& color
)
{
    win.add_overlay(render_face_detections(detection, color));
}

boost::shared_ptr<image_window> make_image_window_from_image(object img)
{
    boost::shared_ptr<image_window> win(new image_window);
    image_window_set_image(*win, img);
    return win;
}

boost::shared_ptr<image_window> make_image_window_from_image_and_title(object img, const string& title)
{
    boost::shared_ptr<image_window> win(new image_window);
    image_window_set_image(*win, img);
    win->set_title(title);
    return win;
}

// ----------------------------------------------------------------------------------------

void bind_gui()
{
    using boost::python::arg;
    {
    typedef image_window type;
    typedef void (image_window::*set_title_funct)(const std::string&);
    typedef void (image_window::*add_overlay_funct)(const std::vector<rectangle>& r, rgb_pixel p);
    class_<type,boost::noncopyable>("image_window",
        "This is a GUI window capable of showing images on the screen.")
        .def("__init__", make_constructor(&make_image_window_from_image),
            "Create an image window that displays the given numpy image.")
        .def("__init__", make_constructor(&make_image_window_from_image_and_title),
            "Create an image window that displays the given numpy image and also has the given title.")
        .def("set_image", image_window_set_image, arg("image"),
            "Make the image_window display the given image.")
        .def("set_image", image_window_set_image_fhog_detector, arg("detector"),
            "Make the image_window display the given HOG detector's filters.")
        .def("set_image", image_window_set_image_simple_detector_py, arg("detector"),
            "Make the image_window display the given HOG detector's filters.")
        .def("set_title", (set_title_funct)&type::set_title, arg("title"),
            "Set the title of the window to the given value.")
        .def("clear_overlay", &type::clear_overlay, "Remove all overlays from the image_window.")
        .def("add_overlay", (add_overlay_funct)&type::add_overlay<rgb_pixel>, (arg("rectangles"), arg("color")=rgb_pixel(255, 0, 0)),
            "Add a list of rectangles to the image_window. They will be displayed as red boxes by default, but the color can be passed.")
        .def("add_overlay", add_overlay_rect, (arg("rectangle"), arg("color")=rgb_pixel(255, 0, 0)),
            "Add a rectangle to the image_window.  It will be displayed as a red box by default, but the color can be passed.")
        .def("add_overlay", add_overlay_drect, (arg("rectangle"), arg("color")=rgb_pixel(255, 0, 0)),
            "Add a rectangle to the image_window.  It will be displayed as a red box by default, but the color can be passed.")
        .def("add_overlay", add_overlay_parts, (arg("detection"), arg("color")=rgb_pixel(0, 0, 255)),
            "Add full_object_detection parts to the image window. They will be displayed as blue lines by default, but the color can be passed.")
        .def("wait_until_closed", &type::wait_until_closed,
            "This function blocks until the window is closed.");
    }
}
#endif

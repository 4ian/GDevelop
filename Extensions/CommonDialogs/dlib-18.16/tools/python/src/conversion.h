// Copyright (C) 2014  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_PYTHON_CONVERSION_H__
#define DLIB_PYTHON_CONVERSION_H__

#include <dlib/python.h>
#include <dlib/pixel.h>

using namespace dlib;
using namespace std;
using namespace boost::python;

template <typename dest_image_type>
void pyimage_to_dlib_image(object img, dest_image_type& image)
{
    if (is_gray_python_image(img))
        assign_image(image, numpy_gray_image(img));
    else if (is_rgb_python_image(img))
        assign_image(image, numpy_rgb_image(img));
    else
        throw dlib::error("Unsupported image type, must be 8bit gray or RGB image.");
}

template <typename image_array, typename param_type>
void images_and_nested_params_to_dlib(
        const object& pyimages,
        const object& pyparams,
        image_array& images,
        std::vector<std::vector<param_type> >& params
)
{
    const unsigned long num_images = len(pyimages);
    // Now copy the data into dlib based objects.
    for (unsigned long i = 0; i < num_images; ++i)
    {
        const unsigned long num_params = len(pyparams[i]);
        for (unsigned long j = 0; j < num_params; ++j)
            params[i].push_back(extract<param_type>(pyparams[i][j]));

        pyimage_to_dlib_image(pyimages[i], images[i]);
    }
}

#endif // DLIB_PYTHON_CONVERSION_H__

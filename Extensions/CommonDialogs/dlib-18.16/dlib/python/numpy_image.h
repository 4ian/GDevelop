// Copyright (C) 2014  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_PYTHON_NuMPY_IMAGE_Hh_
#define DLIB_PYTHON_NuMPY_IMAGE_Hh_

#include "numpy.h"
#include <dlib/pixel.h>
#include <dlib/matrix.h>


// ----------------------------------------------------------------------------------------

class numpy_gray_image
{
public:

    numpy_gray_image() : _data(0), _nr(0), _nc(0) {}
    numpy_gray_image (boost::python::object& img) 
    {
        long shape[2];
        get_numpy_ndarray_parts(img, _data, shape);
        _nr = shape[0];
        _nc = shape[1];
    }

    friend inline long num_rows(const numpy_gray_image& img) { return img._nr; } 
    friend inline long num_columns(const numpy_gray_image& img) { return img._nc; } 
    friend inline void* image_data(numpy_gray_image& img) { return img._data; } 
    friend inline const void* image_data(const numpy_gray_image& img) { return img._data; }
    friend inline long width_step(const numpy_gray_image& img) { return img._nc*sizeof(unsigned char); }

private:

    unsigned char* _data;
    long _nr;
    long _nc;
};

namespace dlib
{
    template <>
    struct image_traits<numpy_gray_image >
    {
        typedef unsigned char pixel_type;
    };
}

// ----------------------------------------------------------------------------------------

inline bool is_gray_python_image (boost::python::object& img)
{
    try
    {
        numpy_gray_image temp(img);
        return true;
    }
    catch (dlib::error&)
    {
        return false;
    }
}

// ----------------------------------------------------------------------------------------

class numpy_rgb_image
{
public:

    numpy_rgb_image() : _data(0), _nr(0), _nc(0) {}
    numpy_rgb_image (boost::python::object& img) 
    {
        long shape[3];
        get_numpy_ndarray_parts(img, _data, shape);
        _nr = shape[0];
        _nc = shape[1];
        if (shape[2] != 3)
            throw dlib::error("Error, python object is not a three band image and therefore can't be a RGB image.");
    }

    friend inline long num_rows(const numpy_rgb_image& img) { return img._nr; } 
    friend inline long num_columns(const numpy_rgb_image& img) { return img._nc; } 
    friend inline void* image_data(numpy_rgb_image& img) { return img._data; } 
    friend inline const void* image_data(const numpy_rgb_image& img) { return img._data; }
    friend inline long width_step(const numpy_rgb_image& img) { return img._nc*sizeof(dlib::rgb_pixel); }


private:

    dlib::rgb_pixel* _data;
    long _nr;
    long _nc;
};

namespace dlib
{
    template <>
    struct image_traits<numpy_rgb_image >
    {
        typedef rgb_pixel pixel_type;
    };
}

// ----------------------------------------------------------------------------------------


inline bool is_rgb_python_image (boost::python::object& img)
{
    try
    {
        numpy_rgb_image temp(img);
        return true;
    }
    catch (dlib::error&)
    {
        return false;
    }
}

// ----------------------------------------------------------------------------------------

#endif // DLIB_PYTHON_NuMPY_IMAGE_Hh_


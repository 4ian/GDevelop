// Copyright (C) 2014  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SAVE_JPEG_Hh_
#define DLIB_SAVE_JPEG_Hh_

#include "save_jpeg_abstract.h"

#include "../enable_if.h"
#include "../matrix.h"
#include "../array2d.h"
#include "../pixel.h"
#include "../image_processing/generic_image.h"
#include <string>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    void save_jpeg (
        const array2d<rgb_pixel>& img,
        const std::string& filename,
        int quality = 75
    );

// ----------------------------------------------------------------------------------------

    void save_jpeg (
        const array2d<unsigned char>& img,
        const std::string& filename,
        int quality = 75
    );

// ----------------------------------------------------------------------------------------

    template <
        typename image_type
        >
    typename disable_if<is_matrix<image_type> >::type save_jpeg(
        const image_type& img,
        const std::string& filename,
        int quality = 75
    )
    {
        // Convert any kind of grayscale image to an unsigned char image 
        if (pixel_traits<typename image_traits<image_type>::pixel_type>::grayscale)
        {
            array2d<unsigned char> temp;
            assign_image(temp, img);
            save_jpeg(temp, filename, quality);
        }
        else
        {
            // This is some other kind of color image so just save it as an RGB image.
            array2d<rgb_pixel> temp;
            assign_image(temp, img);
            save_jpeg(temp, filename, quality);
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename EXP 
        >
    void save_jpeg(
        const matrix_exp<EXP>& img,
        const std::string& file_name,
        int quality = 75
    )
    {
        array2d<typename EXP::type> temp;
        assign_image(temp, img);
        save_jpeg(temp, file_name, quality);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SAVE_JPEG_Hh_


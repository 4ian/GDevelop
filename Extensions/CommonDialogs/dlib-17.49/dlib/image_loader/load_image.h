// Copyright (C) 2011  Davis E. King (davis@dlib.net), Nils Labugt
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_LOAd_IMAGE_H__
#define DLIB_LOAd_IMAGE_H__

#include "load_image_abstract.h"
#include "../string.h"
#include "png_loader.h"
#include "jpeg_loader.h"
#include "image_loader.h"

namespace dlib
{
    template <typename image_type>
    void load_image (
        image_type& image,
        const std::string& file_name
    )
    {
        const std::string extension = tolower(right_substr(file_name,"."));
        if (extension == "bmp")
            load_bmp(image, file_name);
#ifdef DLIB_PNG_SUPPORT
        else if (extension == "png")
            load_png(image, file_name);
#endif
#ifdef DLIB_JPEG_SUPPORT
        else if (extension == "jpeg" || extension == "jpg")
            load_jpeg(image, file_name);
#endif
        else if (extension == "dng")
            load_dng(image, file_name);
        else
        {
            if (extension == "jpeg" || extension == "jpg")
                throw image_load_error("DLIB_JPEG_SUPPORT not #defined: Unable to load image in file " + file_name);
            else if (extension == "png")
                throw image_load_error("DLIB_PNG_SUPPORT not #defined: Unable to load image in file " + file_name);
            else
                throw image_load_error("Unknown file extension: Unable to load image in file " + file_name);
        }
    }

}

#endif // DLIB_LOAd_IMAGE_H__ 


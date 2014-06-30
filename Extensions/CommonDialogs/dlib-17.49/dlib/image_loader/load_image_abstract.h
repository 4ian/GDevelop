// Copyright (C) 2011  Davis E. King (davis@dlib.net), Nils Labugt
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_LOAd_IMAGE_ABSTRACT_
#ifdef DLIB_LOAd_IMAGE_ABSTRACT_

#include "load_image_abstract.h"
#include "../string.h"

namespace dlib
{
    template <typename image_type>
    void load_image (
        image_type& image,
        const std::string& file_name
    );
    /*!
        requires
            - image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - pixel_traits<typename image_type::type> is defined  
        ensures
            - let EXT == the extension of the file given by file_name converted
              to lower case (i.e.  the part of the file after the '.')
            - if (EXT == "png") then
                - performs: load_png(image, file_name);
            - else if (EXT == "jpg" || EXT == "jpeg") then
                - performs: load_jpeg(image, file_name);
            - else if (EXT == "bmp") then
                - performs: load_bmp(image, file_name);
            - else if (EXT == "dng") then
                - performs: load_dng(image, file_name);
            - else
                - throws image_load_error
        throws
            - image_load_error
                This exception is thrown if there is some error that prevents
                us from loading the given image file.
    !*/

}

#endif // DLIB_LOAd_IMAGE_ABSTRACT_ 

 

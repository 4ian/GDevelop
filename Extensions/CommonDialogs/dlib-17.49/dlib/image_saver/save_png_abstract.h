// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SAVE_PnG_ABSTRACT_
#ifdef DLIB_SAVE_PnG_ABSTRACT_

#include "../pixel.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename image_type 
        >
    void save_png (
        const image_type& image,
        const std::string& file_name
    );
    /*!
        requires
            - image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - pixel_traits<typename image_type::type> is defined  
            - image.size() != 0
        ensures
            - writes the image to the file indicated by file_name in the PNG (Portable Network Graphics) 
              format.
            - image[0][0] will be in the upper left corner of the image.
            - image[image.nr()-1][image.nc()-1] will be in the lower right
              corner of the image.
            - This routine can save images containing any type of pixel.  However, save_png() can
              only natively store the following pixel types: rgb_pixel, rgb_alpha_pixel, uint8, 
              and uint16.  All other pixel types will be converted into one of these types as 
              appropriate before being saved to disk.
        throws
            - image_save_error
                This exception is thrown if there is an error that prevents us from saving 
                the image.  
            - std::bad_alloc 
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SAVE_PnG_ABSTRACT_




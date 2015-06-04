// Copyright (C) 2014  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SAVE_JPEG_ABSTRACT_Hh_
#ifdef DLIB_SAVE_JPEG_ABSTRACT_Hh_

#include "../image_processing/generic_image.h"
#include "../pixel.h"
#include <string>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename image_type
        >
    void save_jpeg (
        const image_type& img,
        const std::string& filename,
        int quality = 75
    );
    /*!
        requires
            - image_type == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h or a matrix expression
            - image.size() != 0
            - 0 <= quality <= 100
        ensures
            - writes the image to the file indicated by file_name in the JPEG format.
            - image[0][0] will be in the upper left corner of the image.
            - image[image.nr()-1][image.nc()-1] will be in the lower right corner of the
              image.
            - This routine can save images containing any type of pixel.  However,
              save_jpeg() can only natively store rgb_pixel and uint8 pixel types.  All
              other pixel types will be converted into one of these types as appropriate
              before being saved to disk.
            - The quality value determines how lossy the compression is.  Larger quality 
              values result in larger output images but the images will look better.
        throws
            - image_save_error
                This exception is thrown if there is an error that prevents us from saving 
                the image.  
            - std::bad_alloc 
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SAVE_JPEG_ABSTRACT_Hh_


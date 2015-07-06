// Copyright (C) 2011  Davis E. King (davis@dlib.net), Nils Labugt
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_LOAd_IMAGE_ABSTRACT_
#ifdef DLIB_LOAd_IMAGE_ABSTRACT_

#include "load_image_abstract.h"
#include "../string.h"
#include "../image_processing/generic_image.h"

namespace dlib
{
    template <typename image_type>
    void load_image (
        image_type& image,
        const std::string& file_name
    );
    /*!
        requires
            - image_type == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h 
        ensures
            - This function looks at the file extensions and file headers to try and figure
              out what kind of image format is inside the given file.  It then calls one of
              load_png(), load_jpeg(), load_bmp(), or load_dng() as appropriate and stores
              the resulting image into #image.
        throws
            - image_load_error
                This exception is thrown if there is some error that prevents
                us from loading the given image file.
    !*/

}

#endif // DLIB_LOAd_IMAGE_ABSTRACT_ 

 

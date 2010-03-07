// Copyright (C) 2006  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_IMAGE_SAVEr_ABSTRACT_
#ifdef DLIB_IMAGE_SAVEr_ABSTRACT_

#include <iosfwd>
#include "../algs.h"
#include "../pixel.h"

namespace dlib
{
    class image_save_error : public dlib::error 
    { 
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is an exception used to indicate a failure to save an image.
                Its type member variable will be set to EIMAGE_SAVE.
        !*/
    };

// ----------------------------------------------------------------------------------------

    template <
        typename image_type 
        >
    void save_bmp (
        const image_type& image,
        std::ostream& out 
    );
    /*!
        requires
            - image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - pixel_traits<typename image_type::type> is defined  
        ensures
            - writes the image to the out stream in the Microsoft Windows BMP format.
            - image[0][0] will be in the upper left corner of the image.
            - image[image.nr()-1][image.nc()-1] will be in the lower right
              corner of the image.
        throws
            - image_save_error
                This exception is thrown if there is an error that prevents us
                from saving the image.  
            - std::bad_alloc 
    !*/

// ----------------------------------------------------------------------------------------

    /*!
        dlib dng file format:
            This is a file format I created for this library.  It is a lossless 
            compressed image format that is similar to the PNG format but uses
            the dlib PPM compression algorithms instead of the DEFLATE algorithm.
    !*/

    template <
        typename image_type 
        >
    void save_dng (
        const image_type& image,
        std::ostream& out 
    );
    /*!
        requires
            - image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - pixel_traits<typename image_type::type> is defined  
        ensures
            - writes the image to the out stream in the dlib dng format.
            - image[0][0] will be in the upper left corner of the image.
            - image[image.nr()-1][image.nc()-1] will be in the lower right
              corner of the image.
        throws
            - image_save_error
                This exception is thrown if there is an error that prevents us
                from saving the image.  
            - std::bad_alloc 
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_IMAGE_SAVEr_ABSTRACT_



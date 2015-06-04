// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_IMAGE_LOADEr_ABSTRACT_
#ifdef DLIB_IMAGE_LOADEr_ABSTRACT_

#include <iosfwd>
#include "../algs.h"
#include "../pixel.h"
#include "../image_processing/generic_image.h"

namespace dlib
{
    class image_load_error : public dlib::error 
    { 
        /*!
            WHAT THIS OBJECT REPRESENTS
                This is an exception used to indicate a failure to load an image.
                Its type member variable will be set to EIMAGE_LOAD.
        !*/
    };

// ----------------------------------------------------------------------------------------

    template <
        typename image_type 
        >
    void load_bmp (
        image_type& image,
        std::istream& in
    );
    /*!
        requires
            - image_type == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h 
        ensures
            - #image == the image of the MS Windows BMP file that was available 
              in the input stream in.  
            - #image[0][0] will be the upper left corner of the image 
            - #image[image.nr()-1][image.nc()-1] will be the lower right
              corner of the image
            - Performs any color space conversion necessary to convert the
              BMP image data into the pixel type used by the given image
              object.
        throws
            - image_load_error
                This exception is thrown if there is an error that prevents us
                from loading the image.  If this exception is thrown then 
                #image will have an initial value for its type.
            - std::bad_alloc 
                If this exception is thrown then #image will have an initial
                value for its type.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_type 
        >
    void load_bmp (
        image_type& image,
        const std::string& file_name
    );
    /*!
        requires
            - image_type == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h 
        ensures
            - opens the file indicated by file_name with an input file stream named fin 
              and performs:
              load_bmp(image,fin);
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
    void load_dng (
        image_type& image,
        std::istream& in
    );
    /*!
        requires
            - image_type == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h 
        ensures
            - #image == the image of the dlib dng file that was available 
              in the input stream in. 
            - #image[0][0] will be the upper left corner of the image 
            - #image[image.nr()-1][image.nc()-1] will be the lower right
              corner of the image
            - Performs any color space conversion necessary to convert the
              dng image data into the pixel type used by the given image
              object.
        throws
            - image_load_error
                This exception is thrown if there is an error that prevents us
                from loading the image.  If this exception is thrown then 
                #image will have an initial value for its type.
            - std::bad_alloc 
                If this exception is thrown then #image will have an initial
                value for its type.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_type
        >
    void load_dng (
        image_type& image,
        const std::string& file_name
    );
    /*!
        requires
            - image_type == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h 
        ensures
            - opens the file indicated by file_name with an input file stream named fin 
              and performs:
              load_dng(image,fin);
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_IMAGE_LOADEr_ABSTRACT_


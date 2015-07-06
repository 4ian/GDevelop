// Copyright (C) 2009  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_OPENCV_IMAGE_AbSTRACT_H_
#ifdef DLIB_OPENCV_IMAGE_AbSTRACT_H_

#include <opencv2/core/core.hpp>
#include <opencv2/core/types_c.h>
#include "../algs.h"
#include "../pixel.h"

namespace dlib
{

    template <
        typename pixel_type
        >
    class cv_image
    {
        /*!
            REQUIREMENTS ON pixel_type
                pixel_type just needs to be something that matches the pixel memory
                layout of whatever OpenCV image you are going to use with this object.
                For example, you might use unsigned char or bgr_pixel depending
                on what you needed.

            WHAT THIS OBJECT REPRESENTS
                This object is meant to be used as a simple wrapper around the OpenCV
                IplImage struct or Mat object.  Using this class template you can turn
                an OpenCV image into something that looks like a normal dlib style 
                image object.

                So you should be able to use cv_image objects with many of the image
                processing functions in dlib as well as the GUI tools for displaying
                images on the screen.

                Note that this object does NOT take ownership of the image data you 
                give to it.  This means it is up to you to make sure the OpenCV image
                is properly freed at some point.  This also means that an instance of 
                this object can only be used as long as the OpenCV image it references 
                remains valid, since a cv_image just points to the OpenCV image's 
                memory directly.
        !*/

    public:
        typedef pixel_type type;
        typedef default_memory_manager mem_manager_type;

        cv_image (
            const IplImage* img
        );
        /*!
            requires
                - img->dataOrder == 0
                  (i.e. Only interleaved color channels are supported with cv_image)
                - (img->depth&0xFF)/8*img->nChannels == sizeof(pixel_type)
                  (i.e. The size of the pixel_type needs to match the size of the pixels 
                  inside the OpenCV image)
            ensures
                - #nr() == img->height
                  #nc() == img->width
                - using the operator[] on this object you will be able to access the pixels
                  inside this OpenCV image.
        !*/

        cv_image (
            const IplImage img
        );
        /*!
            requires
                - img.dataOrder == 0
                  (i.e. Only interleaved color channels are supported with cv_image)
                - (img.depth&0xFF)/8*img.nChannels == sizeof(pixel_type)
                  (i.e. The size of the pixel_type needs to match the size of the pixels 
                  inside the OpenCV image)
            ensures
                - #nr() == img.height
                  #nc() == img.width
                - using the operator[] on this object you will be able to access the pixels
                  inside this OpenCV image.
        !*/

        cv_image (
            const cv::Mat img
        ); 
        /*!
            requires
                - img.depth() == cv::DataType<pixel_traits<pixel_type>::basic_pixel_type>::depth
                  (i.e. The pixel_type template argument needs to match the type of pixel 
                  used inside the OpenCV image)
                - img.channels() == pixel_traits<pixel_type>::num
                  (i.e. the number of channels in the pixel_type needs to match the number of 
                  channels in the OpenCV image)
            ensures
                - #nr() == img.rows
                - #nc() == img.cols
                - using the operator[] on this object you will be able to access the pixels
                  inside this OpenCV image.
        !*/

        cv_image(
        ); 
        /*!
            ensures
                - #nr() == 0
                - #nc() == 0
        !*/

        ~cv_image (
        );
        /*!
            ensures
                - This function does nothing.  e.g. It doesn't delete the OpenCV 
                  image used by this cv_image object
        !*/

        long nr(
        ) const; 
        /*!
            ensures
                - returns the number of rows in this image
        !*/

        long nc(
        ) const;
        /*!
            ensures
                - returns the number of columns in this image
        !*/

        unsigned long size (
        ) const; 
        /*!
            ensures
                - returns nr()*nc()
                  (i.e. returns the number of pixels in this image)
        !*/

        inline pixel_type* operator[] (
            const long row 
        );
        /*!
            requires
                - 0 <= row < nr()
            ensures
                - returns a pointer to the first pixel in the given row
                  of this image
        !*/

        inline const pixel_type* operator[] (
            const long row 
        ) const;
        /*!
            requires
                - 0 <= row < nr()
            ensures
                - returns a pointer to the first pixel in the given row
                  of this image
        !*/

        cv_image& operator= ( 
            const cv_image& item
        );
        /*!
            ensures
                - #*this is an identical copy of item
                - returns #*this
        !*/

        cv_image& operator=( 
            const IplImage* img
        );
        /*!
            requires
                - img->dataOrder == 0
                  (i.e. Only interleaved color channels are supported with cv_image)
                - (img->depth&0xFF)/8*img->nChannels == sizeof(pixel_type)
                  (i.e. The size of the pixel_type needs to match the size of the pixels 
                  inside the OpenCV image)
            ensures
                - #nr() == img->height
                  #nc() == img->width
                - using the operator[] on this object you will be able to access the pixels
                  inside this OpenCV image.
                - returns #*this
        !*/

        cv_image& operator=( 
            const IplImage img
        );
        /*!
            requires
                - img->dataOrder == 0
                  (i.e. Only interleaved color channels are supported with cv_image)
                - (img->depth&0xFF)/8*img->nChannels == sizeof(pixel_type)
                  (i.e. The size of the pixel_type needs to match the size of the pixels 
                  inside the OpenCV image)
            ensures
                - #nr() == img->height
                  #nc() == img->width
                - using the operator[] on this object you will be able to access the pixels
                  inside this OpenCV image.
                - returns #*this
        !*/

        cv_image& operator=( 
            const cv::Mat img
        );
        /*!
            requires
                - img.depth() == cv::DataType<pixel_traits<pixel_type>::basic_pixel_type>::depth
                  (i.e. The pixel_type template argument needs to match the type of pixel 
                  used inside the OpenCV image)
                - img.channels() == pixel_traits<pixel_type>::num
                  (i.e. the number of channels in the pixel_type needs to match the number of 
                  channels in the OpenCV image)
            ensures
                - #nr() == img.rows
                - #nc() == img.cols
                - using the operator[] on this object you will be able to access the pixels
                  inside this OpenCV image.
                - returns #*this
        !*/

        long width_step (
        ) const;
        /*!
            ensures
                - returns the size of one row of the image, in bytes.  
                  More precisely, return a number N such that:
                  (char*)&item[0][0] + N == (char*)&item[1][0].
        !*/
    };

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    const matrix_exp mat (
        const cv_image<T>& img
    );
    /*!
        ensures
            - returns a matrix R such that:
                - R.nr() == img.nr() 
                - R.nc() == img.nc()
                - for all valid r and c:
                  R(r, c) == img[r][c]
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_OPENCV_IMAGE_AbSTRACT_H_


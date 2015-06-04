// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_RANDOMLY_COlOR_IMAGE_ABSTRACT_Hh_
#ifdef DLIB_RANDOMLY_COlOR_IMAGE_ABSTRACT_Hh_

#include "../hash.h"
#include "../pixel.h"
#include "../matrix.h"
#include "../image_processing/generic_image.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    template <
        typename image_type
        >
    const matrix_exp randomly_color_image (
        const image_type& img
    );
    /*!
        requires
            - image_type == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h, or something convertible to a matrix
              via mat().
        ensures
            - randomly generates a mapping from gray level pixel values
              to the RGB pixel space and then uses this mapping to create
              a colored version of img.  Returns a matrix which represents
              this colored version of img.
            - black pixels in img will remain black in the output image.  
            - The returned matrix will have the same dimensions as img.
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    rgb_pixel colormap_heat (
        double value,
        double min_val,
        double max_val
    );
    /*!
        ensures
            - Maps value to a color.  In particular, we use a heatmap color scheme where
              values <= min_val are black and larger values become more red, then yellow,
              and then white as they approach max_val.
    !*/

    template <
        typename image_type
        >
    const matrix_exp heatmap (
        const image_type& img,
        double max_val,
        double min_val = 0
    );
    /*!
        requires
            - image_type == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h, or something convertible to a matrix
              via mat().
        ensures
            - Interprets img as a grayscale image and returns a new matrix which represents
              a colored version of img.  In particular, the colormap is defined by
              colormap_heat().
            - The returned matrix will have the same dimensions as img.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_type
        >
    const matrix_exp heatmap (
        const image_type& img
    );
    /*!
        requires
            - image_type == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h, or something convertible to a matrix
              via mat().
        ensures
            - returns heatmap(img, max(mat(img)), min(mat(img)))
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    rgb_pixel colormap_jet (
        double value,
        double min_val,
        double max_val
    );
    /*!
        ensures
            - Maps value to a color.  In particular, we use a jet color scheme where 
              values <= min_val are dark blue and larger values become light blue, then
              yellow, and then finally red as they approach max_val.
    !*/

    template <
        typename image_type
        >
    const matrix_exp jet (
        const image_type& img,
        double max_val,
        double min_val = 0
    );
    /*!
        requires
            - image_type == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h, or something convertible to a matrix
              via mat().
        ensures
            - Interprets img as a grayscale image and returns a new matrix which represents
              a colored version of img.  In particular, the colormap is defined by
              colormap_jet().
            - The returned matrix will have the same dimensions as img.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_type
        >
    const matrix_exp jet (
        const image_type& img
    );
    /*!
        requires
            - image_type == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h, or something convertible to a matrix
              via mat().
        ensures
            - returns jet(img, max(mat(img)), min(mat(img)))
    !*/

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

}

#endif // DLIB_RANDOMLY_COlOR_IMAGE_ABSTRACT_Hh_



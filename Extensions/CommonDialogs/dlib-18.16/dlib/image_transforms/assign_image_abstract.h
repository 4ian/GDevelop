// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_ASSIGN_IMAGe_ABSTRACT
#ifdef DLIB_ASSIGN_IMAGe_ABSTRACT

#include "../pixel.h"
#include "../image_processing/generic_image.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename dest_image_type,
        typename src_image_type
        >
    void assign_image (
        dest_image_type& dest_img,
        const src_image_type& src_img
    );
    /*!
        requires
            - src_image_type == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h or any object convertible to a matrix
              via mat().
            - dest_image_type == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h or an image_view.
        ensures
            - #dest_img.nc() == src_img.nc()
            - #dest_img.nr() == src_img.nr()
            - for all valid r and c:
                - performs assign_pixel(#dest_img[r][c],src_img[r][c]) 
                  (i.e. copies the src image to dest image)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename dest_image_type,
        typename src_image_type
        >
    void assign_image_scaled (
        dest_image_type& dest_img,
        const src_image_type& src_img,
        const double thresh = 4
    );
    /*!
        requires
            - src_image_type == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h or any object convertible to a matrix
              via mat().
            - dest_image_type == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h or an image_view.
            - thresh > 0
        ensures
            - #dest_img.nc() == src_img.nc()
            - #dest_img.nr() == src_img.nr()
            - if (dest_img's pixels have a wide enough dynamic range to contain all the
              pixels in src_img.  (Note that dynamic range is determined by the min() and 
              max() pixel_traits properties)) then
                - performs: assign_image(dest_img, src_img) 
                  (i.e. in this case, no scaling is performed.  Just a normal color space 
                  conversion and copy )
            - else
                - #dest_img will be converted to a grayscale image
                - scales the contents of src_img into the dynamic range of dest_img and then
                  assigns the result into dest_img.  The thresh parameter is used to filter 
                  source pixel values which are outliers.  These outliers will saturate
                  at the edge of the destination image's dynamic range.
                - Specifically, for all valid r and c:
                    - scales get_pixel_intensity(src_img[r][c]) into the dynamic range
                      of the dest_img.  This is done by computing the mean and standard
                      deviation of src_img. Call the mean M and the standard deviation
                      D.  Then the scaling from src_img to dest_img is performed using
                      the following mapping:
                        let SRC_UPPER  = min(M + thresh*D, max(mat(src_img)))
                        let SRC_LOWER  = max(M - thresh*D, min(mat(src_img)))
                        let DEST_UPPER = pixel_traits<image_traits<dest_image_type>::pixel_type>::max()
                        let DEST_LOWER = pixel_traits<image_traits<dest_image_type>::pixel_type>::min()

                        MAPPING: [SRC_LOWER, SRC_UPPER] -> [DEST_LOWER, DEST_UPPER]

                      Where this mapping is a linear mapping of values from the left range
                      into the right range of values.  Source pixel values outside the left
                      range are modified to be at the appropriate end of the range.

                      The scaled pixel is then stored in dest_img[r][c].
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename dest_image_type,
        typename src_pixel_type
        >
    void assign_all_pixels (
        dest_image_type& dest_img,
        const src_pixel_type& src_pixel
    );
    /*!
        requires
            - dest_image_type == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h or an image_view.
            - pixel_traits<src_pixel_type> is defined  
        ensures
            - #dest_img.nc() == dest_img.nc()
            - #dest_img.nr() == dest_img.nr()
              (i.e. the size of dest_img isn't changed by this function)
            - for all valid r and c:
                - performs assign_pixel(#dest_img[r][c],src_pixel) 
                  (i.e. assigns the src pixel to every pixel in the dest image)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_type
        >
    void assign_border_pixels (
        image_type& img,
        long x_border_size,
        long y_border_size,
        const typename image_traits<image_type>::pixel_type& p
    );
    /*!
        requires
            - image_type == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h or an image_view
            - x_border_size >= 0
            - y_border_size >= 0
        ensures
            - #img.nc() == img.nc()
            - #img.nr() == img.nr()
              (i.e. the size of img isn't changed by this function)
            - for all valid r such that r+y_border_size or r-y_border_size gives an invalid row
                - for all valid c such that c+x_border_size or c-x_border_size gives an invalid column 
                    - performs assign_pixel(#img[r][c],p) 
                      (i.e. assigns the given pixel to every pixel in the border of img)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_type
        >
    void zero_border_pixels (
        image_type& img,
        long x_border_size,
        long y_border_size
    );
    /*!
        requires
            - image_type == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h or an image_view
            - x_border_size >= 0
            - y_border_size >= 0
        ensures
            - #img.nc() == img.nc()
            - #img.nr() == img.nr()
              (i.e. the size of img isn't changed by this function)
            - for all valid r such that r+y_border_size or r-y_border_size gives an invalid row
                - for all valid c such that c+x_border_size or c-x_border_size gives an invalid column 
                    - performs assign_pixel(#img[r][c], 0 ) 
                      (i.e. assigns 0 to every pixel in the border of img)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_type
        >
    void zero_border_pixels (
        image_type& img,
        rectangle inside
    );
    /*!
        requires
            - image_type == an image object that implements the interface defined in
              dlib/image_processing/generic_image.h or an image_view
        ensures
            - #img.nc() == img.nc()
            - #img.nr() == img.nr()
              (i.e. the size of img isn't changed by this function)
            - All the pixels in img that are not contained inside the inside rectangle
              given to this function are set to 0.  That is, anything not "inside" is on
              the border and set to 0.
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_ASSIGN_IMAGe_ABSTRACT



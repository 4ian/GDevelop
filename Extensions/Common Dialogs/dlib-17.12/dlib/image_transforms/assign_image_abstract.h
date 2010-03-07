// Copyright (C) 2007  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_ASSIGN_IMAGe_ABSTRACT
#ifdef DLIB_ASSIGN_IMAGe_ABSTRACT

#include "../pixel.h"

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
            - src_image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - dest_image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - pixel_traits<typename src_image_type::type> is defined  
            - pixel_traits<typename dest_image_type::type> is defined  
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
        typename src_pixel_type
        >
    void assign_all_pixels (
        dest_image_type& dest_img,
        const src_pixel_type& src_pixel
    );
    /*!
        requires
            - dest_image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - pixel_traits<typename dest_image_type::type> is defined  
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
        const typename image_type::type& p
    );
    /*!
        requires
            - image_type == is an implementation of array2d/array2d_kernel_abstract.h
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
    void assign_border_pixels (
        image_type& img,
        long x_border_size,
        long y_border_size
    );
    /*!
        requires
            - image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - x_border_size >= 0
            - y_border_size >= 0
        ensures
            - #img.nc() == img.nc()
            - #img.nr() == img.nr()
              (i.e. the size of img isn't changed by this function)
            - let p be a pixel such that get_pixel_intensity(p) == 0
            - performs assign_border_pixels(img, x_border_size, y_border_size, p)
              (i.e. zeros the border of the given image)
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_ASSIGN_IMAGe_ABSTRACT



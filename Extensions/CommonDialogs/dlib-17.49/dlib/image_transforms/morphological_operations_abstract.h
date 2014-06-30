// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_MORPHOLOGICAL_OPERATIONs_ABSTRACT_
#ifdef DLIB_MORPHOLOGICAL_OPERATIONs_ABSTRACT_

#include "../pixel.h"
#include "thresholding_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename in_image_type,
        typename out_image_type,
        long M,
        long N
        >
    void binary_dilation (
        const in_image_type& in_img,
        out_image_type& out_img,
        const unsigned char (&structuring_element)[M][N]
    );
    /*!
        requires
            - in_image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - out_image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - pixel_traits<typename in_image_type::type>::grayscale == true   
            - pixel_traits<typename in_image_type::type>::has_alpha == false
            - pixel_traits<typename out_image_type::type>::has_alpha == false 
            - is_same_object(in_img,out_img) == false
            - M % 2 == 1  (i.e. M must be odd)
            - N % 2 == 1  (i.e. N must be odd)
            - all pixels in in_img are set to either on_pixel or off_pixel
              (i.e. it must be a binary image)
            - all pixels in structuring_element are set to either on_pixel or off_pixel
              (i.e. it must be a binary image)
        ensures
            - Does a binary dilation of in_img using the given structuring element and 
              stores the result in out_img.
            - #out_img.nc() == in_img.nc()
            - #out_img.nr() == in_img.nr()
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename in_image_type,
        typename out_image_type,
        long M,
        long N
        >
    void binary_erosion (
        const in_image_type& in_img,
        out_image_type& out_img,
        const unsigned char (&structuring_element)[M][N]
    );
    /*!
        requires
            - in_image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - out_image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - pixel_traits<typename in_image_type::type>::grayscale == true   
            - pixel_traits<typename in_image_type::type>::has_alpha == false
            - pixel_traits<typename out_image_type::type>::has_alpha == false 
            - is_same_object(in_img,out_img) == false
            - M % 2 == 1  (i.e. M must be odd)
            - N % 2 == 1  (i.e. N must be odd)
            - all pixels in in_img are set to either on_pixel or off_pixel
              (i.e. it must be a binary image)
            - all pixels in structuring_element are set to either on_pixel or off_pixel
              (i.e. it must be a binary image)
        ensures
            - Does a binary erosion of in_img using the given structuring element and 
              stores the result in out_img.
            - #out_img.nc() == in_img.nc()
            - #out_img.nr() == in_img.nr()
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename in_image_type,
        typename out_image_type,
        long M,
        long N
        >
    void binary_open (
        const in_image_type& in_img,
        out_image_type& out_img,
        const unsigned char (&structuring_element)[M][N],
        const unsigned long iter = 1
    );
    /*!
        requires
            - in_image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - out_image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - pixel_traits<typename in_image_type::type>::grayscale == true   
            - pixel_traits<typename in_image_type::type>::has_alpha == false
            - pixel_traits<typename out_image_type::type>::has_alpha == false 
            - is_same_object(in_img,out_img) == false
            - M % 2 == 1  (i.e. M must be odd)
            - N % 2 == 1  (i.e. N must be odd)
            - all pixels in in_img are set to either on_pixel or off_pixel
              (i.e. it must be a binary image)
            - all pixels in structuring_element are set to either on_pixel or off_pixel
              (i.e. it must be a binary image)
        ensures
            - Does a binary open of in_img using the given structuring element and 
              stores the result in out_img.  Specifically, iter iterations of binary 
              erosion are applied and then iter iterations of binary dilation.
            - #out_img.nc() == in_img.nc()
            - #out_img.nr() == in_img.nr()
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename in_image_type,
        typename out_image_type,
        long M,
        long N
        >
    void binary_close (
        const in_image_type& in_img,
        out_image_type& out_img,
        const unsigned char (&structuring_element)[M][N],
        const unsigned long iter = 1
    );
    /*!
        requires
            - in_image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - out_image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - pixel_traits<typename in_image_type::type>::grayscale == true   
            - pixel_traits<typename in_image_type::type>::has_alpha == false
            - pixel_traits<typename out_image_type::type>::has_alpha == false 
            - is_same_object(in_img,out_img) == false
            - M % 2 == 1  (i.e. M must be odd)
            - N % 2 == 1  (i.e. N must be odd)
            - all pixels in in_img are set to either on_pixel or off_pixel
              (i.e. it must be a binary image)
            - all pixels in structuring_element are set to either on_pixel or off_pixel
              (i.e. it must be a binary image)
        ensures
            - Does a binary close of in_img using the given structuring element and 
              stores the result in out_img.  Specifically, iter iterations of binary 
              dilation are applied and then iter iterations of binary erosion.
            - #out_img.nc() == in_img.nc()
            - #out_img.nr() == in_img.nr()
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename in_image_type1,
        typename in_image_type2,
        typename out_image_type
        >
    void binary_intersection (
        const in_image_type1& in_img1,
        const in_image_type2& in_img2,
        out_image_type& out_img
    );
    /*!
        requires
            - in_image_type1 == is an implementation of array2d/array2d_kernel_abstract.h
            - in_image_type2 == is an implementation of array2d/array2d_kernel_abstract.h
            - out_image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - pixel_traits<typename in_image_type1::type>::grayscale == true   
            - pixel_traits<typename in_image_type2::type>::grayscale == true   
            - pixel_traits<typename in_image_type1::type>::has_alpha == false
            - pixel_traits<typename in_image_type2::type>::has_alpha == false
            - pixel_traits<typename out_image_type::type>::has_alpha == false 
            - all pixels in in_img1 and in_img2 are set to either on_pixel or off_pixel
              (i.e. they must be binary images)
            - in_img1.nc() == in_img2.nc()
            - in_img1.nr() == in_img2.nr()
        ensures
            - #out_img == the binary intersection of in_img1 and in_img2.  (i.e. All
              the pixels that are set to on_pixel in both in_img1 and in_img2 will be set
              to on_pixel in #out_img.  All other pixels will be set to off_pixel)
            - #out_img.nc() == in_img.nc()
            - #out_img.nr() == in_img.nr()
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename in_image_type1,
        typename in_image_type2,
        typename out_image_type
        >
    void binary_union (
        const in_image_type1& in_img1,
        const in_image_type2& in_img2,
        out_image_type& out_img
    );
    /*!
        requires
            - in_image_type1 == is an implementation of array2d/array2d_kernel_abstract.h
            - in_image_type2 == is an implementation of array2d/array2d_kernel_abstract.h
            - out_image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - pixel_traits<typename in_image_type1::type>::grayscale == true   
            - pixel_traits<typename in_image_type2::type>::grayscale == true   
            - pixel_traits<typename in_image_type1::type>::has_alpha == false
            - pixel_traits<typename in_image_type2::type>::has_alpha == false
            - pixel_traits<typename out_image_type::type>::has_alpha == false 
            - all pixels in in_img1 and in_img2 are set to either on_pixel or off_pixel
              (i.e. they must be binary images)
            - in_img1.nc() == in_img2.nc()
            - in_img1.nr() == in_img2.nr()
        ensures
            - #out_img == the binary union of in_img1 and in_img2.  (i.e. All
              the pixels that are set to on_pixel in in_img1 and/or in_img2 will be set
              to on_pixel in #out_img.  All other pixels will be set to off_pixel)
            - #out_img.nc() == in_img.nc()
            - #out_img.nr() == in_img.nr()
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename in_image_type1,
        typename in_image_type2,
        typename out_image_type
        >
    void binary_difference (
        const in_image_type1& in_img1,
        const in_image_type2& in_img2,
        out_image_type& out_img
    );
    /*!
        requires
            - in_image_type1 == is an implementation of array2d/array2d_kernel_abstract.h
            - in_image_type2 == is an implementation of array2d/array2d_kernel_abstract.h
            - out_image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - pixel_traits<typename in_image_type1::type>::grayscale == true   
            - pixel_traits<typename in_image_type2::type>::grayscale == true   
            - pixel_traits<typename in_image_type1::type>::has_alpha == false
            - pixel_traits<typename in_image_type2::type>::has_alpha == false
            - pixel_traits<typename out_image_type::type>::has_alpha == false 
            - all pixels in in_img1 and in_img2 are set to either on_pixel or off_pixel
              (i.e. they must be binary images)
            - in_img1.nc() == in_img2.nc()
            - in_img1.nr() == in_img2.nr()
        ensures
            - #out_img == the binary difference of in_img1 and in_img2.  (i.e. #out_img
              will be a copy of in_img1 except that any pixels in in_img2 that are set to 
              on_pixel will be set to off_pixel)
            - #out_img.nc() == in_img.nc()
            - #out_img.nr() == in_img.nr()
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename in_image_type,
        typename out_image_type
        >
    void binary_complement (
        const in_image_type& in_img,
        out_image_type& out_img
    );
    /*!
        requires
            - in_image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - out_image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - pixel_traits<typename in_image_type::type>::grayscale == true   
            - pixel_traits<typename in_image_type::type>::has_alpha == false
            - pixel_traits<typename out_image_type::type>::has_alpha == false 
            - all pixels in in_img are set to either on_pixel or off_pixel
              (i.e. it must be a binary image)
        ensures
            - #out_img == the binary complement of in_img.  (i.e. For each pixel in
              in_img, if it is on_pixel then it will be set to off_pixel in #out_img and
              if it was off_pixel in in_img then it will be on_pixel in #out_img)
            - #out_img.nc() == in_img.nc()
            - #out_img.nr() == in_img.nr()
    !*/

    template <
        typename image_type
        >
    void binary_complement (
        image_type& img
    );
    /*!
        requires
            - it must be valid to call binary_complement(img,img);
        ensures
            - calls binary_complement(img,img);
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_MORPHOLOGICAL_OPERATIONs_ABSTRACT_



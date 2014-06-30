// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#undef DLIB_SPATIAL_FILTERINg_ABSTRACT_
#ifdef DLIB_SPATIAL_FILTERINg_ABSTRACT_

#include "../pixel.h"
#include "../matrix.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename in_image_type,
        typename out_image_type,
        typename EXP,
        typename T
        >
    rectangle spatially_filter_image (
        const in_image_type& in_img,
        out_image_type& out_img,
        const matrix_exp<EXP>& filter,
        T scale = 1,
        bool use_abs = false,
        bool add_to = false
    );
    /*!
        requires
            - in_image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - out_image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - pixel_traits<typename in_image_type::type>::has_alpha == false
            - pixel_traits<typename out_image_type::type>::has_alpha == false 
            - is_same_object(in_img, out_img) == false 
            - T must be some scalar type
            - scale != 0
            - filter.nr() % 2 == 1  (i.e. must be odd)
            - filter.nc() % 2 == 1  (i.e. must be odd)
        ensures
            - Applies the given spatial filter to in_img and stores the result in out_img (i.e.
              cross-correlates in_img with filter).  Also divides each resulting pixel by scale.  
            - The intermediate filter computations will be carried out using variables of type EXP::type.
              This is whatever scalar type is used inside the filter matrix. 
            - Pixel values are stored into out_img using the assign_pixel() function and therefore
              any applicable color space conversion or value saturation is performed.  Note that if 
              add_to is true then the filtered output value will be added to out_img rather than 
              overwriting the original value.
            - if (pixel_traits<typename in_image_type::type>::grayscale == false) then
                - the pixel values are converted to the HSI color space and the filtering
                  is done on the intensity channel only.
            - if (use_abs == true) then
                - pixel values after filtering that are < 0 are converted to their absolute values.
            - Pixels close enough to the edge of in_img to not have the filter still fit 
              inside the image are always set to zero.
            - #out_img.nc() == in_img.nc()
            - #out_img.nr() == in_img.nr()
            - returns a rectangle which indicates what pixels in #out_img are considered 
              non-border pixels and therefore contain output from the filter.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename in_image_type,
        typename out_image_type,
        typename EXP1,
        typename EXP2,
        typename T
        >
    rectangle spatially_filter_image_separable (
        const in_image_type& in_img,
        out_image_type& out_img,
        const matrix_exp<EXP1>& row_filter,
        const matrix_exp<EXP2>& col_filter,
        T scale = 1,
        bool use_abs = false,
        bool add_to = false
    );
    /*!
        requires
            - in_image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - out_image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - pixel_traits<typename in_image_type::type>::has_alpha == false
            - pixel_traits<typename out_image_type::type>::has_alpha == false 
            - is_same_object(in_img, out_img) == false 
            - T must be some scalar type
            - scale != 0
            - is_vector(row_filter) == true
            - is_vector(col_filter) == true
            - row_filter.size() % 2 == 1  (i.e. must be odd)
            - col_filter.size() % 2 == 1  (i.e. must be odd)
        ensures
            - Applies the given separable spatial filter to in_img and stores the result in out_img.  
              Also divides each resulting pixel by scale.  Calling this function has the same
              effect as calling the regular spatially_filter_image() routine with a filter,
              FILT, defined as follows: 
                - FILT(r,c) == col_filter(r)*row_filter(c)
            - The intermediate filter computations will be carried out using variables of type EXP1::type.
              This is whatever scalar type is used inside the row_filter matrix. 
            - Pixel values are stored into out_img using the assign_pixel() function and therefore
              any applicable color space conversion or value saturation is performed.  Note that if 
              add_to is true then the filtered output value will be added to out_img rather than 
              overwriting the original value.
            - if (pixel_traits<typename in_image_type::type>::grayscale == false) then
                - the pixel values are converted to the HSI color space and the filtering
                  is done on the intensity channel only.
            - if (use_abs == true) then
                - pixel values after filtering that are < 0 are converted to their absolute values
            - Pixels close enough to the edge of in_img to not have the filter still fit 
              inside the image are always set to zero.
            - #out_img.nc() == in_img.nc()
            - #out_img.nr() == in_img.nr()
            - returns a rectangle which indicates what pixels in #out_img are considered 
              non-border pixels and therefore contain output from the filter.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename in_image_type,
        typename out_image_type,
        typename EXP1,
        typename EXP2,
        typename T
        >
    rectangle spatially_filter_image_separable_down (
        const unsigned long downsample,
        const in_image_type& in_img,
        out_image_type& out_img,
        const matrix_exp<EXP1>& row_filter,
        const matrix_exp<EXP2>& col_filter,
        T scale = 1,
        bool use_abs = false,
        bool add_to = false
    );
    /*!
        requires
            - in_image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - out_image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - pixel_traits<typename in_image_type::type>::has_alpha == false
            - pixel_traits<typename out_image_type::type>::has_alpha == false 
            - is_same_object(in_img, out_img) == false 
            - T must be some scalar type
            - scale != 0
            - is_vector(row_filter) == true
            - is_vector(col_filter) == true
            - row_filter.size() % 2 == 1  (i.e. must be odd)
            - col_filter.size() % 2 == 1  (i.e. must be odd)
            - downsample > 0
        ensures
            - This function is equivalent to calling 
              spatially_filter_image_separable(in_img,out_img,row_filter,col_filter,scale,use_abs,add_to)
              and then downsampling the output image by a factor of downsample.  Therefore, 
              we will have that:
                - #out_img.nr() == ceil((double)in_img.nr()/downsample)
                - #out_img.nc() == ceil((double)in_img.nc()/downsample)
                - #out_img[r][c] == filtered pixel corresponding to in_img[r*downsample][c*downsample]
            - returns a rectangle which indicates what pixels in #out_img are considered 
              non-border pixels and therefore contain output from the filter.
            - Note that the first row and column of non-zero padded data are the following
                - first_row == ceil(floor(col_filter.size()/2.0)/downsample)
                - first_col == ceil(floor(row_filter.size()/2.0)/downsample)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        long NR,
        long NC,
        typename T,
        typename in_image_type
        >
    inline void separable_3x3_filter_block_grayscale (
        T (&block)[NR][NC],
        const in_image_type& img,
        const long& r,
        const long& c,
        const T& fe1, 
        const T& fm,  
        const T& fe2 
    );
    /*!
        requires
            - in_image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - pixel_traits<typename in_image_type::type> must be defined 
            - T should be a scalar type
            - shrink_rect(get_rect(img),1).contains(c,r)
            - shrink_rect(get_rect(img),1).contains(c+NC-1,r+NR-1)
        ensures
            - Filters the image in the sub-window of img defined by a rectangle 
              with its upper left corner at (c,r) and lower right at (c+NC-1,r+NR-1).
            - The output of the filter is stored in #block.  Note that img will be 
              interpreted as a grayscale image.
            - The filter used is defined by the separable filter [fe1 fm fe2].  So the
              spatial filter is thus:
                fe1*fe1  fe1*fm  fe2*fe1
                fe1*fm   fm*fm   fe2*fm
                fe1*fe2  fe2*fm  fe2*fe2
    !*/

// ----------------------------------------------------------------------------------------

    template <
        long NR,
        long NC,
        typename T,
        typename U,
        typename in_image_type
        >
    inline void separable_3x3_filter_block_rgb (
        T (&block)[NR][NC],
        const in_image_type& img,
        const long& r,
        const long& c,
        const U& fe1, 
        const U& fm, 
        const U& fe2
    );
    /*!
        requires
            - in_image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - pixel_traits<typename in_image_type::type>::rgb == true
            - T should be a struct with .red .green and .blue members.
            - U should be a scalar type
            - shrink_rect(get_rect(img),1).contains(c,r)
            - shrink_rect(get_rect(img),1).contains(c+NC-1,r+NR-1)
        ensures
            - Filters the image in the sub-window of img defined by a rectangle 
              with its upper left corner at (c,r) and lower right at (c+NC-1,r+NR-1).
            - The output of the filter is stored in #block.  Note that the filter is applied
              to each color component independently.
            - The filter used is defined by the separable filter [fe1 fm fe2].  So the
              spatial filter is thus:
                fe1*fe1  fe1*fm  fe2*fe1
                fe1*fm   fm*fm   fe2*fm
                fe1*fe2  fe2*fm  fe2*fe2
    !*/

// ----------------------------------------------------------------------------------------

    inline double gaussian (
        double x, 
        double sigma
    );
    /*!
        requires
            - sigma > 0
        ensures
            - computes and returns the value of a 1D Gaussian function with mean 0 
              and standard deviation sigma at the given x value.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    matrix<T,0,1> create_gaussian_filter (
        double sigma,
        int size 
    );
    /*!
        requires
            - sigma > 0
            - size > 0 
            - size is an odd number
        ensures
            - returns a separable Gaussian filter F such that:
                - is_vector(F) == true 
                - F.size() == size 
                - F is suitable for use with the spatially_filter_image_separable() routine
                  and its use with this function corresponds to running a Gaussian filter 
                  of sigma width over an image.
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename in_image_type,
        typename out_image_type
        >
    void gaussian_blur (
        const in_image_type& in_img,
        out_image_type& out_img,
        double sigma = 1,
        int max_size = 1001
    );
    /*!
        requires
            - in_image_type  == is an implementation of array2d/array2d_kernel_abstract.h
            - out_image_type == is an implementation of array2d/array2d_kernel_abstract.h
            - pixel_traits<typename in_image_type::type>::has_alpha == false
            - pixel_traits<typename out_image_type::type>::has_alpha == false 
            - is_same_object(in_img, out_img) == false 
            - sigma > 0
            - max_size > 0
            - max_size is an odd number
        ensures
            - Filters in_img with a Gaussian filter of sigma width.  The actual spatial filter will
              be applied to pixel blocks that are at most max_size wide and max_size tall (note that
              this function will automatically select a smaller block size as appropriate).  The 
              results are stored into #out_img.
            - Pixel values are stored into out_img using the assign_pixel() function and therefore
              any applicable color space conversion or value saturation is performed.
            - if (pixel_traits<typename in_image_type::type>::grayscale == false) then
                - the pixel values are converted to the HSI color space and the filtering
                  is done on the intensity channel only.
            - Pixels close enough to the edge of in_img to not have the filter still fit 
              inside the image are set to zero.
            - #out_img.nc() == in_img.nc()
            - #out_img.nr() == in_img.nr()
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_type1, 
        typename image_type2
        >
    void sum_filter (
        const image_type1& img,
        image_type2& out,
        const rectangle& rect
    );
    /*!
        requires
            - out.nr() == img.nr() 
            - out.nc() == img.nc()
            - image_type1 == an implementation of array2d/array2d_kernel_abstract.h
              and it must contain a scalar type
            - image_type2 == an implementation of array2d/array2d_kernel_abstract.h
              and it must contain a scalar type
            - is_same_object(img,out) == false
        ensures
            - for all valid r and c:
                - let SUM(r,c) == sum of pixels from img which are inside the rectangle 
                  translate_rect(rect, point(c,r)).
                - #out[r][c] == out[r][c] + SUM(r,c)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_type1, 
        typename image_type2
        >
    void sum_filter_assign (
        const image_type1& img,
        image_type2& out,
        const rectangle& rect
    );
    /*!
        requires
            - out.nr() == img.nr() 
            - out.nc() == img.nc()
            - image_type1 == an implementation of array2d/array2d_kernel_abstract.h
              and it must contain a scalar type
            - image_type2 == an implementation of array2d/array2d_kernel_abstract.h
              and it must contain a scalar type
            - is_same_object(img,out) == false
        ensures
            - for all valid r and c:
                - let SUM(r,c) == sum of pixels from img which are inside the rectangle 
                  translate_rect(rect, point(c,r)).
                - #out[r][c] == SUM(r,c)
    !*/

// ----------------------------------------------------------------------------------------

    template <
        typename image_type1, 
        typename image_type2
        >
    void max_filter (
        image_type1& img,
        image_type2& out,
        const long width,
        const long height,
        const typename image_type1::type& thresh
    );
    /*!
        requires
            - out.nr() == img.nr() 
            - out.nc() == img.nc()
            - image_type1 == an implementation of array2d/array2d_kernel_abstract.h
              and it must contain a scalar type
            - image_type2 == an implementation of array2d/array2d_kernel_abstract.h
              and it must contain a scalar type
            - is_same_object(img,out) == false
            - width > 0 && height > 0
        ensures
            - for all valid r and c:
                - let MAX(r,c) == maximum of pixels from img which are inside the rectangle 
                  centered_rect(point(c,r), width, height)
                - if (MAX(r,c) >= thresh)
                    - #out[r][c] == out[r][c] + MAX(r,c)
                - else
                    - #out[r][c] == out[r][c] + thresh 
            - Does not change the size of img.
            - Uses img as scratch space.  Therefore, the pixel values in img will have
              been modified by this function.  That is, max_filter() destroys the contents
              of img. 
    !*/

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SPATIAL_FILTERINg_ABSTRACT_


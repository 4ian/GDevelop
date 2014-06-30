// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SPATIAL_FILTERINg_H_
#define DLIB_SPATIAL_FILTERINg_H_

#include "../pixel.h"
#include "spatial_filtering_abstract.h"
#include "../algs.h"
#include "../assert.h"
#include "../array2d.h"
#include "../matrix.h"
#include <limits>

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
        T scale,
        bool use_abs = false,
        bool add_to = false
    )
    {
        COMPILE_TIME_ASSERT( pixel_traits<typename in_image_type::type>::has_alpha == false );
        COMPILE_TIME_ASSERT( pixel_traits<typename out_image_type::type>::has_alpha == false );

        DLIB_ASSERT(scale != 0 &&
                    filter.nr()%2 == 1 &&
                    filter.nc()%2 == 1,
            "\tvoid spatially_filter_image()"
            << "\n\t You can't give a scale of zero or a filter with even dimensions"
            << "\n\t scale: "<< scale
            << "\n\t filter.nr(): "<< filter.nr()
            << "\n\t filter.nc(): "<< filter.nc()
            );
        DLIB_ASSERT(is_same_object(in_img, out_img) == false,
            "\tvoid spatially_filter_image()"
            << "\n\tYou must give two different image objects"
            );



        // if there isn't any input image then don't do anything
        if (in_img.size() == 0)
        {
            out_img.clear();
            return rectangle();
        }

        out_img.set_size(in_img.nr(),in_img.nc());

        zero_border_pixels(out_img, filter.nc()/2, filter.nr()/2); 

        // figure out the range that we should apply the filter to
        const long first_row = filter.nr()/2;
        const long first_col = filter.nc()/2;
        const long last_row = in_img.nr() - filter.nr()/2;
        const long last_col = in_img.nc() - filter.nc()/2;

        const rectangle non_border = rectangle(first_col, first_row, last_col-1, last_row-1);

        // apply the filter to the image
        for (long r = first_row; r < last_row; ++r)
        {
            for (long c = first_col; c < last_col; ++c)
            {
                typedef typename EXP::type ptype;
                ptype p;
                ptype temp = 0;
                for (long m = 0; m < filter.nr(); ++m)
                {
                    for (long n = 0; n < filter.nc(); ++n)
                    {
                        // pull out the current pixel and put it into p
                        p = get_pixel_intensity(in_img[r-filter.nr()/2+m][c-filter.nc()/2+n]);
                        temp += p*filter(m,n);
                    }
                }

                temp /= scale;

                if (use_abs && temp < 0)
                {
                    temp = -temp;
                }

                // save this pixel to the output image
                if (add_to == false)
                {
                    assign_pixel(out_img[r][c], in_img[r][c]);
                    assign_pixel_intensity(out_img[r][c], temp);
                }
                else
                {
                    assign_pixel(out_img[r][c], temp + get_pixel_intensity(out_img[r][c]));
                }
            }
        }

        return non_border;
    }

    template <
        typename in_image_type,
        typename out_image_type,
        typename EXP
        >
    rectangle spatially_filter_image (
        const in_image_type& in_img,
        out_image_type& out_img,
        const matrix_exp<EXP>& filter
    )
    {
        return spatially_filter_image(in_img,out_img,filter,1);
    }

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
        T scale,
        bool use_abs = false,
        bool add_to = false
    )
    {
        COMPILE_TIME_ASSERT( pixel_traits<typename in_image_type::type>::has_alpha == false );
        COMPILE_TIME_ASSERT( pixel_traits<typename out_image_type::type>::has_alpha == false );

        DLIB_ASSERT(scale != 0 &&
                    row_filter.size()%2 == 1 &&
                    col_filter.size()%2 == 1 &&
                    is_vector(row_filter) &&
                    is_vector(col_filter),
            "\tvoid spatially_filter_image_separable()"
            << "\n\t Invalid inputs were given to this function."
            << "\n\t scale: "<< scale
            << "\n\t row_filter.size(): "<< row_filter.size()
            << "\n\t col_filter.size(): "<< col_filter.size()
            << "\n\t is_vector(row_filter): "<< is_vector(row_filter)
            << "\n\t is_vector(col_filter): "<< is_vector(col_filter)
            );
        DLIB_ASSERT(is_same_object(in_img, out_img) == false,
            "\tvoid spatially_filter_image_separable()"
            << "\n\tYou must give two different image objects"
            );



        // if there isn't any input image then don't do anything
        if (in_img.size() == 0)
        {
            out_img.clear();
            return rectangle();
        }

        out_img.set_size(in_img.nr(),in_img.nc());

        zero_border_pixels(out_img, row_filter.size()/2, col_filter.size()/2); 

        // figure out the range that we should apply the filter to
        const long first_row = col_filter.size()/2;
        const long first_col = row_filter.size()/2;
        const long last_row = in_img.nr() - col_filter.size()/2;
        const long last_col = in_img.nc() - row_filter.size()/2;

        const rectangle non_border = rectangle(first_col, first_row, last_col-1, last_row-1);

        typedef typename out_image_type::mem_manager_type mem_manager_type;
        typedef typename EXP1::type ptype;

        array2d<ptype,mem_manager_type> temp_img;
        temp_img.set_size(in_img.nr(), in_img.nc());

        // apply the row filter
        for (long r = 0; r < in_img.nr(); ++r)
        {
            for (long c = first_col; c < last_col; ++c)
            {
                ptype p;
                ptype temp = 0;
                for (long n = 0; n < row_filter.size(); ++n)
                {
                    // pull out the current pixel and put it into p
                    p = get_pixel_intensity(in_img[r][c-row_filter.size()/2+n]);
                    temp += p*row_filter(n);
                }
                temp_img[r][c] = temp;
            }
        }

        // apply the column filter 
        for (long r = first_row; r < last_row; ++r)
        {
            for (long c = first_col; c < last_col; ++c)
            {
                ptype temp = 0;
                for (long m = 0; m < col_filter.size(); ++m)
                {
                    temp += temp_img[r-col_filter.size()/2+m][c]*col_filter(m);
                }

                temp /= scale;

                if (use_abs && temp < 0)
                {
                    temp = -temp;
                }

                // save this pixel to the output image
                if (add_to == false)
                {
                    assign_pixel(out_img[r][c], in_img[r][c]);
                    assign_pixel_intensity(out_img[r][c], temp);
                }
                else
                {
                    assign_pixel(out_img[r][c], temp + get_pixel_intensity(out_img[r][c]));
                }
            }
        }
        return non_border;
    }

    template <
        typename in_image_type,
        typename out_image_type,
        typename EXP1,
        typename EXP2
        >
    rectangle spatially_filter_image_separable (
        const in_image_type& in_img,
        out_image_type& out_img,
        const matrix_exp<EXP1>& row_filter,
        const matrix_exp<EXP2>& col_filter
    )
    {
        return spatially_filter_image_separable(in_img,out_img,row_filter,col_filter,1);
    }

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
        T scale,
        bool use_abs = false,
        bool add_to = false
    )
    {
        COMPILE_TIME_ASSERT( pixel_traits<typename in_image_type::type>::has_alpha == false );
        COMPILE_TIME_ASSERT( pixel_traits<typename out_image_type::type>::has_alpha == false );

        DLIB_ASSERT(downsample > 0 &&
                    scale != 0 &&
                    row_filter.size()%2 == 1 &&
                    col_filter.size()%2 == 1 &&
                    is_vector(row_filter) &&
                    is_vector(col_filter),
            "\tvoid spatially_filter_image_separable_down()"
            << "\n\t Invalid inputs were given to this function."
            << "\n\t downsample: "<< downsample
            << "\n\t scale: "<< scale
            << "\n\t row_filter.size(): "<< row_filter.size()
            << "\n\t col_filter.size(): "<< col_filter.size()
            << "\n\t is_vector(row_filter): "<< is_vector(row_filter)
            << "\n\t is_vector(col_filter): "<< is_vector(col_filter)
            );
        DLIB_ASSERT(is_same_object(in_img, out_img) == false,
            "\tvoid spatially_filter_image_separable_down()"
            << "\n\tYou must give two different image objects"
            );



        // if there isn't any input image then don't do anything
        if (in_img.size() == 0)
        {
            out_img.clear();
            return rectangle();
        }

        out_img.set_size((long)(std::ceil((double)in_img.nr()/downsample)),
                         (long)(std::ceil((double)in_img.nc()/downsample)));

        const double col_border = std::floor(col_filter.size()/2.0);
        const double row_border = std::floor(row_filter.size()/2.0);

        // figure out the range that we should apply the filter to
        const long first_row = (long)std::ceil(col_border/downsample);
        const long first_col = (long)std::ceil(row_border/downsample);
        const long last_row  = (long)std::ceil((in_img.nr() - col_border)/downsample) - 1;
        const long last_col  = (long)std::ceil((in_img.nc() - row_border)/downsample) - 1;

        // zero border pixels
        const rectangle non_border = rectangle(first_col, first_row, last_col, last_row);
        border_enumerator be(get_rect(out_img), non_border );
        while (be.move_next())
        {
            out_img[be.element().y()][be.element().x()] = 0;
        }

        typedef typename EXP1::type ptype;

        typedef typename out_image_type::mem_manager_type mem_manager_type;
        array2d<ptype,mem_manager_type> temp_img;
        temp_img.set_size(in_img.nr(), out_img.nc());

        // apply the row filter
        for (long r = 0; r < temp_img.nr(); ++r)
        {
            for (long c = non_border.left(); c <= non_border.right(); ++c)
            {
                ptype p;
                ptype temp = 0;
                for (long n = 0; n < row_filter.size(); ++n)
                {
                    // pull out the current pixel and put it into p
                    p = get_pixel_intensity(in_img[r][c*downsample-row_filter.size()/2+n]);
                    temp += p*row_filter(n);
                }
                temp_img[r][c] = temp;
            }
        }

        // apply the column filter 
        for (long r = non_border.top(); r <= non_border.bottom(); ++r)
        {
            for (long c = non_border.left(); c <= non_border.right(); ++c)
            {
                ptype temp = 0;
                for (long m = 0; m < col_filter.size(); ++m)
                {
                    temp += temp_img[r*downsample-col_filter.size()/2+m][c]*col_filter(m);
                }

                temp /= scale;

                if (use_abs && temp < 0)
                {
                    temp = -temp;
                }

                // save this pixel to the output image
                if (add_to == false)
                {
                    assign_pixel(out_img[r][c], in_img[r*downsample][c*downsample]);
                    assign_pixel_intensity(out_img[r][c], temp);
                }
                else
                {
                    assign_pixel(out_img[r][c], temp + get_pixel_intensity(out_img[r][c]));
                }
            }
        }

        return non_border;
    }

    template <
        typename in_image_type,
        typename out_image_type,
        typename EXP1,
        typename EXP2
        >
    rectangle spatially_filter_image_separable_down (
        const unsigned long downsample,
        const in_image_type& in_img,
        out_image_type& out_img,
        const matrix_exp<EXP1>& row_filter,
        const matrix_exp<EXP2>& col_filter
    )
    {
        return spatially_filter_image_separable_down(downsample,in_img,out_img,row_filter,col_filter,1);
    }

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
        const T& fe1, // separable filter end
        const T& fm,  // separable filter middle 
        const T& fe2 // separable filter end 2
    ) 
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(shrink_rect(get_rect(img),1).contains(c,r) &&
                    shrink_rect(get_rect(img),1).contains(c+NC-1,r+NR-1),
            "\t void separable_3x3_filter_block_grayscale()"
            << "\n\t The sub-window doesn't fit inside the given image."
            << "\n\t get_rect(img):       " << get_rect(img) 
            << "\n\t (c,r):               " << point(c,r) 
            << "\n\t (c+NC-1,r+NR-1): " << point(c+NC-1,r+NR-1) 
            );


        T row_filt[NR+2][NC];
        for (long rr = 0; rr < NR+2; ++rr)
        {
            for (long cc = 0; cc < NC; ++cc)
            {
                row_filt[rr][cc] = get_pixel_intensity(img[r+rr-1][c+cc-1])*fe1 + 
                                   get_pixel_intensity(img[r+rr-1][c+cc])*fm + 
                                   get_pixel_intensity(img[r+rr-1][c+cc+1])*fe2;
            }
        }

        for (long rr = 0; rr < NR; ++rr)
        {
            for (long cc = 0; cc < NC; ++cc)
            {
                block[rr][cc] = (row_filt[rr][cc]*fe1 + 
                                row_filt[rr+1][cc]*fm + 
                                row_filt[rr+2][cc]*fe2);
            }
        }

    }

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
        const U& fe1, // separable filter end
        const U& fm,  // separable filter middle 
        const U& fe2  // separable filter end 2
    ) 
    {
        // make sure requires clause is not broken
        DLIB_ASSERT(shrink_rect(get_rect(img),1).contains(c,r) &&
                    shrink_rect(get_rect(img),1).contains(c+NC-1,r+NR-1),
            "\t void separable_3x3_filter_block_grayscale()"
            << "\n\t The sub-window doesn't fit inside the given image."
            << "\n\t get_rect(img):       " << get_rect(img) 
            << "\n\t (c,r):               " << point(c,r) 
            << "\n\t (c+NC-1,r+NR-1): " << point(c+NC-1,r+NR-1) 
            );

        T row_filt[NR+2][NC];
        for (long rr = 0; rr < NR+2; ++rr)
        {
            for (long cc = 0; cc < NC; ++cc)
            {
                row_filt[rr][cc].red   = img[r+rr-1][c+cc-1].red*fe1   + img[r+rr-1][c+cc].red*fm   + img[r+rr-1][c+cc+1].red*fe2;
                row_filt[rr][cc].green = img[r+rr-1][c+cc-1].green*fe1 + img[r+rr-1][c+cc].green*fm + img[r+rr-1][c+cc+1].green*fe2;
                row_filt[rr][cc].blue  = img[r+rr-1][c+cc-1].blue*fe1  + img[r+rr-1][c+cc].blue*fm  + img[r+rr-1][c+cc+1].blue*fe2;
            }
        }

        for (long rr = 0; rr < NR; ++rr)
        {
            for (long cc = 0; cc < NC; ++cc)
            {
                block[rr][cc].red   = row_filt[rr][cc].red*fe1   + row_filt[rr+1][cc].red*fm   + row_filt[rr+2][cc].red*fe2;
                block[rr][cc].green = row_filt[rr][cc].green*fe1 + row_filt[rr+1][cc].green*fm + row_filt[rr+2][cc].green*fe2;
                block[rr][cc].blue  = row_filt[rr][cc].blue*fe1  + row_filt[rr+1][cc].blue*fm  + row_filt[rr+2][cc].blue*fe2;
            }
        }

    }

// ----------------------------------------------------------------------------------------

    inline double gaussian (
        double x, 
        double sigma
    )
    /*!
        requires
            - sigma > 0
        ensures
            - computes and returns the value of a 1D Gaussian function with mean 0 
              and standard deviation sigma at the given x value.
    !*/
    {
        DLIB_ASSERT(sigma > 0,
            "\tdouble gaussian(x)"
            << "\n\t sigma must be bigger than 0"
            << "\n\t sigma: " << sigma 
        );
        const double sqrt_2_pi = 2.5066282746310002416123552393401041626930;
        return 1.0/(sigma*sqrt_2_pi) * std::exp( -(x*x)/(2*sigma*sigma));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    matrix<T,0,1> create_gaussian_filter (
        double sigma,
        int max_size 
    )
    /*!
        requires
            - sigma > 0
            - max_size > 0 
            - max_size is an odd number
        ensures
            - returns a separable Gaussian filter F such that:
                - is_vector(F) == true 
                - F.size() <= max_size 
                - F is suitable for use with the spatially_filter_image_separable() routine
                  and its use with this function corresponds to running a Gaussian filter 
                  of sigma width over an image.
    !*/
    {
        DLIB_ASSERT(sigma > 0 && max_size > 0 && (max_size%2)==1,
            "\t matrix<T,0,1> create_gaussian_filter()"
            << "\n\t Invalid inputs were given to this function."
            << "\n\t sigma: " << sigma 
            << "\n\t max_size:  " << max_size 
        );

        // Adjust the size so that the ratio of the gaussian values isn't huge.  
        // This only matters when T is an integer type.  However, we do it for
        // all types so that the behavior of this function is always relatively
        // the same.
        while (gaussian(0,sigma)/gaussian(max_size/2,sigma) > 50)
            --max_size;


        matrix<double,0,1> f(max_size);
        for (long i = 0; i < f.size(); ++i)
        {
            f(i) = gaussian(i-max_size/2, sigma);
        }

        if (is_float_type<T>::value == false)
        {
            f /= f(0);
            return matrix_cast<T>(round(f));
        }
        else
        {
            return matrix_cast<T>(f);
        }
    }

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
    )
    {
        DLIB_ASSERT(sigma > 0 && max_size > 0 && (max_size%2)==1 &&
                    is_same_object(in_img, out_img) == false,
            "\t void gaussian_blur()"
            << "\n\t Invalid inputs were given to this function."
            << "\n\t sigma: " << sigma 
            << "\n\t max_size:  " << max_size 
            << "\n\t is_same_object(in_img,out_img): " << is_same_object(in_img,out_img) 
        );

        typedef typename pixel_traits<typename out_image_type::type>::basic_pixel_type type;
        typedef typename promote<type>::type ptype;

        const matrix<ptype,0,1>& filt = create_gaussian_filter<ptype>(sigma, max_size);

        ptype scale = sum(filt);
        scale = scale*scale;

        spatially_filter_image_separable(in_img, out_img, filt, filt, scale);

    }

// ----------------------------------------------------------------------------------------

    namespace impl
    {
    template <
        bool add_to,
        typename image_type1, 
        typename image_type2
        >
    void sum_filter (
        const image_type1& img,
        image_type2& out,
        const rectangle& rect
    )
    {
        DLIB_ASSERT(img.nr() == out.nr() &&
                    img.nc() == out.nc() &&
                    is_same_object(img,out) == false,
            "\t void sum_filter()"
            << "\n\t Invalid arguments given to this function."
            << "\n\t img.nr(): " << img.nr() 
            << "\n\t img.nc(): " << img.nc() 
            << "\n\t out.nr(): " << out.nr() 
            << "\n\t out.nc(): " << out.nc() 
            << "\n\t is_same_object(img,out): " << is_same_object(img,out) 
        );

        typedef typename image_type1::type pixel_type;
        typedef typename promote<pixel_type>::type ptype;

        std::vector<ptype> column_sum;
        column_sum.resize(img.nc() + rect.width(),0);

        const long top    = -1 + rect.top();
        const long bottom = -1 + rect.bottom();
        long left = rect.left()-1;

        // initialize column_sum at row -1
        for (unsigned long j = 0; j < column_sum.size(); ++j)
        {
            rectangle strip(left,top,left,bottom);
            strip = strip.intersect(get_rect(img));
            if (!strip.is_empty())
            {
                column_sum[j] = sum(matrix_cast<ptype>(subm(array_to_matrix(img),strip)));
            }

            ++left;
        }


        const rectangle area = get_rect(img);

        // Save width to avoid computing it over and over.
        const long width = rect.width();


        // Now do the bulk of the filtering work.
        for (long r = 0; r < img.nr(); ++r)
        {
            // set to sum at point(-1,r). i.e. should be equal to sum(array_to_matrix(img), translate_rect(rect, point(-1,r)))
            // We compute it's value in the next loop.
            ptype cur_sum = 0; 

            // Update the first part of column_sum since we only work on the c+width part of column_sum
            // in the main loop.
            const long top    = r + rect.top() - 1;
            const long bottom = r + rect.bottom();
            for (long k = 0; k < width; ++k)
            {
                const long right  = k-width + rect.right();

                const ptype br_corner = area.contains(right,bottom) ? img[bottom][right] : 0;
                const ptype tr_corner = area.contains(right,top)    ? img[top][right]    : 0;
                // update the sum in this column now that we are on the next row
                column_sum[k] = column_sum[k] + br_corner - tr_corner;
                cur_sum += column_sum[k];
            }

            for (long c = 0; c < img.nc(); ++c)
            {
                const long top    = r + rect.top() - 1;
                const long bottom = r + rect.bottom();
                const long right  = c + rect.right();

                const ptype br_corner = area.contains(right,bottom) ? img[bottom][right] : 0;
                const ptype tr_corner = area.contains(right,top)    ? img[top][right]    : 0;

                // update the sum in this column now that we are on the next row
                column_sum[c+width] = column_sum[c+width] + br_corner - tr_corner;

                // add in the new right side of the rect and subtract the old right side.
                cur_sum = cur_sum + column_sum[c+width] - column_sum[c];

                if (add_to)
                    out[r][c] += static_cast<typename image_type2::type>(cur_sum);
                else
                    out[r][c] = static_cast<typename image_type2::type>(cur_sum);
            }
        }
    }
    }

    template <
        typename image_type1, 
        typename image_type2
        >
    void sum_filter (
        const image_type1& img,
        image_type2& out,
        const rectangle& rect
    )
    {
        impl::sum_filter<true>(img,out,rect);
    }

    template <
        typename image_type1, 
        typename image_type2
        >
    void sum_filter_assign (
        const image_type1& img,
        image_type2& out,
        const rectangle& rect
    )
    {
        impl::sum_filter<false>(img,out,rect);
    }

// ----------------------------------------------------------------------------------------

    namespace impl
    {
        template <typename T>
        class fast_deque
        {
        /*
            This is a fast and minimal implementation of std::deque for 
            use with the max_filter.  

            This object assumes that no more than max_size elements
            will ever be pushed into it at a time.
        */
        public:

            explicit fast_deque(unsigned long max_size)
            {
                // find a power of two that upper bounds max_size
                mask = 2;
                while (mask < max_size)
                    mask *= 2;

                clear();

                data.resize(mask);
                --mask;  // make into bit mask
            }

            void clear()
            {
                first = 1;
                last = 0;
                size = 0;
            }

            bool empty() const
            {
                return size == 0;
            }

            void pop_back()
            {
                last = (last-1)&mask;
                --size;
            }

            void push_back(const T& item)
            {
                last = (last+1)&mask;
                ++size;
                data[last] = item;
            }

            void pop_front()
            {
                first = (first+1)&mask;
                --size;
            }

            const T& front() const
            {
                return data[first];
            }

            const T& back() const
            {
                return data[last];
            }

        private:

            std::vector<T> data;
            unsigned long mask;
            unsigned long first;
            unsigned long last;
            unsigned long size;
        };
    }

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
    )
    {
        DLIB_ASSERT( width > 0 &&
                     height > 0 &&
                     out.nr() == img.nr() &&
                     out.nc() == img.nc() &&
                     is_same_object(img,out) == false,
                "\t void max_filter()"
                << "\n\t Invalid arguments given to this function."
                << "\n\t img.nr(): " << img.nr() 
                << "\n\t img.nc(): " << img.nc() 
                << "\n\t out.nr(): " << out.nr() 
                << "\n\t out.nc(): " << out.nc() 
                << "\n\t width:    " << width 
                << "\n\t height:   " << height 
                << "\n\t is_same_object(img,out): " << is_same_object(img,out) 
                     );

        typedef typename image_type1::type pixel_type;


        dlib::impl::fast_deque<std::pair<long,pixel_type> > Q(std::max(width,height));

        const long last_col = std::max(img.nc(), ((width-1)/2));
        const long last_row = std::max(img.nr(), ((height-1)/2));

        // run max filter along rows of img
        for (long r = 0; r < img.nr(); ++r)
        {
            Q.clear();
            for (long c = 0; c < (width-1)/2 && c < img.nc(); ++c)
            {
                while (!Q.empty() && img[r][c] >= Q.back().second)
                    Q.pop_back();
                Q.push_back(std::make_pair(c,img[r][c]));
            }

            for (long c = (width-1)/2; c < img.nc(); ++c)
            {
                while (!Q.empty() && img[r][c] >= Q.back().second)
                    Q.pop_back();
                while (!Q.empty() && Q.front().first <= c-width)
                    Q.pop_front();
                Q.push_back(std::make_pair(c,img[r][c]));

                img[r][c-((width-1)/2)] = Q.front().second;
            }

            for (long c = last_col; c < img.nc() + ((width-1)/2); ++c)
            {
                while (!Q.empty() && Q.front().first <= c-width)
                    Q.pop_front();

                img[r][c-((width-1)/2)] = Q.front().second;
            }
        }

        // run max filter along columns of img.  Store result in out.
        for (long cc = 0; cc < img.nc(); ++cc)
        {
            Q.clear();
            for (long rr = 0; rr < (height-1)/2 && rr < img.nr(); ++rr)
            {
                while (!Q.empty() && img[rr][cc] >= Q.back().second)
                    Q.pop_back();
                Q.push_back(std::make_pair(rr,img[rr][cc]));
            }

            for (long rr = (height-1)/2; rr < img.nr(); ++rr)
            {
                while (!Q.empty() && img[rr][cc] >= Q.back().second)
                    Q.pop_back();
                while (!Q.empty() && Q.front().first <= rr-height)
                    Q.pop_front();
                Q.push_back(std::make_pair(rr,img[rr][cc]));

                out[rr-((height-1)/2)][cc] += std::max(Q.front().second, thresh);
            }

            for (long rr = last_row; rr < img.nr() + ((height-1)/2); ++rr)
            {
                while (!Q.empty() && Q.front().first <= rr-height)
                    Q.pop_front();

                out[rr-((height-1)/2)][cc] += std::max(Q.front().second, thresh);
            }
        }
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SPATIAL_FILTERINg_H_



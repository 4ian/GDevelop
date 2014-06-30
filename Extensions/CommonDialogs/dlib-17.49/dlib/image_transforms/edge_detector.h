// Copyright (C) 2008  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_EDGE_DETECTOr_
#define DLIB_EDGE_DETECTOr_

#include "edge_detector_abstract.h"
#include "../pixel.h"
#include "../array2d.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename T
        >
    inline char edge_orientation (
        const T& x_,
        const T& y_
    )
    {

        // if this is a perfectly horizontal gradient then return right away
        if (x_ == 0)
        {
            return '|';
        }
        else if (y_ == 0) // if this is a perfectly vertical gradient then return right away
        {
            return '-';
        }

        // Promote x so that when we multiply by 128 later we know overflow won't happen.
        typedef typename promote<T>::type type;
        type x = x_;
        type y = y_;

        if (x < 0)
        {
            x = -x;
            if (y < 0)
            {
                y = -y;
                x *= 128;
                const type temp = x/y;
                if (temp > 309)
                    return '-';
                else if (temp > 53)
                    return '/';
                else
                    return '|';
            }
            else
            {
                x *= 128;
                const type temp = x/y;
                if (temp > 309)
                    return '-';
                else if (temp > 53)
                    return '\\';
                else
                    return '|';
            }
        }
        else
        {
            if (y < 0)
            {
                y = -y;
                x *= 128;

                const type temp = x/y;
                if (temp > 309)
                    return '-';
                else if (temp > 53)
                    return '\\';
                else
                    return '|';
            }
            else
            {
                x *= 128;

                const type temp = x/y;
                if (temp > 309)
                    return '-';
                else if (temp > 53)
                    return '/';
                else
                    return '|';
            }
        }

    }

// ----------------------------------------------------------------------------------------

    template <
        typename in_image_type,
        typename out_image_type
        >
    void sobel_edge_detector (
        const in_image_type& in_img,
        out_image_type& horz,
        out_image_type& vert
    )
    {
        COMPILE_TIME_ASSERT(pixel_traits<typename out_image_type::type>::is_unsigned == false);
        DLIB_ASSERT( !is_same_object(in_img,horz) && !is_same_object(in_img,vert) &&
                     !is_same_object(horz,vert),
            "\tvoid sobel_edge_detector(in_img, horz, vert)"
            << "\n\t You can't give the same image as more than one argument"
            << "\n\t is_same_object(in_img,horz): " << is_same_object(in_img,horz)
            << "\n\t is_same_object(in_img,vert): " << is_same_object(in_img,vert)
            << "\n\t is_same_object(horz,vert):    " << is_same_object(horz,vert)
            );


        const int vert_filter[3][3] = {{-1,-2,-1}, 
        {0,0,0}, 
        {1,2,1}};
        const int horz_filter[3][3] = { {-1,0,1}, 
        {-2,0,2}, 
        {-1,0,1}};

        const long M = 3;
        const long N = 3;

        horz.set_size(in_img.nr(),in_img.nc());
        vert.set_size(in_img.nr(),in_img.nc());

        assign_border_pixels(horz,1,1,0);
        assign_border_pixels(vert,1,1,0);

        // figure out the range that we should apply the filter to
        const long first_row = M/2;
        const long first_col = N/2;
        const long last_row = in_img.nr() - M/2;
        const long last_col = in_img.nc() - N/2;


        // apply the filter to the image
        for (long r = first_row; r < last_row; ++r)
        {
            for (long c = first_col; c < last_col; ++c)
            {
                typedef typename pixel_traits<typename in_image_type::type>::basic_pixel_type bp_type;

                typename promote<bp_type>::type p, horz_temp, vert_temp;
                horz_temp = 0;
                vert_temp = 0;
                for (long m = 0; m < M; ++m)
                {
                    for (long n = 0; n < N; ++n)
                    {
                        // pull out the current pixel and put it into p
                        p = get_pixel_intensity(in_img[r-M/2+m][c-N/2+n]);

                        horz_temp += p*horz_filter[m][n];
                        vert_temp += p*vert_filter[m][n];
                    }
                }

                assign_pixel(horz[r][c] , horz_temp);
                assign_pixel(vert[r][c] , vert_temp);

            }
        }
    }

// ----------------------------------------------------------------------------------------

    namespace impl
    {
        template <typename T>
        typename promote<T>::type square (const T& a)
        { 
            typedef typename promote<T>::type type;
            return static_cast<T>(a)*static_cast<T>(a); 
        }
    }

    template <
        typename in_image_type,
        typename out_image_type
        >
    void suppress_non_maximum_edges (
        const in_image_type& horz,
        const in_image_type& vert,
        out_image_type& out_img
    )
    {
        COMPILE_TIME_ASSERT(is_signed_type<typename in_image_type::type>::value);
        DLIB_ASSERT( horz.nr() == vert.nr() && horz.nc() == vert.nc(),
            "\tvoid suppress_non_maximum_edges(horz, vert, out_img)"
            << "\n\tYou have to give horz and vert gradient images that are the same size"
            << "\n\thorz.nr():   " << horz.nr() 
            << "\n\thorz.nc():   " << horz.nc() 
            << "\n\tvert.nr():   " << vert.nr() 
            << "\n\tvert.nc():   " << vert.nc() 
            );
        DLIB_ASSERT( !is_same_object(out_img,horz) && !is_same_object(out_img,vert),
            "\tvoid suppress_non_maximum_edges(horz, vert, out_img)"
            << "\n\t out_img can't be the same as one of the input images."
            << "\n\t is_same_object(out_img,horz):    " << is_same_object(out_img,horz)
            << "\n\t is_same_object(out_img,vert):    " << is_same_object(out_img,vert)
            );

        using std::min;
        using std::abs;


        // if there isn't any input image then don't do anything
        if (horz.size() == 0)
        {
            out_img.clear();
            return;
        }

        out_img.set_size(horz.nr(),horz.nc());

        zero_border_pixels(out_img,1,1);

        // now do non maximum suppression while we copy the 
        const long M = 3;
        const long N = 3;

        // figure out the range that we should apply the filter to
        const long first_row = M/2;
        const long first_col = N/2;
        const long last_row = horz.nr() - M/2;
        const long last_col = horz.nc() - N/2;


        // apply the filter to the image
        for (long r = first_row; r < last_row; ++r)
        {
            for (long c = first_col; c < last_col; ++c)
            {
                typedef typename promote<typename in_image_type::type>::type T;
                const T y = horz[r][c];
                const T x = vert[r][c];

                using impl::square;

                const T val = square(horz[r][c]) + square(vert[r][c]); 

                const char ori = edge_orientation(x,y);
                const unsigned char zero = 0;
                switch (ori)
                {
                    case '-':
                        if (square(horz[r-1][c])+square(vert[r-1][c]) > val || square(horz[r+1][c]) + square(vert[r+1][c]) > val)
                            assign_pixel(out_img[r][c] , zero);
                        else
                            assign_pixel(out_img[r][c] , std::sqrt((double)val));
                        break;

                    case '|':
                        if (square(horz[r][c-1]) + square(vert[r][c-1]) > val || square(horz[r][c+1]) + square(vert[r][c+1]) > val)
                            assign_pixel(out_img[r][c] , zero);
                        else
                            assign_pixel(out_img[r][c] , std::sqrt((double)val));
                        break;

                    case '/':
                        if (square(horz[r-1][c-1]) + square(vert[r-1][c-1]) > val || square(horz[r+1][c+1]) + square(vert[r+1][c+1]) > val)
                            assign_pixel(out_img[r][c] , zero);
                        else
                            assign_pixel(out_img[r][c] , std::sqrt((double)val));
                        break;

                    case '\\':
                        if (square(horz[r+1][c-1]) + square(vert[r+1][c-1]) > val || square(horz[r-1][c+1]) + square(vert[r-1][c+1]) > val)
                            assign_pixel(out_img[r][c] , zero);
                        else
                            assign_pixel(out_img[r][c] , std::sqrt((double)val));
                        break;

                }
            }
        }
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_EDGE_DETECTOr_




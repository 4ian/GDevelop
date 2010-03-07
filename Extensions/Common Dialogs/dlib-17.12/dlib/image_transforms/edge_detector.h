// Copyright (C) 2008  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_EDGE_DETECTOr_
#define DLIB_EDGE_DETECTOr_

#include "edge_detector_abstract.h"
#include "../pixel.h"
#include "../array2d.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    inline char edge_orientation (
        long x,
        long y
    )
    {
        // if this is a perfectly horizontal gradient then return right away
        if (x == 0)
        {
            return '|';
        }
        else if (y == 0) // if this is a perfectly vertical gradient then return right away
        {
            return '-';
        }

        if (x < 0)
        {
            x = -x;
            if (y < 0)
            {
                y = -y;
                x <<= 7;
                const long temp = x/y;
                if (temp > 309)
                    return '-';
                else if (temp > 53)
                    return '/';
                else
                    return '|';
            }
            else
            {
                x <<= 7;
                const long temp = x/y;
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
                x <<= 7;

                const long temp = x/y;
                if (temp > 309)
                    return '-';
                else if (temp > 53)
                    return '\\';
                else
                    return '|';
            }
            else
            {
                x <<= 7;

                const long temp = x/y;
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
        COMPILE_TIME_ASSERT(is_signed_type<typename out_image_type::type>::value);
        DLIB_ASSERT( (((void*)&in_img != (void*)&horz) && ((void*)&in_img != (void*)&vert) && ((void*)&vert != (void*)&horz)),
            "\tvoid sobel_edge_detector(in_img, horz, vert)"
            << "\n\tYou can't give the same image as more than one argument"
            << "\n\t&in_img: " << &in_img 
            << "\n\t&horz:   " << &horz 
            << "\n\t&vert:   " << &vert 
            );


        const long vert_filter[3][3] = {{-1,-2,-1}, 
        {0,0,0}, 
        {1,2,1}};
        const long horz_filter[3][3] = { {-1,0,1}, 
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
                unsigned long p;
                long horz_temp = 0;
                long vert_temp = 0;
                for (long m = 0; m < M; ++m)
                {
                    for (long n = 0; n < N; ++n)
                    {
                        // pull out the current pixel and put it into p
                        p = get_pixel_intensity(in_img[r-M/2+m][c-N/2+n]);

                        horz_temp += static_cast<long>(p)*horz_filter[m][n];
                        vert_temp += static_cast<long>(p)*vert_filter[m][n];
                    }
                }

                horz[r][c] = horz_temp;
                vert[r][c] = vert_temp;

            }
        }
    }

// ----------------------------------------------------------------------------------------

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
        DLIB_ASSERT( ((void*)&out_img != (void*)&horz) && ((void*)&out_img != (void*)&vert),
            "\tvoid suppress_non_maximum_edges(horz, vert, out_img)"
            << "\n\tYou can't give the same image as more than one argument"
            << "\n\t&horz:    " << &horz 
            << "\n\t&vert:    " << &vert 
            << "\n\t&out_img: " << &out_img 
            );

        using std::min;
        using std::abs;

        typedef typename out_image_type::type pixel_type;

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
                const long y = horz[r][c];
                const long x = vert[r][c];

                const long val = abs(horz[r][c]) + abs(vert[r][c]); 

                const char ori = edge_orientation(x,y);
                const unsigned char zero = 0;
                switch (ori)
                {
                    case '-':
                        if (abs(horz[r-1][c])+abs(vert[r-1][c]) > val || abs(horz[r+1][c]) + abs(vert[r+1][c]) > val)
                            assign_pixel(out_img[r][c] , zero);
                        else
                            assign_pixel(out_img[r][c] , static_cast<unsigned long>(val));
                        break;

                    case '|':
                        if (abs(horz[r][c-1]) + abs(vert[r][c-1]) > val || abs(horz[r][c+1]) + abs(vert[r][c+1]) > val)
                            assign_pixel(out_img[r][c] , zero);
                        else
                            assign_pixel(out_img[r][c] , static_cast<unsigned long>(val));
                        break;

                    case '/':
                        if (abs(horz[r-1][c-1]) + abs(vert[r-1][c-1]) > val || abs(horz[r+1][c+1]) + abs(vert[r+1][c+1]) > val)
                            assign_pixel(out_img[r][c] , zero);
                        else
                            assign_pixel(out_img[r][c] , static_cast<unsigned long>(val));
                        break;

                    case '\\':
                        if (abs(horz[r+1][c-1]) + abs(vert[r+1][c-1]) > val || abs(horz[r-1][c+1]) + abs(vert[r-1][c+1]) > val)
                            assign_pixel(out_img[r][c] , zero);
                        else
                            assign_pixel(out_img[r][c] , static_cast<unsigned long>(val));
                        break;

                }
            }
        }
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_EDGE_DETECTOr_




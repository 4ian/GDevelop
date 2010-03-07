// Copyright (C) 2006  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SPATIAL_FILTERINg_H_
#define DLIB_SPATIAL_FILTERINg_H_

#include "../pixel.h"
#include "spatial_filtering_abstract.h"
#include "../algs.h"
#include "../assert.h"
#include <limits>

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename in_image_type,
        typename out_image_type,
        typename filter_type,
        long M,
        long N
        >
    void spatially_filter_image (
        const in_image_type& in_img,
        out_image_type& out_img,
        const filter_type (&filter)[M][N],
        unsigned long scale = 1,
        bool use_abs = false
    )
    {
        COMPILE_TIME_ASSERT( pixel_traits<typename in_image_type::type>::has_alpha == false );
        COMPILE_TIME_ASSERT( pixel_traits<typename out_image_type::type>::has_alpha == false );

        COMPILE_TIME_ASSERT(M%2 == 1);
        COMPILE_TIME_ASSERT(N%2 == 1);
        DLIB_ASSERT(scale > 0,
            "\tvoid spatially_filter_image()"
            << "\n\tYou can't give a scale of zero"
            );
        DLIB_ASSERT((void*)&in_img != (void*)&out_img ,
            "\tvoid spatially_filter_image()"
            << "\n\tYou must give two different image objects"
            );



        // if there isn't any input image then don't do anything
        if (in_img.size() == 0)
        {
            out_img.clear();
            return;
        }

        out_img.set_size(in_img.nr(),in_img.nc());

        zero_border_pixels(out_img, M/2, N/2); 

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
                long temp = 0;
                for (long m = 0; m < M; ++m)
                {
                    for (long n = 0; n < N; ++n)
                    {
                        // pull out the current pixel and put it into p
                        p = get_pixel_intensity(in_img[r-M/2+m][c-N/2+n]);
                        temp += static_cast<long>(p)*filter[m][n];
                    }
                }

                temp /= scale;

                // Catch any underflow or apply abs as appropriate
                if (temp < 0)
                {
                    if (use_abs)
                    {
                        temp = -temp;
                    }
                    else
                    {
                        temp = 0;
                    }
                }

                // apply our new value for the intensity
                p = static_cast<unsigned long>(temp);

                // save this pixel to the output image
                assign_pixel(out_img[r][c], in_img[r][c]);
                assign_pixel_intensity(out_img[r][c],p);
            }
        }
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SPATIAL_FILTERINg_H_





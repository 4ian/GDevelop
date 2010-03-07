// Copyright (C) 2007  Davis E. King (davisking@users.sourceforge.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ASSIGN_IMAGe_
#define DLIB_ASSIGN_IMAGe_

#include "../pixel.h"
#include "assign_image_abstract.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename dest_image_type,
        typename src_image_type
        >
    void assign_image (
        dest_image_type& dest,
        const src_image_type& src
    )
    {
        // check for the case where dest is the same object as src
        if ((void*)&dest == (void*)&src)
            return;

        dest.set_size(src.nr(),src.nc());

        for (long r = 0; r < src.nr(); ++r)
        {
            for (long c = 0; c < src.nc(); ++c)
            {
                assign_pixel(dest[r][c], src[r][c]);
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename dest_image_type,
        typename src_pixel_type
        >
    void assign_all_pixels (
        dest_image_type& dest_img,
        const src_pixel_type& src_pixel
    )
    {
        for (long r = 0; r < dest_img.nr(); ++r)
        {
            for (long c = 0; c < dest_img.nc(); ++c)
            {
                assign_pixel(dest_img[r][c], src_pixel);
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_type
        >
    void assign_border_pixels (
        image_type& img,
        long x_border_size,
        long y_border_size,
        const typename image_type::type& p
    )
    {
        DLIB_ASSERT( x_border_size >= 0 && y_border_size >= 0,
            "\tvoid assign_border_pixels(img, p, border_size)"
            << "\n\tYou have given an invalid border_size"
            << "\n\tx_border_size: " << x_border_size
            << "\n\ty_border_size: " << y_border_size
            );

        // assign the top border
        for (long r = 0; r < y_border_size; ++r)
        {
            for (long c = 0; c < img.nc(); ++c)
            {
                img[r][c] = p;
            }
        }

        // assign the bottom border
        for (long r = img.nr()-y_border_size; r < img.nr(); ++r)
        {
            for (long c = 0; c < img.nc(); ++c)
            {
                img[r][c] = p;
            }
        }

        // now assign the two sides
        for (long r = y_border_size; r < img.nr()-y_border_size; ++r)
        {
            // left border
            for (long c = 0; c < x_border_size; ++c)
                img[r][c] = p;

            // right border
            for (long c = img.nc()-x_border_size; c < img.nc(); ++c)
                img[r][c] = p;
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_type
        >
    void zero_border_pixels (
        image_type& img,
        long x_border_size,
        long y_border_size
    )
    {
        DLIB_ASSERT( x_border_size >= 0 && y_border_size >= 0,
            "\tvoid zero_border_pixels(img, p, border_size)"
            << "\n\tYou have given an invalid border_size"
            << "\n\tx_border_size: " << x_border_size
            << "\n\ty_border_size: " << y_border_size
            );

        typename image_type::type zero_pixel;
        assign_pixel_intensity(zero_pixel, 0);
        assign_border_pixels(img, x_border_size, y_border_size, zero_pixel);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_ASSIGN_IMAGe_




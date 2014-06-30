// Copyright (C) 2007  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_ASSIGN_IMAGe_
#define DLIB_ASSIGN_IMAGe_

#include "../pixel.h"
#include "assign_image_abstract.h"
#include "../statistics.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    template <
        typename dest_image_type,
        typename src_pixel_type
        >
    typename enable_if<is_matrix<dest_image_type> >::type impl_assign_single_pixel (
        dest_image_type& img,
        long r,
        long c,
        const src_pixel_type& pix
    )
    {
        assign_pixel(img(r,c), pix);
    }

    template <
        typename dest_image_type,
        typename src_pixel_type
        >
    typename disable_if<is_matrix<dest_image_type> >::type impl_assign_single_pixel (
        dest_image_type& img,
        long r,
        long c,
        const src_pixel_type& pix
    )
    {
        assign_pixel(img[r][c], pix);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename dest_image_type,
        typename src_image_type
        >
    void impl_assign_image (
        dest_image_type& dest,
        const src_image_type& src
    )
    {
        dest.set_size(src.nr(),src.nc());

        for (long r = 0; r < src.nr(); ++r)
        {
            for (long c = 0; c < src.nc(); ++c)
            {
                impl_assign_single_pixel(dest,r,c, src(r,c));
            }
        }
    }

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
        if (is_same_object(dest,src))
            return;

        impl_assign_image(dest, array_to_matrix(src));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename dest_image_type,
        typename src_image_type
        >
    void impl_assign_image_scaled (
        dest_image_type& dest,
        const src_image_type& src,
        const double thresh = 4
    )
    {
        DLIB_ASSERT( thresh > 0,
            "\tvoid assign_image_scaled()"
            << "\n\t You have given an threshold value"
            << "\n\t thresh: " << thresh 
            );

        // If the destination has a dynamic range big enough to contain the source image data then just do a 
        // regular assign_image()
        if (pixel_traits<typename dest_image_type::type>::max() >= pixel_traits<typename src_image_type::type>::max() &&
            pixel_traits<typename dest_image_type::type>::min() <= pixel_traits<typename src_image_type::type>::min() )
        {
            assign_image(dest, src);
            return;
        }

        dest.set_size(src.nr(),src.nc());

        if (src.size() == 0)
            return;

        if (src.size() == 1)
        {
            impl_assign_single_pixel(dest,0,0, src(0,0));
            return;
        }

        // gather image statistics 
        running_stats<double> rs;
        for (long r = 0; r < src.nr(); ++r)
        {
            for (long c = 0; c < src.nc(); ++c)
            {
                rs.add(get_pixel_intensity(src(r,c)));
            }
        }
        typedef typename pixel_traits<typename src_image_type::type>::basic_pixel_type spix_type;

        if (std::numeric_limits<spix_type>::is_integer)
        {
            // If the destination has a dynamic range big enough to contain the source image data then just do a 
            // regular assign_image()
            if (pixel_traits<typename dest_image_type::type>::max() >= rs.max() &&
                pixel_traits<typename dest_image_type::type>::min() <= rs.min() )
            {
                impl_assign_image(dest, src);
                return;
            }
        }

        // Figure out the range of pixel values based on image statistics.  There might be some huge
        // outliers so don't just pick the min and max values.
        const double upper = std::min(rs.mean() + thresh*rs.stddev(), rs.max());
        const double lower = std::max(rs.mean() - thresh*rs.stddev(), rs.min());


        const double dest_min = pixel_traits<typename dest_image_type::type>::min();
        const double dest_max = pixel_traits<typename dest_image_type::type>::max();

        const double scale = (upper!=lower)? ((dest_max - dest_min) / (upper - lower)) : 0;

        for (long r = 0; r < src.nr(); ++r)
        {
            for (long c = 0; c < src.nc(); ++c)
            {
                const double val = get_pixel_intensity(src(r,c)) - lower;

                impl_assign_single_pixel(dest,r,c, scale*val + dest_min);
            }
        }
    }

    template <
        typename dest_image_type,
        typename src_image_type
        >
    void assign_image_scaled (
        dest_image_type& dest,
        const src_image_type& src,
        const double thresh = 4
    )
    {
        // check for the case where dest is the same object as src
        if (is_same_object(dest,src))
            return;

        impl_assign_image_scaled(dest, array_to_matrix(src),thresh);
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

        y_border_size = std::min(y_border_size, img.nr()/2+1);
        x_border_size = std::min(x_border_size, img.nc()/2+1);

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




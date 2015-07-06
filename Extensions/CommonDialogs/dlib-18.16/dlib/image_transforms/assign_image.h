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
        typename src_image_type
        >
    void impl_assign_image (
        image_view<dest_image_type>& dest,
        const src_image_type& src
    )
    {
        dest.set_size(src.nr(),src.nc());
        for (long r = 0; r < src.nr(); ++r)
        {
            for (long c = 0; c < src.nc(); ++c)
            {
                assign_pixel(dest[r][c], src(r,c));
            }
        }
    }

    template <
        typename dest_image_type,
        typename src_image_type
        >
    void impl_assign_image (
        dest_image_type& dest_,
        const src_image_type& src
    )
    {
        image_view<dest_image_type> dest(dest_);
        impl_assign_image(dest, src);
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

        impl_assign_image(dest, mat(src));
    }

// ----------------------------------------------------------------------------------------

    template <
        typename dest_image_type,
        typename src_image_type
        >
    void impl_assign_image_scaled (
        image_view<dest_image_type>& dest,
        const src_image_type& src,
        const double thresh 
    )
    {
        DLIB_ASSERT( thresh > 0,
            "\tvoid assign_image_scaled()"
            << "\n\t You have given an threshold value"
            << "\n\t thresh: " << thresh 
            );


        typedef typename image_traits<dest_image_type>::pixel_type dest_pixel;

        // If the destination has a dynamic range big enough to contain the source image data then just do a 
        // regular assign_image()
        if (pixel_traits<dest_pixel>::max() >= pixel_traits<typename src_image_type::type>::max() &&
            pixel_traits<dest_pixel>::min() <= pixel_traits<typename src_image_type::type>::min() )
        {
            impl_assign_image(dest, src);
            return;
        }

        dest.set_size(src.nr(),src.nc());

        if (src.size() == 0)
            return;

        if (src.size() == 1)
        {
            impl_assign_image(dest, src);
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
            if (pixel_traits<dest_pixel>::max() >= rs.max() &&
                pixel_traits<dest_pixel>::min() <= rs.min() )
            {
                impl_assign_image(dest, src);
                return;
            }
        }

        // Figure out the range of pixel values based on image statistics.  There might be some huge
        // outliers so don't just pick the min and max values.
        const double upper = std::min(rs.mean() + thresh*rs.stddev(), rs.max());
        const double lower = std::max(rs.mean() - thresh*rs.stddev(), rs.min());


        const double dest_min = pixel_traits<dest_pixel>::min();
        const double dest_max = pixel_traits<dest_pixel>::max();

        const double scale = (upper!=lower)? ((dest_max - dest_min) / (upper - lower)) : 0;

        for (long r = 0; r < src.nr(); ++r)
        {
            for (long c = 0; c < src.nc(); ++c)
            {
                const double val = get_pixel_intensity(src(r,c)) - lower;

                assign_pixel(dest[r][c], scale*val + dest_min);
            }
        }
    }

    template <
        typename dest_image_type,
        typename src_image_type
        >
    void impl_assign_image_scaled (
        dest_image_type& dest_,
        const src_image_type& src,
        const double thresh 
    )
    {
        image_view<dest_image_type> dest(dest_);
        impl_assign_image_scaled(dest, src, thresh);
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

        impl_assign_image_scaled(dest, mat(src),thresh);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename dest_image_type,
        typename src_pixel_type
        >
    void assign_all_pixels (
        image_view<dest_image_type>& dest_img,
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
        typename dest_image_type,
        typename src_pixel_type
        >
    void assign_all_pixels (
        dest_image_type& dest_img_,
        const src_pixel_type& src_pixel
    )
    {
        image_view<dest_image_type> dest_img(dest_img_);
        assign_all_pixels(dest_img, src_pixel);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_type
        >
    void assign_border_pixels (
        image_view<image_type>& img,
        long x_border_size,
        long y_border_size,
        const typename image_traits<image_type>::pixel_type& p
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

    template <
        typename image_type
        >
    void assign_border_pixels (
        image_type& img_,
        long x_border_size,
        long y_border_size,
        const typename image_traits<image_type>::pixel_type& p
    )
    {
        image_view<image_type> img(img_);
        assign_border_pixels(img, x_border_size, y_border_size, p);
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

        typename image_traits<image_type>::pixel_type zero_pixel;
        assign_pixel_intensity(zero_pixel, 0);
        assign_border_pixels(img, x_border_size, y_border_size, zero_pixel);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_type
        >
    void zero_border_pixels (
        image_view<image_type>& img,
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

        typename image_traits<image_type>::pixel_type zero_pixel;
        assign_pixel_intensity(zero_pixel, 0);
        assign_border_pixels(img, x_border_size, y_border_size, zero_pixel);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_type
        >
    void zero_border_pixels (
        image_view<image_type>& img,
        rectangle inside
    )
    {
        inside = inside.intersect(get_rect(img));
        if (inside.is_empty())
        {
            assign_all_pixels(img, 0);
            return;
        }

        for (long r = 0; r < inside.top(); ++r)
        {
            for (long c = 0; c < img.nc(); ++c)
                assign_pixel(img[r][c], 0);
        }
        for (long r = inside.top(); r <= inside.bottom(); ++r)
        {
            for (long c = 0; c < inside.left(); ++c)
                assign_pixel(img[r][c], 0);
            for (long c = inside.right()+1; c < img.nc(); ++c)
                assign_pixel(img[r][c], 0);
        }
        for (long r = inside.bottom()+1; r < img.nr(); ++r)
        {
            for (long c = 0; c < img.nc(); ++c)
                assign_pixel(img[r][c], 0);
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_type
        >
    void zero_border_pixels (
        image_type& img_,
        const rectangle& inside
    )
    {
        image_view<image_type> img(img_);
        zero_border_pixels(img, inside);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_ASSIGN_IMAGe_




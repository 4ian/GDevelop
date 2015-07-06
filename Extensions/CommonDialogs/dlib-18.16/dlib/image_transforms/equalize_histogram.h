// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_EQUALIZE_HISTOGRAm_
#define DLIB_EQUALIZE_HISTOGRAm_

#include "../pixel.h"
#include "equalize_histogram_abstract.h"
#include <vector>
#include "../enable_if.h"
#include "../matrix.h"

namespace dlib
{

// ---------------------------------------------------------------------------------------

    template <
        typename in_image_type,
        long R,
        long C,
        typename MM
        >
    void get_histogram (
        const in_image_type& in_img_,
        matrix<unsigned long,R,C,MM>& hist
    )
    {
        typedef typename image_traits<in_image_type>::pixel_type pixel_type;
        COMPILE_TIME_ASSERT( pixel_traits<pixel_type>::is_unsigned == true );

        typedef typename pixel_traits<pixel_type>::basic_pixel_type in_image_basic_pixel_type;
        COMPILE_TIME_ASSERT( sizeof(in_image_basic_pixel_type) <= 2);

        // make sure hist is the right size
        if (R == 1)
            hist.set_size(1,pixel_traits<pixel_type>::max()+1);
        else
            hist.set_size(pixel_traits<pixel_type>::max()+1,1);


        set_all_elements(hist,0);

        const_image_view<in_image_type> in_img(in_img_);
        // compute the histogram 
        for (long r = 0; r < in_img.nr(); ++r)
        {
            for (long c = 0; c < in_img.nc(); ++c)
            {
                unsigned long p = get_pixel_intensity(in_img[r][c]);
                ++hist(p);
            }
        }
    }

// ---------------------------------------------------------------------------------------

    template <
        typename in_image_type,
        typename out_image_type 
        >
    void equalize_histogram (
        const in_image_type& in_img_,
        out_image_type& out_img_
    )
    {
        const_image_view<in_image_type> in_img(in_img_);
        image_view<out_image_type> out_img(out_img_);

        typedef typename image_traits<in_image_type>::pixel_type in_pixel_type;
        typedef typename image_traits<out_image_type>::pixel_type out_pixel_type;

        COMPILE_TIME_ASSERT( pixel_traits<in_pixel_type>::has_alpha == false );
        COMPILE_TIME_ASSERT( pixel_traits<out_pixel_type>::has_alpha == false );

        COMPILE_TIME_ASSERT( pixel_traits<in_pixel_type>::is_unsigned == true );
        COMPILE_TIME_ASSERT( pixel_traits<out_pixel_type>::is_unsigned == true );

        typedef typename pixel_traits<in_pixel_type>::basic_pixel_type in_image_basic_pixel_type;
        COMPILE_TIME_ASSERT( sizeof(in_image_basic_pixel_type) <= 2);


        // if there isn't any input image then don't do anything
        if (in_img.size() == 0)
        {
            out_img.clear();
            return;
        }

        out_img.set_size(in_img.nr(),in_img.nc());

        unsigned long p;

        matrix<unsigned long,1,0> histogram;
        get_histogram(in_img_, histogram);
        in_img = in_img_;

        double scale = pixel_traits<out_pixel_type>::max();
        if (in_img.size() > histogram(0))
            scale /= in_img.size()-histogram(0);
        else
            scale = 0;

        // make the black pixels remain black in the output image
        histogram(0) = 0;

        // compute the transform function
        for (long i = 1; i < histogram.size(); ++i)
            histogram(i) += histogram(i-1);
        // scale so that it is in the range [0,pixel_traits<out_pixel_type>::max()]
        for (long i = 0; i < histogram.size(); ++i)
            histogram(i) = static_cast<unsigned long>(histogram(i)*scale);

        // now do the transform
        for (long row = 0; row < in_img.nr(); ++row)
        {
            for (long col = 0; col < in_img.nc(); ++col)
            {
                p = histogram(get_pixel_intensity(in_img[row][col]));
                assign_pixel(out_img[row][col], in_img[row][col]);
                assign_pixel_intensity(out_img[row][col],p);
            }
        }

    }

    template <
        typename image_type 
        >
    void equalize_histogram (
        image_type& img
    )
    {
        equalize_histogram(img,img);
    }

// ---------------------------------------------------------------------------------------

}

#endif // DLIB_EQUALIZE_HISTOGRAm_




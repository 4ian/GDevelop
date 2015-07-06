// Copyright (C) 2006  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_THRESHOLDINg_
#define DLIB_THRESHOLDINg_ 

#include "../pixel.h"
#include "thresholding_abstract.h"
#include "equalize_histogram.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    const unsigned char on_pixel = 255;
    const unsigned char off_pixel = 0;

// ----------------------------------------------------------------------------------------

    template <
        typename in_image_type,
        typename out_image_type
        >
    void threshold_image (
        const in_image_type& in_img_,
        out_image_type& out_img_,
        typename pixel_traits<typename image_traits<in_image_type>::pixel_type>::basic_pixel_type thresh
    )
    {
        COMPILE_TIME_ASSERT( pixel_traits<typename image_traits<in_image_type>::pixel_type>::has_alpha == false );
        COMPILE_TIME_ASSERT( pixel_traits<typename image_traits<out_image_type>::pixel_type>::has_alpha == false );

        COMPILE_TIME_ASSERT(pixel_traits<typename image_traits<out_image_type>::pixel_type>::grayscale);

        const_image_view<in_image_type> in_img(in_img_);
        image_view<out_image_type> out_img(out_img_);

        // if there isn't any input image then don't do anything
        if (in_img.size() == 0)
        {
            out_img.clear();
            return;
        }

        out_img.set_size(in_img.nr(),in_img.nc());

        for (long r = 0; r < in_img.nr(); ++r)
        {
            for (long c = 0; c < in_img.nc(); ++c)
            {
                if (get_pixel_intensity(in_img[r][c]) >= thresh)
                    assign_pixel(out_img[r][c], on_pixel);
                else
                    assign_pixel(out_img[r][c], off_pixel);
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_type
        >
    void threshold_image (
        image_type& img,
        typename pixel_traits<typename image_traits<image_type>::pixel_type>::basic_pixel_type thresh
    )
    {
        threshold_image(img,img,thresh);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename in_image_type,
        typename out_image_type
        >
    void auto_threshold_image (
        const in_image_type& in_img_,
        out_image_type& out_img_
    )
    {
        COMPILE_TIME_ASSERT( pixel_traits<typename image_traits<in_image_type>::pixel_type>::has_alpha == false );
        COMPILE_TIME_ASSERT( pixel_traits<typename image_traits<out_image_type>::pixel_type>::has_alpha == false );
        COMPILE_TIME_ASSERT( pixel_traits<typename image_traits<in_image_type>::pixel_type>::is_unsigned == true );
        COMPILE_TIME_ASSERT( pixel_traits<typename image_traits<out_image_type>::pixel_type>::is_unsigned == true );

        COMPILE_TIME_ASSERT(pixel_traits<typename image_traits<out_image_type>::pixel_type>::grayscale);

        image_view<out_image_type> out_img(out_img_);

        // if there isn't any input image then don't do anything
        if (image_size(in_img_) == 0)
        {
            out_img.clear();
            return;
        }

        unsigned long thresh;
        // find the threshold we should use
        matrix<unsigned long,1> hist;
        get_histogram(in_img_,hist);

        const_image_view<in_image_type> in_img(in_img_);

        // Start our two means (a and b) out at the ends of the histogram
        long a = 0;
        long b = hist.size()-1;
        bool moved_a = true;
        bool moved_b = true;
        while (moved_a || moved_b)
        {
            moved_a = false;
            moved_b = false;

            // catch the degenerate case where the histogram is empty
            if (a >= b)
                break;

            if (hist(a) == 0)
            {
                ++a;
                moved_a = true;
            }

            if (hist(b) == 0)
            {
                --b;
                moved_b = true;
            }
        }
        
        // now do k-means clustering with k = 2 on the histogram. 
        moved_a = true;
        moved_b = true;
        while (moved_a || moved_b)
        {
            moved_a = false;
            moved_b = false;

            int64 a_hits = 0;
            int64 b_hits = 0;
            int64 a_mass = 0;
            int64 b_mass = 0;

            for (long i = 0; i < hist.size(); ++i)
            {
                // if i is closer to a
                if (std::abs(i-a) < std::abs(i-b))
                {
                    a_mass += hist(i)*i;
                    a_hits += hist(i);
                }
                else // if i is closer to b
                {
                    b_mass += hist(i)*i;
                    b_hits += hist(i);
                }
            }

            long new_a = (a_mass + a_hits/2)/a_hits;
            long new_b = (b_mass + b_hits/2)/b_hits;

            if (new_a != a)
            {
                moved_a = true;
                a = new_a;
            }

            if (new_b != b)
            {
                moved_b = true;
                b = new_b;
            }
        }
        
        // put the threshold between the two means we found
        thresh = (a + b)/2;

        // now actually apply the threshold
        threshold_image(in_img_,out_img_,thresh);
    }

    template <
        typename image_type
        >
    void auto_threshold_image (
        image_type& img
    )
    {
        auto_threshold_image(img,img);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename in_image_type,
        typename out_image_type
        >
    void hysteresis_threshold (
        const in_image_type& in_img_,
        out_image_type& out_img_,
        typename pixel_traits<typename image_traits<in_image_type>::pixel_type>::basic_pixel_type lower_thresh,
        typename pixel_traits<typename image_traits<in_image_type>::pixel_type>::basic_pixel_type upper_thresh
    )
    {
        COMPILE_TIME_ASSERT( pixel_traits<typename image_traits<in_image_type>::pixel_type>::has_alpha == false );
        COMPILE_TIME_ASSERT( pixel_traits<typename image_traits<out_image_type>::pixel_type>::has_alpha == false );

        COMPILE_TIME_ASSERT(pixel_traits<typename image_traits<out_image_type>::pixel_type>::grayscale);

        DLIB_ASSERT( lower_thresh <= upper_thresh && is_same_object(in_img_, out_img_) == false,
            "\tvoid hysteresis_threshold(in_img_, out_img_, lower_thresh, upper_thresh)"
            << "\n\tYou can't use an upper_thresh that is less than your lower_thresh"
            << "\n\tlower_thresh: " << lower_thresh 
            << "\n\tupper_thresh: " << upper_thresh 
            << "\n\tis_same_object(in_img_,out_img_): " << is_same_object(in_img_,out_img_) 
            );

        const_image_view<in_image_type> in_img(in_img_);
        image_view<out_image_type> out_img(out_img_);

        // if there isn't any input image then don't do anything
        if (in_img.size() == 0)
        {
            out_img.clear();
            return;
        }

        out_img.set_size(in_img.nr(),in_img.nc());
        assign_all_pixels(out_img, off_pixel);

        const long size = 1000;
        long rstack[size];
        long cstack[size];

        // now do the thresholding
        for (long r = 0; r < in_img.nr(); ++r)
        {
            for (long c = 0; c < in_img.nc(); ++c)
            {
                typename pixel_traits<typename image_traits<in_image_type>::pixel_type>::basic_pixel_type p;
                assign_pixel(p,in_img[r][c]);
                if (p >= upper_thresh)
                {
                    // now do line following for pixels >= lower_thresh.
                    // set the stack position to 0.
                    long pos = 1;
                    rstack[0] = r;
                    cstack[0] = c;

                    while (pos > 0)
                    {
                        --pos;
                        const long r = rstack[pos];
                        const long c = cstack[pos];

                        // This is the base case of our recursion.  We want to stop if we hit a
                        // pixel we have already visited.
                        if (out_img[r][c] == on_pixel)
                            continue;

                        out_img[r][c] = on_pixel;

                        // put the neighbors of this pixel on the stack if they are bright enough
                        if (r-1 >= 0)
                        {
                            if (pos < size && get_pixel_intensity(in_img[r-1][c]) >= lower_thresh)
                            {
                                rstack[pos] = r-1;
                                cstack[pos] = c;
                                ++pos;
                            }
                            if (pos < size && c-1 >= 0 && get_pixel_intensity(in_img[r-1][c-1]) >= lower_thresh)
                            {
                                rstack[pos] = r-1;
                                cstack[pos] = c-1;
                                ++pos;
                            }
                            if (pos < size && c+1 < in_img.nc() && get_pixel_intensity(in_img[r-1][c+1]) >= lower_thresh)
                            {
                                rstack[pos] = r-1;
                                cstack[pos] = c+1;
                                ++pos;
                            }
                        }

                        if (pos < size && c-1 >= 0 && get_pixel_intensity(in_img[r][c-1]) >= lower_thresh)
                        {
                            rstack[pos] = r;
                            cstack[pos] = c-1;
                            ++pos;
                        }
                        if (pos < size && c+1 < in_img.nc() && get_pixel_intensity(in_img[r][c+1]) >= lower_thresh)
                        {
                            rstack[pos] = r;
                            cstack[pos] = c+1;
                            ++pos;
                        }

                        if (r+1 < in_img.nr())
                        {
                            if (pos < size && get_pixel_intensity(in_img[r+1][c]) >= lower_thresh)
                            {
                                rstack[pos] = r+1;
                                cstack[pos] = c;
                                ++pos;
                            }
                            if (pos < size && c-1 >= 0 && get_pixel_intensity(in_img[r+1][c-1]) >= lower_thresh)
                            {
                                rstack[pos] = r+1;
                                cstack[pos] = c-1;
                                ++pos;
                            }
                            if (pos < size && c+1 < in_img.nc() && get_pixel_intensity(in_img[r+1][c+1]) >= lower_thresh)
                            {
                                rstack[pos] = r+1;
                                cstack[pos] = c+1;
                                ++pos;
                            }
                        }

                    } // end while (pos >= 0)

                }
                else
                {
                    out_img[r][c] = off_pixel;
                }

            }
        }
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_THRESHOLDINg_ 


// Copyright (C) 2011  Davis E. King (davis@dlib.net)
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_SCAN_iMAGE_Hh_
#define DLIB_SCAN_iMAGE_Hh_

#include <vector>
#include <utility>
#include "scan_image_abstract.h"
#include "../matrix.h"
#include "../algs.h"
#include "../rand.h"
#include "../array2d.h"
#include "../image_transforms/spatial_filtering.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    namespace impl
    {

        inline rectangle bounding_box_of_rects (
            const std::vector<std::pair<unsigned int, rectangle> >& rects,
            const point& position
        )
        /*!
            ensures
                - returns the smallest rectangle that contains all the 
                  rectangles in rects.  That is, returns the rectangle that
                  contains translate_rect(rects[i].second,position) for all valid i.
        !*/
        {
            rectangle rect;

            for (unsigned long i = 0; i < rects.size(); ++i)
            {
                rect += translate_rect(rects[i].second,position);
            }

            return rect;
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_array_type
        >
    bool all_images_same_size (
        const image_array_type& images
    )
    {
        if (images.size() == 0)
            return true;

        for (unsigned long i = 0; i < images.size(); ++i)
        {
            if (num_rows(images[0]) != num_rows(images[i]) ||
                num_columns(images[0]) != num_columns(images[i]))
                return false;
        }

        return true;
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_array_type
        >
    double sum_of_rects_in_images (
        const image_array_type& images,
        const std::vector<std::pair<unsigned int, rectangle> >& rects,
        const point& position
    )
    {
        DLIB_ASSERT(all_images_same_size(images),
            "\t double sum_of_rects_in_images()"
            << "\n\t Invalid arguments given to this function."
            << "\n\t all_images_same_size(images): " << all_images_same_size(images)
        );
#ifdef ENABLE_ASSERTS
        for (unsigned long i = 0; i < rects.size(); ++i)
        {
            DLIB_ASSERT(rects[i].first < images.size(),
                "\t double sum_of_rects_in_images()"
                << "\n\t rects["<<i<<"].first must refer to a valid image."
                << "\n\t rects["<<i<<"].first: " << rects[i].first 
                << "\n\t images.size(): " << images.size() 
            );
        }
#endif


        typedef typename image_traits<typename image_array_type::type>::pixel_type pixel_type;
        typedef typename promote<pixel_type>::type ptype;

        ptype temp = 0;

        for (unsigned long i = 0; i < rects.size(); ++i)
        {
            const typename image_array_type::type& img = images[rects[i].first];
            const rectangle rect = get_rect(img).intersect(translate_rect(rects[i].second,position));
            temp += sum(matrix_cast<ptype>(subm(mat(img), rect)));
        }

        return static_cast<double>(temp);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_array_type
        >
    double sum_of_rects_in_images_movable_parts (
        const image_array_type& images,
        const rectangle& window,
        const std::vector<std::pair<unsigned int, rectangle> >& fixed_rects,
        const std::vector<std::pair<unsigned int, rectangle> >& movable_rects,
        const point& position
    )
    {
        DLIB_ASSERT(all_images_same_size(images) && center(window) == point(0,0),
            "\t double sum_of_rects_in_images_movable_parts()"
            << "\n\t Invalid arguments given to this function."
            << "\n\t all_images_same_size(images): " << all_images_same_size(images)
            << "\n\t center(window): " << center(window)
        );
#ifdef ENABLE_ASSERTS
        for (unsigned long i = 0; i < fixed_rects.size(); ++i)
        {
            DLIB_ASSERT(fixed_rects[i].first < images.size(),
                "\t double sum_of_rects_in_images_movable_parts()"
                << "\n\t fixed_rects["<<i<<"].first must refer to a valid image."
                << "\n\t fixed_rects["<<i<<"].first: " << fixed_rects[i].first 
                << "\n\t images.size(): " << images.size() 
            );
        }
        for (unsigned long i = 0; i < movable_rects.size(); ++i)
        {
            DLIB_ASSERT(movable_rects[i].first < images.size(),
                "\t double sum_of_rects_in_images_movable_parts()"
                << "\n\t movable_rects["<<i<<"].first must refer to a valid image."
                << "\n\t movable_rects["<<i<<"].first: " << movable_rects[i].first 
                << "\n\t images.size(): " << images.size() 
            );
            DLIB_ASSERT(center(movable_rects[i].second) == point(0,0),
                "\t double sum_of_rects_in_images_movable_parts()"
                << "\n\t movable_rects["<<i<<"].second: " << movable_rects[i].second 
            );
        }
#endif
        typedef typename image_traits<typename image_array_type::type>::pixel_type pixel_type;
        typedef typename promote<pixel_type>::type ptype;

        ptype temp = 0;

        // compute TOTAL_FIXED part
        for (unsigned long i = 0; i < fixed_rects.size(); ++i)
        {
            const typename image_array_type::type& img = images[fixed_rects[i].first];
            const rectangle rect = get_rect(img).intersect(translate_rect(fixed_rects[i].second,position));
            temp += sum(matrix_cast<ptype>(subm(mat(img), rect)));
        }

        if (images.size() > 0)
        {
            // compute TOTAL_MOVABLE part
            array2d<ptype> tempimg(images[0].nr(), images[0].nc());
            for (unsigned long i = 0; i < movable_rects.size(); ++i)
            {
                const typename image_array_type::type& img = images[movable_rects[i].first];

                sum_filter_assign(img, tempimg, movable_rects[i].second);

                const rectangle rect = get_rect(tempimg).intersect(translate_rect(window,position));
                if (rect.is_empty() == false)
                    temp += std::max(0,max(matrix_cast<ptype>(subm(mat(tempimg), rect))));
            }
        }

        return static_cast<double>(temp);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_type
        >
    void find_points_above_thresh (
        std::vector<std::pair<double, point> >& dets,
        const image_type& img_,
        const double thresh,
        const unsigned long max_dets
    )
    {
        const_image_view<image_type> img(img_);
        typedef typename image_traits<image_type>::pixel_type ptype;

        dets.clear();
        if (max_dets == 0)
            return;

        unsigned long count = 0;
        dlib::rand rnd;
        for (long r = 0; r < img.nr(); ++r)
        {
            for (long c = 0; c < img.nc(); ++c)
            {
                const ptype val = img[r][c];
                if (val >= thresh)
                {
                    ++count;

                    if (dets.size() < max_dets)
                    {
                        dets.push_back(std::make_pair(val, point(c,r)));
                    }
                    else 
                    {
                        // The idea here is to cause us to randomly sample possible detection
                        // locations throughout the image rather than just stopping the detection
                        // procedure once we hit the max_dets limit. So this method will result
                        // in a random subsample of all the detections >= thresh being in dets
                        // at the end of scan_image().
                        const unsigned long random_index = rnd.get_random_32bit_number()%count;
                        if (random_index < dets.size())
                        {
                            dets[random_index] = std::make_pair(val, point(c,r));
                        }
                    }
                }
            }
        }
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_array_type
        >
    void scan_image (
        std::vector<std::pair<double, point> >& dets,
        const image_array_type& images,
        const std::vector<std::pair<unsigned int, rectangle> >& rects,
        const double thresh,
        const unsigned long max_dets
    )
    {
        DLIB_ASSERT(images.size() > 0 && rects.size() > 0 && all_images_same_size(images),
            "\t void scan_image()"
            << "\n\t Invalid arguments given to this function."
            << "\n\t images.size(): " << images.size() 
            << "\n\t rects.size():  " << rects.size() 
            << "\n\t all_images_same_size(images): " << all_images_same_size(images)
        );
#ifdef ENABLE_ASSERTS
        for (unsigned long i = 0; i < rects.size(); ++i)
        {
            DLIB_ASSERT(rects[i].first < images.size(),
                "\t void scan_image()"
                << "\n\t rects["<<i<<"].first must refer to a valid image."
                << "\n\t rects["<<i<<"].first: " << rects[i].first 
                << "\n\t images.size(): " << images.size() 
            );
        }
#endif




        typedef typename image_traits<typename image_array_type::type>::pixel_type pixel_type;
        typedef typename promote<pixel_type>::type ptype;

        array2d<ptype> accum(images[0].nr(), images[0].nc());
        assign_all_pixels(accum, 0);

        for (unsigned long i = 0; i < rects.size(); ++i)
            sum_filter(images[rects[i].first], accum, rects[i].second);

        find_points_above_thresh(dets, accum, thresh, max_dets);
    }

// ----------------------------------------------------------------------------------------

    template <
        typename image_array_type
        >
    void scan_image_movable_parts (
        std::vector<std::pair<double, point> >& dets,
        const image_array_type& images,
        const rectangle& window,
        const std::vector<std::pair<unsigned int, rectangle> >& fixed_rects,
        const std::vector<std::pair<unsigned int, rectangle> >& movable_rects,
        const double thresh,
        const unsigned long max_dets
    )
    {
        DLIB_ASSERT(images.size() > 0 && all_images_same_size(images) && 
                    center(window) == point(0,0) && window.area() > 0,
            "\t void scan_image_movable_parts()"
            << "\n\t Invalid arguments given to this function."
            << "\n\t all_images_same_size(images): " << all_images_same_size(images)
            << "\n\t center(window): " << center(window)
            << "\n\t window.area():  " << window.area() 
            << "\n\t images.size():  " << images.size() 
        );
#ifdef ENABLE_ASSERTS
        for (unsigned long i = 0; i < fixed_rects.size(); ++i)
        {
            DLIB_ASSERT(fixed_rects[i].first < images.size(),
                "\t void scan_image_movable_parts()"
                << "\n\t Invalid arguments given to this function."
                << "\n\t fixed_rects["<<i<<"].first must refer to a valid image."
                << "\n\t fixed_rects["<<i<<"].first: " << fixed_rects[i].first 
                << "\n\t images.size(): " << images.size() 
            );
        }
        for (unsigned long i = 0; i < movable_rects.size(); ++i)
        {
            DLIB_ASSERT(movable_rects[i].first < images.size(),
                "\t void scan_image_movable_parts()"
                << "\n\t Invalid arguments given to this function."
                << "\n\t movable_rects["<<i<<"].first must refer to a valid image."
                << "\n\t movable_rects["<<i<<"].first: " << movable_rects[i].first 
                << "\n\t images.size(): " << images.size() 
            );
            DLIB_ASSERT(center(movable_rects[i].second) == point(0,0) &&
                        movable_rects[i].second.area() > 0,
                "\t void scan_image_movable_parts()"
                << "\n\t Invalid arguments given to this function."
                << "\n\t movable_rects["<<i<<"].second: " << movable_rects[i].second 
                << "\n\t movable_rects["<<i<<"].second.area(): " << movable_rects[i].second.area()
            );
        }
#endif

        if (movable_rects.size() == 0 && fixed_rects.size() == 0)
            return;

        typedef typename image_traits<typename image_array_type::type>::pixel_type pixel_type;
        typedef typename promote<pixel_type>::type ptype;

        array2d<ptype> accum(images[0].nr(), images[0].nc());
        assign_all_pixels(accum, 0);

        for (unsigned long i = 0; i < fixed_rects.size(); ++i)
            sum_filter(images[fixed_rects[i].first], accum, fixed_rects[i].second);

        array2d<ptype> temp(accum.nr(), accum.nc());
        for (unsigned long i = 0; i < movable_rects.size(); ++i)
        {
            const rectangle rect = movable_rects[i].second;
            sum_filter_assign(images[movable_rects[i].first], temp, rect);
            max_filter(temp, accum, window.width(), window.height(), 0);  
        }

        find_points_above_thresh(dets, accum, thresh, max_dets);
    }

// ----------------------------------------------------------------------------------------

}

#endif // DLIB_SCAN_iMAGE_Hh_


